// app.jsx — 포항공대신문 앱 상태 머신
// screen: 'feed' | 'article' | 'category' | 'bookmark' | 'search'
// feedStyle: 'classic' | 'magazine' | 'minimal' | 'mixed'
// Exports: NewsApp

const { useState: useState$a, useEffect: useEffect$a } = React;

function NewsApp({ feedStyle = 'classic', initDark = false, t: tProp }) {
  const { ARTICLES } = window.POSTECH_DATA;
  const TH = window.POSTECH_THEME;
  const F = window.POSTECH_FONTS;

  const [dark, setDark] = useState$a(initDark);
  const t = tProp || (dark ? TH.dark : TH.light);

  const [tab, setTab] = useState$a('home');
  const [article, setArticle] = useState$a(null);
  const [bookmarks, setBookmarks] = useState$a(
    new Set(ARTICLES.filter(a => a.bookmarked).map(a => a.id))
  );

  const toggleBookmark = (id) => {
    setBookmarks(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const openArticle = (a) => setArticle(a);
  const closeArticle = () => setArticle(null);
  const toggleDark = () => setDark(d => !d);

  const realT = dark ? TH.dark : TH.light;

  // ── feed component map ──────────────────────────────────
  const FeedMap = {
    classic:  window.FeedClassic,
    magazine: window.FeedMagazine,
    minimal:  window.FeedMinimal,
    mixed:    window.FeedMixed,
  };
  const FeedComponent = FeedMap[feedStyle] || window.FeedClassic;

  const feedProps = {
    t: realT, articles: ARTICLES,
    onOpenArticle: openArticle,
    dark, onToggleDark: toggleDark,
  };

  // ── screen routing ──────────────────────────────────────
  const renderScreen = () => {
    // Article overlay (any tab)
    if (article) {
      return (
        <ArticleScreen
          t={realT} article={article}
          onBack={closeArticle}
          dark={dark} onToggleDark={toggleDark}
          bookmarks={bookmarks} onToggleBookmark={toggleBookmark}
        />
      );
    }
    if (tab === 'home')     return <FeedComponent {...feedProps} />;
    if (tab === 'category') return <CategoryScreen t={realT} articles={ARTICLES} onOpenArticle={openArticle} dark={dark} onToggleDark={toggleDark} />;
    if (tab === 'search')   return <SearchScreen t={realT} articles={ARTICLES} onOpenArticle={openArticle} dark={dark} onToggleDark={toggleDark} />;
    if (tab === 'bookmark') return <BookmarkScreen t={realT} articles={ARTICLES} bookmarks={bookmarks} onOpenArticle={openArticle} onToggleBookmark={toggleBookmark} dark={dark} onToggleDark={toggleDark} />;
    return null;
  };

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: realT.surface }}>
      {renderScreen()}
      {/* Tab bar — hide on article view */}
      {!article && (
        <TabBar active={tab} onChange={t => { setTab(t); }} t={realT} />
      )}
    </div>
  );
}

Object.assign(window, { NewsApp });
