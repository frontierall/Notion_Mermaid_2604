# API 설정

## 지원 AI 공급자

앱 상단에서 두 공급자 중 하나를 선택합니다.

| 공급자 | 버튼 | 사용 모델 | 키 형식 |
|---|---|---|---|
| Claude (Anthropic) | 🟣 | claude-haiku-4-5-20251001 | `sk-ant-...` |
| OpenAI | 🟢 | gpt-4o-mini | `sk-...` (ant 제외) |

## API 키 입력 방법

1. 상단 공급자 버튼 클릭 (기본값: Claude)
2. 해당 공급자의 API 키 입력
3. **저장** 버튼 클릭 또는 `Enter` 키
4. ✅ 확인 메시지 후 입력 섹션 활성화

## 키 유효성 검사

```
Claude  → sk-ant- 로 시작해야 활성화
OpenAI  → sk- 로 시작 (sk-ant- 제외)
```

입력 중 형식이 맞지 않으면 실시간으로 안내 메시지가 표시됩니다.

## API 호출 구조

### Claude (Anthropic)

```
POST https://api.anthropic.com/v1/messages

Headers:
  x-api-key: {API_KEY}
  anthropic-version: 2023-06-01
  anthropic-beta: prompt-caching-2024-07-31
  anthropic-dangerous-direct-browser-access: true

Body:
  model: claude-haiku-4-5-20251001
  max_tokens: 1000
  system: [{ type: "text", text: "...", cache_control: { type: "ephemeral" } }]
  messages: [{ role: "user", content: "..." }]
```

### OpenAI

```
POST https://api.openai.com/v1/chat/completions

Headers:
  Authorization: Bearer {API_KEY}

Body:
  model: gpt-4o-mini
  max_tokens: 1000
  messages: [{ role: "system", content: "..." }, { role: "user", content: "..." }]
```

## 주의사항

- API 키는 브라우저 네트워크 탭에서 노출될 수 있습니다.
- 프로덕션 환경에서는 백엔드 프록시 서버 구성을 권장합니다.
- `anthropic-dangerous-direct-browser-access: true` 헤더는 브라우저 직접 호출 시 Anthropic이 요구하는 헤더입니다.
