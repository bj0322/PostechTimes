const NAMED_ENTITIES: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”', sbquo: '‚', bdquo: '„',
  middot: '·', hellip: '…', ndash: '–', mdash: '—', bull: '•', copy: '©',
  reg: '®', trade: '™', deg: '°', times: '×', divide: '÷', plusmn: '±',
  laquo: '«', raquo: '»', lsaquo: '‹', rsaquo: '›', prime: '′', Prime: '″',
};

// HTMLRewriter가 넘기는 텍스트는 엔티티가 풀리지 않은 원문 그대로다.
export function decodeEntities(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, name: string) => {
    if (name[0] === '#') {
      const code = name[1] === 'x' || name[1] === 'X' ? parseInt(name.slice(2), 16) : parseInt(name.slice(1), 10);
      return Number.isFinite(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : match;
    }
    return NAMED_ENTITIES[name] ?? match;
  });
}

export function cleanParagraphs(raw: string[]): string[] {
  return raw
    .map(p => decodeEntities(p).replace(/\s+/g, ' ').trim())
    .filter(p => p && !p.includes('저작권자'));
}

export function stripSiteSuffix(title: string): string {
  return decodeEntities(title).replace(/\s+-\s+포항공대신문\s*$/, '').trim();
}
