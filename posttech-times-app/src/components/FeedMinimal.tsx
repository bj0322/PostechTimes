import type { Theme } from '@/lib/theme';
import { fonts } from '@/lib/theme';
import type { Article } from '@/types/article';
import PhotoBlock from './PhotoBlock';
import CatBadge from './CatBadge';
import MetaLine from './MetaLine';
import { MoonIcon, SunIcon, SearchIcon, ChevronIcon } from './Icons';

interface Props {
  t: Theme;
  articles: Article[];
  onOpenArticle: (a: Article) => void;
  dark: boolean;
  onToggleDark: () => void;
}

export default function FeedMinimal({ t, articles, onOpenArticle, dark, onToggleDark }: Props) {
  const lead = articles[0];
  const items = articles.slice(1, 10);

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: t.surface }}>
      {/* Header */}
      <div style={{ padding: '12px 20px 0', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: fonts.serif, fontSize: 24, fontWeight: 900, color: t.ink, letterSpacing: -1, lineHeight: 1 }}>
            포항공대<br />신문
          </div>
          <div style={{ fontFamily: fonts.mono, fontSize: 9, color: t.muted, letterSpacing: 0.6, marginTop: 4 }}>
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

      {/* Lead */}
      <button onClick={() => onOpenArticle(lead)} style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', padding: '14px 20px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <CatBadge cat="1면 톱" color="primary" t={t} />
          <span style={{ fontFamily: fonts.mono, fontSize: 9, color: t.muted, letterSpacing: 0.5 }}>
            {lead.kicker}
          </span>
        </div>
        <div style={{ fontFamily: fonts.serif, fontSize: 21, fontWeight: 800, color: t.ink, lineHeight: 1.3, letterSpacing: -0.4, marginBottom: 8 }}>
          {lead.title}
        </div>
        <div style={{ fontFamily: fonts.sans, fontSize: 13, color: t.inkSoft, lineHeight: 1.7, marginBottom: 10 }}>
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

      {/* Numbered list */}
      {items.map((a, i) => (
        <>
          <button key={a.id} onClick={() => onOpenArticle(a)} style={{
            width: '100%',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 14,
            padding: '12px 20px',
          }}>
            <div style={{ fontFamily: fonts.mono, fontSize: 17, fontWeight: 700, color: t.primary, lineHeight: 1, width: 22, flexShrink: 0, marginTop: 2 }}>
              {String(i + 2).padStart(2, '0')}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: 3 }}>
                <CatBadge cat={a.cat} color={a.catColor} t={t} />
              </div>
              <div style={{ fontFamily: fonts.serif, fontSize: 14, fontWeight: 700, color: t.ink, lineHeight: 1.45, letterSpacing: -0.1, marginBottom: 4 }}>
                {a.title}
              </div>
              <MetaLine a={a} t={t} dim />
            </div>
            <div style={{ width: 66, flexShrink: 0 }}>
              <PhotoBlock hue={a.hero.hue} label="" ratio="1" radius={2} />
            </div>
          </button>
          <div key={`div-${a.id}`} style={{ margin: '0 20px 0 56px', height: 1, background: t.lineSoft }} />
        </>
      ))}
      <div style={{ height: 24 }} />
    </div>
  );
}
