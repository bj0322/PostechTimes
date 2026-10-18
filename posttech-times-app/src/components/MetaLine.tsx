import type { Theme } from '@/lib/theme';
import { fonts } from '@/lib/theme';
import type { Article } from '@/types/article';

interface Props {
  a: Article;
  t: Theme;
  showRead?: boolean;
  dim?: boolean;
}

export default function MetaLine({ a, t, showRead = true, dim = false }: Props) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      fontFamily: fonts.mono,
      fontSize: 10,
      color: dim ? t.mutedSoft : t.muted,
      letterSpacing: 0.2,
    }}>
      <span>{a.author}</span>
      <span style={{ opacity: 0.5 }}>·</span>
      <span>{a.date.slice(5)}</span>
      {showRead && (
        <>
          <span style={{ opacity: 0.5 }}>·</span>
          <span>{a.readTime}</span>
        </>
      )}
    </div>
  );
}
