'use client';

import { useState, useEffect, useRef } from 'react';
import { lightTheme, darkTheme, fonts } from '@/lib/theme';
import { articles as sampleArticles, categories } from '@/lib/articles';
import type { Article } from '@/types/article';
import TabBar, { type TabKey } from './TabBar';
import FeedClassic from './FeedClassic';
import ArticleScreen from './ArticleScreen';
import CategoryScreen from './CategoryScreen';
import BookmarkScreen from './BookmarkScreen';
import SearchScreen from './SearchScreen';
import UpdateBanner from './UpdateBanner';
import type { AppUpdate } from '@/lib/update';
import type { AlertTarget } from '@/lib/alerts';

const BOOKMARK_STORAGE_KEY = 'postech_times_bookmarks_v1';

// 알림으로 연 기사는 번호와 제목만 안다. 나머지는 기사 화면이 원문에서 불러온다.
function articleFromAlert({ articleId, title }: AlertTarget): Article {
  return {
    id: articleId,
    cat: '속보',
    catColor: 'primary',
    kicker: '포항공대신문',
    title,
    sub: '',
    author: '포항공대신문',
    date: '',
    readTime: '',
    bookmarked: false,
    hero: { hue: 8, label: '포항공대신문' },
    url: `https://times.postech.ac.kr/news/articleView.html?idxno=${articleId}`,
  };
}

function getInitialBookmarks() {
  const defaults = sampleArticles.filter(a => a.bookmarked).map(a => a.id);

  if (typeof window === 'undefined') {
    return new Set(defaults);
  }

  try {
    const raw = window.localStorage.getItem(BOOKMARK_STORAGE_KEY);
    if (!raw) return new Set(defaults);
    const saved = JSON.parse(raw);
    if (!Array.isArray(saved)) return new Set(defaults);
    return new Set(saved.filter((id): id is string => typeof id === 'string'));
  } catch {
    return new Set(defaults);
  }
}

