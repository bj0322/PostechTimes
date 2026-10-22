import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { ArticleNotFoundError } from './article.ts';
import { startPrefetch } from './prefetch.ts';
import { generate, isGenerating, readStored } from './store.ts';
import { MODEL, SummaryError } from './summarize.ts';

const PORT = Number(process.env.PORT ?? 8787);
const HOST = process.env.HOST ?? '0.0.0.0';
// 요약 API를 호출할 수 있는 웹 출처(쉼표로 구분). Android 앱은 https://localhost, iOS 앱은 capacitor://localhost입니다.
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? 'https://localhost,capacitor://localhost,http://localhost:3000')
  .split(',').map(o => o.trim()).filter(Boolean);
// 리버스 프록시(Caddy, nginx, Cloudflare Tunnel 등) 뒤에서 돌릴 때만 켠다. 켜면 X-Forwarded-For를 믿는다.
const TRUST_PROXY = process.env.TRUST_PROXY === '1';

// 저장된 요약이 없어 새로 만들어야 하는 요청만 IP당 1분에 10회로 제한한다.
const LIMIT = 10;
const WINDOW_MS = 60_000;
const hits = new Map<string, number[]>();

function allowGenerate(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter(t => now - t < WINDOW_MS);
  if (recent.length >= LIMIT) {
    hits.set(ip, recent);
    return false;
  }
  recent.push(now);
  hits.set(ip, recent);
  return true;
}
setInterval(() => {
  const now = Date.now();
  for (const [ip, times] of hits) if (times.every(t => now - t >= WINDOW_MS)) hits.delete(ip);
}, WINDOW_MS).unref();

function clientIp(req: IncomingMessage): string {
  if (TRUST_PROXY) {
    const forwarded = String(req.headers['x-forwarded-for'] ?? '').split(',')[0]?.trim();
    if (forwarded) return forwarded;
  }
  return req.socket.remoteAddress ?? 'unknown';
}

function corsHeaders(req: IncomingMessage): Record<string, string> {
  const origin = req.headers.origin;
  if (!origin || !ALLOWED_ORIGINS.includes(origin)) return { Vary: 'Origin' };
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function send(res: ServerResponse, body: unknown, status: number, headers: Record<string, string>, cacheControl = 'no-store') {
  res.writeHead(status, { ...headers, 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': cacheControl });
  res.end(JSON.stringify(body));
}

const server = createServer(async (req, res) => {
  const cors = corsHeaders(req);
  if (req.method === 'OPTIONS') {
    res.writeHead(204, cors);
    return void res.end();
  }
  if (req.method !== 'GET') return send(res, { error: 'method_not_allowed' }, 405, cors);

  const path = new URL(req.url ?? '/', 'http://localhost').pathname;
  if (path === '/health') return send(res, { ok: true, model: MODEL }, 200, cors);

  const id = path.match(/^\/summary\/(\d{1,9})\/?$/)?.[1];
  if (!id) return send(res, { error: 'not_found' }, 404, cors);

  const stored = await readStored(id);
  if (stored) return send(res, stored, 200, cors, 'public, max-age=3600');

  if (!isGenerating(id) && !allowGenerate(clientIp(req))) {
    return send(res, { error: 'rate_limited' }, 429, { ...cors, 'Retry-After': '60' });
  }

  try {
    return send(res, await generate(id), 200, cors, 'public, max-age=3600');
  } catch (err) {
    console.error(`summary ${id} failed:`, err);
    if (err instanceof ArticleNotFoundError) return send(res, { error: 'article_not_found' }, 404, cors);
    if (err instanceof SummaryError) return send(res, { error: 'summary_unavailable' }, 422, cors);
    return send(res, { error: 'upstream_error' }, 502, cors);
  }
});

server.listen(PORT, HOST, () => {
  console.log(`summary server on http://${HOST}:${PORT} (model ${MODEL})`);
  startPrefetch();
});
