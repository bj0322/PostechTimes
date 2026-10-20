# PostechTimes · 포항공대신문 앱

포항공대신문 기사 열람을 위한 웹·모바일 앱과 초기 디자인 시안을 함께 보관하는 프로젝트입니다. Next.js 16.2.6, React 19.2.4, TypeScript, Tailwind CSS 4, Capacitor 8을 사용합니다. 현재 package.json 버전은 0.1.0이며, Android 설정은 versionName 7.0 / versionCode 7입니다. 버전 표기가 서로 다르므로 릴리스 전에 정리해야 합니다.

## 구성

- `posttech-times-app/`: 실제 앱 소스, 의존성 잠금 파일, Android 및 iOS 네이티브 프로젝트
- `summary-worker/`: 기사 AI 요약 서버(Cloudflare Worker). 설정과 배포는 [summary-worker/README.md](summary-worker/README.md)를 봅니다.
- 최상위 `*.jsx`, `data.js`, `theme.js`, `POSTECH Times.html`: 초기 디자인 시안 및 화면 실험 파일. 실제 앱의 실행 진입점과 구분합니다.

## 기능

- 한글·영문 섹션 기사 목록, 카테고리 탐색, 검색, 기사 본문 열람
- 추가 기사 불러오기와 기사 ID 기반 중복 제거
- localStorage 기반 북마크와 10분 기사 목록 캐시
- 라이트·다크 화면, 모바일 뒤로가기 처리
- 네트워크 실패 또는 기사 부족 시 샘플 데이터 표시
- 기사 화면의 AI 3줄 요약(요약 서버 `https://posttech-times-summary.beomjoon.workers.dev`)

기사 목록과 본문은 `https://times.postech.ac.kr`의 HTML을 파싱합니다. 네이티브에서는 CapacitorHttp를 우선 사용하고, 웹에서는 fetch를 사용합니다. 브라우저에서는 원본 사이트의 CORS 정책에 따라 실시간 요청이 실패하고 샘플 데이터가 표시될 수 있습니다. 사이트 HTML 구조가 바뀌면 파서 수정이 필요합니다. 검색은 현재 앱에 불러온 기사 데이터를 기준으로 하며, 별도 검색 서버나 사용자 계정 서버는 없습니다.

## 개발 실행

Node.js와 npm을 설치한 뒤 프로젝트 루트에서 실행합니다.

```powershell
cd posttech-times-app
npm ci
npm run dev
```

브라우저에서 `http://localhost:3000`을 엽니다. 앱에는 API 키를 넣지 않습니다. AI 요약 서버 주소는 `.env.production`에 들어 있어 `npm run build` 결과에 자동으로 포함됩니다. 개발 서버(`npm run dev`)에서도 요약을 보려면 같은 줄을 `.env.local`에 넣습니다.

## 검사 및 웹 빌드

```powershell
npm run lint
npm run build
```

Next.js는 정적 내보내기(`output: export`)로 설정되어 있으며 결과는 `out/`입니다. 배포·네이티브 동기화에는 이 결과를 사용합니다.

## Android

Android Studio와 Android SDK, 프로젝트 Gradle 설정에 맞는 JDK가 필요합니다. 앱 폴더에서 실행합니다.

```powershell
npm run build
npx cap sync android
npx cap open android
```

Android Studio에서 SDK 경로를 설정하고 앱을 실행하거나 빌드합니다. Windows 명령줄 디버그 빌드는 `android` 폴더에서 `./gradlew.bat assembleDebug`를 사용합니다. 앱 ID는 `kr.ac.postech.times`입니다. `android/local.properties`는 각 PC에서 생성하며 공유하지 않습니다. 서명 키도 별도로 관리합니다.

## iOS

macOS와 Xcode가 필요합니다. 앱 폴더에서 `npm run build`, `npx cap sync ios`, `npx cap open ios` 순서로 실행합니다. 실제 기기 배포에는 본인 Apple 개발 환경의 서명 설정이 필요합니다.

## 코드 구조

| 경로 | 역할 |
|---|---|
| `src/app/` | Next.js 진입점·레이아웃·전역 스타일 |
| `src/components/NewsApp.tsx` | 화면 전환·기사 로딩·북마크 상태 |
| `src/components/` | 피드·검색·카테고리·북마크·기사 화면 |
| `src/lib/fetchArticles.ts` | 섹션 목록·원본 HTML 파싱·캐시·본문 요청 |
| `src/lib/articles.ts` | 샘플 기사·카테고리 데이터 |
| `src/lib/summarize.ts`, `src/components/SummaryCard.tsx` | AI 요약 요청·캐시와 기사 화면의 요약 카드 |
| `src/lib/theme.ts` | 테마·글꼴 |
| `src/types/article.ts` | 기사 데이터 타입 |
| `android/`, `ios/` | Capacitor 네이티브 소스와 프로젝트 설정 |

## 협업 및 저장소 범위

각자 Clone한 로컬 폴더에서 기능별 branch로 작업하고 Pull Request로 변경을 검토한 뒤 main에 합치는 방식을 권장합니다. 의존성 변경 시 `package-lock.json`도 함께 올립니다.

APK·ZIP·실행 파일, node_modules, 정적 내보내기, 네이티브 복사 웹 자산, 빌드 캐시, 개인 SDK 경로, 환경 변수 파일, 서명 키는 포함하지 않습니다. Gradle wrapper JAR는 빌드 도구 부트스트랩 파일로 포함합니다. 생성된 Capacitor 자산은 `npx cap sync`로 다시 만듭니다.

기사·사진·기관 명칭과 로고의 권리는 각 권리자에게 있습니다. 저장소 공유는 기사 콘텐츠의 재배포 권한이나 공식 서비스 지위를 의미하지 않습니다. 이 가져오기 작업에서는 별도 오픈소스 라이선스를 새로 부여하지 않습니다.

