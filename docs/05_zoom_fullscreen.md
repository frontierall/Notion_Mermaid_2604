# 줌 컨트롤 & 전체화면

## 줌 컨트롤

각 다이어그램 결과 카드 상단에 툴바가 표시됩니다.

```
[ − ]  100%  [ + ]  [ ↺ ]  [ ↔ 맞춤 ]              [ ⛶ ]
└── 줌 컨트롤 그룹 ──────────────────┘    전체화면 버튼
```

### 버튼 기능

| 버튼 | 기능 | 범위 |
|---|---|---|
| `−` | 25% 단위 축소 | 최소 25% |
| 퍼센트 표시 | 현재 줌 레벨 | — |
| `+` | 25% 단위 확대 | 최대 400% |
| `↺` | 원래 크기 (100%) 복원 | — |
| `↔ 맞춤` | 컨테이너 너비에 맞게 자동 스케일 | 25%~400% |
| `⛶` | 전체화면 모달 열기 | — |

### 구현 방식

SVG를 `.zoom-wrap` div로 감싸고 CSS `transform: scale()` 적용.  
`.diagram-output`에 `overflow: auto`가 설정되어 있어 확대 시 스크롤바가 나타납니다.

```
.diagram-output (overflow: auto)
  └── .zoom-wrap (transform: scale(N))
        └── <svg> (Mermaid 렌더링 결과)
```

### 너비 맞춤 계산 로직

```javascript
function zoomFit(typeId) {
  wrap.style.transform = 'scale(1)';          // 자연 크기로 리셋
  const svgW = svg.getBoundingClientRect().width;
  const containerW = output.clientWidth - 48; // 패딩 제외
  const fitScale = Math.min(4, Math.max(0.25, containerW / svgW));
  setZoom(typeId, fitScale);
}
```

## 전체화면 모달

작은 다이어그램을 화면 전체로 펼쳐 볼 수 있습니다.

### 열기

- 툴바의 `⛶` 버튼 클릭

### 닫기 (세 가지 방법)

- `✕ 닫기` 버튼 클릭
- 모달 배경(어두운 영역) 클릭
- `ESC` 키

### 전체화면 내 기능

- 독립적인 줌 컨트롤 (`−`, `+`, `↺`, `↔ 맞춤`)
- 열릴 때 **자동으로 너비 맞춤** 적용
- 스크롤 가능한 넓은 뷰 영역

### 구현 방식

원본 SVG를 복제하여 모달 컨테이너에 삽입합니다.  
모달의 줌은 `__fs__` 키로 별도 관리되어 원본 카드의 줌 레벨에 영향을 주지 않습니다.

```javascript
function openFullscreen(typeId) {
  const fsWrap = document.getElementById('zoomWrap___fs__');
  fsWrap.innerHTML = srcWrap.innerHTML;  // SVG 복사
  zoomLevels['__fs__'] = 1;
  requestAnimationFrame(() => zoomFit('__fs__'));  // 자동 너비 맞춤
}
```

## 배경: 왜 다이어그램이 작게 보이나?

Mermaid는 콘텐츠 기반으로 SVG를 생성합니다.  
노드가 적거나 텍스트가 짧으면 SVG 자체가 작게 만들어지고,  
`max-width: 100%` 제약만 있는 경우 작은 SVG는 그대로 작게 표시됩니다.

**해결책 요약:**

| 방법 | 이 앱의 대응 |
|---|---|
| 줌 버튼 (+/-) | ✅ 구현됨 |
| 너비 맞춤 (Fit Width) | ✅ 구현됨 |
| 전체화면 모달 | ✅ 구현됨 |
| 마우스 휠 줌 + 드래그 | 미구현 (라이브러리 필요) |
