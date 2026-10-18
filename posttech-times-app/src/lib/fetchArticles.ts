import type { Article } from '@/types/article';
import { articles as sampleArticles } from './articles';

const BASE = 'https://times.postech.ac.kr';

type SectionInfo = {
  code: string;
  cat: Article['cat'];
  color: Article['catColor'];
  hue: number;
  label: string;
  english?: boolean;
};

export const SITE_SECTIONS: SectionInfo[] = [
  { code: 'S1N1', cat: '보도', color: 'primary', hue: 8, label: '보도' },
  { code: 'S1N26', cat: '대학', color: 'primary', hue: 205, label: '대학' },
  { code: 'S1N20', cat: '사회', color: 'primary', hue: 25, label: '사회' },
  { code: 'S1N6', cat: '문화', color: 'rose', hue: 330, label: '문화' },
  { code: 'S1N31', cat: '과학', color: 'forest', hue: 120, label: '과학' },
  { code: 'S1N22', cat: '인터뷰', color: 'gold', hue: 38, label: '인터뷰' },
  { code: 'S1N5', cat: '학술', color: 'forest', hue: 95, label: '학술' },
  { code: 'S1N32', cat: '기자의시선', color: 'ink', hue: 230, label: '기자의시선' },
  { code: 'S1N27', cat: '여론', color: 'ink', hue: 220, label: '여론' },
  { code: 'S1N25', cat: '특집', color: 'gold', hue: 45, label: '특집' },
  { code: 'S1N28', cat: 'Headlines', color: 'primary', hue: 8, label: 'Headlines', english: true },
  { code: 'S1N9', cat: 'News', color: 'forest', hue: 125, label: 'News', english: true },
  { code: 'S1N10', cat: 'Campus', color: 'primary', hue: 205, label: 'Campus', english: true },
  { code: 'S1N24', cat: 'Postech Microscope', color: 'gold', hue: 45, label: 'Postech Microscope', english: true },
  { code: 'S1N13', cat: 'Opinion', color: 'ink', hue: 225, label: 'Opinion', english: true },
  { code: 'S1N14', cat: 'Feature', color: 'gold', hue: 35, label: 'Feature', english: true },
  { code: 'S1N30', cat: 'Culture', color: 'rose', hue: 330, label: 'Culture', english: true },
];

const CACHE_KEY = 'postech_articles_v6';
const CACHE_TTL = 10 * 60 * 1000;

function absoluteUrl(path: string, base = `${BASE}/news/articleList.html`): string {
  return new URL(path.replace(/^http:\/\//, 'https://'), base).href.replace(/^http:\/\//, 'https://');
}

async function fetchText(url: string): Promise<string> {
  const win = typeof window !== 'undefined'
    ? (window as Window & { Capacitor?: { isNativePlatform?: () => boolean } })
    : null;

  if (win?.Capacitor?.isNativePlatform?.()) {
    try {
      const { CapacitorHttp } = await import('@capacitor/core');
      const res = await CapacitorHttp.get({ url, headers: { Accept: 'text/html,*/*' } });
      if (res.status >= 200 && res.status < 300) return String(res.data);
    } catch {
      // Browser fetch remains useful during local development.
    }
  }

  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  return res.text();
}

function text(el: Element | null): string {
  return (el?.textContent ?? '').replace(/\s+/g, ' ').trim();
}

function meta(doc: Document, selector: string): string {
  return doc.querySelector(selector)?.getAttribute('content')?.trim() ?? '';
}

function stripSiteSuffix(title: string): string {
  return title.replace(/\s+-\s+포항공대신문\s*$/, '').trim();
}

function parseDate(raw: string): string {
  const m = raw.match(/(\d{4})[-.](\d{2})[-.](\d{2})/);
  return m ? `${m[1]}.${m[2]}.${m[3]}` : '';
}

function readTime(summary: string): string {
  const words = summary.length / 3;
  return `${Math.max(1, Math.ceil(words / 450))}분`;
}

function itemFromListBlock(block: Element, section: SectionInfo, listUrl: string): Article | null {
  const link = block.querySelector<HTMLAnchorElement>('.list-titles a[href*="articleView"], a[href*="articleView"]');
  const href = link?.getAttribute('href') ?? '';
  const id = href.match(/idxno=(\d+)/)?.[1];
  const title = text(link?.querySelector('strong') ?? link);
  if (!id || !title) return null;

  const summary = text(block.querySelector('.list-summary a, .list-summary'));
  const dated = text(block.querySelector('.list-dated'));
  const parts = dated.split('|').map(part => part.trim()).filter(Boolean);
  const detailCat = parts[0] || section.label;
  const author = parts[1] || '포항공대신문';
  const date = parseDate(parts[2] || dated);

  const bg = block.querySelector<HTMLElement>('.list-image')?.style.backgroundImage ?? '';
  const bgPath = bg.match(/url\(["']?(.+?)["']?\)/)?.[1] ?? '';
  const img = block.querySelector<HTMLImageElement>('img')?.getAttribute('src') ?? bgPath;

  return {
    id,
    cat: section.cat,
    catColor: section.color,
    kicker: detailCat,
    title,
    sub: summary,
    author,
    date,
    readTime: readTime(summary),
    bookmarked: false,
    hero: { hue: section.hue, label: detailCat },
    url: absoluteUrl(href, listUrl),
    imageUrl: img ? absoluteUrl(img, listUrl) : undefined,
  };
}

function parseList(html: string, section: SectionInfo, listUrl: string): Article[] {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return Array.from(doc.querySelectorAll('.article-list-content .list-block, .list-block'))
    .map(block => itemFromListBlock(block, section, listUrl))
    .filter((article): article is Article => Boolean(article));
}

function loadCache(): Article[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { ts, data } = JSON.parse(raw) as { ts: number; data: Article[] };
    if (Date.now() - ts > CACHE_TTL) return null;
    return data;
  } catch {
    return null;
  }
}

function saveCache(articles: Article[]): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: articles }));
  } catch {
    // Ignore quota or private-mode storage failures.
  }
}

