// app.js — main UI logic

// ── Auto-resize textarea ──
function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.max(160, el.scrollHeight) + 'px';
}

// ── Language detection from code text ──
function detectLang(val) {
  const tag  = document.getElementById('lang-tag');
  const name = document.getElementById('lang-name');
  if (!val.trim()) { tag.style.display = 'none'; return; }

  let lang = '';
  if (/\bdef \b|\bimport \b|print\(|elif |:\s*$|\bNone\b|\bself\b/.test(val))     lang = 'Python';
  else if (/console\.log|const |let |var |=>|function\s/.test(val))               lang = 'JavaScript';
  else if (/:\s*(string|number|boolean|any)\b|interface |\.tsx?/.test(val))       lang = 'TypeScript';
  else if (/public\s+class|System\.out|void\s+main/.test(val))                    lang = 'Java';
  else if (/\bfunc \b|fmt\.|package main/.test(val))                              lang = 'Go';
  else if (/#include|cout|cin|std::/.test(val))                                   lang = 'C++';
  else if (/<?php|\$[a-z_]/i.test(val))                                           lang = 'PHP';
  else if (/\bfn\b.*->|\blet\b.*\bmut\b/.test(val))                              lang = 'Rust';

  if (lang) { name.textContent = lang; tag.style.display = 'flex'; }
  else       { tag.style.display = 'none'; }
}

// ── API Key — reads from config.js ──
function getStoredKey() {
  if (typeof OPENAI_API_KEY !== 'undefined' 
      && OPENAI_API_KEY !== '' 
      && OPENAI_API_KEY !== 'YOUR_OPENAI_API_KEY_HERE') {
    return OPENAI_API_KEY;
  }
  return null;
}


function checkKeyBanner() {
  if (getStoredKey()) {
    document.getElementById('api-banner').classList.add('hidden');
    // show saved indicator in session badge
    const badge = document.getElementById('session-label');
    if (badge && badge.textContent === '0 bugs analyzed') {
      // key already saved, banner stays hidden
    }
  }
}


// ── Main analyze ──
async function analyze() {
  const input = document.getElementById('code-input').value.trim();
  if (!input) {
    showOutput('<div class="err-box">Please paste your code and error message first.</div>');
    return;
  }

  const apiKey = getStoredKey();
  if (!apiKey) {
    showOutput('<div class="err-box">API key not set. Open config.js and add your OpenAI API key.</div>');
    return;
  }

  const btn = document.getElementById('analyze-btn');
  btn.disabled = true;
  showOutput(`
    <div class="loading">
      <div class="dot"></div><div class="dot"></div><div class="dot"></div>
      <span>Analyzing your error...</span>
    </div>
  `);

  try {
    const result = await callAPI(input, apiKey);

    if (result.language) {
      document.getElementById('lang-name').textContent = result.language;
      document.getElementById('lang-tag').style.display = 'flex';
    }

    if (result.mistakeLabel) addPattern(result.mistakeLabel);

    renderResult(result);
  } catch (err) {
    showOutput(`<div class="err-box">${err.message}</div>`);
  }

  btn.disabled = false;
}

// ── Render result ──
function renderResult(d) {
  const chips = (d.followUpQuestions || []).map(q =>
    `<div class="chip" onclick="askFollowUp(${JSON.stringify(q)})">${q} ↗</div>`
  ).join('');

  const fixedBlock = d.fixedCode ? `
    <div class="panel">
      <div class="panel-head green">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
        Fixed code
        <button class="copy-btn" onclick="copyCode()">Copy</button>
      </div>
      <div class="code-wrap">
        <pre id="fixed-code">${escapeHtml(d.fixedCode)}</pre>
      </div>
    </div>` : '';

  const chipsBlock = chips ? `
    <div class="panel">
      <div class="panel-head purple">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        Ask more
      </div>
      <div class="chip-wrap">${chips}</div>
    </div>` : '';

  showOutput(`
    <div class="results">
      <div class="two-col">
        <div class="panel">
          <div class="panel-head red">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            Why this happened
          </div>
          <div class="panel-body">${d.rootCause || '—'}</div>
        </div>
        <div class="panel">
          <div class="panel-head blue">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
            What to remember
          </div>
          <div class="concept-accent">${d.conceptCard || '—'}</div>
        </div>
      </div>
      ${fixedBlock}
      ${chipsBlock}
    </div>
  `);
}

// ── Helpers ──
function showOutput(html) {
  document.getElementById('output').innerHTML = html;
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function copyCode() {
  const el = document.getElementById('fixed-code');
  if (!el) return;
  navigator.clipboard.writeText(el.textContent).then(() => {
    const btn = document.querySelector('.copy-btn');
    if (btn) { btn.textContent = 'Copied!'; setTimeout(() => btn.textContent = 'Copy', 1600); }
  });
}

function askFollowUp(question) {
  const ta = document.getElementById('code-input');
  ta.value = question;
  autoResize(ta);
  window.scrollTo({ top: 0, behavior: 'smooth' });
  ta.focus();
}

// ── Init ──
checkKeyBanner();
renderTracker();
updateSessionLabel();