export default function NewsApp() {
  const [dark, setDark] = useState(false);
  const [tab, setTab] = useState<TabKey>('home');
  const [article, setArticle] = useState<Article | null>(null);
  const [articles, setArticles] = useState<Article[]>(sampleArticles);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextPage, setNextPage] = useState(2);
  const [hasMore, setHasMore] = useState(true);
  const [bookmarks, setBookmarks] = useState<Set<string>>(getInitialBookmarks);
  const [update, setUpdate] = useState<AppUpdate | null>(null);
  const articleRef = useRef<Article | null>(null);
  const tabRef = useRef<TabKey>('home');

  const t = dark ? darkTheme : lightTheme;

  useEffect(() => {
    articleRef.current = article;
  }, [article]);

  useEffect(() => {
    tabRef.current = tab;
  }, [tab]);

  useEffect(() => {
    try {
      window.localStorage.setItem(BOOKMARK_STORAGE_KEY, JSON.stringify([...bookmarks]));
    } catch {
      // Ignore storage failures; in-memory bookmarks still work for this session.
    }
  }, [bookmarks]);

  useEffect(() => {
    window.history.replaceState({ screen: 'home' }, '', window.location.href);
  }, []);

  useEffect(() => {
    const onPopState = () => {
      if (article) {
        setArticle(null);
        return;
      }
      if (tab !== 'home') {
        setTab('home');
        return;
      }
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [article, tab]);

  useEffect(() => {
    const onNativeBack = () => {
      if (articleRef.current) {
        setArticle(null);
        window.history.replaceState({ screen: tabRef.current }, '', window.location.href);
        return;
      }

      if (tabRef.current !== 'home') {
        setTab('home');
        window.history.replaceState({ screen: 'home' }, '', window.location.href);
      }
    };

    window.addEventListener('postech-native-back', onNativeBack);
    return () => window.removeEventListener('postech-native-back', onNativeBack);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const { fetchLiveArticles } = await import('@/lib/fetchArticles');
        const live = await fetchLiveArticles();
        if (!cancelled) {
          setArticles(live);
          // Preserve bookmarks for live articles if same id
          setBookmarks(prev => new Set(prev));
        }
      } catch {
        // keep sample articles
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    import('@/lib/update')
      .then(({ checkForUpdate }) => checkForUpdate())
      .then(found => { if (!cancelled && found) setUpdate(found); })
      .catch(() => {
        // 업데이트 확인 실패는 다음 실행 때 다시 시도한다.
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let stop: (() => void) | null = null;
    let cancelled = false;
    import('@/lib/alerts')
      .then(({ startAlerts }) => startAlerts(target => {
        setArticle(articleFromAlert(target));
        window.history.pushState({ screen: 'article', id: target.articleId }, '', window.location.href);
      }))
      .then(cleanup => {
        if (cancelled) cleanup();
        else stop = cleanup;
      })
      .catch(() => {
        // 알림을 켜지 못해도 앱은 그대로 쓴다.
      });
    return () => {
      cancelled = true;
      stop?.();
    };
  }, []);

  const toggleBookmark = (id: string) => {
    setBookmarks(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleDark = () => setDark(d => !d);

  const appendArticles = (incoming: Article[]) => {
    setArticles(prev => {
      const seen = new Set(prev.map(a => a.id));
      const merged = [...prev];
      incoming.forEach(a => {
        if (!seen.has(a.id)) {
          seen.add(a.id);
          merged.push(a);
        }
      });
      return merged;
    });
  };

  const loadMoreArticles = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const { fetchLiveArticlePage } = await import('@/lib/fetchArticles');
      const more = await fetchLiveArticlePage(nextPage);
      if (more.length === 0) {
        setHasMore(false);
      } else {
        appendArticles(more);
        setNextPage(p => p + 1);
      }
    } finally {
      setLoadingMore(false);
    }
  };

  const openArticle = (next: Article) => {
    setArticle(next);
    window.history.pushState({ screen: 'article', id: next.id }, '', window.location.href);
  };

  const closeArticle = () => {
    if (article && window.history.state?.screen === 'article') {
      window.history.back();
      return;
    }
    setArticle(null);
  };

  const changeTab = (next: TabKey) => {
    setTab(next);
    if (next !== 'home') {
      window.history.pushState({ screen: next }, '', window.location.href);
    }
  };

  const feedProps = {
    t,
    articles,
    onOpenArticle: openArticle,
    dark,
    onToggleDark: toggleDark,
    onGoSearch: () => changeTab('search'),
    onLoadMore: loadMoreArticles,
    loadingMore,
    hasMore,
  };

  const renderScreen = () => {
    if (article) {
      return (
        <ArticleScreen
          key={article.id}
          t={t}
          article={article}
          onBack={closeArticle}
          dark={dark}
          onToggleDark={toggleDark}
          bookmarks={bookmarks}
          onToggleBookmark={toggleBookmark}
        />
      );
    }
    if (tab === 'home') {
      return (
        <>
          {loading && (
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0,
              zIndex: 10, background: t.primary,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '6px 16px', gap: 8,
            }}>
              <span style={{ fontFamily: fonts.mono, fontSize: 9, color: 'rgba(255,240,200,0.8)', letterSpacing: 0.6 }}>
                LOADING LATEST ARTICLES
              </span>
            </div>
          )}
          <FeedClassic {...feedProps} />
        </>
      );
    }
    if (tab === 'category') return (
      <CategoryScreen
        t={t}
        articles={articles}
        categories={categories}
        onOpenArticle={openArticle}
        dark={dark}
        onToggleDark={toggleDark}
        onLoadMore={loadMoreArticles}
        loadingMore={loadingMore}
        hasMore={hasMore}
      />
    );
    if (tab === 'search') return (
      <SearchScreen
        t={t}
        articles={articles}
        onOpenArticle={openArticle}
        dark={dark}
        onToggleDark={toggleDark}
        onLoadMore={loadMoreArticles}
        loadingMore={loadingMore}
        hasMore={hasMore}
      />
    );
    if (tab === 'bookmark') return (
      <BookmarkScreen
        t={t}
        articles={articles}
        bookmarks={bookmarks}
        onOpenArticle={openArticle}
        onToggleBookmark={toggleBookmark}
        dark={dark}
        onToggleDark={toggleDark}
      />
    );
    return null;
  };

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: t.surface, position: 'relative' }}>
      {renderScreen()}
      {!article && (
        <TabBar active={tab} onChange={changeTab} t={t} />
      )}
      {update && !article && (
        <UpdateBanner t={t} update={update} onDismiss={() => setUpdate(null)} />
      )}
    </div>
  );
}