export async function fetchLiveArticles(): Promise<Article[]> {
  const cached = loadCache();
  if (cached && cached.length >= 8) return cached;

  const articles = await fetchLiveArticlePage(1);
  if (articles.length >= 8) {
    saveCache(articles);
    return articles;
  }

  return sampleArticles;
}

export async function fetchLiveArticlePage(page = 1): Promise<Article[]> {
  const pages = await Promise.allSettled(
    SITE_SECTIONS.map(async section => {
      const url = `${BASE}/news/articleList.html?sc_section_code=${section.code}&view_type=sm&page=${page}`;
      return parseList(await fetchText(url), section, url);
    })
  );

  const seen = new Set<string>();
  const articles = pages
    .flatMap(result => result.status === 'fulfilled' ? result.value : [])
    .filter(article => {
      if (seen.has(article.id)) return false;
      seen.add(article.id);
      return true;
    })
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    .slice(0, 260);

  if (articles.length === 0) {
    const failures = pages.filter(result => result.status === 'rejected').length;
    if (failures) console.warn(`[fetchArticles] page ${page} failed for ${failures} sections`);
  }

  return articles;
}

export async function fetchArticleDetail(article: Article): Promise<Article> {
  if (!article.url) return article;

  const html = await fetchText(article.url);
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const bodyRoot = doc.querySelector('#article-view-content-div');
  const body = Array.from(bodyRoot?.querySelectorAll('p') ?? [])
    .map(p => text(p))
    .filter(p => p && p !== '&nbsp;' && !p.includes('저작권자'))
    .slice(0, 80);

  const imageUrl =
    meta(doc, 'meta[property="og:image"]') ||
    bodyRoot?.querySelector<HTMLImageElement>('img')?.getAttribute('src') ||
    article.imageUrl;

  const title = stripSiteSuffix(meta(doc, 'meta[property="og:title"]') || doc.title || article.title);
  const sub = meta(doc, 'meta[property="og:description"]') || meta(doc, 'meta[name="description"]') || article.sub;
  const author = meta(doc, 'meta[property="og:article:author"]') || meta(doc, 'meta[name="twitter:creator"]') || article.author;
  const published = meta(doc, 'meta[property="article:published_time"]');
  const section = meta(doc, 'meta[property="article:section"]') || article.cat;

  return {
    ...article,
    title,
    sub,
    author,
    date: parseDate(published) || article.date,
    kicker: section,
    readTime: readTime(body.join(' ') || sub),
    body: body.length ? body : article.body,
    imageUrl: imageUrl ? absoluteUrl(imageUrl, article.url) : undefined,
  };
}
