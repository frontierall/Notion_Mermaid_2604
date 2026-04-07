function getSaveLocalCheck() {
  return document.getElementById('saveLocalCheck');
}

function isSaveLocalEnabled() {
  return getSaveLocalCheck()?.checked ?? false;
}

function applyTheme(mode) {
  const isLight = mode === 'light';
  document.documentElement.classList.toggle('light', isLight);
  document.getElementById('themeBtn').textContent = isLight ? '🌙' : '☀️';
  mermaid.initialize({ startOnLoad: false, theme: isLight ? 'default' : 'default', securityLevel: 'loose' });
  localStorage.setItem('theme', mode);
}

function toggleTheme() {
  const isLight = document.documentElement.classList.contains('light');
  applyTheme(isLight ? 'dark' : 'light');
}

(function initTheme() {
  const saved = localStorage.getItem('theme');
  if (saved) {
    applyTheme(saved);
  } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
    applyTheme('light');
  }
})();

mermaid.initialize({ startOnLoad: false, theme: 'default', securityLevel: 'loose' });

const MAIN_TYPES = [
  { id: 'flowchart', icon: '🔵', name: 'Flowchart', desc: '프로세스 흐름, 의사결정 구조' },
  { id: 'sequence', icon: '🟣', name: 'Sequence Diagram', desc: '시스템/사용자 간 상호작용' },
  { id: 'gantt', icon: '🟠', name: 'Gantt Chart', desc: '프로젝트 일정 및 타임라인' },
  { id: 'mindmap', icon: '🟡', name: 'Mindmap', desc: '아이디어 연결, 개념 구조화' },
  { id: 'classDiagram', icon: '🟢', name: 'Class Diagram', desc: '객체지향 구조, 관계 모델' },
  { id: 'stateDiagram', icon: '🔴', name: 'State Diagram', desc: '상태 변화, 이벤트 흐름' },
  { id: 'erDiagram', icon: '🩵', name: 'ER Diagram', desc: '데이터베이스 관계 모델' },
];

const EXTRA_TYPES = [
  { id: 'journey', icon: '🧭', name: 'User Journey', desc: '사용자 경험 단계, UX 시나리오' },
  { id: 'timeline', icon: '📅', name: 'Timeline', desc: '역사/이벤트 시간순 정리' },
  { id: 'gitGraph', icon: '🌿', name: 'Git Graph', desc: '브랜치 전략, 커밋 히스토리' },
  { id: 'pie', icon: '🥧', name: 'Pie Chart', desc: '비율/구성 데이터 시각화' },
  { id: 'quadrantChart', icon: '🎯', name: 'Quadrant Chart', desc: '2x2 우선순위 매트릭스' },
  { id: 'requirementDiagram', icon: '📋', name: 'Requirement Diagram', desc: '요구사항 추적, 기능 명세' },
];

const DIAGRAM_TYPES = [...MAIN_TYPES, ...EXTRA_TYPES];

let selectedTypes = [];
let currentCodes = {};
let zoomLevels = {};
let analysisResult = null;
let apiKey = '';
let provider = 'claude';
let openaiModel = 'gpt-4o-mini';
let detailLevel = 'low';

const PROVIDER_CONFIG = {
  claude: {
    placeholder: 'Anthropic API Key를 입력하세요 (sk-ant-...)',
    validate: v => v.startsWith('sk-ant-'),
    hint: '❌ Anthropic 키는 sk-ant- 로 시작해야 합니다.',
  },
  openai: {
    placeholder: 'OpenAI API Key를 입력하세요 (sk-...)',
    validate: v => v.startsWith('sk-') && !v.startsWith('sk-ant-'),
    hint: '❌ OpenAI 키는 sk- 로 시작해야 합니다 (sk-ant- 제외).',
  },
};

function getDetailLevel() {
  return detailLevel === 'high' ? 'high' : 'low';
}

function setDetailLevel(level) {
  detailLevel = level === 'high' ? 'high' : 'low';
  const lowBtn = document.getElementById('detailLow');
  const highBtn = document.getElementById('detailHigh');
  if (lowBtn) lowBtn.classList.toggle('active', detailLevel === 'low');
  if (highBtn) highBtn.classList.toggle('active', detailLevel === 'high');
  localStorage.setItem('mermaid_detail_level', detailLevel);
}

