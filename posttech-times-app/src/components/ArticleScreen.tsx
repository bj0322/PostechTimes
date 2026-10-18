import { useEffect, useState } from 'react';
import type { Theme } from '@/lib/theme';
import { fonts } from '@/lib/theme';
import type { Article } from '@/types/article';
import PhotoBlock from './PhotoBlock';
import CatBadge from './CatBadge';
import { ArrowLeftIcon, FontIcon, BookmarkIcon, ShareIcon, MoonIcon, SunIcon } from './Icons';

interface Props {
  t: Theme;
  article: Article;
  onBack: () => void;
  dark: boolean;
  onToggleDark: () => void;
  bookmarks: Set<string>;
  onToggleBookmark: (id: string) => void;
}

const DEFAULT_BODY = [
  '포항공대신문은 1988년 창간 이후 포스텍 구성원들의 목소리를 기록해왔다. 이번 기사는 포항공대 캠퍼스 일상과 학문, 그리고 공동체에 관한 이야기를 담고 있다.',
  '"이번 사안은 단순한 행정적 결정이 아니라 학생 전체의 삶과 직결된 문제입니다." 학생 대표 김○○씨는 본지와의 인터뷰에서 이같이 말했다.',
  '한편 학교 측은 해당 사안에 대해 충분한 논의를 거쳤다는 입장이다. 관련 위원회는 다음 달 중 공청회를 열어 학생·교수·직원 의견을 수렴할 계획이다.',
  '포항공대신문은 이 사안의 추이를 계속 지켜보며 후속 취재를 이어나갈 예정이다.',
];

async function shareArticle(article: Article) {
  const shareUrl = article.url ?? window.location.href;
  const text = article.sub ? `${article.sub}\n${shareUrl}` : shareUrl;

  if (navigator.share) {
    await navigator.share({
      title: article.title,
      text: article.sub,
      url: shareUrl,
    });
    return;
  }

  await navigator.clipboard.writeText(`${article.title}\n${text}`);
}

