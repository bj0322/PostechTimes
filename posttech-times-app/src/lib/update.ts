import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';

// 새 버전은 이 저장소의 최신 GitHub Release에서 확인한다.
const REPO = 'bj0322/PostechTimes';

export interface AppUpdate {
  version: string;
  notes: string[];
  downloadUrl: string;
  sizeMb: number;
}

interface LatestRelease {
  tag_name: string;
  body: string | null;
  assets: { name: string; size: number; browser_download_url: string }[];
}

// "2.10"이 "2.9"보다 크도록 숫자 단위로 비교한다.
export function isNewer(latest: string, current: string): boolean {
  const a = latest.split('.').map(n => parseInt(n, 10) || 0);
  const b = current.split('.').map(n => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const diff = (a[i] ?? 0) - (b[i] ?? 0);
    if (diff) return diff > 0;
  }
  return false;
}

// GitHub 릴리스 노트에서 "* 변경 내용 by @user in URL" 줄만 골라 변경 내용만 남긴다.
function releaseNotes(body: string): string[] {
  return body
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.startsWith('* '))
    .map(line => line.slice(2).replace(/\s+by @\S+ in \S+$/, '').trim())
    .filter(Boolean)
    .slice(0, 5);
}

// APK로 배포하는 Android 앱만 확인한다. iOS는 앱스토어·TestFlight가 업데이트를 맡는다.
export async function checkForUpdate(): Promise<AppUpdate | null> {
  if (Capacitor.getPlatform() !== 'android') return null;

  const [{ version }, res] = await Promise.all([
    App.getInfo(),
    fetch(`https://api.github.com/repos/${REPO}/releases/latest`, { headers: { Accept: 'application/vnd.github+json' } }),
  ]);
  if (!res.ok) return null;
  const release = (await res.json()) as LatestRelease;
  const apk = release.assets.find(a => a.name.endsWith('.apk'));
  const latest = release.tag_name.replace(/^v/, '');
  if (!apk || !isNewer(latest, version)) return null;

  return {
    version: latest,
    notes: releaseNotes(release.body ?? ''),
    downloadUrl: apk.browser_download_url,
    sizeMb: Math.round((apk.size / 1024 / 1024) * 10) / 10,
  };
}