function selectProvider(p) {
  provider = p;
  document.getElementById('providerClaude').classList.toggle('active', p === 'claude');
  document.getElementById('providerOpenai').classList.toggle('active', p === 'openai');
  document.getElementById('apiKeyInput').placeholder = PROVIDER_CONFIG[p].placeholder;

  const savedKey = isSaveLocalEnabled() ? localStorage.getItem('mermaid_api_key_' + p) : '';
  document.getElementById('apiKeyInput').value = savedKey || '';

  onApiKeyChange();
  document.getElementById('openaiModelRow').style.display = p === 'openai' ? 'block' : 'none';
  localStorage.setItem('mermaid_last_provider', p);
}

function onApiKeyChange() {
  const val = document.getElementById('apiKeyInput').value.trim();
  const valid = PROVIDER_CONFIG[provider].validate(val);
  const saveBtn = document.getElementById('apiKeySaveBtn');

  saveBtn.disabled = !valid;
  saveBtn.style.opacity = valid ? '1' : '0.45';

  if (val.length > 6 && !valid) {
    document.getElementById('apiKeyStatus').textContent = PROVIDER_CONFIG[provider].hint;
    document.getElementById('apiKeyStatus').style.color = '#f87171';
  } else {
    document.getElementById('apiKeyStatus').textContent = isSaveLocalEnabled()
      ? 'API Key는 브라우저의 localStorage에 저장됩니다.'
      : 'API Key는 현재 세션(메모리)에만 유지되며 새로고침 시 삭제됩니다.';
    document.getElementById('apiKeyStatus').style.color = '#888';
  }
}

function onSaveLocalToggle() {
  const isChecked = isSaveLocalEnabled();
  localStorage.setItem('mermaid_save_local', String(isChecked));

  if (!isChecked) {
    localStorage.removeItem('mermaid_api_key_claude');
    localStorage.removeItem('mermaid_api_key_openai');
    localStorage.removeItem('mermaid_openai_model');
  }

  onApiKeyChange();
}

function saveApiKey() {
  const val = document.getElementById('apiKeyInput').value.trim();
  if (!PROVIDER_CONFIG[provider].validate(val)) return;
  apiKey = val;

  if (isSaveLocalEnabled()) {
    localStorage.setItem('mermaid_api_key_' + provider, val);
    if (provider === 'openai') {
      localStorage.setItem('mermaid_openai_model', openaiModel);
    }
  }

  const label = provider === 'claude' ? 'Claude (Anthropic)' : 'OpenAI';
  const saveHint = isSaveLocalEnabled() ? ' 및 브라우저에 저장' : '';
  document.getElementById('apiKeyStatus').textContent = `✅ ${label} API Key가 설정${saveHint}되었습니다.`;
  document.getElementById('apiKeyStatus').style.color = '#34d399';
  document.getElementById('inputCard').classList.remove('hidden');
  document.getElementById('inputText').focus();
}

(function initApiSettings() {
  const lastProvider = localStorage.getItem('mermaid_last_provider') || 'claude';
  const savedModel = localStorage.getItem('mermaid_openai_model');
  const isSaveEnabled = localStorage.getItem('mermaid_save_local') !== 'false';
  const saveLocalCheck = getSaveLocalCheck();

  if (saveLocalCheck) {
    saveLocalCheck.checked = isSaveEnabled;
  }

  if (savedModel && isSaveEnabled) {
    openaiModel = savedModel;
    document.getElementById('openaiModelSelect').value = savedModel;
  }

  selectProvider(lastProvider);

  if (isSaveEnabled) {
    const savedKey = localStorage.getItem('mermaid_api_key_' + lastProvider);
    if (savedKey && PROVIDER_CONFIG[lastProvider].validate(savedKey)) {
      saveApiKey();
    }
  }
})();

