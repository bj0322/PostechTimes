// common.jsx — shared shells, primitives, photo placeholders
// Loaded after React + theme.js + data.js
// Exports to window: PhoneShell, PhotoBlock, CatBadge, MetaLine, BookmarkIcon,
//   ChevronIcon, SearchIcon, HomeIcon, BookIcon, GridIcon, ArrowLeftIcon,
//   ShareIcon, FontIcon, MoonIcon, SunIcon, TabBar, Divider, useCatColor

const { useState, useEffect, useRef, useMemo } = React;

// ── photo placeholder: subtly-striped diagonal block w/ caption ─────
function PhotoBlock({ hue = 30, label = 'photo', ratio = '16/9', radius = 0, theme }) {
  // Warm tinted gradient with diagonal stripes & monospace caption
  const c1 = `oklch(0.78 0.04 ${hue})`;
  const c2 = `oklch(0.70 0.05 ${hue})`;
  const c3 = `oklch(0.62 0.05 ${hue})`;
  return (
    <div style={{
      width: '100%', aspectRatio: ratio, borderRadius: radius,
      background: `
        repeating-linear-gradient(135deg, rgba(0,0,0,0.05) 0 1px, transparent 1px 6px),
        linear-gradient(160deg, ${c1} 0%, ${c2} 55%, ${c3} 100%)
      `,
      position: 'relative', overflow: 'hidden',
      boxShadow: theme && theme === 'dark' ? 'inset 0 0 0 1px rgba(255,255,255,0.04)' : 'inset 0 0 0 1px rgba(0,0,0,0.04)',
    }}>
      <div style={{
        position: 'absolute', left: 8, bottom: 6,
        fontFamily: window.POSTECH_FONTS.mono, fontSize: 9, letterSpacing: 0.3,
        color: 'rgba(20,15,5,0.55)', textTransform: 'lowercase',
      }}>┃ {label}</div>
    </div>
  );
}

// ── category badge ─────────────────────────────────────────
function CatBadge({ cat, color, t, size = 'sm', filled = false }) {
  const palette = {
    primary: t.primary, gold: t.gold, forest: t.forest, rose: t.rose, ink: t.ink2,
  };
  const c = palette[color] || t.primary;
  const fs = size === 'lg' ? 11 : 10;
  const py = size === 'lg' ? 4 : 3;
  const px = size === 'lg' ? 9 : 7;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontFamily: window.POSTECH_FONTS.sans, fontSize: fs, fontWeight: 600,
      letterSpacing: 0.4,
      color: filled ? '#FFF8EC' : c,
      background: filled ? c : 'transparent',
      border: filled ? 'none' : `1px solid ${c}`,
      padding: `${py}px ${px}px`, borderRadius: 2,
      textTransform: 'none',
    }}>{cat}</span>
  );
}

// ── meta line: author · date · read · bookmark ─────────────
function MetaLine({ a, t, showRead = true, dim = false }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      fontFamily: window.POSTECH_FONTS.mono, fontSize: 10,
      color: dim ? t.mutedSoft : t.muted, letterSpacing: 0.2,
    }}>
      <span>{a.author}</span>
      <span style={{ opacity: 0.5 }}>·</span>
      <span>{a.date.slice(5)}</span>
      {showRead && <>
        <span style={{ opacity: 0.5 }}>·</span>
        <span>{a.readTime}</span>
      </>}
    </div>
  );
}

