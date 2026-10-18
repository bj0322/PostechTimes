export interface Article {
  id: string;
  cat: string;
  catColor: 'primary' | 'gold' | 'forest' | 'rose' | 'ink';
  kicker: string;
  title: string;
  sub: string;
  author: string;
  date: string;
  readTime: string;
  bookmarked: boolean;
  hero: { hue: number; label: string };
  body?: string[];
  url?: string;
  imageUrl?: string;
}

export interface Category {
  key: string;
  label: string;
  desc: string;
}
