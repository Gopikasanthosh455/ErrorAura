// tracker.js — mistake pattern tracker using localStorage

const STORAGE_KEY = 'erroraura_patterns_v2';

function loadPatterns() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
  catch (e) { return {}; }
}

function savePatterns(p) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); }
  catch (e) { console.warn('Storage error:', e); }
}

function addPattern(label) {
  if (!label) return;
  const p = loadPatterns();
  p[label] = (p[label] || 0) + 1;
  savePatterns(p);
  renderTracker();
  updateSessionLabel();
}

function clearPatterns() {
  if (!confirm('Clear all your mistake history?')) return;
  localStorage.removeItem(STORAGE_KEY);
  renderTracker();
  updateSessionLabel();
}

function updateSessionLabel() {
  const p = loadPatterns();
  const total = Object.values(p).reduce((a, b) => a + b, 0);
  const el = document.getElementById('session-label');
  if (el) el.textContent = total === 0 ? '0 bugs analyzed' : `${total} bug${total > 1 ? 's' : ''} analyzed`;
}

function renderTracker() {
  const p = loadPatterns();
  const box = document.getElementById('tracker-box');
  const clearBtn = document.getElementById('clear-btn');
  if (!box) return;

  const entries = Object.entries(p).sort((a, b) => b[1] - a[1]).slice(0, 7);

  if (entries.length === 0) {
    box.innerHTML = '<div class="empty-tracker">No patterns yet — analyze your first bug above</div>';
    if (clearBtn) clearBtn.style.display = 'none';
    return;
  }

  const max = entries[0][1];
  box.innerHTML = entries.map(([name, count]) => `
    <div class="tracker-row">
      <span class="tracker-name" title="${name}">${name}</span>
      <div class="bar-bg"><div class="bar-fill" style="width:${Math.round((count / max) * 100)}%"></div></div>
      <span class="bar-count">${count}x</span>
    </div>
  `).join('');

  if (clearBtn) clearBtn.style.display = 'inline-block';
}
