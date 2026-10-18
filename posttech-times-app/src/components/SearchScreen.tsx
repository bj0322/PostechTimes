import { useState } from 'react';
import type { Theme } from '@/lib/theme';
import { fonts } from '@/lib/theme';
import type { Article } from '@/types/article';
import PhotoBlock from './PhotoBlock';
import CatBadge from './CatBadge';
import MetaLine from './MetaLine';
import Divider from './Divider';
import { SearchIcon, MoonIcon, SunIcon } from './Icons';

interface Props {
  t: Theme;
  articles: Article[];
  onOpenArticle: (a: Article) => void;
  dark: boolean;
  onToggleDark: () => void;
  onLoadMore?: () => void;
  loadingMore?: boolean;
  hasMore?: boolean;
}

const RECENT = ['포카전', 'POSTECH AI', '기숙사', '연구'];

function preview(text: string) {
  return text.length > 92 ? `${text.slice(0, 92)}...` : text;
}

export default function SearchScreen({ t, articles, onOpenArticle, dark, onToggleDark, onLoadMore, loadingMore, hasMore }: Props) {
  const [query, setQuery] = useState('');
  const needle = query.trim().toLowerCase();
  const results = needle
    ? articles.filter(a =>
        a.title.toLowerCase().includes(needle) ||
        a.sub.toLowerCase().includes(needle) ||
        a.cat.toLowerCase().includes(needle) ||
        a.author.toLowerCase().includes(needle)
      )
    : [];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: t.bg }}>
      <div style={{ background: '#050505', borderBottom: `2px solid ${t.primary}`, padding: '12px 14px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div>
            <div style={{ fontFamily: fonts.sans, fontSize: 20, fontWeight: 800, color: '#FFFFFF' }}>Search</div>
            <div style={{ fontFamily: fonts.mono, fontSize: 9, color: t.primary, letterSpacing: 0.5, marginTop: 2 }}>{articles.length} ARTICLES LOADED</div>
          </div>
          <button onClick={onToggleDark} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.72)', padding: 4 }}>
            {dark ? <SunIcon size={18} /> : <MoonIcon size={18} />}
          </button>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: '#FFFFFF',
          borderRadius: 4,
          padding: '8px 10px',
        }}>
          <SearchIcon size={17} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="기사 검색"
            style={{
              flex: 1,
              border: 'none',
              background: 'none',
              outline: 'none',
              fontFamily: fonts.sans,
              fontSize: 14,
              color: '#111111',
            }}
          />
          {query && (
            <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555', padding: 0, fontSize: 18, lineHeight: 1 }}>x</button>
          )}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {query.trim() === '' ? (
          <div style={{ padding: '16px' }}>
            <div style={{ fontFamily: fonts.mono, fontSize: 10, color: t.muted, letterSpacing: 0.6, marginBottom: 10 }}>RECENT SEARCHES</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {RECENT.map(r => (
                <button key={r} onClick={() => setQuery(r)} style={{
                  fontFamily: fonts.sans,
                  fontSize: 13,
                  color: t.ink,
                  background: t.surface,
                  border: `1px solid ${t.line}`,
                  borderRadius: 4,
                  padding: '7px 12px',
                  cursor: 'pointer',
                  fontWeight: 700,
                }}>{r}</button>
              ))}
            </div>
          </div>
        ) : results.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', fontFamily: fonts.sans, fontSize: 13, color: t.muted }}>
            &quot;{query}&quot; 검색 결과가 없습니다. 이전 기사를 더 불러온 뒤 다시 검색할 수 있습니다.
          </div>
        ) : (
          <div style={{ background: t.surface }}>
            <div style={{ padding: '8px 16px', fontFamily: fonts.mono, fontSize: 10, color: t.primary, letterSpacing: 0.4, fontWeight: 700 }}>
              {results.length} RESULTS
            </div>
            {results.map((a, i) => (
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
                    <div style={{ fontFamily: fonts.sans, fontSize: 14.5, fontWeight: 800, color: t.ink, lineHeight: 1.35, margin: '6px 0 5px' }}>{a.title}</div>
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
                {i < results.length - 1 && <Divider t={t} />}
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
