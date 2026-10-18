// Light / Dark 테마 토큰 — POSTECH Times
// 따뜻한 크림 + 와인레드 + 골드/포레스트 액센트
window.POSTECH_THEME = {
  light: {
    bg:        '#F4EFE3',  // 따뜻한 크림 배경 (캔버스)
    surface:   '#FBF7EC',  // 카드/디바이스 표면
    surfaceAlt:'#EDE6D3',  // 강조 표면 (구분선 영역)
    line:      '#D9CFB6',  // 디바이더
    lineSoft:  '#E5DCC4',
    ink:       '#1F1B14',  // 본문 글자
    inkSoft:   '#4A4232',
    muted:     '#857B66',  // 캡션, 메타
    mutedSoft: '#A89E86',
    primary:   '#8C2332',  // POSTECH 와인레드
    primarySoft:'#B85562',
    primaryWash:'#F2E0DD', // 와시 (배경 강조)
    gold:      '#B98A3C',  // 골드 액센트
    forest:    '#3F5C3A',  // 포레스트 (학술)
    rose:      '#C76A5B',  // 문화 액센트
    ink2:      '#34372F',
    frame:     'rgba(112,98,72,0.35)',
  },
  dark: {
    bg:        '#15120D',
    surface:   '#1E1A12',
    surfaceAlt:'#26211A',
    line:      '#37301F',
    lineSoft:  '#2A2419',
    ink:       '#EDE3CE',
    inkSoft:   '#C2B69C',
    muted:     '#8A7E66',
    mutedSoft: '#6A6051',
    primary:   '#D9606C',  // 다크에서 더 밝게
    primarySoft:'#E08891',
    primaryWash:'#3A1E22',
    gold:      '#D6A35A',
    forest:    '#7AA174',
    rose:      '#E08A77',
    ink2:      '#D9CFB9',
    frame:     'rgba(180,162,128,0.18)',
  },
};

window.POSTECH_FONTS = {
  serif:  '"Noto Serif KR", "Newsreader", "Source Serif 4", Georgia, serif',
  sans:   '"Pretendard", "Pretendard Variable", "Noto Sans KR", -apple-system, system-ui, sans-serif',
  mono:   '"JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace',
};
