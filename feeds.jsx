// feeds.jsx — 4가지 메인 피드 스타일 변형
// Exports: FeedClassic, FeedMagazine, FeedMinimal, FeedMixed

const { useState: useState$f } = React;

// ───────────────────────────────────────────────────────────────────
// 공통 유틸
// ───────────────────────────────────────────────────────────────────
const F = window.POSTECH_FONTS;

// 공통 앱 헤더 (각 피드 상단에 사용)
function FeedHeader({ t, title = '포항공대신문', sub = '', dark, onToggleDark }) {
  return (
    <div style={{
      background: t.surface,
      borderBottom: `1px solid ${t.line}`,
      padding: '0 16px',
      flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '10px 0 8px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: F.serif, fontSize: 20, fontWeight: 700, color: t.primary, letterSpacing: -0.3 }}>
            포항공대신문
          </div>
          {sub && (
            <div style={{ fontFamily: F.mono, fontSize: 9, color: t.muted, letterSpacing: 0.5, marginTop: 1 }}>
              {sub}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <button onClick={onToggleDark} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: t.muted, padding: 6, borderRadius: 6,
          }}>
            {dark ? <SunIcon size={19} /> : <MoonIcon size={19} />}
          </button>
          <button style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: t.muted, padding: 6, borderRadius: 6,
          }}>
            <SearchIcon size={19} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────
// VARIATION A — Editorial Classic: 신문 레이아웃
// 마스트헤드 + 큰 톱기사 (세리프 헤드) + 2단 리스트
// ───────────────────────────────────────────────────────────────────
function FeedClassic({ t, articles, onOpenArticle, onToggleDark, dark }) {
  const lead = articles[0];
  const secondary = articles.slice(1, 5);
  const rest = articles.slice(5, 11);

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: t.bg }}>
      {/* Masthead */}
      <div style={{
        background: t.primary, padding: '10px 16px 8px',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontFamily: F.serif, fontSize: 22, fontWeight: 700, color: '#FFF5E0', letterSpacing: -0.3 }}>
            포항공대신문
          </div>
          <div style={{ fontFamily: F.mono, fontSize: 9, color: 'rgba(255,240,200,0.6)', letterSpacing: 0.4, marginTop: 1 }}>
            POSTECH TIMES · 제1452호
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button onClick={onToggleDark} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,240,200,0.7)', padding: 4 }}>
            {dark ? <SunIcon size={17} /> : <MoonIcon size={17} />}
          </button>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,240,200,0.7)', padding: 4 }}>
            <SearchIcon size={17} />
          </button>
        </div>
      </div>

      {/* 발행일 / 에디션 */}
      <div style={{
        background: t.surfaceAlt, borderBottom: `1px solid ${t.line}`,
        padding: '4px 16px',
        fontFamily: F.mono, fontSize: 9, color: t.muted, letterSpacing: 0.5,
        display: 'flex', justifyContent: 'space-between',
      }}>
        <span>2026년 5월 27일 수요일</span>
        <span>포항공과대학교 학생신문</span>
      </div>

      {/* Lead story */}
      <button onClick={() => onOpenArticle(lead)} style={{ width: '100%', background: t.surface, border: 'none', textAlign: 'left', cursor: 'pointer', padding: 0 }}>
        <PhotoBlock hue={lead.hero.hue} label={lead.hero.label} ratio="16/9" theme={dark ? 'dark' : 'light'} />
        <div style={{ padding: '14px 16px 14px' }}>
          <CatBadge cat={lead.cat} color={lead.catColor} t={t} size="sm" />
          <div style={{ fontFamily: F.serif, fontSize: 20, fontWeight: 700, color: t.ink, lineHeight: 1.35, margin: '7px 0 6px', letterSpacing: -0.2 }}>
            {lead.title}
          </div>
          <div style={{ fontFamily: F.sans, fontSize: 13, color: t.inkSoft, lineHeight: 1.6, marginBottom: 8 }}>
            {lead.sub}
          </div>
          <MetaLine a={lead} t={t} />
        </div>
      </button>

      <Divider t={t} double />

      {/* 2-col secondary stories */}
      <div style={{ padding: '10px 0' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: 0, background: t.surface,
        }}>
          {secondary.map((a, i) => (
            <button key={a.id} onClick={() => onOpenArticle(a)} style={{
              border: 'none', textAlign: 'left', cursor: 'pointer',
              background: t.surface, padding: '12px 14px',
              borderRight: i % 2 === 0 ? `1px solid ${t.lineSoft}` : 'none',
              borderBottom: i < 2 ? `1px solid ${t.lineSoft}` : 'none',
            }}>
              <PhotoBlock hue={a.hero.hue} label={a.hero.label} ratio="4/3" />
              <div style={{ marginTop: 8 }}>
                <CatBadge cat={a.cat} color={a.catColor} t={t} />
                <div style={{ fontFamily: F.serif, fontSize: 13.5, fontWeight: 700, color: t.ink, lineHeight: 1.4, margin: '5px 0 5px', letterSpacing: -0.1 }}>
                  {a.title.length > 40 ? a.title.slice(0, 40) + '…' : a.title}
                </div>
                <MetaLine a={a} t={t} showRead={false} dim />
              </div>
            </button>
          ))}
        </div>
      </div>

      <Divider t={t} double />

      {/* 텍스트 리스트 (하단) */}
      <div style={{ background: t.surface, padding: '8px 0' }}>
        <div style={{ padding: '6px 16px 4px', fontFamily: F.mono, fontSize: 10, color: t.muted, letterSpacing: 0.8, textTransform: 'uppercase' }}>
          More Stories
        </div>
        {rest.map((a, i) => (
          <React.Fragment key={a.id}>
            <button onClick={() => onOpenArticle(a)} style={{
              width: '100%', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left',
              display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 16px',
            }}>
              <div style={{ flex: 1 }}>
                <CatBadge cat={a.cat} color={a.catColor} t={t} />
                <div style={{ fontFamily: F.serif, fontSize: 13.5, fontWeight: 700, color: t.ink, lineHeight: 1.45, margin: '4px 0', letterSpacing: -0.1 }}>
                  {a.title}
                </div>
                <MetaLine a={a} t={t} dim />
              </div>
              <div style={{ width: 72, flexShrink: 0 }}>
                <PhotoBlock hue={a.hero.hue} label={a.hero.label} ratio="1" radius={2} />
              </div>
            </button>
            {i < rest.length - 1 && <Divider t={t} />}
          </React.Fragment>
        ))}
      </div>
      <div style={{ height: 20 }} />
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────
// VARIATION B — Magazine Cards: 풀블리드 카드 + 그리드
// ───────────────────────────────────────────────────────────────────
function FeedMagazine({ t, articles, onOpenArticle, onToggleDark, dark }) {
  const [tab, setTab] = useState$f('전체');
  const cats = ['전체', '학내', '학술', '문화', '오피니언'];
  const filtered = tab === '전체' ? articles : articles.filter(a => a.cat === tab);
  const lead = filtered[0] || articles[0];
  const grid = filtered.slice(1, 5);
  const list = filtered.slice(5);

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: t.bg }}>
      <FeedHeader t={t} sub="POSTECH TIMES · 제1452호" dark={dark} onToggleDark={onToggleDark} />

      {/* Category tabs */}
      <div style={{
        display: 'flex', gap: 0, overflowX: 'auto', background: t.surface,
        borderBottom: `2px solid ${t.line}`, padding: '0 12px',
        scrollbarWidth: 'none',
      }}>
        {cats.map(c => (
          <button key={c} onClick={() => setTab(c)} style={{
            fontFamily: F.sans, fontSize: 13, fontWeight: tab === c ? 700 : 500,
            color: tab === c ? t.primary : t.muted,
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '9px 12px', flexShrink: 0,
            borderBottom: `2px solid ${tab === c ? t.primary : 'transparent'}`,
            marginBottom: -2,
          }}>{c}</button>
        ))}
      </div>

      {/* Hero card — full-bleed */}
      <button onClick={() => onOpenArticle(lead)} style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', padding: 0, display: 'block' }}>
        <div style={{ position: 'relative' }}>
          <PhotoBlock hue={lead.hero.hue} label={lead.hero.label} ratio="3/2" />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(20,15,8,0.92) 0%, rgba(20,15,8,0.3) 55%, transparent 100%)',
            display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
            padding: '20px 16px 16px',
          }}>
            <CatBadge cat={lead.cat} color="primary" t={{ ...t, primary: '#FFF5E0' }} filled />
            <div style={{ fontFamily: F.serif, fontSize: 20, fontWeight: 700, color: '#FFF5E0', lineHeight: 1.3, margin: '8px 0 6px', letterSpacing: -0.3 }}>
              {lead.title}
            </div>
            <div style={{ fontFamily: F.mono, fontSize: 10, color: 'rgba(255,240,200,0.65)', letterSpacing: 0.3 }}>
              {lead.author} · {lead.date.slice(5)} · {lead.readTime}
            </div>
          </div>
        </div>
      </button>

      {/* 2×2 grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, background: t.line, margin: '2px 0' }}>
        {grid.map(a => (
          <button key={a.id} onClick={() => onOpenArticle(a)} style={{
            background: t.surface, border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0,
          }}>
            <PhotoBlock hue={a.hero.hue} label={a.hero.label} ratio="4/3" />
            <div style={{ padding: '9px 12px 12px' }}>
              <CatBadge cat={a.cat} color={a.catColor} t={t} />
              <div style={{ fontFamily: F.serif, fontSize: 13, fontWeight: 700, color: t.ink, lineHeight: 1.4, margin: '5px 0 4px', letterSpacing: -0.1 }}>
                {a.title.length > 36 ? a.title.slice(0, 36) + '…' : a.title}
              </div>
              <MetaLine a={a} t={t} showRead={false} dim />
            </div>
          </button>
        ))}
      </div>

      {/* list below */}
      <div style={{ background: t.surface, marginTop: 2 }}>
        {list.map((a, i) => (
          <React.Fragment key={a.id}>
            <button onClick={() => onOpenArticle(a)} style={{
              width: '100%', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left',
              display: 'flex', gap: 12, alignItems: 'flex-start', padding: '12px 16px',
            }}>
              <div style={{ flex: 1 }}>
                <CatBadge cat={a.cat} color={a.catColor} t={t} />
                <div style={{ fontFamily: F.serif, fontSize: 13.5, fontWeight: 700, color: t.ink, lineHeight: 1.45, margin: '4px 0', letterSpacing: -0.1 }}>{a.title}</div>
                <MetaLine a={a} t={t} dim />
              </div>
              <div style={{ width: 72, flexShrink: 0 }}>
                <PhotoBlock hue={a.hero.hue} label={''} ratio="1" radius={3} />
              </div>
            </button>
            {i < list.length - 1 && <Divider t={t} />}
          </React.Fragment>
        ))}
      </div>
      <div style={{ height: 20 }} />
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────
// VARIATION C — Minimalist Text-Forward: 미니멀 리스트
// 넓은 여백, 세리프 헤드라인, 작은 썸네일, 신문 숫자 번호
// ───────────────────────────────────────────────────────────────────
function FeedMinimal({ t, articles, onOpenArticle, onToggleDark, dark }) {
  const lead = articles[0];
  const items = articles.slice(1, 10);

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: t.surface }}>
      {/* Top header — minimal */}
      <div style={{
        padding: '12px 20px 0',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontFamily: F.serif, fontSize: 24, fontWeight: 900, color: t.ink, letterSpacing: -1, lineHeight: 1 }}>
            포항공대<br />신문
          </div>
          <div style={{ fontFamily: F.mono, fontSize: 9, color: t.muted, letterSpacing: 0.6, marginTop: 4 }}>
            2026.05.27 · 제1452호
          </div>
        </div>
        <div style={{ display: 'flex', gap: 2 }}>
          <button onClick={onToggleDark} style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.muted, padding: 6 }}>
            {dark ? <SunIcon size={18} /> : <MoonIcon size={18} />}
          </button>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.muted, padding: 6 }}>
            <SearchIcon size={18} />
          </button>
        </div>
      </div>

      {/* Thick rule */}
      <div style={{ margin: '12px 20px 0', height: 2, background: t.ink }} />
      <div style={{ margin: '1px 20px 0', height: 1, background: t.ink, opacity: 0.25 }} />

      {/* Lead — text only, big serif */}
      <button onClick={() => onOpenArticle(lead)} style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', padding: '14px 20px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <CatBadge cat="1면 톱" color="primary" t={t} />
          <span style={{ fontFamily: F.mono, fontSize: 9, color: t.muted, letterSpacing: 0.5 }}>
            {lead.kicker}
          </span>
        </div>
        <div style={{ fontFamily: F.serif, fontSize: 21, fontWeight: 800, color: t.ink, lineHeight: 1.3, letterSpacing: -0.4, marginBottom: 8 }}>
          {lead.title}
        </div>
        <div style={{ fontFamily: F.sans, fontSize: 13, color: t.inkSoft, lineHeight: 1.7, marginBottom: 10 }}>
          {lead.sub}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <MetaLine a={lead} t={t} />
          <div style={{ color: t.primary }}>
            <ChevronIcon size={16} />
          </div>
        </div>
      </button>

      <div style={{ margin: '0 20px', height: 1, background: t.line }} />
      <div style={{ margin: '1px 20px 0', height: 3, background: t.line }} />

      {/* numbered text list */}
      {items.map((a, i) => (
        <React.Fragment key={a.id}>
          <button onClick={() => onOpenArticle(a)} style={{
            width: '100%', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left',
            display: 'flex', alignItems: 'flex-start', gap: 14, padding: '12px 20px',
          }}>
            {/* number */}
            <div style={{
              fontFamily: F.mono, fontSize: 17, fontWeight: 700, color: t.primary,
              lineHeight: 1, width: 22, flexShrink: 0, marginTop: 2,
            }}>
              {String(i + 2).padStart(2, '0')}
            </div>
            {/* content */}
            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: 3 }}>
                <CatBadge cat={a.cat} color={a.catColor} t={t} />
              </div>
              <div style={{ fontFamily: F.serif, fontSize: 14, fontWeight: 700, color: t.ink, lineHeight: 1.45, letterSpacing: -0.1, marginBottom: 4 }}>
                {a.title}
              </div>
              <MetaLine a={a} t={t} dim />
            </div>
            {/* thumb */}
            <div style={{ width: 66, flexShrink: 0 }}>
              <PhotoBlock hue={a.hero.hue} label="" ratio="1" radius={2} />
            </div>
          </button>
          <div style={{ margin: '0 20px 0 56px', height: 1, background: t.lineSoft }} />
        </React.Fragment>
      ))}
      <div style={{ height: 24 }} />
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────
// VARIATION D — Curated Mix: 큐레이션 위젯
// "Today's pick" 대형 헤드 + 카테고리 가로스크롤 + 이슈위젯
// ───────────────────────────────────────────────────────────────────
function FeedMixed({ t, articles, onOpenArticle, onToggleDark, dark }) {
  const pick = articles[0];
  const breaking = articles.slice(1, 4);
  const sectionGroups = [
    { label: '🔬 학술·연구', arts: articles.filter(a => a.cat === '학술') },
    { label: '🎓 학내소식', arts: articles.filter(a => a.cat === '학내') },
    { label: '🎭 문화', arts: articles.filter(a => a.cat === '문화') },
    { label: '✏️ 오피니언', arts: articles.filter(a => a.cat === '오피니언' || a.cat === '기획') },
  ];

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: t.bg }}>
      <FeedHeader t={t} sub="2026.05.27 수요일" dark={dark} onToggleDark={onToggleDark} />

      {/* Today's Pick */}
      <div style={{ padding: '14px 16px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <div style={{ width: 3, height: 14, background: t.primary, borderRadius: 2 }} />
          <span style={{ fontFamily: F.mono, fontSize: 10, fontWeight: 700, color: t.primary, letterSpacing: 1 }}>TODAY'S PICK</span>
        </div>
        <button onClick={() => onOpenArticle(pick)} style={{
          width: '100%', border: 'none', background: t.surface, borderRadius: 10,
          padding: 0, cursor: 'pointer', textAlign: 'left',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(40,20,10,0.08)',
        }}>
          <PhotoBlock hue={pick.hero.hue} label={pick.hero.label} ratio="16/9" />
          <div style={{ padding: '12px 14px 14px' }}>
            <CatBadge cat={pick.cat} color={pick.catColor} t={t} filled />
            <div style={{ fontFamily: F.serif, fontSize: 17, fontWeight: 700, color: t.ink, lineHeight: 1.35, margin: '8px 0 6px', letterSpacing: -0.2 }}>
              {pick.title}
            </div>
            <div style={{ fontFamily: F.sans, fontSize: 12.5, color: t.inkSoft, lineHeight: 1.6, marginBottom: 8 }}>
              {pick.sub.length > 80 ? pick.sub.slice(0, 80) + '…' : pick.sub}
            </div>
            <MetaLine a={pick} t={t} />
          </div>
        </button>
      </div>

      {/* Breaking / 주요 단신 */}
      <div style={{ padding: '16px 16px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{ width: 3, height: 14, background: t.gold, borderRadius: 2 }} />
          <span style={{ fontFamily: F.mono, fontSize: 10, fontWeight: 700, color: t.gold, letterSpacing: 1 }}>주요 기사</span>
        </div>
        <div style={{ background: t.surface, borderRadius: 10, overflow: 'hidden', boxShadow: '0 2px 8px rgba(40,20,10,0.06)' }}>
          {breaking.map((a, i) => (
            <React.Fragment key={a.id}>
              <button onClick={() => onOpenArticle(a)} style={{
                width: '100%', border: 'none', background: 'none', cursor: 'pointer',
                display: 'flex', gap: 12, alignItems: 'center', padding: '12px 14px', textAlign: 'left',
              }}>
                <div style={{ width: 60, flexShrink: 0 }}>
                  <PhotoBlock hue={a.hero.hue} label="" ratio="1" radius={6} />
                </div>
                <div style={{ flex: 1 }}>
                  <CatBadge cat={a.cat} color={a.catColor} t={t} />
                  <div style={{ fontFamily: F.serif, fontSize: 13, fontWeight: 700, color: t.ink, lineHeight: 1.4, margin: '4px 0 4px', letterSpacing: -0.1 }}>
                    {a.title.length > 40 ? a.title.slice(0, 40) + '…' : a.title}
                  </div>
                  <MetaLine a={a} t={t} showRead={false} dim />
                </div>
              </button>
              {i < breaking.length - 1 && <Divider t={t} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Section carousels */}
      {sectionGroups.map(sg => sg.arts.length > 0 && (
        <div key={sg.label} style={{ padding: '16px 0 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', marginBottom: 10 }}>
            <span style={{ fontFamily: F.sans, fontSize: 13, fontWeight: 700, color: t.ink }}>{sg.label}</span>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: F.mono, fontSize: 10, color: t.muted, letterSpacing: 0.3 }}>더보기 →</button>
          </div>
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', padding: '0 16px', scrollbarWidth: 'none' }}>
            {sg.arts.concat(sg.arts).slice(0, 4).map((a, i) => (
              <button key={a.id + i} onClick={() => onOpenArticle(a)} style={{
                border: 'none', background: t.surface, borderRadius: 8,
                cursor: 'pointer', textAlign: 'left', flexShrink: 0,
                width: 160, overflow: 'hidden',
                boxShadow: '0 2px 6px rgba(40,20,10,0.07)',
                padding: 0,
              }}>
                <PhotoBlock hue={a.hero.hue} label="" ratio="3/2" />
                <div style={{ padding: '9px 10px 11px' }}>
                  <div style={{ fontFamily: F.serif, fontSize: 12.5, fontWeight: 700, color: t.ink, lineHeight: 1.45, marginBottom: 4, letterSpacing: -0.1 }}>
                    {a.title.length > 32 ? a.title.slice(0, 32) + '…' : a.title}
                  </div>
                  <MetaLine a={a} t={t} showRead={false} dim />
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
      <div style={{ height: 24 }} />
    </div>
  );
}

Object.assign(window, { FeedClassic, FeedMagazine, FeedMinimal, FeedMixed });
