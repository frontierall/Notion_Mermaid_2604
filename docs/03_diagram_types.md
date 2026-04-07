# 다이어그램 유형

총 13종의 Mermaid 다이어그램을 지원하며, **대표 7종**과 **추가 6종**으로 구분됩니다.

## 대표 다이어그램 (AI 추천 분석 대상)

AI가 입력 텍스트를 분석하여 적합도 순으로 정렬하고 추천 뱃지를 표시합니다.

| 아이콘 | 이름 | Mermaid 키워드 | 적합한 경우 |
|---|---|---|---|
| 🔵 | Flowchart | `flowchart LR` | 프로세스 흐름, 의사결정 구조 |
| 🟣 | Sequence Diagram | `sequenceDiagram` | 시스템/사용자 간 상호작용 |
| 🟠 | Gantt Chart | `gantt` | 프로젝트 일정 및 타임라인 |
| 🟡 | Mindmap | `mindmap` | 아이디어 연결, 개념 구조화 |
| 🟢 | Class Diagram | `classDiagram` | 객체지향 구조, 관계 모델 |
| 🔴 | State Diagram | `stateDiagram-v2` | 상태 변화, 이벤트 흐름 |
| 🩵 | ER Diagram | `erDiagram` | 데이터베이스 관계 모델 |

## 추가 다이어그램

고정 순서로 표시되며 AI 추천 분석에는 포함되지 않습니다. 카드는 점선 테두리로 구분됩니다.

| 아이콘 | 이름 | Mermaid 키워드 | 적합한 경우 |
|---|---|---|---|
| 🧭 | User Journey | `journey` | UX 시나리오, 고객 경험 단계 |
| 📅 | Timeline | `timeline` | 역사/이벤트 시간순 정리 |
| 🌿 | Git Graph | `gitGraph` | 브랜치 전략, 커밋 히스토리 |
| 🥧 | Pie Chart | `pie` | 비율/구성 데이터 시각화 |
| 🎯 | Quadrant Chart | `quadrantChart` | 2×2 우선순위 매트릭스 |
| 📋 | Requirement Diagram | `requirementDiagram` | 요구사항 추적, 기능 명세 |

## Mermaid가 지원하는 전체 유형 (참고)

현재 앱에 미포함된 유형입니다.

| 이름 | 키워드 | 상태 |
|---|---|---|
| ZenUML | `zenuml` | 안정 |
| Requirement Diagram | `requirementDiagram` | 안정 |
| Sankey Diagram | `sankey-beta` | 베타 |
| XY Chart | `xychart-beta` | 베타 |
| Block Diagram | `block-beta` | 베타 |
| Architecture Diagram | `architecture-beta` | 베타 |

## AI 프롬프트 전략

각 다이어그램 유형마다 전용 생성 규칙(`colorGuides`)이 적용됩니다.

- **식별자(ID)는 영문 필수** — 한국어는 레이블/설명에만 허용
- **Flowchart**: `classDef`로 보라/파랑 계열 색상 자동 적용
- **Sequence**: participant 이름은 단일 영문 단어만 허용
- **State Diagram**: 상태 이름은 단일 영문 단어, 한국어 설명은 별도 줄로

## 오류 자동 수정

렌더링 실패 시 AI가 오류 메시지를 분석하여 코드를 자동 수정합니다 (최대 2회).

```
렌더링 시도
    ↓ 실패
AI에게 오류 메시지 전달 → 코드 수정 → 재렌더링
    ↓ 또 실패
2차 수정 시도
    ↓ 또 실패
코드 탭에서 수동 확인 안내
```
