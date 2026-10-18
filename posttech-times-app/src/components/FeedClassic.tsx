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
  onGoSearch?: () => void;
  onLoadMore?: () => void;
  loadingMore?: boolean;
  hasMore?: boolean;
}

function preview(text: string, length: number) {
  return text.length > length ? `${text.slice(0, length)}...` : text;
}

function TextPreview({ a, t, compact = false }: { a: Article; t: Theme; compact?: boolean }) {
  return (
    <div style={{
      fontFamily: fonts.sans,
      fontSize: compact ? 12.5 : 13,
      color: t.inkSoft,
      lineHeight: 1.45,
      fontWeight: 500,
      margin: compact ? '0 0 6px' : '0 0 8px',
    }}>
      {preview(a.sub, compact ? 58 : 96)}
    </div>
  );
}

export default function FeedClassic({ t, articles, onOpenArticle, dark, onToggleDark, onGoSearch, onLoadMore, loadingMore }: Props) {
  const lead = articles[0];
  const secondary = articles.slice(1, 5);
  const rest = articles.slice(5, 13);

  if (!lead) return null;

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: t.bg }}>
      <div style={{
        background: '#050505',
        padding: '12px 16px 10px',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontFamily: fonts.sans, fontSize: 22, fontWeight: 800, color: '#FFFFFF', letterSpacing: 0 }}>
            포항공대신문
          </div>
          <div style={{ fontFamily: fonts.mono, fontSize: 9, color: t.primary, letterSpacing: 0.4, marginTop: 2 }}>
            POSTECH TIMES · LIVE BRIEF
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button onClick={onToggleDark} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.72)', padding: 4 }}>
            {dark ? <SunIcon size={17} /> : <MoonIcon size={17} />}
          </button>
          <button onClick={onGoSearch} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.72)', padding: 4 }}>
            <SearchIcon size={17} />
          </button>
        </div>
      </div>

      <div style={{
        background: t.surface,
        borderBottom: `1px solid ${t.line}`,
        padding: '6px 16px',
        fontFamily: fonts.mono,
        fontSize: 9,
        color: t.muted,
        letterSpacing: 0.5,
        display: 'flex',
        justifyContent: 'space-between',
      }}>
        <span>TOP STORIES</span>
        <span>POSTECH NEWSROOM</span>
      </div>

      <button onClick={() => onOpenArticle(lead)} style={{ width: '100%', background: t.surface, border: 'none', textAlign: 'left', cursor: 'pointer', padding: 0 }}>
        {lead.imageUrl && (
          <PhotoBlock hue={lead.hero.hue} label={lead.hero.label} ratio="16/9" theme={dark ? 'dark' : 'light'} imageUrl={lead.imageUrl} fit="contain" />
        )}
        <div style={{ padding: lead.imageUrl ? '14px 16px 15px' : '18px 16px 16px' }}>
          <CatBadge cat={lead.cat} color={lead.catColor} t={t} size="sm" />
          <div style={{ fontFamily: fonts.sans, fontSize: 22, fontWeight: 800, color: t.ink, lineHeight: 1.22, margin: '8px 0 8px', letterSpacing: 0 }}>
            {lead.title}
          </div>
          <div style={{ fontFamily: fonts.sans, fontSize: 14, fontWeight: 500, color: t.inkSoft, lineHeight: 1.55, marginBottom: 10 }}>
            {lead.sub}
          </div>
          <MetaLine a={lead} t={t} showRead={false} />
        </div>
      </button>

      <Divider t={t} double />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: t.surface }}>
        {secondary.map((a, i) => (
          <button key={a.id} onClick={() => onOpenArticle(a)} style={{
            border: 'none',
            textAlign: 'left',
            cursor: 'pointer',
            background: t.surface,
            padding: '12px 14px 13px',
            borderRight: i % 2 === 0 ? `1px solid ${t.lineSoft}` : 'none',
            borderBottom: i < 2 ? `1px solid ${t.lineSoft}` : 'none',
          }}>
            {a.imageUrl && <PhotoBlock hue={a.hero.hue} label={a.hero.label} ratio="4/3" imageUrl={a.imageUrl} fit="contain" />}
            <div style={{ marginTop: a.imageUrl ? 8 : 0 }}>
              <CatBadge cat={a.cat} color={a.catColor} t={t} />
              <div style={{ fontFamily: fonts.sans, fontSize: 14, fontWeight: 800, color: t.ink, lineHeight: 1.35, margin: '6px 0 5px', letterSpacing: 0 }}>
                {preview(a.title, 44)}
              </div>
              {!a.imageUrl && <TextPreview a={a} t={t} compact />}
              <MetaLine a={a} t={t} showRead={false} dim />
            </div>
          </button>
        ))}
      </div>

      <Divider t={t} double />

      <div style={{ background: t.surface, padding: '8px 0' }}>
        <div style={{ padding: '6px 16px 6px', fontFamily: fonts.mono, fontSize: 10, color: t.primary, letterSpacing: 0.8, textTransform: 'uppercase', fontWeight: 700 }}>
          지난 기사
        </div>
        {rest.map((a, i) => (
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
              padding: '12px 16px',
            }}>
              <div style={{ flex: 1 }}>
                <CatBadge cat={a.cat} color={a.catColor} t={t} />
                <div style={{ fontFamily: fonts.sans, fontSize: 14, fontWeight: 800, color: t.ink, lineHeight: 1.35, margin: '5px 0', letterSpacing: 0 }}>
                  {a.title}
                </div>
                {!a.imageUrl && <TextPreview a={a} t={t} />}
                <MetaLine a={a} t={t} showRead={false} dim />
              </div>
              {a.imageUrl && (
                <div style={{ width: 86, flexShrink: 0 }}>
                  <PhotoBlock hue={a.hero.hue} label={a.hero.label} ratio="1" radius={4} imageUrl={a.imageUrl} />
                </div>
              )}
            </button>
            {i < rest.length - 1 && <Divider t={t} />}
          </div>
        ))}
      </div>
      {false && (
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
            {loadingMore ? '지난 기사 불러오는 중' : '지난 기사 더 보기'}
          </button>
        </div>
      )}
      <div style={{ height: 20 }} />
    </div>
  );
}
