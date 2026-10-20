import { ArticleNotFoundError, fetchArticle } from './article';
import { summarize, SummaryError } from './summarize';

export interface Env {
  ANTHROPIC_API_KEY: string;
  ALLOWED_ORIGINS: string;
  SUMMARIES: KVNamespace;
  GENERATE_LIMITER: RateLimit;
}

export interface ArticleSummary {
  id: string;
  title: string;
  summary: string[];
  keywords: string[];
  model: string;
  createdAt: string;
}

// 요약 프롬프트나 출력 형식을 바꾸면 버전을 올려 이전 요약을 새로 만들게 한다.
const KEY_VERSION = 'v1';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const cors = corsHeaders(request, env);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (request.method !== 'GET') return json({ error: 'method_not_allowed' }, 405, cors);

    const id = new URL(request.url).pathname.match(/^\/summary\/(\d{1,9})\/?$/)?.[1];
    if (!id) return json({ error: 'not_found' }, 404, cors);

    const key = `${KEY_VERSION}:${id}`;
    const stored = await env.SUMMARIES.get<ArticleSummary>(key, 'json');
    if (stored) return json(stored, 200, cors, 'public, max-age=3600');

    const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
    const { success } = await env.GENERATE_LIMITER.limit({ key: ip });
    if (!success) return json({ error: 'rate_limited' }, 429, { ...cors, 'Retry-After': '60' });

    try {
      const article = await fetchArticle(id);
      const result = await summarize(env.ANTHROPIC_API_KEY, article);
      const body: ArticleSummary = { id, title: article.title, ...result, createdAt: new Date().toISOString() };
      ctx.waitUntil(env.SUMMARIES.put(key, JSON.stringify(body)));
      return json(body, 200, cors, 'public, max-age=3600');
    } catch (err) {
      console.error(`summary ${id} failed:`, err);
      if (err instanceof ArticleNotFoundError) return json({ error: 'article_not_found' }, 404, cors);
      if (err instanceof SummaryError) return json({ error: 'summary_unavailable' }, 422, cors);
      return json({ error: 'upstream_error' }, 502, cors);
    }
  },
} satisfies ExportedHandler<Env>;

function corsHeaders(request: Request, env: Env): Record<string, string> {
  const origin = request.headers.get('Origin');
  const allowed = env.ALLOWED_ORIGINS.split(',').map(o => o.trim()).filter(Boolean);
  if (!origin || !allowed.includes(origin)) return { Vary: 'Origin' };
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function json(body: unknown, status: number, headers: Record<string, string>, cacheControl = 'no-store'): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': cacheControl },
  });
}