document.addEventListener('DOMContentLoaded', () => {
  const savedDetail = localStorage.getItem('mermaid_detail_level');
  setDetailLevel(savedDetail === 'high' ? 'high' : 'low');

  if (window.location.protocol === 'file:') {
    document.getElementById('apiKeyStatus').textContent =
      'ℹ️ index.html 직접 실행 모드(file://)입니다. 브라우저 정책에 따라 일부 환경에서만 제한이 발생할 수 있습니다.';
    document.getElementById('apiKeyStatus').style.color = '#888';
  }

  document.getElementById('apiKeyInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') saveApiKey();
  });

  document.getElementById('openaiModelSelect').addEventListener('change', e => {
    openaiModel = e.target.value;
  });

  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      const inputCard = document.getElementById('inputCard');
      if (!inputCard.classList.contains('hidden')) analyzeText();
    }
  });
});

async function callAI(messages, systemPrompt) {
  if (!apiKey) throw new Error('API Key가 설정되지 않았습니다.');

  if (provider === 'claude') {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'prompt-caching-2024-07-31',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1000,
        system: [{ type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } }],
        messages
      })
    });

    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    return data.content.map(b => b.text || '').join('');
  }

  const openAiMessages = [
    { role: 'system', content: systemPrompt },
    ...messages
  ];

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: openaiModel,
      messages: openAiMessages,
      max_tokens: 1000,
      temperature: 0.2
    })
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error?.message || `OpenAI API 오류: ${res.status}`);
  }

  const data = await res.json();
  return data.choices[0].message.content || '';
}

async function analyzeText() {
  const text = document.getElementById('inputText').value.trim();
  if (!text) return;

  setStatus('분석 중...', true);
  document.getElementById('analyzeBtn').disabled = true;
  document.getElementById('analyzeError').classList.add('hidden');

  try {
    const systemPrompt = `You are a diagram type recommender. Given user text, analyze it and return JSON only.
Return this exact JSON structure (no markdown, no explanation):
{
  "summary": "한 줄 요약 (한국어)",
  "recommended": ["flowchart","sequence","gantt","mindmap","classDiagram","stateDiagram","erDiagram"],
  "reasons": {
    "flowchart": "이 유형이 적합한 이유 (한국어, 1줄)",
    "sequence": "...",
    "gantt": "...",
    "mindmap": "...",
    "classDiagram": "...",
    "stateDiagram": "...",
    "erDiagram": "..."
  }
}
The "recommended" array must contain ALL 7 types sorted from most to least suitable.`;

    const raw = await callAI([{ role: 'user', content: text }], systemPrompt);
    const clean = raw.replace(/```json|```/g, '').trim();
    analysisResult = JSON.parse(clean);

    buildTypeGrid(analysisResult);
    document.getElementById('typeSection').classList.remove('hidden');
    setStatus('');
  } catch (e) {
    showError('analyzeError', '분석 중 오류가 발생했습니다: ' + e.message);
    setStatus('');
  }

  document.getElementById('analyzeBtn').disabled = false;
}

function makeGroupHeader(label) {
  const el = document.createElement('div');
  el.className = 'group-header';
  el.innerHTML = `<span class="group-header-label">${label}</span><span class="group-header-line"></span>`;
  return el;
}

function makeCard(type, extraClass, reason) {
  const card = document.createElement('div');
  card.className = 'diagram-card' + (extraClass ? ' ' + extraClass : '');
  card.id = 'card_' + type.id;
  card.onclick = () => selectType(type.id);
  card.innerHTML = `<div class="d-icon">${type.icon}</div>
    <div class="d-name">${type.name}</div>
    <div class="d-desc">${reason}</div>`;
  return card;
}

function buildTypeGrid(analysis) {
  const grid = document.getElementById('diagramGrid');
  grid.innerHTML = '';
  const recommended = analysis.recommended || MAIN_TYPES.map(d => d.id);

  grid.appendChild(makeGroupHeader('✨ 대표 다이어그램'));
  recommended.forEach((id, i) => {
    const type = MAIN_TYPES.find(d => d.id === id);
    if (!type) return;
    const reason = analysis.reasons?.[id] || type.desc;
    grid.appendChild(makeCard(type, i === 0 ? 'recommended' : '', reason));
  });

  grid.appendChild(makeGroupHeader('➕ 추가 다이어그램'));
  EXTRA_TYPES.forEach(type => {
    grid.appendChild(makeCard(type, 'extra', type.desc));
  });
}

