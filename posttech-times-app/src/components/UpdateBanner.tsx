import type { Theme } from '@/lib/theme';
import { fonts } from '@/lib/theme';
import type { AppUpdate } from '@/lib/update';

interface Props {
  t: Theme;
  update: AppUpdate;
  onDismiss: () => void;
}

export default function UpdateBanner({ t, update, onDismiss }: Props) {
  // 앱 밖(브라우저)으로 APK 주소를 열면 내려받은 뒤 Android 설치 화면이 뜬다.
  const install = () => {
    window.location.href = update.downloadUrl;
  };

  return (
    <div style={{
      position: 'absolute', left: 12, right: 12, bottom: 72, zIndex: 20,
      background: t.surface, border: `1px solid ${t.primary}`, borderRadius: 10,
      boxShadow: '0 6px 24px rgba(0,0,0,0.18)', padding: '14px 16px',
    }}>
      <div style={{ fontFamily: fonts.sans, fontSize: 14, fontWeight: 800, color: t.ink, marginBottom: 4 }}>
        새 버전 {update.version}이 나왔습니다
      </div>
      {update.notes.length > 0 && (
        <ul style={{ margin: '0 0 8px', paddingLeft: 18 }}>
          {update.notes.map((note, i) => (
            <li key={i} style={{ fontFamily: fonts.sans, fontSize: 12.5, color: t.inkSoft, lineHeight: 1.6 }}>{note}</li>
          ))}
        </ul>
      )}
      <div style={{ fontFamily: fonts.sans, fontSize: 11.5, color: t.muted, lineHeight: 1.5, marginBottom: 10 }}>
        내려받은 파일({update.sizeMb}MB)을 열어 설치하면 기존 앱 위에 업데이트됩니다.
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button onClick={onDismiss} style={{
          background: 'none', border: `1px solid ${t.line}`, borderRadius: 8, padding: '8px 14px',
          fontFamily: fonts.sans, fontSize: 13, fontWeight: 700, color: t.muted, cursor: 'pointer',
        }}>
          나중에
        </button>
        <button onClick={install} style={{
          background: t.primary, border: 'none', borderRadius: 8, padding: '8px 14px',
          fontFamily: fonts.sans, fontSize: 13, fontWeight: 800, color: '#fff', cursor: 'pointer',
        }}>
          업데이트
        </button>
      </div>
    </div>
  );
}
