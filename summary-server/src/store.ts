import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fetchArticle } from './article.ts';
import { summarize, type Priority } from './summarize.ts';

export interface ArticleSummary {
  id: string;
  title: string;
  summary: string[];
  keywords: string[];
  model: string;
  createdAt: string;
}

const DATA_DIR = process.env.DATA_DIR ?? './data';

// 요약 프롬프트나 출력 형식을 바꾸면 버전을 올려 이전 요약을 새로 만들게 한다.
const KEY_VERSION = 'v2';

const cachePath = (id: string) => join(DATA_DIR, KEY_VERSION, `${id}.json`);

export async function readStored(id: string): Promise<ArticleSummary | null> {
  try {
    return JSON.parse(await readFile(cachePath(id), 'utf8')) as ArticleSummary;
  } catch {
    return null;
  }
}

async function store(body: ArticleSummary): Promise<void> {
  const path = cachePath(body.id);
  await mkdir(join(DATA_DIR, KEY_VERSION), { recursive: true });
  await writeFile(`${path}.tmp`, JSON.stringify(body));
  await rename(`${path}.tmp`, path);
}

// 같은 기사를 동시에 여러 번 요청해도 모델은 한 번만 돌린다.
const inFlight = new Map<string, Promise<ArticleSummary>>();

export function isGenerating(id: string): boolean {
  return inFlight.has(id);
}

export function generate(id: string, priority: Priority = 'high'): Promise<ArticleSummary> {
  let job = inFlight.get(id);
  if (!job) {
    job = (async () => {
      const article = await fetchArticle(id);
      const result = await summarize(article, priority);
      const body: ArticleSummary = { id, title: article.title, ...result, createdAt: new Date().toISOString() };
      await store(body).catch(err => console.error(`saving summary ${id} failed:`, err));
      return body;
    })().finally(() => inFlight.delete(id));
    inFlight.set(id, job);
  }
  return job;
}
