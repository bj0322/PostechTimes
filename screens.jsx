// screens.jsx — 기사 상세, 카테고리, 북마크, 검색 화면
// Exports: ArticleScreen, CategoryScreen, BookmarkScreen, SearchScreen

const { useState: useState$s, useRef: useRef$s } = React;
const Fs = window.POSTECH_FONTS;

// ── 기사 상세 ─────────────────────────────────────────────────────
function ArticleScreen({ t, article: a, onBack, dark, onToggleDark, onToggleBookmark, bookmarks }) {
  const [fontSize, setFontSize] = useState$s(15);
  const [showFontPanel, setShowFontPanel] = useState$s(false);
  const isBookmarked = bookmarks.has(a.id);

  const body = a.body || [
    a.sub,
    `${a.author}가 취재한 이 기사는 포항공대 캠퍼스 일상과 학문, 그리고 공동체에 관한 이야기를 담고 있다. 포항공대신문은 1988년 창간 이후 포스텍 구성원들의 목소리를 기록해왔다.`,
    `"이번 사안은 단순한 행정적 결정이 아니라 학생 전체의 삶과 직결된 문제입니다." 학생 대표 김○○씨는 본지와의 인터뷰에서 이같이 말했다. 그는 총학생회 차원에서 공식 의견서를 제출할 예정이라고 밝혔다.`,
    `한편 학교 측은 해당 사안에 대해 충분한 논의를 거쳤다는 입장이다. 관련 위원회는 다음 달 중 공청회를 열어 학생·교수·직원 의견을 수렴할 계획이다.`,
    `포항공대신문은 이 사안의 추이를 계속 지켜보며 후속 취재를 이어나갈 예정이다.`,
  ];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: t.surface, overflow: 'hidden' }}>
      {/* top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', padding: '6px 10px 6px',
        borderBottom: `1px solid ${t.line}`, background: t.surface,
        gap: 4, flexShrink: 0,
      }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.ink, padding: 6, borderRadius: 6, display: 'flex' }}>
          <ArrowLeftIcon size={20} />
        </button>
        <div style={{ flex: 1, textAlign: 'center', fontFamily: Fs.serif, fontSize: 13, fontWeight: 700, color: t.primary, letterSpacing: -0.2 }}>
          포항공대신문
        </div>
        <button onClick={() => setShowFontPanel(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.muted, padding: 6, borderRadius: 6, display: 'flex' }}>
          <FontIcon size={18} />
        </button>
        <button onClick={() => onToggleBookmark(a.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: isBookmarked ? t.primary : t.muted, padding: 6, borderRadius: 6, display: 'flex' }}>
          <BookmarkIcon size={18} filled={isBookmarked} color={t.primary} />
        </button>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.muted, padding: 6, borderRadius: 6, display: 'flex' }}>
          <ShareIcon size={18} />
        </button>
      </div>

      {/* font size panel */}
      {showFontPanel && (
        <div style={{
          background: t.surfaceAlt, borderBottom: `1px solid ${t.line}`,
          padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
        }}>
          <span style={{ fontFamily: Fs.mono, fontSize: 10, color: t.muted, letterSpacing: 0.4 }}>글자 크기</span>
          <button onClick={() => setFontSize(v => Math.max(12, v - 1))} style={{ background: t.surface, border: `1px solid ${t.line}`, borderRadius: 4, cursor: 'pointer', color: t.ink, width: 28, height: 28, fontFamily: Fs.sans, fontSize: 16 }}>−</button>
          <span style={{ fontFamily: Fs.mono, fontSize: 11, color: t.ink, minWidth: 24, textAlign: 'center' }}>{fontSize}</span>
          <button onClick={() => setFontSize(v => Math.min(22, v + 1))} style={{ background: t.surface, border: `1px solid ${t.line}`, borderRadius: 4, cursor: 'pointer', color: t.ink, width: 28, height: 28, fontFamily: Fs.sans, fontSize: 16 }}>+</button>
          <div style={{ flex: 1 }} />
          <button onClick={onToggleDark} style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.muted, padding: 4 }}>
            {dark ? <SunIcon size={17} /> : <MoonIcon size={17} />}
          </button>
        </div>
      )}

      {/* scroll body */}
      <div style={{ flex: 1, overflowY: 'auto', background: t.surface }}>
        {/* hero photo */}
        <PhotoBlock hue={a.hero.hue} label={a.hero.label} ratio="3/2" />

        <div style={{ padding: '18px 20px 0' }}>
          {/* kicker + cat */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <CatBadge cat={a.cat} color={a.catColor} t={t} filled size="lg" />
            {a.kicker && (
              <span style={{ fontFamily: Fs.mono, fontSize: 9, color: t.muted, letterSpacing: 0.5 }}>{a.kicker}</span>
            )}
          </div>

          {/* title */}
          <h1 style={{
            fontFamily: Fs.serif, fontSize: 22, fontWeight: 800, color: t.ink,
            lineHeight: 1.3, letterSpacing: -0.5, margin: '0 0 10px',
          }}>{a.title}</h1>

          {/* subtitle */}
          <p style={{
            fontFamily: Fs.sans, fontSize: 14.5, color: t.inkSoft, lineHeight: 1.7,
            margin: '0 0 14px', borderLeft: `2.5px solid ${t.primary}`, paddingLeft: 12,
          }}>{a.sub}</p>

          {/* meta */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 0', borderTop: `1px solid ${t.lineSoft}`, borderBottom: `1px solid ${t.lineSoft}`,
            marginBottom: 20,
          }}>
            <div>
              <div style={{ fontFamily: Fs.sans, fontSize: 12.5, fontWeight: 600, color: t.ink }}>{a.author}</div>
              <div style={{ fontFamily: Fs.mono, fontSize: 10, color: t.muted, letterSpacing: 0.3, marginTop: 2 }}>{a.date} · {a.readTime}</div>
            </div>
            <button onClick={() => onToggleBookmark(a.id)} style={{
              background: isBookmarked ? t.primaryWash : t.surfaceAlt,
              border: `1px solid ${isBookmarked ? t.primary : t.line}`,
              borderRadius: 6, cursor: 'pointer', color: isBookmarked ? t.primary : t.muted,
              padding: '5px 10px', display: 'flex', alignItems: 'center', gap: 4,
              fontFamily: Fs.sans, fontSize: 11, fontWeight: 600,
            }}>
              <BookmarkIcon size={13} filled={isBookmarked} color={isBookmarked ? t.primary : t.muted} />
              {isBookmarked ? '저장됨' : '스크랩'}
            </button>
          </div>

          {/* body paragraphs */}
          {body.map((para, i) => (
            <p key={i} style={{
              fontFamily: Fs.serif, fontSize, color: t.ink,
              lineHeight: 1.9, margin: '0 0 18px', letterSpacing: -0.1,
            }}>{para}</p>
          ))}

          {/* tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '14px 0', borderTop: `1px solid ${t.lineSoft}` }}>
            {['#포스텍', `#${a.cat}`, '#포항공대신문'].map(tag => (
              <span key={tag} style={{
                fontFamily: Fs.mono, fontSize: 11, color: t.muted,
                background: t.surfaceAlt, padding: '4px 8px', borderRadius: 4, letterSpacing: 0.2,
              }}>{tag}</span>
            ))}
          </div>

          {/* share row */}
          <div style={{ display: 'flex', gap: 8, padding: '12px 0 24px' }}>
            {['SNS 공유', '링크 복사', '카카오'].map(l => (
              <button key={l} style={{
                flex: 1, border: `1px solid ${t.line}`, background: t.surfaceAlt,
                borderRadius: 6, cursor: 'pointer', padding: '8px 4px',
                fontFamily: Fs.sans, fontSize: 11, color: t.inkSoft,
              }}>{l}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── 카테고리 / 섹션 ───────────────────────────────────────────────
function CategoryScreen({ t, articles, onOpenArticle, dark, onToggleDark }) {
  const { CATEGORIES } = window.POSTECH_DATA;
  const [active, setActive] = useState$s('전체');
  const filtered = active === '전체' ? articles : articles.filter(a => a.cat === active);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: t.bg }}>
      {/* header */}
      <div style={{ background: t.surface, borderBottom: `1px solid ${t.line}`, padding: '10px 16px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 10 }}>
          <div style={{ fontFamily: Fs.serif, fontSize: 18, fontWeight: 700, color: t.ink, letterSpacing: -0.3 }}>섹션</div>
          <button onClick={onToggleDark} style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.muted, padding: 4 }}>
            {dark ? <SunIcon size={18} /> : <MoonIcon size={18} />}
          </button>
        </div>
        {/* category chips row */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 10, scrollbarWidth: 'none' }}>
          {CATEGORIES.map(c => {
            const on = active === c.key;
            return (
              <button key={c.key} onClick={() => setActive(c.key)} style={{
                flexShrink: 0, border: `1px solid ${on ? t.primary : t.line}`,
                background: on ? t.primary : t.surface,
                color: on ? '#FFF8EC' : t.ink,
                borderRadius: 20, padding: '5px 14px',
                fontFamily: Fs.sans, fontSize: 12.5, fontWeight: on ? 700 : 500,
                cursor: 'pointer',
              }}>{c.label}</button>
            );
          })}
        </div>
      </div>

      {/* section description */}
      {active !== '전체' && (
        <div style={{
          background: t.primaryWash, padding: '8px 16px',
          fontFamily: Fs.sans, fontSize: 12, color: t.primary, borderBottom: `1px solid ${t.line}`,
        }}>
          {CATEGORIES.find(c => c.key === active)?.desc}
        </div>
      )}

      {/* article list */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', fontFamily: Fs.sans, fontSize: 13, color: t.muted }}>
            해당 섹션에 기사가 없습니다.
          </div>
        ) : (
          <div style={{ background: t.surface }}>
            {filtered.map((a, i) => (
              <React.Fragment key={a.id}>
                <button onClick={() => onOpenArticle(a)} style={{
                  width: '100%', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left',
                  display: 'flex', gap: 12, alignItems: 'flex-start', padding: '14px 16px',
                }}>
                  <div style={{ width: 76, flexShrink: 0 }}>
                    <PhotoBlock hue={a.hero.hue} label="" ratio="1" radius={4} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <CatBadge cat={a.cat} color={a.catColor} t={t} />
                    <div style={{ fontFamily: Fs.serif, fontSize: 14, fontWeight: 700, color: t.ink, lineHeight: 1.45, margin: '5px 0 5px', letterSpacing: -0.1 }}>{a.title}</div>
                    <MetaLine a={a} t={t} dim />
                  </div>
                </button>
                {i < filtered.length - 1 && <Divider t={t} />}
              </React.Fragment>
            ))}
          </div>
        )}
        <div style={{ height: 20 }} />
      </div>
    </div>
  );
}

