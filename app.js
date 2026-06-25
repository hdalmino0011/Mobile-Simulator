/* ══════════════════════════════════════════════════════
   iOS Safari Simulator — app.js
   ══════════════════════════════════════════════════════ */
'use strict';

/* ── ROUTING ─────────────────────────────────────────── */
const ROUTES = {
  'home':          'pages/home.html',
  'safari://home': 'pages/home.html',
  'news':          'pages/page1.html',
  'article':       'pages/page1.html',
  'page1':         'pages/page1.html',
  'settings':      'pages/page2.html',
  'page2':         'pages/page2.html',
};

const BOOKMARKS_DATA = [
  { emoji: '🏠', name: 'Home',        url: 'safari://home' },
  { emoji: '📰', name: 'Top Stories', url: 'news' },
  { emoji: '⚙️', name: 'Settings',    url: 'settings' },
];

const SUGGESTIONS_DATA = [
  { icon: 'home',   title: 'Home',        sub: 'safari://home' },
  { icon: 'news',   title: 'Top Stories', sub: 'news' },
  { icon: 'gear',   title: 'Settings',    sub: 'settings' },
];

/* ── STATE ───────────────────────────────────────────── */
let tabs = [
  { id: 1, title: 'Google',  url: 'google.com',     src: 'pages/home.html', hist: ['pages/home.html'], hi: 0 },
];
let activeId = 1;
let nextId   = 2;
let isDark   = false;

/* ── DOM ─────────────────────────────────────────────── */
const $id = id => document.getElementById(id);
const statusTime     = $id('statusTime');
const progressFill   = $id('progressFill');
const pageFrame      = $id('pageFrame');
const transOverlay   = $id('transitionOverlay');
const urlText        = $id('urlText');
const urlInput       = $id('urlInput');
const urlClearBtn    = $id('urlClearBtn');
const urlReloadBtn   = $id('urlReloadBtn');
const suggestionsDrop= $id('suggestionsDrop');
const backBtn        = $id('backBtn');
const fwdBtn         = $id('fwdBtn');
const tabsNum        = $id('tabsNum');
const tabView        = $id('tabView');
const tabCardsScroll = $id('tabCardsScroll');
const tvTabCount     = $id('tvTabCount');
const shareSheet     = $id('shareSheet');
const shareBackdrop  = $id('shareBackdrop');
const sharePrevTitle = $id('sharePrevTitle');
const sharePrevUrl   = $id('sharePrevUrl');
const bkSheet        = $id('bkSheet');
const bkBackdrop     = $id('bkBackdrop');
const bkList         = $id('bkList');
const moonIcon       = $id('moonIcon');
const sunIcon        = $id('sunIcon');

/* ── CLOCK ───────────────────────────────────────────── */
function tick() {
  const n = new Date();
  const h = n.getHours(), m = String(n.getMinutes()).padStart(2,'0');
  statusTime.textContent = `${h}:${m}`;
}
tick(); setInterval(tick, 10000);

/* ── ACTIVE TAB ──────────────────────────────────────── */
const activeTab = () => tabs.find(t => t.id === activeId);

