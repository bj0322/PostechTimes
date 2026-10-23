# 기사 목록 보관소 (`data/`)

앱이 학교 서버(times.postech.ac.kr)에 사용자마다 수십 번씩 요청하지 않도록, **기사 목록과 호 구성**을 이 저장소의 `data/`에 JSON으로 보관합니다. 앱은 이 파일로 홈·지난 호·기자 페이지를 만들고, **기사 본문만** 열 때 사이트에서 받습니다.

캠퍼스 와이파이는 학생들이 같은 IP를 쓰므로, 앱마다 사이트를 직접 긁으면 학교 방화벽이 캠퍼스 전체를 막을 수 있습니다(개발 중 실제로 403 차단을 겪었습니다).

## 처음 한 번: 전체 목록 받기

```sh
python3 tools/archive/ptimes_archive.py backfill
```

- 사이트 전체 기사 목록을 20건씩, 요청 사이 1.5초 쉬며 받습니다. 기사 본문은 받지 않습니다(단신 묶음만 꼭지를 나누려고 받습니다).
- 403/429를 받으면 바로 멈춥니다. 30분~몇 시간 뒤 **같은 명령**을 다시 실행하면 이어서 받습니다.
- 끝나면 `data/`의 변경을 커밋합니다.

## 새 호가 나올 때마다

```sh
python3 tools/archive/ptimes_archive.py update
```

목록 앞쪽에서 처음 보는 기사만 받아 추가하고 호 파일을 다시 만듭니다. 결과(`data/issues/index.json`의 맨 위 호, 기사 수)를 확인한 뒤 커밋합니다.

## 손으로 고치기

자동 규칙이 틀린 경우 `data/overrides.json`을 고친 뒤 `build`로 다시 만듭니다(네트워크 없음).

```json
{
  "excludeArticles": [24316],
  "renumber": { "ko:2024-03-06": 455 }
}
```

- `excludeArticles`: 호에서 뺄 기사 번호
- `renumber`: `판:그 호 첫 기사 등록일` → 호수

```sh
python3 tools/archive/ptimes_archive.py build
```

## 규칙

| 항목 | 규칙 |
|---|---|
| 분류 | 목록의 분류 이름(예: `TOP/준TOP`)을 사이트 메뉴에서 읽은 코드 표(`categories.json`)로 코드화. 2차 분류는 메뉴에서 바로 앞 1차 분류에 속함 |
| 판 | 1차 분류가 Headlines·News·Campus·Postech Microscope·Opinion·Feature·Culture(S1N28·9·10·24·13·14·30)면 영문, 나머지 국문 |
| 호 묶음 | 등록 시각 순으로 늘어놓고 3일(`config.json`의 `gapDays`) 넘게 벌어지면 다른 호 |
| 국문 호수 | 호 안 제목의 `제NNN호`(단신보도·형산만평 등). 없으면 앞뒤 호 사이에 하나가 빈 경우만 채우고, 나머지는 호로 보지 않음(목록·검색에는 남음) |
| 영문 호수 | CMS에 없음. Headlines가 있는 묶음만 호로 보고 기준점(`config.json`의 `englishAnchor`: 국문 제478호와 함께 나온 No. 199)에서 앞뒤로 셈 |
| 사진 | 목록 썸네일의 원본 JPEG. PNG 도표는 쓰지 않음 |

## 파일

| 파일 | 내용 |
|---|---|
| `data/articles.json` | 전체 기사(번호·제목·등록 시각·분류·바이라인·사진·판), 번호 내림차순 |
| `data/issues/index.json` | 판별 호 목록 `{ "ko": [{number, published, lastUpload, count}], "en": [...] }` |
| `data/issues/{ko,en}/{호수}.json` | 그 호의 기사들과 단신 꼭지(`briefs`) |
| `data/categories.json` | 분류 이름 → 코드 표 |
| `data/briefs.json` | 단신 묶음별 꼭지(제목·기자·문단) |
| `data/config.json`, `data/overrides.json` | 설정과 손으로 고친 것 |

점검: `python3 -m unittest discover tools/archive/tests`
