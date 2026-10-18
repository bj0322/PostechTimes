import { useState } from 'react';
import type { Theme } from '@/lib/theme';
import { fonts } from '@/lib/theme';
import type { Article } from '@/types/article';
import PhotoBlock from './PhotoBlock';
import CatBadge from './CatBadge';
import MetaLine from './MetaLine';
import Divider from './Divider';
import { MoonIcon, SunIcon, SearchIcon } from './Icons';

interface Props {
  t: Theme;
  articles: Article[];
  onOpenArticle: (a: Article) => void;
  dark: boolean;
  onToggleDark: () => void;
}

function FeedHeader({ t, sub, dark, onToggleDark }: { t: Theme; sub?: string; dark: boolean; onToggleDark: () => void }) {
  return (
    <div style={{ background: t.surface, borderBottom: `1px solid ${t.line}`, padding: '0 16px', flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '10px 0 8px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: fonts.serif, fontSize: 20, fontWeight: 700, color: t.primary, letterSpacing: -0.3 }}>
            포항공대신문
          </div>
          {sub && (
            <div style={{ fontFamily: fonts.mono, fontSize: 9, color: t.muted, letterSpacing: 0.5, marginTop: 1 }}>
              {sub}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <button onClick={onToggleDark} style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.muted, padding: 6, borderRadius: 6 }}>
            {dark ? <SunIcon size={19} /> : <MoonIcon size={19} />}
          </button>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.muted, padding: 6, borderRadius: 6 }}>
            <SearchIcon size={19} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FeedMagazine({ t, articles, onOpenArticle, dark, onToggleDark }: Props) {
  const [tab, setTab] = useState('전체');
  const cats = ['전체', '학내', '학술', '문화', '오피니언'];
  const filtered = tab === '전체' ? articles : articles.filter(a => a.cat === tab);
  const lead = filtered[0] ?? articles[0];
  const grid = filtered.slice(1, 5);
  const list = filtered.slice(5);

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: t.bg }}>
      <FeedHeader t={t} sub="POSTECH TIMES · 제1452호" dark={dark} onToggleDark={onToggleDark} />

      {/* Category tabs */}
      <div style={{
        display: 'flex',
        gap: 0,
        overflowX: 'auto',
        background: t.surface,
        borderBottom: `2px solid ${t.line}`,
        padding: '0 12px',
        scrollbarWidth: 'none',
      }}>
        {cats.map(c => (
          <button key={c} onClick={() => setTab(c)} style={{
            fontFamily: fonts.sans,
            fontSize: 13,
            fontWeight: tab === c ? 700 : 500,
            color: tab === c ? t.primary : t.muted,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '9px 12px',
            flexShrink: 0,
            borderBottom: `2px solid ${tab === c ? t.primary : 'transparent'}`,
            marginBottom: -2,
          }}>{c}</button>
        ))}
      </div>

      {/* Hero card */}
      <button onClick={() => onOpenArticle(lead)} style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', padding: 0, display: 'block' }}>
        <div style={{ position: 'relative' }}>
          <PhotoBlock hue={lead.hero.hue} label={lead.hero.label} ratio="3/2" />
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(20,15,8,0.92) 0%, rgba(20,15,8,0.3) 55%, transparent 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: '20px 16px 16px',
          }}>
            <CatBadge cat={lead.cat} color="primary" t={{ ...t, primary: '#FFF5E0' }} filled />
            <div style={{ fontFamily: fonts.serif, fontSize: 20, fontWeight: 700, color: '#FFF5E0', lineHeight: 1.3, margin: '8px 0 6px', letterSpacing: -0.3 }}>
              {lead.title}
            </div>
            <div style={{ fontFamily: fonts.mono, fontSize: 10, color: 'rgba(255,240,200,0.65)', letterSpacing: 0.3 }}>
              {lead.author} · {lead.date.slice(5)} · {lead.readTime}
            </div>
          </div>
        </div>
      </button>

      {/* 2×2 grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, background: t.line, margin: '2px 0' }}>
        {grid.map(a => (
          <button key={a.id} onClick={() => onOpenArticle(a)} style={{ background: t.surface, border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}>
            <PhotoBlock hue={a.hero.hue} label={a.hero.label} ratio="4/3" />
            <div style={{ padding: '9px 12px 12px' }}>
              <CatBadge cat={a.cat} color={a.catColor} t={t} />
              <div style={{ fontFamily: fonts.serif, fontSize: 13, fontWeight: 700, color: t.ink, lineHeight: 1.4, margin: '5px 0 4px', letterSpacing: -0.1 }}>
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
          <>
            <button key={a.id} onClick={() => onOpenArticle(a)} style={{
              width: '100%',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              textAlign: 'left',
              display: 'flex',
              gap: 12,
              alignItems: 'flex-start',
              padding: '12px 16px',
            }}>
              <div style={{ flex: 1 }}>
                <CatBadge cat={a.cat} color={a.catColor} t={t} />
                <div style={{ fontFamily: fonts.serif, fontSize: 13.5, fontWeight: 700, color: t.ink, lineHeight: 1.45, margin: '4px 0', letterSpacing: -0.1 }}>{a.title}</div>
                <MetaLine a={a} t={t} dim />
              </div>
              <div style={{ width: 72, flexShrink: 0 }}>
                <PhotoBlock hue={a.hero.hue} label="" ratio="1" radius={3} />
              </div>
            </button>
            {i < list.length - 1 && <Divider t={t} />}
          </>
        ))}
      </div>
      <div style={{ height: 20 }} />
    </div>
  );
}