function selectType(id) {
  const idx = selectedTypes.indexOf(id);
  if (idx >= 0) {
    selectedTypes.splice(idx, 1);
  } else {
    if (selectedTypes.length >= 3) return;
    selectedTypes.push(id);
  }
  updateCardSelections();
}

function updateCardSelections() {
  const grid = document.getElementById('diagramGrid');
  document.querySelectorAll('.diagram-card').forEach(c => {
    c.classList.remove('selected');
    delete c.dataset.selNum;
  });

  selectedTypes.forEach((id, i) => {
    const card = document.getElementById('card_' + id);
    if (!card) return;
    card.classList.add('selected');
    card.dataset.selNum = i + 1;
  });

  const maxed = selectedTypes.length >= 3;
  if (maxed) grid.dataset.maxed = 'true';
  else delete grid.dataset.maxed;

  const n = selectedTypes.length;
  const hint = document.getElementById('selectHint');
  hint.innerHTML = n === 0
    ? `유형을 선택하세요 — <span>${n} / 3</span> 선택됨`
    : `<span>${n}개</span> 선택됨${maxed ? ' (최대)' : ' — 추가 선택하거나 생성하세요'}`;

  const btn = document.getElementById('generateBtn');
  btn.disabled = n === 0;
  btn.textContent = n > 1
    ? `✨ 다이어그램 ${n}개 동시 생성하기`
    : '✨ 다이어그램 생성하기';
}