export default function ArticleScreen({ t, article: a, onBack, dark, onToggleDark, bookmarks, onToggleBookmark }: Props) {
  const [fontSize, setFontSize] = useState(16);
  const [showFontPanel, setShowFontPanel] = useState(false);
  const [article, setArticle] = useState(a);
  const [loadingDetail, setLoadingDetail] = useState(Boolean(a.url && !a.body));
  const [shareCopied, setShareCopied] = useState(false);
  const isBookmarked = bookmarks.has(a.id);

  useEffect(() => {
    let cancelled = false;

    if (a.url && !a.body) {
      import('@/lib/fetchArticles')
        .then(({ fetchArticleDetail }) => fetchArticleDetail(a))
        .then(detail => {
          if (!cancelled) setArticle(detail);
        })
        .catch(() => {
          if (!cancelled) setArticle(a);
        })
        .finally(() => {
          if (!cancelled) setLoadingDetail(false);
        });
    }

    return () => { cancelled = true; };
  }, [a]);

  const current = article;

  const topBar = (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: '6px 10px',
      borderBottom: `1px solid ${t.line}`,
      background: t.surface,
      gap: 4,
      flexShrink: 0,
    }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.ink, padding: 6, borderRadius: 6, display: 'flex' }}>
        <ArrowLeftIcon size={20} />
      </button>
      <div style={{ flex: 1, textAlign: 'center', fontFamily: fonts.serif, fontSize: 13, fontWeight: 800, color: t.primary, letterSpacing: 0 }}>
        포항공대신문
      </div>
      <button onClick={() => setShowFontPanel(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.muted, padding: 6, borderRadius: 6, display: 'flex' }}>
        <FontIcon size={18} />
      </button>
      <button onClick={() => onToggleBookmark(current.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: isBookmarked ? t.primary : t.muted, padding: 6, borderRadius: 6, display: 'flex' }}>
        <BookmarkIcon size={18} filled={isBookmarked} color={t.primary} />
      </button>
      {current.url && (
        <button
          aria-label="기사 공유"
          title={shareCopied ? '링크 복사됨' : '기사 공유'}
          onClick={async () => {
            try {
              await shareArticle(current);
              setShareCopied(true);
              window.setTimeout(() => setShareCopied(false), 1200);
            } catch {
              setShareCopied(false);
            }
          }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: shareCopied ? t.primary : t.muted, padding: 6, borderRadius: 6, display: 'flex' }}
        >
          <ShareIcon size={18} />
        </button>
      )}
    </div>
  );

  const body = current.body ?? (loadingDetail ? [] : DEFAULT_BODY);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: t.surface, overflow: 'hidden' }}>
      {topBar}

      {/* Font size panel */}
      {showFontPanel && (
        <div style={{
          background: t.surfaceAlt,
          borderBottom: `1px solid ${t.line}`,
          padding: '8px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexShrink: 0,
        }}>
          <span style={{ fontFamily: fonts.sans, fontSize: 12, color: t.inkSoft, fontWeight: 700, letterSpacing: 0 }}>글자 크기</span>
          <button onClick={() => setFontSize(v => Math.max(12, v - 1))} style={{ background: t.surface, border: `1px solid ${t.line}`, borderRadius: 4, cursor: 'pointer', color: t.ink, width: 28, height: 28, fontFamily: fonts.sans, fontSize: 16 }}>−</button>
          <span style={{ fontFamily: fonts.mono, fontSize: 11, color: t.ink, minWidth: 24, textAlign: 'center' }}>{fontSize}</span>
          <button onClick={() => setFontSize(v => Math.min(22, v + 1))} style={{ background: t.surface, border: `1px solid ${t.line}`, borderRadius: 4, cursor: 'pointer', color: t.ink, width: 28, height: 28, fontFamily: fonts.sans, fontSize: 16 }}>+</button>
          <div style={{ flex: 1 }} />
          <button onClick={onToggleDark} style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.muted, padding: 4 }}>
            {dark ? <SunIcon size={17} /> : <MoonIcon size={17} />}
          </button>
        </div>
      )}

      {/* Scroll body */}
      <div style={{ flex: 1, overflowY: 'auto', background: t.surface }}>
        <PhotoBlock hue={current.hero.hue} label={current.hero.label} ratio="3/2" imageUrl={current.imageUrl} fit="contain" theme={dark ? 'dark' : 'light'} />

        <div style={{ padding: '18px 20px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <CatBadge cat={current.cat} color={current.catColor} t={t} filled size="lg" />
            {current.kicker && (
              <span style={{ fontFamily: fonts.mono, fontSize: 9, color: t.muted, letterSpacing: 0.5 }}>{current.kicker}</span>
            )}
          </div>

          <h1 style={{ fontFamily: fonts.serif, fontSize: 22, fontWeight: 800, color: t.ink, lineHeight: 1.3, letterSpacing: -0.5, margin: '0 0 10px' }}>
            {current.title}
          </h1>

          {current.sub && (
            <p style={{ fontFamily: fonts.sans, fontSize: 14.5, color: t.inkSoft, lineHeight: 1.7, margin: '0 0 14px', borderLeft: `2.5px solid ${t.primary}`, paddingLeft: 12 }}>
              {current.sub}
            </p>
          )}

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 0',
            borderTop: `1px solid ${t.lineSoft}`,
            borderBottom: `1px solid ${t.lineSoft}`,
            marginBottom: 20,
          }}>
            <div>
              <div style={{ fontFamily: fonts.sans, fontSize: 12.5, fontWeight: 800, color: t.ink }}>{current.author}</div>
              <div style={{ fontFamily: fonts.mono, fontSize: 10, color: t.muted, letterSpacing: 0.3, marginTop: 2 }}>{current.date} · {current.readTime}</div>
            </div>
            <button onClick={() => onToggleBookmark(current.id)} style={{
              background: isBookmarked ? t.primaryWash : t.surfaceAlt,
              border: `1px solid ${isBookmarked ? t.primary : t.line}`,
              borderRadius: 6,
              cursor: 'pointer',
              color: isBookmarked ? t.primary : t.muted,
              padding: '5px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontFamily: fonts.sans,
              fontSize: 11,
              fontWeight: 600,
            }}>
              <BookmarkIcon size={13} filled={isBookmarked} color={isBookmarked ? t.primary : t.muted} />
              {isBookmarked ? '저장됨' : '스크랩'}
            </button>
          </div>

          {loadingDetail && (
            <div style={{
              padding: '24px 0 34px',
              fontFamily: fonts.sans,
              fontSize: 13,
              color: t.muted,
              textAlign: 'center',
            }}>
              기사 본문을 불러오는 중...
            </div>
          )}

          {body.map((para, i) => (
            <p key={i} style={{ fontFamily: fonts.serif, fontSize, fontWeight: 500, color: t.ink, lineHeight: 1.9, margin: '0 0 18px', letterSpacing: 0 }}>
              {para}
            </p>
          ))}

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '14px 0', borderTop: `1px solid ${t.lineSoft}` }}>
            {['#포스텍', `#${current.cat}`, '#포항공대신문'].map(tag => (
              <span key={tag} style={{ fontFamily: fonts.mono, fontSize: 11, color: t.muted, background: t.surfaceAlt, padding: '4px 8px', borderRadius: 4, letterSpacing: 0.2 }}>
                {tag}
              </span>
            ))}
          </div>

          <div style={{ height: 32 }} />
        </div>
      </div>
    </div>
  );
}
