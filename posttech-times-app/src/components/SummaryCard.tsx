import { useState } from 'react';
import type { Theme } from '@/lib/theme';
import { fonts } from '@/lib/theme';
import { fetchSummary, type ArticleSummary } from '@/lib/summarize';

interface Props {
  t: Theme;
  articleId: string;
}

type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'done'; data: ArticleSummary }
  | { status: 'error' };

export default function SummaryCard({ t, articleId }: Props) {
  const [state, setState] = useState<State>({ status: 'idle' });

  const load = () => {
    setState({ status: 'loading' });
    fetchSummary(articleId)
      .then(data => setState({ status: 'done', data }))
      .catch(() => setState({ status: 'error' }));
  };

  const label = { fontFamily: fonts.sans, fontSize: 12, fontWeight: 800, color: t.primary, letterSpacing: 0 };
  const note = { fontFamily: fonts.sans, fontSize: 12.5, color: t.muted, lineHeight: 1.6 };

  if (state.status === 'idle') {
    return (
      <button onClick={load} style={{
        width: '100%',
        background: t.primaryWash,
        border: `1px solid ${t.primary}`,
        borderRadius: 8,
        cursor: 'pointer',
        padding: '10px 12px',
        marginBottom: 20,
        textAlign: 'left',
        ...label,
      }}>
        AI 3줄 요약 보기
      </button>
    );
  }

  return (
    <div style={{
      background: t.surfaceAlt,
      border: `1px solid ${t.line}`,
      borderRadius: 8,
      padding: '12px 14px',
      marginBottom: 20,
    }}>
      <div style={{ ...label, marginBottom: 8 }}>AI 3줄 요약</div>

      {state.status === 'loading' && <div style={note}>요약을 불러오는 중...</div>}

      {state.status === 'error' && (
        <div style={note}>
          요약을 불러오지 못했습니다.{' '}
          <button onClick={load} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', ...note, color: t.primary, fontWeight: 700 }}>
            다시 시도
          </button>
        </div>
      )}

      {state.status === 'done' && (
        <>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {state.data.summary.map((line, i) => (
              <li key={i} style={{ fontFamily: fonts.sans, fontSize: 14, color: t.ink, lineHeight: 1.7, marginBottom: 4 }}>
                {line}
              </li>
            ))}
          </ul>
          <div style={{ ...note, fontSize: 11, marginTop: 8 }}>
            AI가 기사를 요약했습니다. 정확한 내용은 본문을 확인하세요.
          </div>
        </>
      )}
    </div>
  );
}