// ── 스크랩 / 북마크 ──────────────────────────────────────────────
function BookmarkScreen({ t, articles, bookmarks, onOpenArticle, onToggleBookmark, dark, onToggleDark }) {
  const saved = articles.filter(a => bookmarks.has(a.id));

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: t.bg }}>
      <div style={{ background: t.surface, borderBottom: `1px solid ${t.line}`, padding: '12px 16px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: Fs.serif, fontSize: 18, fontWeight: 700, color: t.ink, letterSpacing: -0.3 }}>스크랩</div>
            <div style={{ fontFamily: Fs.mono, fontSize: 10, color: t.muted, letterSpacing: 0.4, marginTop: 2 }}>{saved.length}개 저장됨</div>
          </div>
          <div style={{ display: 'flex', gap: 2 }}>
            <button onClick={onToggleDark} style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.muted, padding: 6 }}>
              {dark ? <SunIcon size={18} /> : <MoonIcon size={18} />}
            </button>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.muted, padding: 6 }}>
              <FilterIcon size={18} />
            </button>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {saved.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <div style={{ fontFamily: Fs.sans, fontSize: 32, marginBottom: 12, opacity: 0.3 }}>
              <BookmarkIcon size={40} color={t.muted} />
            </div>
            <div style={{ fontFamily: Fs.serif, fontSize: 17, color: t.ink, marginBottom: 6 }}>아직 스크랩한 기사가 없어요</div>
            <div style={{ fontFamily: Fs.sans, fontSize: 13, color: t.muted }}>기사를 읽다가 북마크 버튼을 누르면<br />여기에 저장됩니다.</div>
          </div>
        ) : (
          <div style={{ background: t.surface }}>
            {saved.map((a, i) => (
              <React.Fragment key={a.id}>
                <div style={{ display: 'flex', alignItems: 'flex-start', padding: '14px 16px', gap: 12 }}>
                  <button onClick={() => onOpenArticle(a)} style={{
                    flex: 1, border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left',
                    display: 'flex', gap: 12, alignItems: 'flex-start', padding: 0,
                  }}>
                    <div style={{ width: 76, flexShrink: 0 }}>
                      <PhotoBlock hue={a.hero.hue} label="" ratio="1" radius={4} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <CatBadge cat={a.cat} color={a.catColor} t={t} />
                      <div style={{ fontFamily: Fs.serif, fontSize: 14, fontWeight: 700, color: t.ink, lineHeight: 1.45, margin: '5px 0 5px', letterSpacing: -0.1 }}>{a.title}</div>
                      <MetaLine a={a} t={t} dim />
                    </div>
                  </button>
                  <button onClick={() => onToggleBookmark(a.id)} style={{
                    background: 'none', border: 'none', cursor: 'pointer', color: t.primary, padding: 4,
                    flexShrink: 0, marginTop: 2,
                  }}>
                    <BookmarkIcon size={18} filled color={t.primary} />
                  </button>
                </div>
                {i < saved.length - 1 && <Divider t={t} />}
              </React.Fragment>
            ))}
          </div>
        )}
        <div style={{ height: 20 }} />
      </div>
    </div>
  );
}