async function generateDiagram() {
  if (selectedTypes.length === 0) return;
  const text = document.getElementById('inputText').value.trim();
  const n = selectedTypes.length;
  setStatus(n > 1 ? `${n}개 다이어그램 병렬 생성 중...` : '다이어그램 생성 중...', true);
  document.getElementById('generateBtn').disabled = true;
  document.getElementById('generateError').classList.add('hidden');
  currentCodes = {};

  const colorGuides = {
    flowchart: `STRICT RULES:
- Node IDs must be simple alphanumeric ONLY (e.g. A1, step2, nodeB). NEVER start IDs with a number.
- Korean text MUST be inside brackets: A1[한국어 텍스트] or A1((한글)).
- If a label contains special characters (+, -, :, /, etc.), wrap it in double quotes: A1["Label + with + chars"].
- Use classDef for colors and apply to nodes.`,
    sequence: `STRICT RULES:
- Participant names must be single English words (User, Server, DB).
- Message text after the colon can be Korean: User->>Server: 요청전송
- No blank participants. No special chars in names.`,
    gantt: `Use dateFormat YYYY-MM-DD. Section and task names can be Korean.
Each task line: taskName : status, startDate, duration`,
    mindmap: `STRICT RULES:
- Use simple indentation. 
- Labels can be Korean. 
- If a label has special chars (+, -, 등), wrap in quotes: node["특수문자+"]`,
    classDiagram: `Class, attribute, and method names must be English. Korean allowed ONLY in %% comments.`,
    stateDiagram: `Use stateDiagram-v2.
- State names must be single English words.
- Add Korean description: state X : "한국어설명"
- Transitions: StateA --> StateB : "한국어레이블"`,
    erDiagram: `Entity and attribute names must be English. Korean allowed ONLY in %% comments or quoted relationship labels.`,
    journey: `title 제목 (Korean ok). section 단계명 (Korean ok). 작업명: score: ActorName (Actor must be English).`,
    timeline: `title 제목 (Korean ok). section 섹션명 (Korean ok). 날짜 : 이벤트설명 (Korean ok).`,
    gitGraph: `Branch names English. Commit messages can be Korean: commit id:"한국어"`,
    pie: `title 제목 (Korean ok). "항목명" : 숫자 (Labels in double quotes).`,
    quadrantChart: `Axis and quadrant labels can be Korean. 항목명: [x, y] (Item names can be Korean).`,
    requirementDiagram: `STRICT RULES:
- Use Mermaid requirementDiagram block syntax ONLY (NOT JSON/NOT object literals).
- Each requirement must be multi-line:
  requirement req_name {
    id: R1
    text: "한국어 설명"
    risk: medium
    verifymethod: test
  }
- "text" value must always be in double quotes.`,
  };

  const buildPrompt = typeId => {
    const isLow = getDetailLevel() === 'low';
    const isOpenAI = provider === 'openai';

    // OpenAI/기타 모델에서 자주 발생하는 문법 오류 방지용 강제 지침
    const modelStrictRules = isOpenAI 
      ? `\n### STRICT SYNTAX ENFORCEMENT FOR THIS MODEL:
- Every property inside a { block } MUST have a colon followed by a space (e.g., id: R1, NOT id R1).
- String values for 'text', 'docref', 'type' MUST be in double quotes.
- Ensure every opening { has a corresponding closing } on a new line.`
      : '';

    const summaryGuide = isLow 
      ? `### VISUALIZATION STRATEGY: BEGINNER-FRIENDLY SUMMARY
- Goal: Create a CLEAR, SIMPLE diagram for someone who knows nothing about this topic.
- Rule 1: MAX 10-12 nodes total. DO NOT include minor details.
- Rule 2: Group related points into a single, high-level node.
- Rule 3: Use very short labels (1-3 words).
- Rule 4: Focus on the "Big Picture" or "Main Path".`
      : `### VISUALIZATION STRATEGY: PROFESSIONAL DETAIL
- Goal: Create a COMPREHENSIVE and DETAILED diagram for experts.
- Rule 1: Include all nuances, sub-steps, and technical details.
- Rule 2: Be as exhaustive as possible while maintaining correctness.
- Rule 3: Map out every logical connection from the provided text.`;

    return `You are a Mermaid expert and Information Architect.
Generate ONLY valid raw Mermaid ${typeId} code.
${modelStrictRules}

${summaryGuide}

CRITICAL RULES:
1. Node IDs MUST be simple English (n1, stepA). NEVER start IDs with numbers.
2. Korean text MUST be inside brackets or double quotes.
3. Wrap labels with special characters (+, -, :, /) in double quotes: id["Text + Here"].
4. First line must be exactly "${typeId === 'flowchart' ? 'flowchart LR' : typeId}".
5. NO markdown, NO explanation, NO backticks.
6. NEVER output JSON, JS objects, YAML, or key-value blocks on a single line.

DIAGRAM-SPECIFIC RULES:
${colorGuides[typeId] || ''}

Content:
${text}`;
  };

  try {
    buildResultItems(selectedTypes);

    const results = await Promise.allSettled(
      selectedTypes.map(typeId =>
        callAI([{ role: 'user', content: text }], buildPrompt(typeId))
          .then(raw => raw.trim().replace(/^```[a-z]*\n?|```$/g, '').trim())
      )
    );

    for (let i = 0; i < selectedTypes.length; i++) {
      const typeId = selectedTypes[i];
      const result = results[i];
      if (result.status === 'fulfilled') {
        currentCodes[typeId] = result.value;
        document.getElementById('codeText_' + typeId).textContent = result.value;
        await renderDiagram(result.value, typeId);
      } else {
        const out = document.getElementById('diagramOutput_' + typeId);
        if (out) out.innerHTML = `<div style="color:#f87171;font-size:0.85rem">생성 실패: ${result.reason?.message || '알 수 없는 오류'}</div>`;
      }
    }

    document.getElementById('outputSection').classList.remove('hidden');
    document.getElementById('outputSection').scrollIntoView({ behavior: 'smooth' });
    setStatus('');
  } catch (e) {
    showError('generateError', '생성 중 오류: ' + e.message);
    setStatus('');
  }

  document.getElementById('generateBtn').disabled = false;
}