/* ── URL RESOLVE ─────────────────────────────────────── */
function resolve(raw) {
  if (!raw || !raw.trim()) return { src: 'pages/home.html', display: 'Home', title: 'Home' };
  const t = raw.trim();
  const key = t.toLowerCase().replace(/^https?:\/\//,'').replace(/\/$/,'');

  if (ROUTES[key]) return { src: ROUTES[key], display: displayFrom(ROUTES[key]), title: titleFrom(ROUTES[key]) };
  for (const [k, src] of Object.entries(ROUTES)) {
    if (key.includes(k) || k.includes(key)) return { src, display: displayFrom(src), title: titleFrom(src) };
  }
  if (t.includes('.') && !t.includes(' ')) return { src: null, display: t, title: t, external: true };
  return { src: null, display: `"${t}"`, title: t, search: true, query: t };
}

function displayFrom(src) {
  if (src.includes('home'))  return 'google.com';
  if (src.includes('page1')) return 'news.example.com';
  if (src.includes('page2')) return 'settings.example.com';
  return src;
}
function titleFrom(src) {
  if (src.includes('home'))  return 'Google';
  if (src.includes('page1')) return 'Top Stories';
  if (src.includes('page2')) return 'Settings';
  return 'Safari';
}

/* ── NAVIGATE ────────────────────────────────────────── */
function navigate(raw) {
  const tab = activeTab(); if (!tab) return;
  const r = resolve(raw);

  if (r.external) { loadExternal(r.display); return; }
  if (r.search)   { loadSearch(r.query); tab.url = r.display; tab.title = r.query; syncUrlBar(); return; }

  startProgress();
  crossfade(() => {
    pageFrame.src = r.src;
    tab.url   = r.display;
    tab.title = r.title;
    tab.src   = r.src;
    tab.hist  = tab.hist.slice(0, tab.hi + 1);
    tab.hist.push(r.src);
    tab.hi    = tab.hist.length - 1;
    syncUrlBar();
    updateNavBtns();
    updateShare();
  });
}

function loadSearch(query) {
  startProgress();
  crossfade(() => {
    const html = searchHTML(query);
    pageFrame.contentDocument.open();
    pageFrame.contentDocument.write(html);
    pageFrame.contentDocument.close();
    syncUrlBar();
    updateNavBtns();
    updateShare();
  });
}

function loadExternal(url) {
  startProgress();
  crossfade(() => {
    pageFrame.contentDocument.open();
    pageFrame.contentDocument.write(externalHTML(url));
    pageFrame.contentDocument.close();
    syncUrlBar();
    updateShare();
  });
}

function goBack() {
  const tab = activeTab(); if (!tab || tab.hi <= 0) return;
  tab.hi--;
  startProgress();
  crossfade(() => { pageFrame.src = tab.hist[tab.hi]; tab.src = tab.hist[tab.hi]; tab.url = displayFrom(tab.src); tab.title = titleFrom(tab.src); syncUrlBar(); updateNavBtns(); });
}

function goForward() {
  const tab = activeTab(); if (!tab || tab.hi >= tab.hist.length - 1) return;
  tab.hi++;
  startProgress();
  crossfade(() => { pageFrame.src = tab.hist[tab.hi]; tab.src = tab.hist[tab.hi]; tab.url = displayFrom(tab.src); tab.title = titleFrom(tab.src); syncUrlBar(); updateNavBtns(); });
}

function reloadPage(e) {
  e.stopPropagation();
  startProgress();
  crossfade(() => { pageFrame.src = pageFrame.src; });
}

/* ── SYNC UI ─────────────────────────────────────────── */
function syncUrlBar() {
  const tab = activeTab();
  urlText.textContent = tab ? tab.url : '';
}

function updateNavBtns() {
  const tab = activeTab();
  backBtn.classList.toggle('dim', !tab || tab.hi <= 0);
  fwdBtn.classList.toggle('dim',  !tab || tab.hi >= tab.hist.length - 1);
}

function updateShare() {
  const tab = activeTab();
  if (!tab) return;
  sharePrevTitle.textContent = tab.title;
  sharePrevUrl.textContent   = tab.url;
}

function updateTabCount() {
  const n = tabs.length;
  tabsNum.textContent    = n > 99 ? '∞' : n;
  tvTabCount.textContent = n === 1 ? '1 Tab' : `${n} Tabs`;
}

/* ── TRANSITIONS ─────────────────────────────────────── */
function crossfade(cb) {
  transOverlay.classList.add('on');
  setTimeout(() => { cb(); setTimeout(() => transOverlay.classList.remove('on'), 80); }, 110);
}

function startProgress() {
  progressFill.style.transition = 'none';
  progressFill.style.width = '0%';
  progressFill.style.opacity = '1';
  requestAnimationFrame(() => {
    progressFill.style.transition = 'width 1.2s cubic-bezier(0.4,0,0.6,1)';
    progressFill.style.width = '86%';
  });
  setTimeout(() => {
    progressFill.style.transition = 'width 0.2s ease, opacity 0.3s ease 0.1s';
    progressFill.style.width = '100%';
    progressFill.style.opacity = '0';
    setTimeout(() => { progressFill.style.width = '0%'; }, 500);
  }, 900);
}

/* ── URL BAR FOCUS ───────────────────────────────────── */
function activateUrl() {
  document.body.classList.add('url-on');
  const tab = activeTab();
  urlInput.value = tab && tab.url !== 'google.com' ? tab.url : '';
  urlInput.focus();
  urlInput.select();
  renderSuggestions('');
}

function deactivateUrl() {
  document.body.classList.remove('url-on');
  urlInput.blur();
  hideSuggestions();
}

function handleKey(e) {
  if (e.key === 'Enter') {
    const v = urlInput.value.trim();
    deactivateUrl();
    if (v) navigate(v);
  }
  if (e.key === 'Escape') deactivateUrl();
}

function handleInput(v) {
  urlClearBtn.classList.toggle('show', v.length > 0);
  renderSuggestions(v);
}

function clearUrl() {
  urlInput.value = '';
  urlClearBtn.classList.remove('show');
  urlInput.focus();
  renderSuggestions('');
}

/* ── SUGGESTIONS ─────────────────────────────────────── */
function renderSuggestions(q) {
  const lq = q.toLowerCase();
  const filtered = lq
    ? SUGGESTIONS_DATA.filter(s => s.title.toLowerCase().includes(lq) || s.sub.toLowerCase().includes(lq))
    : SUGGESTIONS_DATA;

  let html = filtered.map(s => `
    <div class="sugg-item" onclick="pickSugg('${s.sub}')">
      <div class="sugg-icon">${iconSVG(s.icon)}</div>
      <div class="sugg-text">
        <div class="sugg-title">${s.title}</div>
        <div class="sugg-sub">${s.sub}</div>
      </div>
    </div>`).join('');

  if (q && !filtered.length) {
    html = `<div class="sugg-item" onclick="pickSugg(${JSON.stringify(q)},true)">
      <div class="sugg-icon">${iconSVG('search')}</div>
      <div class="sugg-text">
        <div class="sugg-title">Search for "<strong>${q}</strong>"</div>
        <div class="sugg-sub">Google Search</div>
      </div>
    </div>`;
  } else if (q) {
    html += `<div class="sugg-item" onclick="pickSugg(${JSON.stringify(q)},true)">
      <div class="sugg-icon">${iconSVG('search')}</div>
      <div class="sugg-text">
        <div class="sugg-title">Search "<strong>${q}</strong>"</div>
        <div class="sugg-sub">Google</div>
      </div>
    </div>`;
  }
  suggestionsDrop.innerHTML = html;
}

function hideSuggestions() { suggestionsDrop.innerHTML = ''; }

function pickSugg(url, isSearch) {
  deactivateUrl();
  navigate(isSearch ? url : url);
}

function iconSVG(type) {
  const map = {
    home:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
    news:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 22h16a2 2 0 002-2V4a2 2 0 00-2-2H8a2 2 0 00-2 2v16a2 2 0 01-4 0V6"/><path d="M10 7h8M10 11h8M10 15h5"/></svg>`,
    gear:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>`,
    search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>`,
  };
  return map[type] || map.search;
}

/* ── TAB SYSTEM ──────────────────────────────────────── */
function showTabs() {
  renderTabCards();
  tabView.classList.add('show');
}

function hideTabs() {
  tabView.classList.remove('show');
}

function renderTabCards() {
  tabCardsScroll.innerHTML = '';
  tabs.forEach((tab, i) => {
    const card = document.createElement('div');
    card.className = 'tab-card' + (tab.id === activeId ? ' is-active' : '');
    card.style.animationDelay = `${i * 0.05}s`;
    card.innerHTML = `
      <div class="tab-card-topbar">
        <div class="tab-card-title">${tab.title}</div>
        <button class="tab-card-close" onclick="closeTab(event,${tab.id})">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>
      <div class="tab-card-preview" onclick="switchTab(${tab.id})">
        <iframe src="${tab.src}" tabindex="-1" aria-hidden="true"></iframe>
      </div>`;
    tabCardsScroll.appendChild(card);
  });
  updateTabCount();
}

function switchTab(id) {
  if (id === activeId) { hideTabs(); return; }
  activeId = id;
  const tab = activeTab();
  startProgress();
  crossfade(() => {
    pageFrame.src = tab.src;
    syncUrlBar();
    updateNavBtns();
    updateShare();
  });
  hideTabs();
}

function closeTab(e, id) {
  e.stopPropagation();
  if (tabs.length === 1) {
    // Reset to home
    tabs[0] = { id: 1, title: 'Google', url: 'google.com', src: 'pages/home.html', hist: ['pages/home.html'], hi: 0 };
    activeId = 1; nextId = 2;
    pageFrame.src = 'pages/home.html';
    syncUrlBar(); updateNavBtns();
    renderTabCards(); updateTabCount();
    return;
  }
  const idx = tabs.findIndex(t => t.id === id);
  tabs.splice(idx, 1);
  if (id === activeId) {
    const next = tabs[Math.min(idx, tabs.length - 1)];
    activeId = next.id;
    startProgress();
    crossfade(() => { pageFrame.src = next.src; syncUrlBar(); updateNavBtns(); });
  }
  renderTabCards(); updateTabCount();
}

function newTab() {
  const tab = { id: nextId++, title: 'New Tab', url: 'google.com', src: 'pages/home.html', hist: ['pages/home.html'], hi: 0 };
  tabs.push(tab);
  activeId = tab.id;
  updateTabCount();
  startProgress();
  crossfade(() => { pageFrame.src = tab.src; syncUrlBar(); updateNavBtns(); });
  hideTabs();
}

/* ── SHARE ───────────────────────────────────────────── */
function showShare() {
  updateShare();
  shareSheet.classList.add('show');
  shareBackdrop.classList.add('show');
}
function hideShare() {
  shareSheet.classList.remove('show');
  shareBackdrop.classList.remove('show');
}

/* ── BOOKMARKS ───────────────────────────────────────── */
function showBookmarks() {
  renderBkList('bk');
  bkSheet.classList.add('show');
  bkBackdrop.classList.add('show');
}
function hideBookmarks() {
  bkSheet.classList.remove('show');
  bkBackdrop.classList.remove('show');
}

function bkSeg(btn, type) {
  document.querySelectorAll('.bk-seg-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderBkList(type);
}

function renderBkList(type) {
  let items = [];
  if (type === 'bk') {
    items = BOOKMARKS_DATA.map(b => ({ emoji: b.emoji, name: b.name, url: b.url }));
  } else if (type === 'rl') {
    items = [{ emoji: '📚', name: 'No items in Reading List', url: null }];
  } else {
    const tab = activeTab();
    items = (tab?.hist || []).slice().reverse().map(src => ({ emoji: '🕐', name: titleFrom(src), url: src }));
  }
  bkList.innerHTML = items.map(item => `
    <div class="bk-item" onclick="${item.url ? `bkNav('${item.url}')` : ''}">
      <div class="bk-item-icon">${item.emoji}</div>
      <div>
        <div class="bk-item-name">${item.name}</div>
        ${item.url ? `<div class="bk-item-url">${item.url}</div>` : ''}
      </div>
    </div>`).join('');
}

function bkNav(url) {
  hideBookmarks();
  setTimeout(() => navigate(url), 220);
}

/* ── DARK MODE ───────────────────────────────────────── */
function toggleDark() {
  isDark = !isDark;
  document.documentElement.toggleAttribute('data-dark', isDark);
  moonIcon.style.display = isDark ? 'none' : 'block';
  sunIcon.style.display  = isDark ? 'block' : 'none';
}

/* ── INTER-FRAME MESSAGES ────────────────────────────── */
window.addEventListener('message', e => {
  if (e.data?.type === 'navigate') navigate(e.data.url);
  if (e.data?.type === 'focusUrl') activateUrl();
});

/* ── SEARCH PAGE HTML ────────────────────────────────── */
function searchHTML(q) {
  const results = [
    { title: `${q} — Wikipedia`, url: `en.wikipedia.org/wiki/${q}`, desc: `${q} is described in detail on Wikipedia, the free encyclopedia.` },
    { title: `${q}: Latest News & Updates`, url: `news.google.com/search?q=${q}`, desc: `Read the latest news stories and updates about ${q} from top publications.` },
    { title: `Understanding ${q} — A Complete Guide`, url: `guide.example.com/${q}`, desc: `Everything you need to know about ${q}, explained clearly from beginner to advanced.` },
    { title: `${q} — Official Site`, url: `${q.toLowerCase().replace(/\s+/g,'')}.com`, desc: `The official website for ${q}. Find resources, documentation, and more.` },
    { title: `${q} Discussion — Community Forum`, url: `reddit.com/search?q=${q}`, desc: `Join thousands of people discussing ${q} in our active community forums.` },
  ];
  return `<!DOCTYPE html><html><head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:-apple-system,sans-serif;background:#f2f2f7;min-height:100vh;color:#1c1c1e}
    .header{background:#fff;padding:14px 16px;border-bottom:1px solid rgba(0,0,0,.08);position:sticky;top:0;z-index:5}
    .g-logo{font-size:22px;font-weight:700;letter-spacing:-0.5px;margin-bottom:10px}
    .g-logo .g{color:#4285f4}.g-logo .o1{color:#ea4335}.g-logo .o2{color:#fbbc05}.g-logo .gl{color:#34a853}.g-logo .e{color:#ea4335}
    .search-box{background:#f1f3f4;border-radius:24px;padding:10px 16px;display:flex;align-items:center;gap:10px;font-size:15px;color:#1c1c1e}
    .search-box svg{width:18px;height:18px;color:#5f6368;flex-shrink:0}
    .count{font-size:12px;color:#70757a;padding:12px 16px 4px}
    .result{background:#fff;margin:8px 12px;border-radius:12px;padding:14px 16px;box-shadow:0 1px 3px rgba(0,0,0,.08);cursor:pointer}
    .result:active{background:#f8f8f8}
    .res-url{font-size:12px;color:#202124;opacity:.7;margin-bottom:4px;display:flex;align-items:center;gap:6px}
    .res-favicon{width:16px;height:16px;background:#e8eaed;border-radius:3px;display:flex;align-items:center;justify-content:center;font-size:10px}
    .res-title{font-size:17px;color:#1a0dab;font-weight:500;margin-bottom:5px;line-height:1.3}
    .res-desc{font-size:14px;color:#4d5156;line-height:1.5}
  </style></head>
  <body>
  <div class="header">
    <div class="g-logo"><span class="g">G</span><span class="o1">o</span><span class="o2">o</span><span class="gl">g</span><span class="e">l</span><span class="g">e</span></div>
    <div class="search-box">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
      ${q}
    </div>
  </div>
  <div class="count">About 1,240,000,000 results (0.52 seconds)</div>
  ${results.map(r => `
    <div class="result">
      <div class="res-url"><div class="res-favicon">🌐</div>${r.url}</div>
      <div class="res-title">${r.title}</div>
      <div class="res-desc">${r.desc}</div>
    </div>`).join('')}
  </body></html>`;
}

function externalHTML(url) {
  return `<!DOCTYPE html><html><head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    body{font-family:-apple-system,sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:80vh;background:#f2f2f7;color:#1c1c1e;text-align:center;padding:32px;gap:14px}
    .icon{font-size:54px}
    h2{font-size:21px;font-weight:700}
    p{font-size:15px;color:#6c6c70;max-width:270px;line-height:1.5}
    .badge{background:rgba(118,118,128,.12);border-radius:10px;padding:8px 14px;font-size:13px;color:#3c3c43;word-break:break-all;max-width:100%}
  </style></head>
  <body>
    <div class="icon">🔒</div>
    <h2>Cannot Open Page</h2>
    <p>Safari cannot connect to the server at this address.</p>
    <div class="badge">${url}</div>
  </body></html>`;
}

/* ── KEYBOARD ────────────────────────────────────────── */
document.addEventListener('keydown', e => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'l') { e.preventDefault(); activateUrl(); }
  if (e.key === 'Escape') {
    deactivateUrl();
    hideTabs();
    hideShare();
    hideBookmarks();
  }
});

/* ── INIT ────────────────────────────────────────────── */
(function init() {
  syncUrlBar();
  updateNavBtns();
  updateTabCount();
  updateShare();
  backBtn.classList.add('dim');
  fwdBtn.classList.add('dim');
})();
