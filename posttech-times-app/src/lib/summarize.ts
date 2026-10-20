export interface ArticleSummary {
  id: string;
  title: string;
  summary: string[];
  keywords: string[];
  model: string;
  createdAt: string;
}

const API_URL = (process.env.NEXT_PUBLIC_SUMMARY_API_URL ?? '').replace(/\/+$/, '');
const CACHE_PREFIX = 'postech_summary_v1:';

// 요약 서버는 포항공대신문 기사 번호(idxno)로만 요약한다. 샘플 기사는 대상이 아니다.
export function canSummarize(articleId: string): boolean {
  return Boolean(API_URL) && /^\d+$/.test(articleId);
}

function loadCache(id: string): ArticleSummary | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + id);
    return raw ? (JSON.parse(raw) as ArticleSummary) : null;
  } catch {
    return null;
  }
}

function saveCache(summary: ArticleSummary): void {
  try {
    localStorage.setItem(CACHE_PREFIX + summary.id, JSON.stringify(summary));
  } catch {
    // Ignore quota or private-mode storage failures.
  }
}

export async function fetchSummary(id: string): Promise<ArticleSummary> {
  const cached = loadCache(id);
  if (cached) return cached;

  const res = await fetch(`${API_URL}/summary/${id}`);
  if (!res.ok) throw new Error(`HTTP ${res.status} summary ${id}`);
  const summary = (await res.json()) as ArticleSummary;
  saveCache(summary);
  return summary;
}