// ── icons (line, 20px) ─────────────────────────────────────
const Ic = ({ d, size = 20, sw = 1.6, fill = 'none', stroke = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
       strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">{d}</svg>
);
const BookmarkIcon = ({ size = 20, filled = false, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24"
       fill={filled ? color : 'none'} stroke={color} strokeWidth="1.6" strokeLinejoin="round">
    <path d="M6 4h12v17l-6-4-6 4V4z" />
  </svg>
);
const ChevronIcon  = ({ size = 18, dir = 'right' }) => {
  const r = { right: 0, left: 180, up: 270, down: 90 }[dir];
  return <Ic size={size} d={<polyline points="9 6 15 12 9 18" transform={`rotate(${r} 12 12)`} />} />;
};
const SearchIcon   = ({ size = 20 }) => <Ic size={size} d={<><circle cx="11" cy="11" r="7"/><line x1="20" y1="20" x2="16.5" y2="16.5"/></>} />;
const HomeIcon     = ({ size = 22 }) => <Ic size={size} d={<><path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/></>} />;
const BookIcon     = ({ size = 22 }) => <Ic size={size} d={<><path d="M4 5a2 2 0 0 1 2-2h13v17H6a2 2 0 0 0-2 2V5z"/><path d="M19 17H6a2 2 0 0 0-2 2"/></>} />;
const GridIcon     = ({ size = 22 }) => <Ic size={size} d={<><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>} />;
const ArrowLeftIcon= ({ size = 20 }) => <Ic size={size} d={<><line x1="20" y1="12" x2="4" y2="12"/><polyline points="10 6 4 12 10 18"/></>} />;
const ShareIcon    = ({ size = 20 }) => <Ic size={size} d={<><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><line x1="8" y1="11" x2="16" y2="7"/><line x1="8" y1="13" x2="16" y2="17"/></>} />;
const FontIcon     = ({ size = 20 }) => <Ic size={size} sw={1.8} d={<><path d="M5 18l4-12h2l4 12"/><line x1="7" y1="14" x2="13" y2="14"/><path d="M16 18h4M18 8v10"/></>} />;
const MoonIcon     = ({ size = 20 }) => <Ic size={size} d={<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>} />;
const SunIcon      = ({ size = 20 }) => <Ic size={size} d={<><circle cx="12" cy="12" r="4"/><line x1="12" y1="3" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="21"/><line x1="3" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="21" y2="12"/><line x1="5.5" y1="5.5" x2="6.9" y2="6.9"/><line x1="17.1" y1="17.1" x2="18.5" y2="18.5"/><line x1="5.5" y1="18.5" x2="6.9" y2="17.1"/><line x1="17.1" y1="6.9" x2="18.5" y2="5.5"/></>} />;
const MoreIcon     = ({ size = 20 }) => <Ic size={size} d={<><circle cx="5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="19" cy="12" r="1.2"/></>} fill="currentColor" stroke="none" />;
const PlusIcon     = ({ size = 20 }) => <Ic size={size} d={<><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>} />;
const FilterIcon   = ({ size = 18 }) => <Ic size={size} d={<><line x1="4" y1="6" x2="20" y2="6"/><line x1="7" y1="12" x2="17" y2="12"/><line x1="10" y1="18" x2="14" y2="18"/></>} />;

// ── Divider ────────────────────────────────────────────────
const Divider = ({ t, double = false }) => double ? (
  <div style={{ borderTop: `1px solid ${t.line}`, borderBottom: `1px solid ${t.line}`, height: 4 }} />
) : (
  <div style={{ borderTop: `1px solid ${t.lineSoft}` }} />
);

// ── Tab Bar ────────────────────────────────────────────────
function TabBar({ active, onChange, t }) {
  const tabs = [
    { key: 'home',     label: '홈',     Icon: HomeIcon },
    { key: 'category', label: '섹션',   Icon: GridIcon },
    { key: 'search',   label: '검색',   Icon: SearchIcon },
    { key: 'bookmark', label: '스크랩', Icon: BookIcon },
  ];
  return (
    <div style={{
      display: 'flex', borderTop: `1px solid ${t.line}`,
      background: t.surface, padding: '6px 4px 8px',
    }}>
      {tabs.map(({ key, label, Icon }) => {
        const on = active === key;
        return (
          <button key={key} onClick={() => onChange(key)} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 2, padding: '6px 0', border: 'none', background: 'transparent',
            color: on ? t.primary : t.muted, cursor: 'pointer',
            fontFamily: window.POSTECH_FONTS.sans, fontSize: 10, fontWeight: on ? 700 : 500,
            letterSpacing: 0.3,
          }}>
            <Icon size={22}/>
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── PhoneShell: device chrome + status bar + bottom gesture pill ───
// (replaces AndroidDevice so we can theme it freely; keeps M3 frame metrics)
function PhoneShell({ children, t, width = 380, height = 760, scale = 1, dark = false }) {
  return (
    <div style={{
      width, height, transformOrigin: 'top left', transform: scale !== 1 ? `scale(${scale})` : undefined,
      borderRadius: 36, padding: 6, boxSizing: 'border-box',
      background: dark ? '#0c0a07' : '#2a2418',
      boxShadow: '0 24px 60px rgba(40,28,10,0.18), 0 6px 14px rgba(40,28,10,0.10)',
    }}>
      <div style={{
        width: '100%', height: '100%', borderRadius: 30, overflow: 'hidden',
        background: t.bg, display: 'flex', flexDirection: 'column', position: 'relative',
      }}>
        {/* status bar */}
        <div style={{
          height: 32, padding: '0 18px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          fontFamily: window.POSTECH_FONTS.sans, fontSize: 12, fontWeight: 600,
          color: t.ink, flexShrink: 0, position: 'relative', zIndex: 2,
          background: t.bg,
        }}>
          <span>9:30</span>
          <div style={{
            position: 'absolute', left: '50%', top: 6, transform: 'translateX(-50%)',
            width: 18, height: 18, borderRadius: '50%', background: '#1a140a',
          }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg width="14" height="10" viewBox="0 0 14 10"><path d="M0 8.5L5 3.5a3 3 0 014 0L13 8.5l-1 1L9 6.5a1.5 1.5 0 00-2 0L1 9.5l-1-1z" fill={t.ink}/></svg>
            <svg width="14" height="10" viewBox="0 0 14 10"><path d="M13 0v10H0L13 0z" fill={t.ink}/></svg>
            <svg width="18" height="10" viewBox="0 0 18 10"><rect x="0" y="1" width="15" height="8" rx="1.5" stroke={t.ink} fill="none"/><rect x="2" y="3" width="9" height="4" fill={t.ink}/><rect x="16" y="3.5" width="2" height="3" fill={t.ink}/></svg>
          </div>
        </div>
        {/* content */}
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          {children}
        </div>
        {/* gesture pill */}
        <div style={{
          height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: t.surface, borderTop: `1px solid ${t.line}`, flexShrink: 0,
        }}>
          <div style={{ width: 110, height: 4, borderRadius: 2, background: t.ink, opacity: 0.55 }}/>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  PhotoBlock, CatBadge, MetaLine, Divider, TabBar, PhoneShell,
  BookmarkIcon, ChevronIcon, SearchIcon, HomeIcon, BookIcon, GridIcon,
  ArrowLeftIcon, ShareIcon, FontIcon, MoonIcon, SunIcon, MoreIcon, PlusIcon, FilterIcon,
});
