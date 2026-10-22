export function cleanParagraphs(raw: string[]): string[] {
  return raw
    .map(p => p.replace(/\s+/g, ' ').trim())
    .filter(p => p && !p.includes('저작권자'));
}

export function stripSiteSuffix(title: string): string {
  return title.replace(/\s+-\s+포항공대신문\s*$/, '').trim();
}
