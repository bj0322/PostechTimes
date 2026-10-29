/// <reference types="@capacitor/background-runner" />
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'kr.ac.postech.times',
  appName: '포항공대신문',
  webDir: 'out',
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
    // 새 기사 알림. OS가 약 15분마다 public/runners/alerts.js의 checkAlerts를 실행한다.
    // label은 src/lib/alerts.ts의 RUNNER_LABEL, iOS Info.plist의 BGTaskSchedulerPermittedIdentifiers와 같아야 한다.
    BackgroundRunner: {
      label: 'kr.ac.postech.times.alerts',
      src: 'runners/alerts.js',
      event: 'checkAlerts',
      repeat: true,
      interval: 15,
      autoStart: true,
    },
  },
};

export default config;
