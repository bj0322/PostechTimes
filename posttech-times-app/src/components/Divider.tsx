import type { Theme } from '@/lib/theme';

export default function Divider({ t, double = false }: { t: Theme; double?: boolean }) {
  if (double) {
    return (
      <div style={{ borderTop: `1px solid ${t.line}`, borderBottom: `1px solid ${t.line}`, height: 4 }} />
    );
  }
  return <div style={{ borderTop: `1px solid ${t.lineSoft}` }} />;
}
