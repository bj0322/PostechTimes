import type { SourceArticle } from './article.ts';

const OLLAMA_URL = (process.env.OLLAMA_URL ?? 'http://127.0.0.1:11434').replace(/\/+$/, '');
export const MODEL = process.env.OLLAMA_MODEL ?? 'gemma3:4b';

// 로컬 모델의 컨텍스트에 맞춰 Claude 때보다 훨씬 짧게 제한한다. 이보다 길면 잘라 요약하지 않고 거절한다.
export const MAX_ARTICLE_CHARS = 12_000;

const SYSTEM = `You summarize articles from 포항공대신문 (The POSTECH Times), POSTECH's student newspaper, for readers of its mobile app.

Put exactly three sentences in "summary", one per array item. The user message states which language to write them in; follow it. Korean sentences use the newspaper's plain written style and end in 다.

Use only what the article states, and keep names, numbers and dates exactly as written. Do not add evaluation or background the article does not give. For opinion pieces and columns, present the argument as the writer's.

Write only the sentences themselves: no notes in parentheses, no labels, no quotation of these instructions.

Put up to five short keywords from the article in "keywords", in the same language as the summary. Keep proper nouns such as company and person names exactly as the article spells them.`;

const outputSchema = (language: string) => ({
  type: 'object',
  properties: {
    summary: { type: 'array', description: `Exactly three sentences, written in ${language}.`, items: { type: 'string' } },
    keywords: {
      type: 'array',
      description: `Up to five keywords, written in ${language}. Copy names and terms from the article as written; never translate them.`,
      items: { type: 'string' },
    },
  },
  required: ['summary', 'keywords'],
});

export interface Summary {
  summary: string[];
  keywords: string[];
  model: string;
}

export class SummaryError extends Error {}

export type Priority = 'high' | 'low';

// GPU/CPU 하나를 여러 요청이 동시에 쓰지 않도록 요약은 한 번에 하나씩 처리한다.
// 사용자가 요청한 기사(high)는 미리 요약하는 작업(low)보다 먼저 처리한다.
const queues: Record<Priority, Array<() => Promise<void>>> = { high: [], low: [] };
let running = false;

async function pump(): Promise<void> {
  if (running) return;
  running = true;
  try {
    for (let job = queues.high.shift() ?? queues.low.shift(); job; job = queues.high.shift() ?? queues.low.shift()) {
      await job();
    }
  } finally {
    running = false;
  }
}

export function summarize(article: SourceArticle, priority: Priority = 'high'): Promise<Summary> {
  return new Promise<Summary>((resolve, reject) => {
    queues[priority].push(() => summarizeNow(article).then(resolve, reject));
    void pump();
  });
}

// 작은 모델은 "기사와 같은 언어로 쓰라"는 지시를 자주 놓친다. 언어는 코드가 정해서 알려 준다.
export function detectLanguage(text: string): 'Korean' | 'English' {
  const hangul = (text.match(/[가-힣]/g) ?? []).length;
  const latin = (text.match(/[A-Za-z]/g) ?? []).length;
  return hangul >= latin * 0.3 ? 'Korean' : 'English';
}

async function summarizeNow(article: SourceArticle): Promise<Summary> {
  const text = article.paragraphs.join('\n\n');
  if (text.length > MAX_ARTICLE_CHARS) throw new SummaryError(`article ${article.id} is too long to summarize`);
  const language = detectLanguage(text);

  const res = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(300_000),
    body: JSON.stringify({
      model: MODEL,
      stream: false,
      think: false,
      keep_alive: '30m',
      format: outputSchema(language),
      options: { temperature: 0, num_ctx: 8192 },
      messages: [
        { role: 'system', content: SYSTEM },
        {
          role: 'user',
          content: `Write the summary and keywords in ${language}.\n\n<title>${article.title}</title>\n<article>\n${text}\n</article>`,
        },
      ],
    }),
  });
  if (!res.ok) throw new Error(`ollama HTTP ${res.status}: ${await res.text()}`);

  const data = (await res.json()) as { message?: { content?: string }; done_reason?: string };
  if (data.done_reason && data.done_reason !== 'stop') {
    throw new SummaryError(`summary for article ${article.id} stopped with ${data.done_reason}`);
  }
  let parsed: { summary?: unknown; keywords?: unknown };
  try {
    parsed = JSON.parse(data.message?.content ?? '');
  } catch {
    throw new SummaryError(`summary for article ${article.id} is not valid JSON`);
  }
  const summary = strings(parsed.summary).slice(0, 5);
  if (!summary.length) throw new SummaryError(`summary for article ${article.id} is empty`);
  return { summary, keywords: keywordsIn(language, strings(parsed.keywords)), model: MODEL };
}

// 작은 모델은 영어 기사의 키워드를 한국어로 내놓기도 한다. 영어 기사에서는 한글 키워드를 버린다.
export function keywordsIn(language: 'Korean' | 'English', keywords: string[]): string[] {
  const kept = language === 'English' ? keywords.filter(k => !/[가-힣]/.test(k)) : keywords;
  return kept.slice(0, 5);
}

function strings(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((v): v is string => typeof v === 'string').map(v => v.trim()).filter(Boolean)
    : [];
}
