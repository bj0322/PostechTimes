# summary-worker · AI 기사 요약 서버

앱의 기사 화면에 나오는 "AI 3줄 요약"을 만들어 주는 Cloudflare Worker입니다. Claude API 키는 이 서버에만 두고, 앱에는 넣지 않습니다.

## 동작

```
GET /summary/{기사 번호}
```

- 기사 번호는 `times.postech.ac.kr/news/articleView.html?idxno=` 뒤의 숫자입니다.
- 이미 만든 요약이 KV(`SUMMARIES`)에 있으면 바로 돌려줍니다.
- 없으면 포항공대신문 사이트에서 원문을 직접 가져와 Claude(`claude-opus-5-5`, effort `low`)로 요약하고 KV에 저장합니다. 앱이 보낸 본문은 받지 않으므로, 이 서버를 아무 글이나 요약하는 용도로 쓸 수 없습니다.
- 새로 요약해야 하는 요청만 IP당 1분에 10회로 제한합니다. 저장된 요약을 읽는 요청은 제한하지 않습니다.
- 안전 분류기가 요청을 거절하면 서버 측 대체 모델(`fallbacks: "default"`)로 다시 요약합니다.

응답 예:

```json
{
  "id": "24341",
  "title": "5년 만에 되찾아 온 우승기, 짜릿했던 제23회 카포전",
  "summary": ["…", "…", "…"],
  "keywords": ["카포전", "…"],
  "model": "claude-opus-5-5",
  "createdAt": "2026-10-20T09:00:00.000Z"
}
```

| 상태 코드 | 의미 |
|---|---|
| 404 `not_found` | 경로나 기사 번호 형식이 잘못됨 |
| 404 `article_not_found` | 사이트에 없는 기사이거나 본문이 비어 있음 |
| 422 `summary_unavailable` | 요약할 수 없는 기사(너무 길거나 모델이 거절함) |
| 429 `rate_limited` | 새 요약 요청이 너무 많음. 60초 뒤 다시 시도 |
| 502 `upstream_error` | 사이트나 Claude API 호출 실패 |

## 처음 배포하기 (GitHub Actions, 권장)

터미널 없이 GitHub 화면에서 배포합니다. `.github/workflows/deploy-summary-worker.yml`이 테스트, KV 네임스페이스 생성·연결, 배포, API 키 등록을 차례로 합니다.

1. Cloudflare API 토큰을 만듭니다. 대시보드 → My Profile → API Tokens → Create Token → **Edit Cloudflare Workers** 템플릿. Account Resources와 Zone Resources는 본인 계정만 고르고, IP 필터는 비워 둡니다.
2. Cloudflare 대시보드의 **Workers & Pages** 화면에서 **Account ID**를 복사합니다.
3. [Claude Console](https://platform.claude.com/)에서 API 키를 만듭니다. 크레딧(결제 수단)이 있어야 요약이 만들어집니다.
4. GitHub 저장소 → Settings → Secrets and variables → Actions에 `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `ANTHROPIC_API_KEY`를 등록합니다.
5. 이 워크플로가 main에 있어야 실행할 수 있습니다. 브랜치를 main에 합친 뒤 Actions → **Deploy summary worker** → **Run workflow**를 누릅니다. 이후에는 main의 `summary-worker/`가 바뀔 때마다 자동으로 배포됩니다.
6. 실행 기록의 **Deploy** 단계 로그에서 `https://posttech-times-summary.<하위 도메인>.workers.dev` 주소를 확인합니다. 브라우저로 `<주소>/summary/24341`을 열어 요약 JSON이 나오는지 봅니다.

그다음 앱 폴더(`posttech-times-app`)에 `.env.local`을 만들고 이 주소를 넣은 뒤 앱을 다시 빌드합니다.

```
NEXT_PUBLIC_SUMMARY_API_URL=https://posttech-times-summary.<하위 도메인>.workers.dev
```

웹으로도 앱을 배포한다면 그 주소를 `wrangler.toml`의 `ALLOWED_ORIGINS`에 추가합니다. Android·iOS 앱은 기본값에 들어 있습니다.

## 내 PC에서 배포하기

이 폴더에서 실행합니다. Node.js가 필요합니다.

```powershell
npm ci
npx wrangler login
npx wrangler kv namespace create posttech-times-summary   # 출력된 id를 wrangler.toml의 REPLACE_WITH_KV_NAMESPACE_ID 자리에 넣습니다
npx wrangler secret put ANTHROPIC_API_KEY                  # 키를 입력합니다
npm run deploy
```

GitHub Actions와 같은 KV 네임스페이스를 쓰므로 둘을 섞어 써도 저장된 요약은 그대로입니다.

## 운영

- **비용**: 요약은 기사마다 한 번만 만듭니다. 기사 하나(입력 약 3천 토큰, 출력 수백 토큰)에 약 $0.02입니다. 정확한 사용량은 Claude Console에서 확인합니다.
- **요약 다시 만들기**: 기사가 정정되었으면 저장된 요약을 지웁니다. 다음 요청 때 새로 만들어집니다.
  ```powershell
  npx wrangler kv key delete --binding SUMMARIES --remote "v1:24341"
  ```
- **프롬프트를 바꿀 때**: `src/summarize.ts`의 프롬프트나 출력 형식을 바꾸면 `src/index.ts`의 `KEY_VERSION`을 올립니다. 이전 요약은 무시되고 새로 만들어집니다.
- **사이트 구조가 바뀔 때**: 본문은 `#article-view-content-div p`에서 읽습니다. 앱의 `src/lib/fetchArticles.ts`와 같은 위치이므로 두 곳을 함께 고칩니다.
- **로그**: `npx wrangler tail`로 실패한 요청을 볼 수 있습니다.

## 개발

```powershell
cp .dev.vars.example .dev.vars   # ANTHROPIC_API_KEY를 넣습니다
npm run dev                      # http://localhost:8787/summary/24341
npm run typecheck
npm test
```

`.dev.vars`는 커밋하지 않습니다(`.gitignore`에 있음).