// ── 검색 ─────────────────────────────────────────────────────────
function SearchScreen({ t, articles, onOpenArticle, dark, onToggleDark }) {
  const [query, setQuery] = useState$s('');
  const results = query.trim().length > 0
    ? articles.filter(a => a.title.includes(query) || a.sub.includes(query) || a.cat.includes(query))
    : [];

  const recent = ['총학생회', 'RC', '태양전지', '도서관'];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: t.bg }}>
      {/* search header */}
      <div style={{ background: t.surface, borderBottom: `1px solid ${t.line}`, padding: '10px 14px', flexShrink: 0 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: t.surfaceAlt, borderRadius: 10, padding: '8px 12px',
          border: `1px solid ${t.line}`,
        }}>
          <SearchIcon size={17} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="기사 검색..."
            style={{
              flex: 1, border: 'none', background: 'none', outline: 'none',
              fontFamily: Fs.sans, fontSize: 14, color: t.ink,
              '::placeholder': { color: t.muted },
            }}
          />
          {query && (
            <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.muted, padding: 0 }}>×</button>
          )}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {query.trim() === '' ? (
          <div style={{ padding: '16px' }}>
            <div style={{ fontFamily: Fs.mono, fontSize: 10, color: t.muted, letterSpacing: 0.6, marginBottom: 10 }}>최근 검색어</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {recent.map(r => (
                <button key={r} onClick={() => setQuery(r)} style={{
                  fontFamily: Fs.sans, fontSize: 13, color: t.ink,
                  background: t.surface, border: `1px solid ${t.line}`,
                  borderRadius: 20, padding: '5px 14px', cursor: 'pointer',
                }}>{r}</button>
              ))}
            </div>
            <div style={{ marginTop: 24, fontFamily: Fs.mono, fontSize: 10, color: t.muted, letterSpacing: 0.6, marginBottom: 10 }}>인기 섹션</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, background: t.surface, borderRadius: 8, overflow: 'hidden', border: `1px solid ${t.line}` }}>
              {['학내', '학술', '문화', '오피니언'].map((cat, i, arr) => (
                <React.Fragment key={cat}>
                  <button onClick={() => setQuery(cat)} style={{
                    border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 14px', fontFamily: Fs.sans, fontSize: 14, color: t.ink,
                  }}>
                    <span>{cat}</span>
                    <ChevronIcon size={16} />
                  </button>
                  {i < arr.length - 1 && <Divider t={t} />}
                </React.Fragment>
              ))}
            </div>
          </div>
        ) : results.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', fontFamily: Fs.sans, fontSize: 13, color: t.muted }}>
            "{query}"에 대한 검색 결과가 없습니다.
          </div>
        ) : (
          <div style={{ background: t.surface }}>
            <div style={{ padding: '8px 16px', fontFamily: Fs.mono, fontSize: 10, color: t.muted, letterSpacing: 0.4 }}>
              {results.length}개 결과
            </div>
            {results.map((a, i) => (
              <React.Fragment key={a.id}>
                <button onClick={() => onOpenArticle(a)} style={{
                  width: '100%', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left',
                  display: 'flex', gap: 12, alignItems: 'flex-start', padding: '12px 16px',
                }}>
                  <div style={{ width: 70, flexShrink: 0 }}>
                    <PhotoBlock hue={a.hero.hue} label="" ratio="1" radius={4} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <CatBadge cat={a.cat} color={a.catColor} t={t} />
                    <div style={{ fontFamily: Fs.serif, fontSize: 13.5, fontWeight: 700, color: t.ink, lineHeight: 1.45, margin: '5px 0 5px' }}>{a.title}</div>
                    <MetaLine a={a} t={t} dim />
                  </div>
                </button>
                {i < results.length - 1 && <Divider t={t} />}
              </React.Fragment>
            ))}
          </div>
        )}
        <div style={{ height: 20 }} />
      </div>
    </div>
  );
}

Object.assign(window, { ArticleScreen, CategoryScreen, BookmarkScreen, SearchScreen });
