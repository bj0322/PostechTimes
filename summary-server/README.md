# summary-server · AI 기사 요약 서버 (Ollama)

앱의 기사 화면에 나오는 "AI 3줄 요약"을 만들어 주는 Node 서버입니다. 서버에 설치한 Ollama의 로컬 모델로 요약하므로 외부 API 키가 필요 없습니다. 기존 Cloudflare Worker(`summary-worker/`)와 같은 API를 제공합니다.

```
GET /summary/{기사 번호}      요약 JSON (summary-worker/README.md의 응답 형식과 같음)
GET /health                   서버와 모델 상태
```

- 만든 요약은 `DATA_DIR`(기본 `./data/v1/{기사 번호}.json`)에 저장하고, 이후 요청에는 바로 돌려줍니다.
- 새로 요약해야 하는 요청만 IP당 1분에 10회로 제한합니다. 요약은 한 번에 하나씩 처리하고, 같은 기사를 동시에 요청해도 모델은 한 번만 돌립니다.
- 오류 응답 코드는 summary-worker와 같습니다(404 `not_found`·`article_not_found`, 422 `summary_unavailable`, 429 `rate_limited`, 502 `upstream_error`).

## 준비

1. Node.js 24 이상을 설치합니다.
2. [Ollama](https://ollama.com)를 설치하고 모델을 받습니다. 한국어 요약 품질은 모델 크기에 크게 좌우됩니다. 서버의 GPU 메모리에 맞는 가장 큰 모델을 권합니다.
   ```powershell
   ollama pull qwen3:8b
   ```
3. 다른 모델을 쓰려면 `OLLAMA_MODEL`을 바꿉니다. 모델을 바꾸거나 프롬프트를 고치면 `src/index.ts`의 `KEY_VERSION`을 올려 이전 요약을 새로 만들게 합니다.

## 실행

```powershell
npm ci
npm start       # http://localhost:8787/summary/24341
npm run typecheck
npm test
```

설정은 환경 변수로 합니다. 목록은 `.env.example`을 봅니다.

## 미리 요약

서버를 시작할 때와 30분마다 사이트의 17개 섹션 목록(1페이지)을 확인해, 요약이 없는 새 기사를 한 번에 하나씩 만들어 둡니다(`src/prefetch.ts`). 앱에서 기사를 열 때 기다리지 않게 하기 위해서입니다. 사용자가 요청한 기사는 미리 요약 작업보다 먼저 처리합니다. `PREFETCH_PER_SECTION`(기본 5, 0이면 끔)과 `PREFETCH_INTERVAL_MIN`(기본 30)으로 조절합니다. 사이트 섹션이 바뀌면 `SECTION_CODES`를 앱의 `SITE_SECTIONS`와 맞춰 고칩니다.

## 자동 시작 (Windows)

`scripts/start.ps1`이 Ollama를 켜고 서버를 실행하며, 서버가 종료되면 10초 뒤 다시 시작합니다. 관리자 권한 없이 로그인할 때 자동 실행하려면 시작프로그램 폴더(`shell:startup`)에 바로가기를 둡니다.

- 대상: `powershell.exe`
- 인수: `-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File "<저장소 경로>\summary-server\scripts\start.ps1"`

로그는 `logs/server.log`에 쌓입니다.

## 앱에 연결

앱 휴대폰에서 접근할 수 있는 **HTTPS 주소**가 필요합니다. 서버를 인터넷에 공개하고(도메인 + 리버스 프록시, 또는 Cloudflare Tunnel 등) `TRUST_PROXY=1`로 켠 뒤, 그 주소를 `posttech-times-app/.env.production`의 `NEXT_PUBLIC_SUMMARY_API_URL`에 넣고 앱을 다시 빌드합니다. Android·iOS 앱은 HTTPS가 아니면 요청이 막힙니다.
