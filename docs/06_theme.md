# 다크 / 라이트 모드

## 전환 방법

헤더 우측의 `☀️ / 🌙` 버튼을 클릭합니다.

- 현재 다크 모드 → `☀️` 버튼 표시 → 클릭 시 라이트 모드 전환
- 현재 라이트 모드 → `🌙` 버튼 표시 → 클릭 시 다크 모드 전환

## 자동 감지

최초 접속 시 브라우저/OS의 시스템 설정을 자동으로 감지합니다.

```javascript
if (window.matchMedia('(prefers-color-scheme: light)').matches) {
  applyTheme('light');
}
```

## 설정 저장

`localStorage`에 테마 설정을 저장하므로 새로고침 후에도 유지됩니다.

```javascript
localStorage.setItem('theme', 'light'); // 또는 'dark'
```

우선순위: `localStorage 저장값` > `시스템 설정` > `다크 모드 (기본)`

## 컬러 팔레트

CSS 변수(`custom properties`)로 구현되어 `<html>` 태그에 `.light` 클래스 토글만으로 전체 테마가 전환됩니다.

| CSS 변수 | 다크 모드 | 라이트 모드 | 용도 |
|---|---|---|---|
| `--bg` | `#0f1117` | `#f4f5fb` | 페이지 배경 |
| `--bg-card` | `#1a1d27` | `#ffffff` | 카드 배경 |
| `--bg-input` | `#12141c` | `#f0f1f8` | 입력 필드 배경 |
| `--border` | `#2a2d3e` | `#d0d3e8` | 테두리 |
| `--border-hover` | `#3a3d5e` | `#b0b3d0` | 호버 테두리 |
| `--text` | `#e0e0e0` | `#1a1d2e` | 본문 텍스트 |
| `--text-muted` | `#888888` | `#6b7280` | 보조 텍스트 |
| `--accent` | `#7c83fd` | `#5b61e8` | 강조색 (버튼, 링크) |
| `--accent2` | `#a78bfa` | `#7c5fcf` | 보조 강조색 |
| `--code-text` | `#60d4f7` | `#0e7dc2` | 코드 텍스트 |
| `--selected-bg` | `#1c1730` | `#ede9ff` | 선택된 카드 배경 |

## 구현 구조

```css
/* 다크 (기본) */
:root {
  --bg: #0f1117;
  --text: #e0e0e0;
  /* ... */
}

/* 라이트 */
:root.light {
  --bg: #f4f5fb;
  --text: #1a1d2e;
  /* ... */
}
```

```javascript
function applyTheme(mode) {
  document.documentElement.classList.toggle('light', mode === 'light');
  document.getElementById('themeBtn').textContent = mode === 'light' ? '🌙' : '☀️';
  localStorage.setItem('theme', mode);
}
```

## 전환 애니메이션

`body`에 `transition: background 0.25s, color 0.25s`가 적용되어 부드럽게 전환됩니다.
