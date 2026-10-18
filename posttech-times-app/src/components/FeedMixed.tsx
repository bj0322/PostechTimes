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

export default function FeedMixed({ t, articles, onOpenArticle, dark, onToggleDark }: Props) {
  const pick = articles[0];
  const breaking = articles.slice(1, 4);
  const sectionGroups = [
    { label: '학술·연구', arts: articles.filter(a => a.cat === '학술') },
    { label: '학내소식', arts: articles.filter(a => a.cat === '학내') },
    { label: '문화', arts: articles.filter(a => a.cat === '문화') },
    { label: '오피니언', arts: articles.filter(a => a.cat === '오피니언' || a.cat === '기획') },
  ].filter(sg => sg.arts.length > 0);

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: t.bg }}>
      <FeedHeader t={t} sub="2026.05.27 수요일" dark={dark} onToggleDark={onToggleDark} />

      {/* Today's Pick */}
      <div style={{ padding: '14px 16px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <div style={{ width: 3, height: 14, background: t.primary, borderRadius: 2 }} />
          <span style={{ fontFamily: fonts.mono, fontSize: 10, fontWeight: 700, color: t.primary, letterSpacing: 1 }}>TODAY&apos;S PICK</span>
        </div>
        <button onClick={() => onOpenArticle(pick)} style={{
          width: '100%',
          border: 'none',
          background: t.surface,
          borderRadius: 10,
          padding: 0,
          cursor: 'pointer',
          textAlign: 'left',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(40,20,10,0.08)',
        }}>
          <PhotoBlock hue={pick.hero.hue} label={pick.hero.label} ratio="16/9" />
          <div style={{ padding: '12px 14px 14px' }}>
            <CatBadge cat={pick.cat} color={pick.catColor} t={t} filled />
            <div style={{ fontFamily: fonts.serif, fontSize: 17, fontWeight: 700, color: t.ink, lineHeight: 1.35, margin: '8px 0 6px', letterSpacing: -0.2 }}>
              {pick.title}
            </div>
            <div style={{ fontFamily: fonts.sans, fontSize: 12.5, color: t.inkSoft, lineHeight: 1.6, marginBottom: 8 }}>
              {pick.sub.length > 80 ? pick.sub.slice(0, 80) + '…' : pick.sub}
            </div>
            <MetaLine a={pick} t={t} />
          </div>
        </button>
      </div>

      {/* 주요 기사 */}
      <div style={{ padding: '16px 16px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{ width: 3, height: 14, background: t.gold, borderRadius: 2 }} />
          <span style={{ fontFamily: fonts.mono, fontSize: 10, fontWeight: 700, color: t.gold, letterSpacing: 1 }}>주요 기사</span>
        </div>
        <div style={{ background: t.surface, borderRadius: 10, overflow: 'hidden', boxShadow: '0 2px 8px rgba(40,20,10,0.06)' }}>
          {breaking.map((a, i) => (
            <>
              <button key={a.id} onClick={() => onOpenArticle(a)} style={{
                width: '100%',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                display: 'flex',
                gap: 12,
                alignItems: 'center',
                padding: '12px 14px',
                textAlign: 'left',
              }}>
                <div style={{ width: 60, flexShrink: 0 }}>
                  <PhotoBlock hue={a.hero.hue} label="" ratio="1" radius={6} />
                </div>
                <div style={{ flex: 1 }}>
                  <CatBadge cat={a.cat} color={a.catColor} t={t} />
                  <div style={{ fontFamily: fonts.serif, fontSize: 13, fontWeight: 700, color: t.ink, lineHeight: 1.4, margin: '4px 0 4px', letterSpacing: -0.1 }}>
                    {a.title.length > 40 ? a.title.slice(0, 40) + '…' : a.title}
                  </div>
                  <MetaLine a={a} t={t} showRead={false} dim />
                </div>
              </button>
              {i < breaking.length - 1 && <Divider key={`div-${a.id}`} t={t} />}
            </>
          ))}
        </div>
      </div>

      {/* Section carousels */}
      {sectionGroups.map(sg => (
        <div key={sg.label} style={{ padding: '16px 0 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', marginBottom: 10 }}>
            <span style={{ fontFamily: fonts.sans, fontSize: 13, fontWeight: 700, color: t.ink }}>{sg.label}</span>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: fonts.mono, fontSize: 10, color: t.muted, letterSpacing: 0.3 }}>더보기 →</button>
          </div>
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', padding: '0 16px', scrollbarWidth: 'none' }}>
            {sg.arts.slice(0, 4).map((a, i) => (
              <button key={`${a.id}-${i}`} onClick={() => onOpenArticle(a)} style={{
                border: 'none',
                background: t.surface,
                borderRadius: 8,
                cursor: 'pointer',
                textAlign: 'left',
                flexShrink: 0,
                width: 160,
                overflow: 'hidden',
                boxShadow: '0 2px 6px rgba(40,20,10,0.07)',
                padding: 0,
              }}>
                <PhotoBlock hue={a.hero.hue} label="" ratio="3/2" />
                <div style={{ padding: '9px 10px 11px' }}>
                  <div style={{ fontFamily: fonts.serif, fontSize: 12.5, fontWeight: 700, color: t.ink, lineHeight: 1.45, marginBottom: 4, letterSpacing: -0.1 }}>
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
