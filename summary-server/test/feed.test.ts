import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkFeed, SiteBlockedError } from '../src/feed.ts';

const ETAG = '"10c2c-65dedfc6abf3e"';
const LAST = 'Fri, 16 Oct 2026 04:56:23 GMT';

function fake(handler: (headers: Headers) => Response) {
  const calls: { url: string; init: RequestInit }[] = [];
  const impl = (async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    return handler(new Headers(init.headers));
  }) as unknown as typeof fetch;
  return { impl, calls };
}

test('first check reads validators, later checks send them and get 304', async () => {
  const { impl, calls } = fake(h =>
    h.get('if-none-match') === ETAG
      ? new Response(null, { status: 304 })
      : new Response('<rss/>', { status: 200, headers: { etag: ETAG, 'last-modified': LAST } }));

  const first = await checkFeed('https://x', {}, impl);
  assert.equal(first.changed, true);
  assert.deepEqual(first.changed && first.next, { etag: ETAG, lastModified: LAST });

  const second = await checkFeed('https://x', { etag: ETAG, lastModified: LAST }, impl);
  assert.deepEqual(second, { changed: false });
  assert.equal(calls[1].init.method ?? 'GET', 'GET');           // HEAD는 보안 장치가 막는다
  assert.equal(calls[1].init.redirect, 'manual');
  assert.equal(new Headers(calls[1].init.headers).get('if-modified-since'), LAST);
});

test('200 with the same validators is not a change', async () => {
  const { impl } = fake(() => new Response('<rss/>', { status: 200, headers: { etag: ETAG, 'last-modified': LAST } }));
  assert.deepEqual(await checkFeed('https://x', { etag: ETAG, lastModified: LAST }, impl), { changed: false });
});

test('redirect to the security error page is a block, not an empty site', async () => {
  const { impl } = fake(() => new Response(null, { status: 302, headers: { location: 'http://se-cu.com/ndsoft/error.html' } }));
  await assert.rejects(checkFeed('https://x', {}, impl), SiteBlockedError);
});
