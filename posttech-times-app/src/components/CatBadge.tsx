import type { Theme } from '@/lib/theme';
import { fonts } from '@/lib/theme';

interface Props {
  cat: string;
  color: string;
  t: Theme;
  size?: 'sm' | 'lg';
  filled?: boolean;
}

export default function CatBadge({ cat, color, t, size = 'sm', filled = false }: Props) {
  const palette: Record<string, string> = {
    primary: t.primary,
    gold: t.gold,
    forest: t.forest,
    rose: t.rose,
    ink: t.ink2,
  };
  const c = palette[color] ?? t.primary;
  const fs = size === 'lg' ? 11 : 10;
  const py = size === 'lg' ? 4 : 3;
  const px = size === 'lg' ? 9 : 7;
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      fontFamily: fonts.sans,
      fontSize: fs,
      fontWeight: 600,
      letterSpacing: 0.4,
      color: filled ? '#FFF8EC' : c,
      background: filled ? c : 'transparent',
      border: filled ? 'none' : `1px solid ${c}`,
      padding: `${py}px ${px}px`,
      borderRadius: 2,
    }}>{cat}</span>
  );
}
