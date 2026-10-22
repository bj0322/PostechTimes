import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

// 앱의 백그라운드 러너(posttech-times-app/public/runners/alerts.js)가 읽는 알림 목록.
// 새 기사는 감시 루프가 자동으로 넣고, 운영자가 POST /admin/alerts로 속보를 직접 넣을 수 있다.
export interface Alert {
  seq: number;
  articleId: string | null;
  title: string;
  body: string;
  breaking: boolean;
  createdAt: string;
}

export interface ListedArticle {
  id: string;
  title: string;
  section: string;
}

interface State {
  seq: number;
  known: string[];
  alerts: Alert[];
}

const DATA_DIR = process.env.DATA_DIR ?? './data';
const PATH = join(DATA_DIR, 'alerts.json');
const MAX_ALERTS = 200;
const MAX_KNOWN = 5000;

let state: State | null = null;

async function load(): Promise<State> {
  if (state) return state;
  try {
    state = JSON.parse(await readFile(PATH, 'utf8')) as State;
  } catch {
    state = { seq: 0, known: [], alerts: [] };
  }
  return state;
}

async function save(s: State): Promise<void> {
  s.alerts = s.alerts.slice(-MAX_ALERTS);
  s.known = s.known.slice(-MAX_KNOWN);
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(`${PATH}.tmp`, JSON.stringify(s));
  await rename(`${PATH}.tmp`, PATH);
}

function push(s: State, alert: Omit<Alert, 'seq' | 'createdAt'>): Alert {
  const full = { ...alert, seq: ++s.seq, createdAt: new Date().toISOString() };
  s.alerts.push(full);
  return full;
}

// 목록에서 처음 보는 기사를 알림으로 만든다. 서버를 처음 켰을 때는 이미 올라온 기사를 기록만 하고 알리지 않는다.
export async function recordArticles(items: ListedArticle[]): Promise<Alert[]> {
  const s = await load();
  const known = new Set(s.known);
  const fresh = items.filter(item => !known.has(item.id));
  if (!fresh.length) return [];

  const seeding = s.known.length === 0;
  s.known.push(...fresh.map(item => item.id));
  const made = seeding
    ? []
    : fresh
        .sort((a, b) => Number(a.id) - Number(b.id))
        .map(item => push(s, { articleId: item.id, title: `포항공대신문 · ${item.section}`, body: item.title, breaking: false }));
  await save(s);
  return made;
}

export async function addManualAlert(input: { title?: unknown; body?: unknown; articleId?: unknown }): Promise<Alert> {
  const body = typeof input.body === 'string' ? input.body.trim() : '';
  if (!body) throw new Error('body is required');
  const articleId = typeof input.articleId === 'string' && /^\d{1,9}$/.test(input.articleId) ? input.articleId : null;
  const title = typeof input.title === 'string' && input.title.trim() ? input.title.trim() : '[속보] 포항공대신문';
  const s = await load();
  const alert = push(s, { articleId, title, body, breaking: true });
  await save(s);
  return alert;
}

export async function alertsAfter(after: number): Promise<{ latest: number; alerts: Alert[] }> {
  const s = await load();
  return { latest: s.seq, alerts: s.alerts.filter(a => a.seq > after) };
}