function buildResultItems(typeIds) {
  const container = document.getElementById('resultsContainer');
  container.innerHTML = '';
  document.getElementById('outputSection').classList.remove('hidden');

  typeIds.forEach((typeId, i) => {
    const type = DIAGRAM_TYPES.find(d => d.id === typeId);
    const item = document.createElement('div');
    item.className = 'result-item';
    item.innerHTML = `
      <div class="result-header">
        ${type.icon} ${type.name}
        <span class="r-badge">${i + 1}번째</span>
      </div>
      <div class="tabs" id="tabs_${typeId}">
        <div class="tab active" onclick="switchResultTab('${typeId}', 'preview')">👁 미리보기</div>
        <div class="tab" onclick="switchResultTab('${typeId}', 'code')">📋 코드</div>
      </div>
      <div id="preview_${typeId}">
        <div class="diagram-toolbar">
          <div class="zoom-controls">
            <button class="zoom-btn" onclick="zoomOut('${typeId}')">−</button>
            <span class="zoom-level" id="zoomLevel_${typeId}">100%</span>
            <button class="zoom-btn" onclick="zoomIn('${typeId}')">+</button>
            <button class="zoom-btn" onclick="zoomReset('${typeId}')" title="원래 크기">↺</button>
            <button class="zoom-btn" onclick="zoomFit('${typeId}')" title="너비 맞춤">↔ 맞춤</button>
          </div>
          <button class="zoom-btn fullscreen-btn" onclick="openFullscreen('${typeId}')" title="전체화면">⛶</button>
        </div>
        <div class="diagram-output" id="diagramOutput_${typeId}">
          <div style="color:var(--text-muted)"><span class="loader"></span> 생성 중...</div>
        </div>
      </div>
      <div id="code_${typeId}" class="hidden">
        <div class="code-output">
          <button class="copy-btn" onclick="copyCode('${typeId}')">복사</button>
          <span id="codeText_${typeId}"></span>
        </div>
      </div>`;
    container.appendChild(item);
  });
}

async function renderDiagram(code, typeId, retryCount = 0) {
  const output = document.getElementById('diagramOutput_' + typeId);
  if (!output) return;

  try {
    const normalizedCode = normalizeMermaidCode(code, typeId);
    if (normalizedCode !== code) {
      currentCodes[typeId] = normalizedCode;
      const codeEl = document.getElementById('codeText_' + typeId);
      if (codeEl) codeEl.textContent = normalizedCode;
      code = normalizedCode;
    }
    const id = 'mermaid_' + typeId + '_' + Date.now();
    const { svg } = await mermaid.render(id, code);
    output.innerHTML = `<div class="zoom-wrap" id="zoomWrap_${typeId}">${svg}</div>`;
    
    // 내용에 따라 높이 자동 조절 (최소 300px, 최대 600px)
    requestAnimationFrame(() => {
      const svgEl = output.querySelector('svg');
      if (svgEl) {
        const h = svgEl.getBoundingClientRect().height + 48; // 여유 공간 포함
        output.style.height = Math.min(600, Math.max(300, h)) + 'px';
      }
    });
    
    setZoom(typeId, zoomLevels[typeId] || 1);
  } catch (e) {
    if (retryCount < 1) {
      output.innerHTML = `<div style="color:#a78bfa;font-size:0.85rem"><span class="loader"></span> 오류 감지 → 자동 수정 중... (${retryCount + 1}/2)</div>`;
      try {
        const fixed = await fixMermaidCode(code, e.message, typeId);
        currentCodes[typeId] = fixed;
        const codeEl = document.getElementById('codeText_' + typeId);
        if (codeEl) codeEl.textContent = fixed;
        await renderDiagram(fixed, typeId, retryCount + 1);
      } catch (e2) {
        output.innerHTML = `<div style="color:#f87171;font-size:0.85rem">자동 수정 실패: ${e2.message}<br><br>코드 탭에서 직접 확인하세요.</div>`;
      }
    } else {
      output.innerHTML = `<div style="color:#f87171;font-size:0.85rem">렌더링 실패 (2회 시도): ${e.message}<br><br>코드 탭에서 확인하세요.</div>`;
    }
  }
}

function getFixRulesForType(typeId) {
  if (typeId === 'requirementDiagram') {
    return `Extra strict rules for requirementDiagram:
- First line must be exactly: requirementDiagram
- requirement block must be multiline and use colon syntax for every property.
- Valid requirement properties: id, text, risk, verifymethod
- Valid risk values: low | medium | high
- Valid verifymethod values: test | inspection | analysis | demonstration
- element block must also be multiline with colon syntax.
- Never output "id R1" or "text 설명" (missing colon is invalid).
- Do not use semicolons.`;
  }
  return '';
}

