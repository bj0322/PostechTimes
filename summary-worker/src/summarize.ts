import Anthropic from '@anthropic-ai/sdk';
import type { SourceArticle } from './article';

export const MODEL = 'claude-opus-5-5';

// 신문 기사 하나는 수천 자 수준이다. 이보다 길면 잘라 요약하지 않고 거절한다.
export const MAX_ARTICLE_CHARS = 60_000;

const SYSTEM = `You summarize articles from 포항공대신문 (The POSTECH Times), POSTECH's student newspaper, for readers of its mobile app.

Put exactly three sentences in "summary", one per array item, in the language the article is written in: Korean articles in Korean, English articles in English. Write Korean sentences in the newspaper's plain written style (~했다, ~이다).

Use only what the article states, and keep names, numbers and dates exactly as written. Do not add evaluation or background the article does not give. For opinion pieces and columns, present the argument as the writer's (e.g. "필자는 …라고 주장한다").

Put up to five short keywords from the article in "keywords".`;

const OUTPUT_SCHEMA = {
  type: 'object',
  properties: {
    summary: { type: 'array', items: { type: 'string' } },
    keywords: { type: 'array', items: { type: 'string' } },
  },
  required: ['summary', 'keywords'],
  additionalProperties: false,
};

export interface Summary {
  summary: string[];
  keywords: string[];
  model: string;
}

export class SummaryError extends Error {}

export async function summarize(apiKey: string, article: SourceArticle): Promise<Summary> {
  const text = article.paragraphs.join('\n\n');
  if (text.length > MAX_ARTICLE_CHARS) throw new SummaryError(`article ${article.id} is too long to summarize`);

  const client = new Anthropic({ apiKey });
  const response = await client.beta.messages.create({
    model: MODEL,
    max_tokens: 8000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: { effort: 'low', format: { type: 'json_schema', schema: OUTPUT_SCHEMA } },
    system: SYSTEM,
    messages: [{ role: 'user', content: `<title>${article.title}</title>\n<article>\n${text}\n</article>` }],
  });

  if (response.stop_reason !== 'end_turn') {
    throw new SummaryError(`summary for article ${article.id} stopped with ${response.stop_reason}`);
  }
  const block = response.content.find(b => b.type === 'text');
  if (!block || block.type !== 'text') throw new SummaryError(`summary for article ${article.id} has no text`);

  const parsed = JSON.parse(block.text) as { summary: unknown; keywords: unknown };
  const summary = strings(parsed.summary).slice(0, 5);
  if (!summary.length) throw new SummaryError(`summary for article ${article.id} is empty`);
  return { summary, keywords: strings(parsed.keywords).slice(0, 5), model: response.model };
}

function strings(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((v): v is string => typeof v === 'string').map(v => v.trim()).filter(Boolean)
    : [];
}
