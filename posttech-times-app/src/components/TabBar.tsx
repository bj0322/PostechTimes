import type { ComponentType } from 'react';
import type { Theme } from '@/lib/theme';
import { fonts } from '@/lib/theme';
import { HomeIcon, GridIcon, SearchIcon, BookIcon } from './Icons';

export type TabKey = 'home' | 'category' | 'search' | 'bookmark';

interface Props {
  active: TabKey;
  onChange: (tab: TabKey) => void;
  t: Theme;
}

export default function TabBar({ active, onChange, t }: Props) {
  const tabs: { key: TabKey; label: string; Icon: ComponentType<{ size?: number }> }[] = [
    { key: 'home', label: 'Top', Icon: HomeIcon },
    { key: 'category', label: 'Sections', Icon: GridIcon },
    { key: 'search', label: 'Search', Icon: SearchIcon },
    { key: 'bookmark', label: 'Saved', Icon: BookIcon },
  ];

  return (
    <div style={{
      display: 'flex',
      borderTop: `1px solid ${t.line}`,
      background: t.surface,
      padding: '6px 4px 8px',
      flexShrink: 0,
    }}>
      {tabs.map(({ key, label, Icon }) => {
        const on = active === key;
        return (
          <button key={key} onClick={() => onChange(key)} style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            padding: '6px 0',
            border: 'none',
            borderTop: `2px solid ${on ? t.primary : 'transparent'}`,
            background: 'transparent',
            color: on ? t.ink : t.muted,
            cursor: 'pointer',
            fontFamily: fonts.sans,
            fontSize: 10,
            fontWeight: on ? 800 : 600,
            letterSpacing: 0,
          }}>
            <Icon size={21} />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