async function fixMermaidCode(code, errorMsg, typeId = '') {
  const systemPrompt = `You are a Mermaid diagram syntax expert.
The user has a broken Mermaid diagram. Fix ALL syntax errors and return ONLY the corrected Mermaid code.
Rules:
- Output raw Mermaid code only. No markdown fences, no backticks, no explanation.
- Keep all content and structure intact, only fix syntax.
- For stateDiagram-v2: labels must NOT contain colons (:) inside state names — use spaces or hyphens instead.
- For stateDiagram-v2: transition labels after --> use colon syntax: StateA --> StateB : label
- Korean text is allowed but must not break syntax tokens.
- Remove or escape any characters that conflict with Mermaid parsing.
${getFixRulesForType(typeId)}`;

  const userMsg = `Mermaid code with error:\n${code}\n\nError message:\n${errorMsg}\n\nPlease fix and return only the corrected Mermaid code.`;
  const fixed = await callAI([{ role: 'user', content: userMsg }], systemPrompt);
  const clean = fixed.trim().replace(/^```[a-z]*\n?|```$/g, '').trim();
  return normalizeMermaidCode(clean, typeId);
}

function normalizeMermaidCode(code, typeId = '') {
  if (typeId !== 'requirementDiagram') return code;
  if (!code || typeof code !== 'string') return code;

  let normalized = code;
  const reqBlockKinds = '(requirement|functionalRequirement|interfaceRequirement|performanceRequirement|physicalRequirement|designConstraint|element)';

  // If properties are glued in one line, split them to new lines.
  normalized = normalized.replace(/([^\n])\s+(id|text|risk|verifymethod)\s*:/g, '$1\n    $2:');
  normalized = normalized.replace(/([^\n])\s+(id|text|risk|verifymethod)\s+([^\n]+)/g, '$1\n    $2: $3');
  normalized = normalized.replace(new RegExp(`([^\\n])\\s+${reqBlockKinds}\\s+`, 'g'), '$1\n$2 ');

  const lines = normalized.split(/\r?\n/);
  const out = [];
  let hasHeader = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      out.push(line);
      continue;
    }

    if (!hasHeader && trimmed === 'requirementDiagram') hasHeader = true;

    const block = line.match(new RegExp(`^(\\s*)${reqBlockKinds}\\s+([A-Za-z_][\\w-]*)(\\s*)$`));
    if (block) {
      const indent = block[1] || '  ';
      const kind = block[2];
      const name = block[3];
      out.push(`${indent}${kind} ${name} {`);
      continue;
    }

    const inlineBlock = line.match(new RegExp(`^(\\s*)${reqBlockKinds}\\s+([A-Za-z_][\\w-]*)\\s*\\{\\s*(.+)$`));
    if (inlineBlock) {
      const indent = inlineBlock[1] || '  ';
      const kind = inlineBlock[2];
      const name = inlineBlock[3];
      const tail = inlineBlock[4].trim();
      out.push(`${indent}${kind} ${name} {`);
      if (tail) out.push(`${indent}  ${tail}`);
      continue;
    }

    const prop = line.match(/^(\s*)(id|text|risk|verifymethod|type|docref)\s*:?\s*(.*)$/i);
    if (!prop) {
      out.push(line);
      continue;
    }

    const indent = prop[1] || '    ';
    const key = prop[2].toLowerCase();
    let value = (prop[3] || '').trim();

    if (key === 'text') {
      if (!value.startsWith('"')) value = `"${value}`;
      if (!value.endsWith('"')) value = `${value}"`;
    } else if (key === 'type' || key === 'docref') {
      if (value && !value.startsWith('"')) value = `"${value}`;
      if (value && !value.endsWith('"')) value = `${value}"`;
    } else if (key === 'risk') {
      value = value.toLowerCase();
      if (!['low', 'medium', 'high'].includes(value)) value = 'medium';
    } else if (key === 'verifymethod') {
      value = value.toLowerCase();
      if (!['test', 'inspection', 'analysis', 'demonstration'].includes(value)) value = 'test';
    }

    out.push(`${indent}${key}: ${value}`);
  }

  normalized = out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
  if (!hasHeader && !normalized.startsWith('requirementDiagram')) {
    normalized = `requirementDiagram\n${normalized}`;
  }
  normalized = balanceRequirementBlocks(normalized);
  return normalized;
}

