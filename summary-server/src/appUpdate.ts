import { createWriteStream } from 'node:fs';
import { mkdir, rename, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

// 저장소가 비공개라 휴대폰은 GitHub Release의 APK를 직접 받을 수 없다.
// 서버가 토큰으로 최신 릴리스의 APK를 받아 두었다가 앱에 그대로 내려준다.
const REPO = process.env.GITHUB_REPO ?? 'bj0322/PostechTimes';
const TOKEN = process.env.GITHUB_TOKEN ?? '';
const DATA_DIR = process.env.DATA_DIR ?? './data';
const APK_DIR = join(DATA_DIR, 'apk');
const CHECK_MS = 10 * 60_000;

export interface LatestApp {
  version: string;
  tag: string;
  notes: string;
  publishedAt: string;
  apkPath: string;
  size: number;
}

interface Release {
  tag_name: string;
  body: string | null;
  published_at: string;
  draft: boolean;
  prerelease: boolean;
  assets: { id: number; name: string; size: number }[];
}

let cached: { at: number; latest: LatestApp | null; assetId: number } | null = null;
const downloads = new Map<string, Promise<void>>();

function github(path: string, accept = 'application/vnd.github+json'): Promise<Response> {
  const headers: Record<string, string> = { Accept: accept, 'User-Agent': 'posttech-times-summary-server' };
  if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`;
  return fetch(`https://api.github.com/repos/${REPO}${path}`, { headers, signal: AbortSignal.timeout(60_000) });
}

export const apkFile = (tag: string) => join(APK_DIR, `posttech-times-${tag}.apk`);

async function exists(path: string): Promise<boolean> {
  return stat(path).then(() => true, () => false);
}

async function download(tag: string, assetId: number): Promise<void> {
  const target = apkFile(tag);
  if (await exists(target)) return;
  let job = downloads.get(tag);
  if (!job) {
    job = (async () => {
      const res = await github(`/releases/assets/${assetId}`, 'application/octet-stream');
      if (!res.ok || !res.body) throw new Error(`APK download HTTP ${res.status}`);
      await mkdir(APK_DIR, { recursive: true });
      await pipeline(Readable.fromWeb(res.body as import('node:stream/web').ReadableStream), createWriteStream(`${target}.tmp`));
      await rename(`${target}.tmp`, target);
      console.log(`app update: downloaded ${tag}`);
    })().finally(() => downloads.delete(tag));
    downloads.set(tag, job);
  }
  return job;
}

export async function latestApp(): Promise<LatestApp | null> {
  if (cached && Date.now() - cached.at < CHECK_MS) return cached.latest;

  const res = await github('/releases/latest');
  if (res.status === 404) {
    cached = { at: Date.now(), latest: null, assetId: 0 };
    return null;
  }
  if (!res.ok) throw new Error(`GitHub releases HTTP ${res.status}`);
  const release = (await res.json()) as Release;
  const asset = release.assets.find(a => a.name.endsWith('.apk'));
  if (release.draft || release.prerelease || !asset) {
    cached = { at: Date.now(), latest: null, assetId: 0 };
    return null;
  }

  const tag = release.tag_name;
  const latest: LatestApp = {
    version: tag.replace(/^v/, ''),
    tag,
    notes: release.body ?? '',
    publishedAt: release.published_at,
    apkPath: `/app/download/${encodeURIComponent(tag)}.apk`,
    size: asset.size,
  };
  cached = { at: Date.now(), latest, assetId: asset.id };
  // 앱이 내려받기 전에 미리 받아 둔다.
  download(tag, asset.id).catch(err => console.error('app update: download failed:', err));
  return latest;
}

// 요청한 태그가 최신 릴리스일 때만 파일 경로를 돌려준다. 아직 받는 중이면 끝날 때까지 기다린다.
export async function apkForTag(tag: string): Promise<string | null> {
  const latest = await latestApp();
  if (!latest || !cached || latest.tag !== tag) return null;
  await download(tag, cached.assetId);
  return apkFile(tag);
}

export function startUpdateCheck(): void {
  if (!TOKEN) console.warn('app update: GITHUB_TOKEN is not set; private repository releases cannot be read');
  const tick = () => void latestApp().catch(err => console.error('app update: check failed:', err));
  tick();
  setInterval(tick, CHECK_MS).unref();
}
