// 요약·업데이트·알림을 제공하는 서버(summary-server) 주소. 비어 있으면 세 기능 모두 꺼진다.
export const SERVER_URL = (process.env.NEXT_PUBLIC_SERVER_URL ?? '').replace(/\/+$/, '');
