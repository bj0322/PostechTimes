import type { Theme } from '@/lib/theme';
import { fonts } from '@/lib/theme';
import type { Article } from '@/types/article';
import PhotoBlock from './PhotoBlock';
import CatBadge from './CatBadge';
import MetaLine from './MetaLine';
import Divider from './Divider';
import { BookmarkIcon, MoonIcon, SunIcon } from './Icons';

interface Props {
  t: Theme;
  articles: Article[];
  bookmarks: Set<string>;
  onOpenArticle: (a: Article) => void;
  onToggleBookmark: (id: string) => void;
  dark: boolean;
  onToggleDark: () => void;
}

function preview(text: string) {
  return text.length > 92 ? `${text.slice(0, 92)}...` : text;
}

export default function BookmarkScreen({ t, articles, bookmarks, onOpenArticle, onToggleBookmark, dark, onToggleDark }: Props) {
  const saved = articles.filter(a => bookmarks.has(a.id));

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: t.bg }}>
      <div style={{ background: '#050505', borderBottom: `2px solid ${t.primary}`, padding: '12px 16px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: fonts.sans, fontSize: 20, fontWeight: 800, color: '#FFFFFF' }}>Saved</div>
            <div style={{ fontFamily: fonts.mono, fontSize: 9, color: t.primary, letterSpacing: 0.5, marginTop: 2 }}>{saved.length} ARTICLES</div>
          </div>
          <button onClick={onToggleDark} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.72)', padding: 4 }}>
            {dark ? <SunIcon size={18} /> : <MoonIcon size={18} />}
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {saved.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <div style={{ marginBottom: 12, opacity: 0.35, display: 'flex', justifyContent: 'center' }}>
              <BookmarkIcon size={40} color={t.muted} />
            </div>
            <div style={{ fontFamily: fonts.sans, fontSize: 17, fontWeight: 800, color: t.ink, marginBottom: 6 }}>저장한 기사가 없습니다</div>
            <div style={{ fontFamily: fonts.sans, fontSize: 13, color: t.muted, lineHeight: 1.5 }}>
              기사 화면에서 북마크를 누르면 여기에 모입니다.
            </div>
          </div>
        ) : (
          <div style={{ background: t.surface }}>
            {saved.map((a, i) => (
              <div key={a.id}>
                <div style={{ display: 'flex', alignItems: 'flex-start', padding: '13px 16px', gap: 12 }}>
                  <button onClick={() => onOpenArticle(a)} style={{
                    flex: 1,
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    gap: 12,
                    alignItems: 'flex-start',
                    padding: 0,
                  }}>
                    <div style={{ flex: 1 }}>
                      <CatBadge cat={a.cat} color={a.catColor} t={t} />
                      <div style={{ fontFamily: fonts.sans, fontSize: 14.5, fontWeight: 800, color: t.ink, lineHeight: 1.35, margin: '6px 0 5px', letterSpacing: 0 }}>{a.title}</div>
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
                  <button onClick={() => onToggleBookmark(a.id)} style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: t.primary,
                    padding: 4,
                    flexShrink: 0,
                    marginTop: 1,
                  }}>
                    <BookmarkIcon size={18} filled color={t.primary} />
                  </button>
                </div>
                {i < saved.length - 1 && <Divider t={t} />}
              </div>
            ))}
          </div>
        )}
        <div style={{ height: 20 }} />
      </div>
    </div>
  );
}
