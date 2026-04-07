# 프로그램 개요

## AI Mermaid 다이어그램 생성기

텍스트를 입력하면 AI가 내용을 분석하여 Mermaid 다이어그램 코드를 자동 생성하고 시각화해주는 웹 앱입니다.

## 파일 구성

```
Notion_Mermaid_2604/
├── index.html        # HTML 마크업
├── styles.css        # 전역 스타일/테마
├── app.js            # 애플리케이션 로직
├── README.md         # 전체 문서
└── docs/
    ├── 01_overview.md
    ├── 02_api_setup.md
    ├── 03_diagram_types.md
    ├── 04_multi_select.md
    ├── 05_zoom_fullscreen.md
    ├── 06_theme.md
    ├── 07_cost_optimization.md
    └── 08_architecture.md
```

## 기술 스택

| 항목 | 내용 |
|---|---|
| 언어 | HTML / CSS / JavaScript (순수 바닐라, 프레임워크 없음) |
| 다이어그램 렌더링 | Mermaid.js 10.6.1 (CDN) |
| AI 엔진 | Anthropic Claude API / OpenAI API (사용자 선택) |
| 상태 관리 | 전역 변수 (selectedTypes, currentCodes, zoomLevels 등) |
| 테마 저장 | localStorage |
| 배포 형태 | 단일 HTML 파일 — 서버 불필요, 브라우저에서 바로 실행 |

## 3단계 워크플로우

```
[① 텍스트 입력]
      ↓ AI 분석 (추천 유형 정렬)
[② 다이어그램 유형 선택] ← 최대 3개 다중 선택
      ↓ 병렬 생성 (Promise.allSettled)
[③ 결과 확인] ← 미리보기 / 코드 탭 / 줌 / 전체화면
```

## 보안 원칙

- API 키는 브라우저 **메모리 변수**에만 저장 (localStorage/sessionStorage 미사용)
- 탭을 닫으면 키가 사라져 유출 위험 최소화
- 모든 API 호출은 사용자 브라우저에서 직접 발생 (중간 서버 없음)
