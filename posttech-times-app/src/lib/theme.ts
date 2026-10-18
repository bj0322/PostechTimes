export interface Theme {
  bg: string;
  surface: string;
  surfaceAlt: string;
  line: string;
  lineSoft: string;
  ink: string;
  inkSoft: string;
  muted: string;
  mutedSoft: string;
  primary: string;
  primarySoft: string;
  primaryWash: string;
  gold: string;
  forest: string;
  rose: string;
  ink2: string;
  frame: string;
}

export const lightTheme: Theme = {
  bg: '#F4F4F2',
  surface: '#FFFFFF',
  surfaceAlt: '#F0F0ED',
  line: '#D7D7D2',
  lineSoft: '#E9E9E5',
  ink: '#101010',
  inkSoft: '#3E3E3A',
  muted: '#6B6B66',
  mutedSoft: '#9A9A94',
  primary: '#FF5F00',
  primarySoft: '#FF8A3D',
  primaryWash: '#FFF0E6',
  gold: '#B06B00',
  forest: '#1D6E4D',
  rose: '#B33A3A',
  ink2: '#151515',
  frame: 'rgba(0,0,0,0.12)',
};

export const darkTheme: Theme = {
  bg: '#080808',
  surface: '#111111',
  surfaceAlt: '#1C1C1A',
  line: '#2C2C29',
  lineSoft: '#20201E',
  ink: '#F4F4F0',
  inkSoft: '#CFCFC7',
  muted: '#9B9B93',
  mutedSoft: '#64645E',
  primary: '#FF7A1A',
  primarySoft: '#FFA05D',
  primaryWash: '#2A170C',
  gold: '#D89022',
  forest: '#5CC08A',
  rose: '#EC6666',
  ink2: '#F4F4F0',
  frame: 'rgba(255,255,255,0.12)',
};

export const fonts = {
  serif: 'var(--font-serif), "Noto Serif KR", Georgia, serif',
  sans: 'var(--font-sans), "Noto Sans KR", -apple-system, system-ui, sans-serif',
  mono: 'var(--font-mono), "JetBrains Mono", ui-monospace, monospace',
};
