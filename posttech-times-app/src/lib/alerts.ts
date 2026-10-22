import { Capacitor } from '@capacitor/core';
import { BackgroundRunner } from '@capacitor/background-runner';
import { SERVER_URL } from './server';

// capacitor.config.ts의 BackgroundRunner label과 같아야 한다(iOS는 Info.plist의 BGTaskSchedulerPermittedIdentifiers도).
export const RUNNER_LABEL = 'kr.ac.postech.times.alerts';

export interface AlertTarget {
  articleId: string;
  title: string;
}

interface ServerAlert {
  seq: number;
  articleId: string | null;
  body: string;
}

// 알림 id는 서버 알림 번호(seq)다. 눌린 알림이 어느 기사인지 서버에 다시 물어본다.
async function targetFor(seq: number): Promise<AlertTarget | null> {
  const res = await fetch(`${SERVER_URL}/alerts?after=${seq - 1}`);
  if (!res.ok) return null;
  const { alerts } = (await res.json()) as { alerts: ServerAlert[] };
  const alert = alerts.find(a => a.seq === seq);
  return alert?.articleId ? { articleId: alert.articleId, title: alert.body } : null;
}

// 알림 권한을 묻고, 서버 주소를 백그라운드 러너에 넘겨 바로 한 번 확인한다. 반환값은 정리 함수다.
export async function startAlerts(onOpen: (target: AlertTarget) => void): Promise<() => void> {
  if (!SERVER_URL || !Capacitor.isNativePlatform()) return () => {};

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
    details: { serverUrl: SERVER_URL },
  }).catch(() => {});

  return () => void handle.remove();
}
