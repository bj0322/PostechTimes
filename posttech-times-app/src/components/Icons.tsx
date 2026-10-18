import type { ReactNode } from 'react';

interface IcProps {
  d: ReactNode;
  size?: number;
  sw?: number;
  fill?: string;
  stroke?: string;
}

const Ic = ({ d, size = 20, sw = 1.6, fill = 'none', stroke = 'currentColor' }: IcProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    {d}
  </svg>
);

export const BookmarkIcon = ({ size = 20, filled = false, color = 'currentColor' }: {
  size?: number; filled?: boolean; color?: string;
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24"
    fill={filled ? color : 'none'} stroke={color} strokeWidth="1.6" strokeLinejoin="round">
    <path d="M6 4h12v17l-6-4-6 4V4z" />
  </svg>
);

export const ChevronIcon = ({ size = 18, dir = 'right' }: {
  size?: number; dir?: 'right' | 'left' | 'up' | 'down';
}) => {
  const rMap: Record<string, number> = { right: 0, left: 180, up: 270, down: 90 };
  const r = rMap[dir] ?? 0;
  return (
    <Ic size={size} d={
      <polyline points="9 6 15 12 9 18" transform={`rotate(${r} 12 12)`} />
    } />
  );
};

export const SearchIcon = ({ size = 20 }: { size?: number }) => (
  <Ic size={size} d={<><circle cx="11" cy="11" r="7" /><line x1="20" y1="20" x2="16.5" y2="16.5" /></>} />
);

export const HomeIcon = ({ size = 22 }: { size?: number }) => (
  <Ic size={size} d={<><path d="M3 11l9-7 9 7" /><path d="M5 10v10h14V10" /></>} />
);

export const BookIcon = ({ size = 22 }: { size?: number }) => (
  <Ic size={size} d={<><path d="M4 5a2 2 0 0 1 2-2h13v17H6a2 2 0 0 0-2 2V5z" /><path d="M19 17H6a2 2 0 0 0-2 2" /></>} />
);

export const GridIcon = ({ size = 22 }: { size?: number }) => (
  <Ic size={size} d={
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </>
  } />
);

export const ArrowLeftIcon = ({ size = 20 }: { size?: number }) => (
  <Ic size={size} d={<><line x1="20" y1="12" x2="4" y2="12" /><polyline points="10 6 4 12 10 18" /></>} />
);

export const ShareIcon = ({ size = 20 }: { size?: number }) => (
  <Ic size={size} d={
    <>
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="6" r="2.5" />
      <circle cx="18" cy="18" r="2.5" />
      <line x1="8" y1="11" x2="16" y2="7" />
      <line x1="8" y1="13" x2="16" y2="17" />
    </>
  } />
);

export const FontIcon = ({ size = 20 }: { size?: number }) => (
  <Ic size={size} sw={1.8} d={
    <>
      <path d="M5 18l4-12h2l4 12" />
      <line x1="7" y1="14" x2="13" y2="14" />
      <path d="M16 18h4M18 8v10" />
    </>
  } />
);

export const MoonIcon = ({ size = 20 }: { size?: number }) => (
  <Ic size={size} d={<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z" />} />
);

export const SunIcon = ({ size = 20 }: { size?: number }) => (
  <Ic size={size} d={
    <>
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="3" x2="12" y2="5" />
      <line x1="12" y1="19" x2="12" y2="21" />
      <line x1="3" y1="12" x2="5" y2="12" />
      <line x1="19" y1="12" x2="21" y2="12" />
      <line x1="5.5" y1="5.5" x2="6.9" y2="6.9" />
      <line x1="17.1" y1="17.1" x2="18.5" y2="18.5" />
      <line x1="5.5" y1="18.5" x2="6.9" y2="17.1" />
      <line x1="17.1" y1="6.9" x2="18.5" y2="5.5" />
    </>
  } />
);

export const FilterIcon = ({ size = 18 }: { size?: number }) => (
  <Ic size={size} d={
    <>
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="7" y1="12" x2="17" y2="12" />
      <line x1="10" y1="18" x2="14" y2="18" />
    </>
  } />
);
