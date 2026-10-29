import { Capacitor } from '@capacitor/core';
import { BackgroundRunner } from '@capacitor/background-runner';

// capacitor.config.ts의 BackgroundRunner label과 같아야 한다(iOS는 Info.plist의 BGTaskSchedulerPermittedIdentifiers도).
export const RUNNER_LABEL = 'kr.ac.postech.times.alerts';

// public/runners/alerts.js와 같은 주소다.
const FEED_URL = 'https://times.postech.ac.kr/rss/allArticle.xml';

export interface AlertTarget {
  articleId: string;
  title: string;
}

// 알림 id는 기사 번호(idxno)다. 눌린 알림의 제목은 새 기사 목록에서 다시 찾는다.
async function targetFor(articleId: number): Promise<AlertTarget | null> {
  const res = await fetch(FEED_URL);
  if (!res.ok) return null;
  const doc = new DOMParser().parseFromString(await res.text(), 'text/xml');
  for (const item of Array.from(doc.querySelectorAll('item'))) {
    const link = item.querySelector('link')?.textContent ?? '';
    if (link.match(/idxno=(\d+)/)?.[1] === String(articleId)) {
      return { articleId: String(articleId), title: item.querySelector('title')?.textContent?.trim() ?? '' };
    }
  }
  return { articleId: String(articleId), title: '포항공대신문' };
}

// 알림 권한을 묻고 백그라운드 러너에게 바로 한 번 확인시킨다. 반환값은 정리 함수다.
export async function startAlerts(onOpen: (target: AlertTarget) => void): Promise<() => void> {
  if (!Capacitor.isNativePlatform()) return () => {};

  const handle = await BackgroundRunner.addListener('backgroundRunnerNotificationReceived', event => {
    targetFor(event.notificationId)
      .then(target => target && onOpen(target))
      .catch(() => {});
  });

  try {
    await BackgroundRunner.requestPermissions({ apis: ['notifications'] });
  } catch {
    // 권한을 거절해도 앱의 다른 기능은 그대로 쓴다.
  }
  BackgroundRunner.dispatchEvent({
    label: RUNNER_LABEL,
    event: 'checkAlerts',
    details: {},
  }).catch(() => {});

  return () => void handle.remove();
}
