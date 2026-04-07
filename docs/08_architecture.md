# 기술 아키텍처

## 전체 구조

```
index.html
├── <head>
│   ├── Mermaid.js 10.6.1 (CDN)
│   ├── styles.css (외부 스타일)
│   └── app.js (defer, 외부 로직)
└── <body>
    ├── .app (max-width: 900px 컨테이너)
    │   ├── 헤더 + 테마 토글 버튼
    │   ├── #apiKeyCard     — API 공급자 선택 + 키 입력
    │   ├── #inputCard      — 텍스트 입력 (Step 1)
    │   ├── #typeSection    — 다이어그램 유형 선택 (Step 2)
    │   ├── #outputSection  — 결과 표시 (Step 3)
    │   └── #statusMsg      — 로딩 상태 메시지
    └── #fsModal            — 전체화면 모달 (전역)
```

## 주요 전역 상태

| 변수 | 타입 | 초기값 | 역할 |
|---|---|---|---|
| `selectedTypes` | `string[]` | `[]` | 선택된 다이어그램 ID (최대 3개) |
| `currentCodes` | `object` | `{}` | 생성된 Mermaid 코드 (`typeId → code`) |
| `zoomLevels` | `object` | `{}` | 줌 레벨 (`typeId → number`) |
| `analysisResult` | `object \| null` | `null` | AI 분석 결과 (추천 순서, 이유) |
| `apiKey` | `string` | `''` | 현재 세션 API 키 (메모리만) |
| `provider` | `string` | `'claude'` | 선택된 AI 공급자 |

## 핵심 함수 맵

### API 계층

| 함수 | 역할 |
|---|---|
| `callAI(messages, systemPrompt)` | Claude/OpenAI 분기 처리 통합 API 호출 |

### UI 제어

| 함수 | 역할 |
|---|---|
| `selectProvider(p)` | AI 공급자 전환 |
| `saveApiKey()` | API 키 검증 및 저장 |
| `toggleTheme()` | 다크/라이트 모드 전환 |
| `applyTheme(mode)` | 테마 적용 + localStorage 저장 |

### 다이어그램 선택

| 함수 | 역할 |
|---|---|
| `selectType(id)` | 카드 토글 선택/해제 (최대 3개) |
| `updateCardSelections()` | 선택 번호 뱃지, 비활성화, 버튼 텍스트 갱신 |
| `buildTypeGrid(analysis)` | 대표/추가 두 섹션으로 카드 그리드 구성 |

### 생성 파이프라인

| 함수 | 역할 |
|---|---|
| `analyzeText()` | Step 1: 텍스트 분석 → 추천 유형 순서 반환 |
| `generateDiagram()` | Step 2: 병렬 생성 (Promise.allSettled) |
| `buildResultItems(typeIds)` | 결과 카드 HTML 동적 생성 |
| `renderDiagram(code, typeId, retry)` | SVG 렌더링 + 오류 시 자동 수정 재시도 |
| `fixMermaidCode(code, errorMsg)` | AI에게 오류 코드 수정 요청 |

### 줌 & 전체화면

| 함수 | 역할 |
|---|---|
| `setZoom(typeId, level)` | 줌 레벨 설정 및 표시 갱신 |
| `zoomIn/Out/Reset/Fit(typeId)` | 줌 컨트롤 액션 |
| `openFullscreen(typeId)` | 모달 열기 + SVG 복사 + 자동 맞춤 |
| `closeFullscreen()` | 모달 닫기 |

### 기타

| 함수 | 역할 |
|---|---|
| `switchResultTab(typeId, tab)` | 미리보기/코드 탭 전환 |
| `copyCode(typeId)` | 클립보드 복사 |
| `resetAll()` | 전체 상태 초기화 |

## 데이터 흐름

```
사용자 입력 텍스트
    │
    ▼
analyzeText()
    │  callAI() → Claude/OpenAI
    ▼
analysisResult = { summary, recommended[], reasons{} }
    │
    ▼
buildTypeGrid()  ←  대표(AI 추천 정렬) + 추가(고정)
    │
    ▼  사용자가 카드 선택 (최대 3개)
    │
    ▼
generateDiagram()
    │  Promise.allSettled([callAI(), callAI(), ...])
    ▼
[code1, code2, code3]
    │
    ▼
renderDiagram(code, typeId)
    │  mermaid.render() → SVG
    │  실패 시 → fixMermaidCode() → 재시도 (최대 2회)
    ▼
zoom-wrap > SVG (화면 표시)
```

## CSS 아키텍처

CSS 변수(Custom Properties)로 테마 시스템을 구현합니다.

```
:root          → 다크 테마 변수 정의
:root.light    → 라이트 테마 변수 오버라이드
모든 컴포넌트   → var(--변수명) 참조
```

`<html>` 요소의 `.light` 클래스 한 번 토글로 전체 테마가 전환됩니다.

## 외부 의존성

| 라이브러리 | 버전 | 로드 방식 | 용도 |
|---|---|---|---|
| Mermaid.js | 10.6.1 | CDN (cdnjs) | 다이어그램 렌더링 |

그 외 모든 코드는 순수 바닐라 JavaScript입니다.
