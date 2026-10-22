import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { SERVER_URL } from './server';

export interface AppUpdate {
  version: string;
  notes: string[];
  downloadUrl: string;
  sizeMb: number;
}

interface LatestApp {
  version: string;
  notes: string;
  apkPath: string;
  size: number;
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
  if (!SERVER_URL || Capacitor.getPlatform() !== 'android') return null;

  const [{ version }, res] = await Promise.all([App.getInfo(), fetch(`${SERVER_URL}/app/latest`)]);
  if (!res.ok) return null;
  const latest = (await res.json()) as LatestApp;
  if (!isNewer(latest.version, version)) return null;

  return {
    version: latest.version,
    notes: releaseNotes(latest.notes ?? ''),
    downloadUrl: `${SERVER_URL}${latest.apkPath}`,
    sizeMb: Math.round((latest.size / 1024 / 1024) * 10) / 10,
  };
}
