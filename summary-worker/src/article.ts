import { cleanParagraphs, stripSiteSuffix } from './text';

const BASE = 'https://times.postech.ac.kr';
const BODY_PARAGRAPHS = '#article-view-content-div p';

export interface SourceArticle {
  id: string;
  url: string;
  title: string;
  paragraphs: string[];
}

export class ArticleNotFoundError extends Error {}

// 앱의 fetchArticleDetail(posttech-times-app/src/lib/fetchArticles.ts)과 같은 본문 영역을 읽는다.
// 사이트 구조가 바뀌면 두 곳을 함께 고친다.
export async function fetchArticle(id: string): Promise<SourceArticle> {
  const url = `${BASE}/news/articleView.html?idxno=${id}`;
  const res = await fetch(url, { headers: { Accept: 'text/html' } });
  if (res.status === 404) throw new ArticleNotFoundError(`article ${id} not found`);
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);

  let title = '';
  const paragraphs: string[] = [];
  await new HTMLRewriter()
    .on('meta[property="og:title"]', {
      element(el) {
        title = el.getAttribute('content') ?? '';
      },
    })
    .on(BODY_PARAGRAPHS, {
      element() {
        paragraphs.push('');
      },
      text(chunk) {
        paragraphs[paragraphs.length - 1] += chunk.text;
      },
    })
    .transform(res)
    .arrayBuffer();

  const body = cleanParagraphs(paragraphs);
  if (!body.length) throw new ArticleNotFoundError(`article ${id} has no body`);
  return { id, url, title: stripSiteSuffix(title), paragraphs: body };
}
