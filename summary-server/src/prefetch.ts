import * as cheerio from 'cheerio';
import { recordArticles, type ListedArticle } from './alerts.ts';
import { generate, readStored } from './store.ts';
import { checkFeed, SiteBlockedError, type Validators } from './feed.ts';

const BASE = 'https://times.postech.ac.kr';

// 앱의 SITE_SECTIONS(posttech-times-app/src/lib/fetchArticles.ts)와 같은 섹션. 사이트 섹션이 바뀌면 함께 고친다.
const SECTIONS: [code: string, label: string][] = [
  ['S1N1', '보도'], ['S1N26', '대학'], ['S1N20', '사회'], ['S1N6', '문화'], ['S1N31', '과학'],
  ['S1N22', '인터뷰'], ['S1N5', '학술'], ['S1N32', '기자의시선'], ['S1N27', '여론'], ['S1N25', '특집'],
  ['S1N28', 'Headlines'], ['S1N9', 'News'], ['S1N10', 'Campus'], ['S1N24', 'Postech Microscope'],
  ['S1N13', 'Opinion'], ['S1N14', 'Feature'], ['S1N30', 'Culture'],
];

const PER_SECTION = Number(process.env.PREFETCH_PER_SECTION ?? 5);
const INTERVAL_MS = Number(process.env.WATCH_INTERVAL_MIN ?? 5) * 60_000;
// 사이트 보안 장치에 막히면(403·429·오류 페이지 리디렉션) 이 시간 동안 사이트에 아무 요청도 보내지 않는다.
const BLOCK_PAUSE_MS = Number(process.env.BLOCK_PAUSE_MIN ?? 60) * 60_000;

async function listSection(code: string, label: string): Promise<ListedArticle[]> {
  const url = `${BASE}/news/articleList.html?sc_section_code=${code}&view_type=sm&page=1`;
  // 리디렉션을 따라가면 보안 장치의 오류 페이지를 '기사 0건'으로 읽는다. 따라가지 않고 차단으로 본다.
  const res = await fetch(url, { headers: { Accept: 'text/html' }, redirect: 'manual', signal: AbortSignal.timeout(15_000) });
  if ((res.status >= 300 && res.status < 400) || res.status === 403 || res.status === 429) {
    throw new SiteBlockedError(`listing ${code}: ${res.status} ${res.headers.get('location') ?? ''}`.trim());
  }
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  const $ = cheerio.load(await res.text());
  const items: ListedArticle[] = [];
  const seen = new Set<string>();
  // 앱의 itemFromListBlock과 같은 위치에서 제목을 읽는다.
  $('.list-block').each((_, block) => {
    const link = $(block).find('.list-titles a[href*="articleView"], a[href*="articleView"]').first();
    const id = link.attr('href')?.match(/idxno=(\d+)/)?.[1];
    const strong = link.find('strong');
    const title = (strong.length ? strong.text() : link.text()).replace(/\s+/g, ' ').trim();
    if (id && title && !seen.has(id)) {
      seen.add(id);
      items.push({ id, title, section: label });
    }
  });
  return items;
}

// 미리 요약할 기사. 요약은 오래 걸리므로 목록 확인(알림)과 따로 돈다.
const pending = new Set<string>();
let summarizing = false;

async function summarizePending(): Promise<void> {
  if (summarizing) return;
  summarizing = true;
  let made = 0;
  try {
    // 새 기사(번호가 큰 것)부터 한 번에 하나씩 요약한다. 사용자 요청은 큐에서 먼저 처리된다.
    for (let id = newest(); id; id = newest()) {
      pending.delete(id);
      if (await readStored(id)) continue;
      try {
        await generate(id, 'low');
        made++;
      } catch (err) {
        console.error(`prefetch: summary ${id} failed:`, err instanceof Error ? err.message : err);
      }
    }
    if (made) console.log(`prefetch: ${made} summaries made`);
  } finally {
    summarizing = false;
  }
}

function newest(): string | undefined {
  return [...pending].sort((a, b) => Number(b) - Number(a))[0];
}

let watching = false;
// 섹션 목록을 끝까지 확인했을 때의 피드 값. 중간에 실패하면 갱신하지 않아 다음 확인에서 다시 목록을 본다.
let feed: Validators = {};
let blockedUntil = 0;

function pauseForBlock(err: SiteBlockedError): void {
  blockedUntil = Date.now() + BLOCK_PAUSE_MS;
  console.error(`watch: ${err.message}; no site requests for ${BLOCK_PAUSE_MS / 60_000} min`);
}

// 사이트가 바뀌었을 때만(피드 조건부 요청이 304가 아닐 때만) 섹션 목록을 확인해 새 기사를 알림으로 기록하고,
// 각 섹션의 최신 기사를 요약 대기열에 넣는다. 평소 확인은 304 응답 하나(수백 바이트)로 끝난다.
async function watchOnce(): Promise<void> {
  if (watching || Date.now() < blockedUntil) return;
  watching = true;
  try {
    let check;
    try {
      check = await checkFeed(BASE, feed);
    } catch (err) {
      if (err instanceof SiteBlockedError) pauseForBlock(err);
      else console.error('watch: feed check failed:', err);
      return;
    }
    if (!check.changed) return;

    const listed: ListedArticle[] = [];
    let failures = 0;
    for (const [code, label] of SECTIONS) {
      try {
        const items = await listSection(code, label);
        listed.push(...items);
        for (const item of items.slice(0, Math.max(0, PER_SECTION))) pending.add(item.id);
      } catch (err) {
        failures++;
        if (err instanceof SiteBlockedError) { pauseForBlock(err); break; }
        console.error(`watch: listing ${code} failed:`, err);
      }
    }

    const fresh = await recordArticles(listed);
    if (fresh.length) console.log(`watch: ${fresh.length} new article alerts`);
    // 새 기사는 섹션별 개수 제한과 상관없이 요약해 둔다. 알림을 받고 바로 열어 볼 기사다.
    for (const alert of fresh) if (alert.articleId) pending.add(alert.articleId);
    if (failures === 0) feed = check.next;
  } finally {
    watching = false;
    void summarizePending().catch(err => console.error('prefetch failed:', err));
  }
}

export function startWatch(): void {
  const tick = () => void watchOnce().catch(err => console.error('watch failed:', err));
  tick();
  setInterval(tick, INTERVAL_MS).unref();
}
