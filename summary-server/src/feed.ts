// 사이트 변경 신호.
//
// RSS 전체기사 피드(/rss/allArticle.xml)는 정적 파일이라 ETag·Last-Modified가 붙고, 기사가 올라오거나
// 고쳐지면 바뀐다(피드 안 lastBuildDate와 같은 값). 지난번 값을 함께 보내는 조건부 GET이면, 바뀌지 않았을 때
// 서버가 본문 없이 304만 돌려준다. 그래서 섹션 목록은 사이트가 바뀌었을 때만 확인하면 된다.
//
// - HEAD는 쓰지 않는다. 사이트 보안 장치가 HEAD를 오류 페이지(se-cu.com/ndsoft/error.html)로 302 리디렉션한다.
// - 리디렉션은 따라가지 않는다. 오류 페이지로 보내진 것은 차단으로 보고, 그동안은 목록 확인을 쉰다.
// - 피드 내용은 신호로만 쓴다. 호를 올리는 날은 피드 창(최근 수십 건)을 넘길 만큼 기사가 올라온다.

export type Validators = { etag?: string; lastModified?: string };

export type FeedCheck =
  | { changed: false }
  | { changed: true; next: Validators };

export class SiteBlockedError extends Error {}

export async function checkFeed(base: string, previous: Validators, fetchImpl: typeof fetch = fetch): Promise<FeedCheck> {
  const headers: Record<string, string> = {};
  if (previous.etag) headers['If-None-Match'] = previous.etag;
  if (previous.lastModified) headers['If-Modified-Since'] = previous.lastModified;

  const res = await fetchImpl(`${base}/rss/allArticle.xml`, {
    headers,
    redirect: 'manual',
    signal: AbortSignal.timeout(15_000),
  });
  if (res.status === 304) return { changed: false };
  if (res.status >= 300 && res.status < 400) {
    throw new SiteBlockedError(`site redirected to ${res.headers.get('location') ?? '?'} (${res.status})`);
  }
  if (res.status === 403 || res.status === 429) throw new SiteBlockedError(`site refused (${res.status})`);
  if (!res.ok) throw new Error(`HTTP ${res.status} rss`);
  await res.body?.cancel();   // 본문(약 70KB)은 필요 없다

  const next: Validators = {
    etag: res.headers.get('etag') ?? undefined,
    lastModified: res.headers.get('last-modified') ?? undefined,
  };
  // 서버가 조건부 요청을 무시하고 200을 주더라도, 값이 같으면 바뀌지 않은 것이다.
  const same = !!(next.etag || next.lastModified) &&
    next.etag === previous.etag && next.lastModified === previous.lastModified;
  return same ? { changed: false } : { changed: true, next };
}
