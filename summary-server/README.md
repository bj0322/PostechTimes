# summary-server · 앱 서버 (AI 요약·업데이트·속보 알림)

앱이 쓰는 세 기능을 한 Node 서버에서 제공합니다. 운영 중인 서버는 `http://141.223.176.120:8787`(포스텍 캠퍼스망의 PC)입니다.

1. **AI 3줄 요약**: 서버에 설치한 Ollama의 로컬 모델로 기사를 요약합니다. 외부 API 키가 필요 없습니다. 기존 Cloudflare Worker(`summary-worker/`)와 같은 API입니다.
2. **앱 업데이트**: GitHub의 최신 릴리스 APK를 받아 두었다가 앱에 내려줍니다. 저장소가 비공개라 휴대폰이 GitHub에서 직접 받을 수 없기 때문입니다.
3. **속보 알림**: 5분마다 사이트의 새 기사를 확인해 알림 목록을 만듭니다. 운영자가 속보를 직접 보낼 수도 있습니다. 앱의 백그라운드 러너가 이 목록을 확인해 휴대폰에 알림을 띄웁니다.

```
GET  /summary/{기사 번호}        요약 JSON (summary-worker/README.md의 응답 형식과 같음)
GET  /alerts?after={알림 번호}   그 번호 이후의 알림과 최신 알림 번호 { latest, alerts: [...] }
GET  /app/latest                 최신 릴리스 { version, tag, notes, apkPath, size }
GET  /app/download/{태그}.apk    최신 릴리스 APK
POST /admin/alerts               속보 보내기(이 PC에서만) { "body": "...", "title"?: "...", "articleId"?: "24341" }
GET  /health                     서버와 모델 상태
```

- 요약은 `DATA_DIR/v2/{기사 번호}.json`, 알림은 `DATA_DIR/alerts.json`, APK는 `DATA_DIR/apk/`에 저장합니다(기본 `./data`).
- 새로 요약해야 하는 요청만 IP당 1분에 10회로 제한합니다. 요약은 한 번에 하나씩 처리하고, 같은 기사를 동시에 요청해도 모델은 한 번만 돌립니다.
- 오류 응답 코드는 summary-worker와 같습니다(404 `not_found`·`article_not_found`, 422 `summary_unavailable`, 429 `rate_limited`, 502 `upstream_error`).

## 준비

1. Node.js 24 이상을 설치합니다.
2. [Ollama](https://ollama.com)를 설치하고 모델을 받습니다. 기본 모델은 구글의 `gemma3:4b`입니다. GPU가 없는 PC(i7-10700, 16GB)에서 기사 하나에 40초 안팎이 걸립니다. Llama 3.2 3B는 한국어 요약에 다른 언어 글자가 섞여 쓰지 않습니다.
   ```powershell
   ollama pull gemma3:4b
   ```
3. 다른 모델을 쓰려면 `OLLAMA_MODEL`을 바꿉니다. 모델을 바꾸거나 프롬프트를 고치면 `src/store.ts`의 `KEY_VERSION`을 올려 이전 요약을 새로 만들게 합니다.
4. 이 폴더에 `.env`를 만들고 GitHub 토큰을 넣습니다. 업데이트 기능이 비공개 저장소의 릴리스를 읽는 데 씁니다. 이 저장소만 고른 fine-grained 토큰에 **Contents: Read-only** 권한이면 충분합니다. `.env`는 커밋하지 않습니다.
   ```
   GITHUB_TOKEN=github_pat_...
   ```

## 실행

```powershell
npm ci
npm start       # http://localhost:8787/summary/24341
npm run typecheck
npm test
```

설정은 `.env` 또는 환경 변수로 합니다. 목록은 `.env.example`을 봅니다.

## 새 기사 감시와 미리 요약

서버를 시작할 때와 5분마다(`WATCH_INTERVAL_MIN`) 사이트의 17개 섹션 목록(1페이지)을 확인합니다(`src/prefetch.ts`).

- 처음 보는 기사는 알림으로 기록합니다. 서버를 처음 켰을 때는 이미 올라온 기사를 기록만 하고 알리지 않습니다.
- 새 기사와 섹션마다 최신 `PREFETCH_PER_SECTION`건(기본 5, 0이면 끔)의 요약을 미리 만들어 둡니다. 앱에서 기사를 열 때 기다리지 않게 하기 위해서입니다. 사용자가 요청한 기사는 미리 요약 작업보다 먼저 처리합니다.
- 사이트 섹션이 바뀌면 `SECTIONS`를 앱의 `SITE_SECTIONS`와 맞춰 고칩니다.

## 속보 보내기

이 PC에서만 받습니다. `articleId`를 넣으면 알림을 눌렀을 때 그 기사가 열립니다.

```powershell
Invoke-RestMethod -Method Post http://127.0.0.1:8787/admin/alerts -ContentType 'application/json; charset=utf-8' -Body ([Text.Encoding]::UTF8.GetBytes('{"body":"알림 내용","articleId":"24341"}'))
```

휴대폰에는 Android가 백그라운드 작업을 실행할 때(약 15분 간격, 배터리 상황에 따라 더 늦을 수 있음) 도착합니다. 앱을 열면 바로 확인합니다.

## 자동 시작 (Windows)

`scripts/start.ps1`이 Ollama를 켜고 서버를 실행하며, 서버가 종료되면 10초 뒤 다시 시작합니다. 관리자 권한 없이 로그인할 때 자동 실행하려면 시작프로그램 폴더(`shell:startup`)에 바로가기를 둡니다.

- 대상: `powershell.exe`
- 인수: `-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File "<저장소 경로>\summary-server\scripts\start.ps1"`

로그는 `logs/server.log`에 쌓입니다. 이 방식은 Windows에 로그인해야 서버가 켜집니다.

## 앱에 연결

앱은 `posttech-times-app/.env.production`의 `NEXT_PUBLIC_SERVER_URL`로 이 서버에 접속합니다. 아직 도메인·HTTPS가 없어 IP 주소의 http를 씁니다. 그래서 Android는 `network_security_config.xml`에서 이 IP만 평문 통신을 허용하고, iOS는 Info.plist에서 ATS를 풀어 두었습니다. 서버 주소가 바뀌면 세 곳을 함께 고치고 앱을 새 버전으로 배포합니다.

휴대폰이 접속하려면 외부에서 이 PC의 8787 포트에 닿아야 합니다. Windows 방화벽(관리자 권한 필요)과 학교 네트워크 정책을 확인합니다. 도메인이 생기면 HTTPS 리버스 프록시(Caddy 등) 뒤에 두고 `TRUST_PROXY=1`을 켠 뒤, 위의 평문 허용을 지웁니다.
