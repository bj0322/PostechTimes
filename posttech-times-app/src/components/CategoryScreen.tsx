import { useState } from 'react';
import type { Theme } from '@/lib/theme';
import { fonts } from '@/lib/theme';
import type { Article, Category } from '@/types/article';
import PhotoBlock from './PhotoBlock';
import CatBadge from './CatBadge';
import MetaLine from './MetaLine';
import Divider from './Divider';
import { MoonIcon, SunIcon } from './Icons';

interface Props {
  t: Theme;
  articles: Article[];
  categories: Category[];
  onOpenArticle: (a: Article) => void;
  dark: boolean;
  onToggleDark: () => void;
  onLoadMore?: () => void;
  loadingMore?: boolean;
  hasMore?: boolean;
}

function preview(text: string) {
  return text.length > 92 ? `${text.slice(0, 92)}...` : text;
}

export default function CategoryScreen({ t, articles, categories, onOpenArticle, dark, onToggleDark, onLoadMore, loadingMore, hasMore }: Props) {
  const allKey = categories[0]?.key ?? '전체';
  const [active, setActive] = useState(allKey);
  const filtered = active === allKey ? articles : articles.filter(a => a.cat === active);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: t.bg }}>
      <div style={{ background: '#050505', borderBottom: `2px solid ${t.primary}`, padding: '12px 16px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 11 }}>
          <div>
            <div style={{ fontFamily: fonts.sans, fontSize: 20, fontWeight: 800, color: '#FFFFFF', letterSpacing: 0 }}>Sections</div>
            <div style={{ fontFamily: fonts.mono, fontSize: 9, color: t.primary, letterSpacing: 0.5, marginTop: 2 }}>POSTECH TIMES</div>
          </div>
          <button onClick={onToggleDark} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.72)', padding: 4 }}>
            {dark ? <SunIcon size={18} /> : <MoonIcon size={18} />}
          </button>
        </div>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 10, scrollbarWidth: 'none' }}>
          {categories.map(c => {
            const on = active === c.key;
            return (
              <button key={c.key} onClick={() => setActive(c.key)} style={{
                flexShrink: 0,
                border: `1px solid ${on ? t.primary : 'rgba(255,255,255,0.28)'}`,
                background: on ? t.primary : 'transparent',
                color: on ? '#111111' : '#FFFFFF',
                borderRadius: 999,
                padding: '5px 12px',
                fontFamily: fonts.sans,
                fontSize: 12,
                fontWeight: 800,
                cursor: 'pointer',
              }}>{c.label}</button>
            );
          })}
        </div>
      </div>

      {active !== allKey && (
        <div style={{
          background: t.surface,
          padding: '8px 16px',
          fontFamily: fonts.sans,
          fontSize: 12,
          color: t.inkSoft,
          borderBottom: `1px solid ${t.line}`,
        }}>
          {categories.find(c => c.key === active)?.desc}
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', fontFamily: fonts.sans, fontSize: 13, color: t.muted }}>
            이 섹션에는 표시할 기사가 없습니다.
          </div>
        ) : (
          <div style={{ background: t.surface }}>
            {filtered.map((a, i) => (
              <div key={a.id}>
                <button onClick={() => onOpenArticle(a)} style={{
                  width: '100%',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  gap: 12,
                  alignItems: 'flex-start',
                  padding: '13px 16px',
                }}>
                  <div style={{ flex: 1 }}>
                    <CatBadge cat={a.cat} color={a.catColor} t={t} />
                    <div style={{ fontFamily: fonts.sans, fontSize: 14.5, fontWeight: 800, color: t.ink, lineHeight: 1.35, margin: '6px 0 5px', letterSpacing: 0 }}>
                      {a.title}
                    </div>
                    {!a.imageUrl && (
                      <div style={{ fontFamily: fonts.sans, fontSize: 12.5, color: t.inkSoft, lineHeight: 1.45, marginBottom: 7 }}>
                        {preview(a.sub)}
                      </div>
                    )}
                    <MetaLine a={a} t={t} showRead={false} dim />
                  </div>
                  {a.imageUrl && (
                    <div style={{ width: 86, flexShrink: 0 }}>
                      <PhotoBlock hue={a.hero.hue} label="" ratio="1" radius={4} imageUrl={a.imageUrl} />
                    </div>
                  )}
                </button>
                {i < filtered.length - 1 && <Divider t={t} />}
              </div>
            ))}
          </div>
        )}
        {hasMore && (
          <div style={{ background: t.surface, padding: '12px 16px 20px' }}>
            <button onClick={onLoadMore} disabled={loadingMore} style={{
              width: '100%',
              border: `1px solid ${t.line}`,
              background: loadingMore ? t.surfaceAlt : '#050505',
              color: loadingMore ? t.muted : '#FFFFFF',
              cursor: loadingMore ? 'default' : 'pointer',
              padding: '11px 12px',
              fontFamily: fonts.sans,
              fontSize: 13,
              fontWeight: 800,
              borderRadius: 4,
            }}>
              {loadingMore ? '이전 기사 불러오는 중' : '이전 기사 더 보기'}
            </button>
          </div>
        )}
        <div style={{ height: 20 }} />
      </div>
    </div>
  );
}
