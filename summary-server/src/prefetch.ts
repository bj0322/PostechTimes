import * as cheerio from 'cheerio';
import { generate, readStored } from './store.ts';

const BASE = 'https://times.postech.ac.kr';

// 앱의 SITE_SECTIONS(posttech-times-app/src/lib/fetchArticles.ts)와 같은 섹션 코드. 사이트 섹션이 바뀌면 함께 고친다.
const SECTION_CODES = [
  'S1N1', 'S1N26', 'S1N20', 'S1N6', 'S1N31', 'S1N22', 'S1N5', 'S1N32', 'S1N27', 'S1N25',
  'S1N28', 'S1N9', 'S1N10', 'S1N24', 'S1N13', 'S1N14', 'S1N30',
];

const PER_SECTION = Number(process.env.PREFETCH_PER_SECTION ?? 5);
const INTERVAL_MS = Number(process.env.PREFETCH_INTERVAL_MIN ?? 30) * 60_000;

async function listSection(code: string): Promise<string[]> {
  const url = `${BASE}/news/articleList.html?sc_section_code=${code}&view_type=sm&page=1`;
  const res = await fetch(url, { headers: { Accept: 'text/html' }, signal: AbortSignal.timeout(15_000) });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  const $ = cheerio.load(await res.text());
  const ids = $('a[href*="articleView"]')
    .map((_, a) => $(a).attr('href')?.match(/idxno=(\d+)/)?.[1])
    .get() as string[];
  return [...new Set(ids)].slice(0, PER_SECTION);
}

let running = false;

async function prefetchOnce(): Promise<void> {
  if (running) return;
  running = true;
  let made = 0;
  try {
    const ids = new Set<string>();
    for (const code of SECTION_CODES) {
      try {
        for (const id of await listSection(code)) ids.add(id);
      } catch (err) {
        console.error(`prefetch: listing ${code} failed:`, err);
      }
    }
    // 새 기사(번호가 큰 것)부터 한 번에 하나씩 요약한다. 사용자 요청은 큐에서 먼저 처리된다.
    for (const id of [...ids].sort((a, b) => Number(b) - Number(a))) {
      if (await readStored(id)) continue;
      try {
        await generate(id, 'low');
        made++;
      } catch (err) {
        console.error(`prefetch: summary ${id} failed:`, err instanceof Error ? err.message : err);
      }
    }
    console.log(`prefetch: ${ids.size} articles checked, ${made} summaries made`);
  } finally {
    running = false;
  }
}

export function startPrefetch(): void {
  if (PER_SECTION <= 0) return;
  const tick = () => void prefetchOnce().catch(err => console.error('prefetch failed:', err));
  tick();
  setInterval(tick, INTERVAL_MS).unref();
}