function balanceRequirementBlocks(code) {
  if (!code || typeof code !== 'string') return code;

  const lines = code.split(/\r?\n/);
  let balance = 0;
  const fixed = [];

  for (const line of lines) {
    const openCount = (line.match(/{/g) || []).length;
    const closeCount = (line.match(/}/g) || []).length;
    balance += openCount - closeCount;
    fixed.push(line);
  }

  while (balance > 0) {
    fixed.push('  }');
    balance--;
  }

  return fixed.join('\n');
}

function switchResultTab(typeId, tab) {
  const tabEls = document.querySelectorAll(`#tabs_${typeId} .tab`);
  tabEls.forEach((t, i) => t.classList.toggle('active', (tab === 'preview' && i === 0) || (tab === 'code' && i === 1)));
  document.getElementById('preview_' + typeId).classList.toggle('hidden', tab !== 'preview');
  document.getElementById('code_' + typeId).classList.toggle('hidden', tab !== 'code');
}

function copyCode(typeId) {
  const code = currentCodes[typeId] || '';
  navigator.clipboard.writeText(code).then(() => {
    const btn = document.querySelector(`#code_${typeId} .copy-btn`);
    if (btn) {
      btn.textContent = '✅ 복사됨';
      setTimeout(() => { btn.textContent = '복사'; }, 1500);
    }
  });
}

function resetAll() {
  selectedTypes = [];
  currentCodes = {};
  zoomLevels = {};
  analysisResult = null;
  document.getElementById('inputText').value = '';
  document.getElementById('typeSection').classList.add('hidden');
  document.getElementById('outputSection').classList.add('hidden');
  document.getElementById('resultsContainer').innerHTML = '';
  document.getElementById('statusMsg').classList.add('hidden');
  document.getElementById('generateBtn').disabled = true;
  closeFullscreen();
  document.getElementById('inputText').focus();
}

function setZoom(typeId, level) {
  zoomLevels[typeId] = level;
  const wrap = document.getElementById('zoomWrap_' + typeId);
  if (wrap) wrap.style.transform = `scale(${level})`;
  const display = document.getElementById('zoomLevel_' + typeId);
  if (display) display.textContent = Math.round(level * 100) + '%';
}

function zoomIn(typeId) {
  setZoom(typeId, Math.min(4, (zoomLevels[typeId] || 1) + 0.25));
}

function zoomOut(typeId) {
  setZoom(typeId, Math.max(0.25, (zoomLevels[typeId] || 1) - 0.25));
}

function zoomReset(typeId) {
  setZoom(typeId, 1);
}

function zoomFit(typeId) {
  const wrap = document.getElementById('zoomWrap_' + typeId);
  const output = document.getElementById('diagramOutput_' + typeId) || document.getElementById('fsDiagram');
  if (!wrap || !output) return;

  wrap.style.transform = 'scale(1)';
  const svg = wrap.querySelector('svg');
  if (!svg) return;
  const svgW = svg.getBoundingClientRect().width;
  const containerW = output.clientWidth - 48;
  const fitScale = Math.min(4, Math.max(0.25, containerW / svgW));
  setZoom(typeId, fitScale);
}

function openFullscreen(typeId) {
  const type = DIAGRAM_TYPES.find(d => d.id === typeId);
  const srcWrap = document.getElementById('zoomWrap_' + typeId);
  if (!srcWrap) return;

  const fsWrap = document.getElementById('zoomWrap___fs__');
  fsWrap.innerHTML = srcWrap.innerHTML;
  fsWrap.style.transform = 'scale(1)';
  zoomLevels.__fs__ = 1;
  document.getElementById('zoomLevel___fs__').textContent = '100%';
  document.getElementById('fsTitle').textContent = type ? `${type.icon} ${type.name}` : '';
  document.getElementById('fsModal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => zoomFit('__fs__'));
}

function closeFullscreen() {
  document.getElementById('fsModal').classList.add('hidden');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeFullscreen();
});

function setStatus(msg, loading = false) {
  const el = document.getElementById('statusMsg');
  if (!msg) {
    el.classList.add('hidden');
    return;
  }

  el.classList.remove('hidden');
  el.innerHTML = loading ? `<span class="loader"></span>${msg}` : msg;
}

function showError(id, msg) {
  const el = document.getElementById(id);
  el.textContent = msg;
  el.classList.remove('hidden');
}
