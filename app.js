/* ═══════════════════════════════════════════════════
   iOS Safari Simulator — app.js
   ═══════════════════════════════════════════════════ */

'use strict';

/* ─── LOCAL PAGE ROUTING ─────────────────────────── */
const LOCAL_PAGES = {
  'home':      'pages/home.html',
  'safari://home': 'pages/home.html',
  'news':      'pages/page1.html',
  'article':   'pages/page1.html',
  'page1':     'pages/page1.html',
  'settings':  'pages/page2.html',
  'page2':     'pages/page2.html',
  'about':     'pages/page2.html',
};

const SUGGESTIONS = [
  { title: 'Home',     url: 'safari://home',     icon: 'home' },
  { title: 'News Article', url: 'news',          icon: 'globe' },
  { title: 'Settings',     url: 'settings',      icon: 'settings' },
];

const BOOKMARKS = [
  { title: 'Home',         url: 'safari://home', emoji: '🏠' },
  { title: 'Top Stories',  url: 'news',          emoji: '📰' },
  { title: 'Settings',     url: 'settings',      emoji: '⚙️' },
];

/* ─── STATE ───────────────────────────────────────── */
let tabs = [
  { id: 1, title: 'Home', url: 'safari://home', src: 'pages/home.html', history: ['pages/home.html'], historyIndex: 0 },
];
let activeTabId = 1;
let nextTabId   = 2;
let tabViewOpen = false;
let isDark      = false;

/* ─── DOM REFS ────────────────────────────────────── */
const $  = id => document.getElementById(id);
const statusTime      = $('statusTime');
const urlDisplay      = $('urlDisplay');
const urlText         = $('urlText');
const urlInput        = $('urlInput');
const urlSuggestions  = $('urlSuggestions');
const pageFrame       = $('pageFrame');
const transitionOverlay = $('transitionOverlay');
const progressFill    = $('progressFill');
const tabsCount       = $('tabsCount');
const tabViewOverlay  = $('tabViewOverlay');
const tabCardsGrid    = $('tabCardsGrid');
const backBtn         = $('backBtn');
const fwdBtn          = $('fwdBtn');
const shareSheet      = $('shareSheet');
const shareSheetBg    = $('shareSheetBg');
const shareTitle      = $('shareTitle');
const shareUrl        = $('shareUrl');
const bookmarksPanel  = $('bookmarksPanel');
const bookmarksBg     = $('bookmarksBg');
const bookmarksList   = $('bookmarksList');
const darkIcon        = $('darkIcon');
const lightIcon       = $('lightIcon');

/* ─── STATUS BAR CLOCK ────────────────────────────── */
function updateClock() {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes().toString().padStart(2, '0');
  statusTime.textContent = `${h}:${m}`;
}
updateClock();
setInterval(updateClock, 10000);

/* ─── ACTIVE TAB HELPERS ──────────────────────────── */
function getActiveTab() {
  return tabs.find(t => t.id === activeTabId);
}

function resolveUrl(raw) {
  const trimmed = raw.trim();
  if (!trimmed) return { src: 'pages/home.html', display: 'safari://home', title: 'Home' };

  // Check local pages map
  const key = trimmed.toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');
  if (LOCAL_PAGES[key]) {
    const src = LOCAL_PAGES[key];
    return { src, display: trimmed, title: pageTitleFromSrc(src) };
  }
  // Check partial match
  for (const [k, src] of Object.entries(LOCAL_PAGES)) {
    if (key.includes(k) || k.includes(key)) {
      return { src, display: trimmed, title: pageTitleFromSrc(src) };
    }
  }
  // Looks like URL?
  if (trimmed.includes('.') && !trimmed.includes(' ')) {
    return { src: 'pages/home.html', display: trimmed, title: trimmed, external: true };
  }
  // Search query
  const q = encodeURIComponent(trimmed);
  return { src: `pages/search.html?q=${q}`, display: `Search: ${trimmed}`, title: `"${trimmed}" — Search`, isSearch: true, query: trimmed };
}

function pageTitleFromSrc(src) {
  if (src.includes('home'))   return 'Home';
  if (src.includes('page1'))  return 'Top Stories';
  if (src.includes('page2'))  return 'Settings';
  return 'Safari';
}

/* ─── NAVIGATION ──────────────────────────────────── */
function navigateTo(urlRaw, skipHistory = false) {
  const tab = getActiveTab();
  if (!tab) return;

  const resolved = resolveUrl(urlRaw);

  // Handle external navigation simulation
  if (resolved.external) {
    showExternalNotice(resolved.display);
    return;
  }

  startProgress();
  showTransition(() => {
    if (resolved.isSearch) {
      renderSearchPage(resolved.query);
    } else {
      pageFrame.src = resolved.src;
    }
    tab.url   = resolved.display;
    tab.title = resolved.title;

    if (!skipHistory) {
      tab.history = tab.history.slice(0, tab.historyIndex + 1);
      tab.history.push(resolved.src);
      tab.historyIndex = tab.history.length - 1;
    }

    urlText.textContent = formatUrlDisplay(resolved.display);
    shareTitle.textContent = resolved.title;
    shareUrl.textContent   = resolved.display;
    updateNavButtons();
  });
}

function formatUrlDisplay(url) {
  return url.replace(/^https?:\/\//, '').replace(/^safari:\/\//, '');
}

function showExternalNotice(url) {
  // Simulate "cannot load" — load home with message overlay
  const tab = getActiveTab();
  tab.url = url;
  tab.title = url;
  urlText.textContent = formatUrlDisplay(url);
  startProgress();
  showTransition(() => {
    pageFrame.contentDocument?.open();
    pageFrame.contentDocument?.write(externalPageHTML(url));
    pageFrame.contentDocument?.close();
  });
}

function externalPageHTML(url) {
  return `<!DOCTYPE html><html>
  <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    body{font-family:-apple-system,sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:80vh;background:#f2f2f7;color:#1c1c1e;text-align:center;padding:24px;gap:16px;}
    .icon{font-size:56px;}
    h2{font-size:20px;font-weight:700;}
    p{font-size:15px;color:#6c6c70;max-width:280px;}
    .url{background:#e5e5ea;border-radius:8px;padding:8px 14px;font-size:13px;color:#3c3c43;word-break:break-all;}
  </style></head>
  <body>
    <div class="icon">🔒</div>
    <h2>Cannot Open Page</h2>
    <p>Safari cannot open the page because it is not connected to the internet.</p>
    <div class="url">${url}</div>
  </body></html>`;
}

function renderSearchPage(query) {
  const html = searchPageHTML(query);
  pageFrame.contentDocument?.open();
  pageFrame.contentDocument?.write(html);
  pageFrame.contentDocument?.close();
}

function searchPageHTML(query) {
  const results = [
    { title: `${query} - Wikipedia`, url: `en.wikipedia.org/wiki/${query}`, desc: `Learn about ${query} on Wikipedia, the free encyclopedia.` },
    { title: `${query} - Latest News`, url: `news.example.com/search?q=${query}`, desc: `Breaking news and latest updates about ${query}.` },
    { title: `Buy ${query} - Online Store`, url: `shop.example.com/${query}`, desc: `Find great deals on ${query}. Free shipping on orders over $50.` },
    { title: `${query} Tutorial for Beginners`, url: `learn.example.com/${query}`, desc: `Step by step guide to understanding ${query} from scratch.` },
    { title: `${query} Forum & Community`, url: `forum.example.com/t/${query}`, desc: `Join the discussion about ${query} with thousands of others.` },
  ];

  const items = results.map(r => `
    <div class="result">
      <div class="result-source">${r.url}</div>
      <div class="result-title">${r.title}</div>
      <div class="result-desc">${r.desc}</div>
    </div>
  `).join('');

  return `<!DOCTYPE html><html>
  <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:-apple-system,sans-serif;background:#f2f2f7;color:#1c1c1e;min-height:100vh;}
    .search-header{background:#fff;padding:16px;border-bottom:1px solid rgba(0,0,0,.1);}
    .search-bar{background:#e5e5ea;border-radius:10px;padding:10px 14px;font-size:15px;color:#1c1c1e;display:flex;align-items:center;gap:8px;}
    .search-bar span{color:#8e8e93;font-size:14px;}
    .search-query-text{font-weight:500;}
    .results-info{padding:12px 16px;font-size:13px;color:#6c6c70;}
    .result{background:#fff;margin:0 12px 10px;border-radius:12px;padding:14px 16px;box-shadow:0 1px 3px rgba(0,0,0,.08);}
    .result-source{font-size:12px;color:#34c759;margin-bottom:3px;}
    .result-title{font-size:16px;color:#007aff;font-weight:600;margin-bottom:5px;}
    .result-desc{font-size:14px;color:#3c3c43;line-height:1.5;}
  </style></head>
  <body>
    <div class="search-header">
      <div class="search-bar">
        <span>🔍</span>
        <span class="search-query-text">${query}</span>
      </div>
    </div>
    <div class="results-info">About 142,000,000 results (0.48 seconds)</div>
    ${items}
  </body></html>`;
}

function goBack() {
  const tab = getActiveTab();
  if (!tab || tab.historyIndex <= 0) return;
  tab.historyIndex--;
  const src = tab.history[tab.historyIndex];
  startProgress();
  showTransition(() => {
    pageFrame.src = src;
    tab.title = pageTitleFromSrc(src);
    tab.url   = src;
    urlText.textContent = formatUrlDisplay(src);
    updateNavButtons();
  }, 'back');
}

function goForward() {
  const tab = getActiveTab();
  if (!tab || tab.historyIndex >= tab.history.length - 1) return;
  tab.historyIndex++;
  const src = tab.history[tab.historyIndex];
  startProgress();
  showTransition(() => {
    pageFrame.src = src;
    tab.title = pageTitleFromSrc(src);
    tab.url   = src;
    urlText.textContent = formatUrlDisplay(src);
    updateNavButtons();
  }, 'fwd');
}

function refreshPage() {
  startProgress();
  showTransition(() => {
    pageFrame.src = pageFrame.src;
  });
}

function updateNavButtons() {
  const tab = getActiveTab();
  backBtn.classList.toggle('disabled', !tab || tab.historyIndex <= 0);
  fwdBtn.classList.toggle('disabled',  !tab || tab.historyIndex >= tab.history.length - 1);
}

/* ─── TRANSITION & PROGRESS ──────────────────────── */
function showTransition(callback, direction = 'fwd') {
  transitionOverlay.classList.add('active');
  setTimeout(() => {
    callback();
    setTimeout(() => {
      transitionOverlay.classList.remove('active');
    }, 80);
  }, 100);
}

function startProgress() {
  progressFill.style.transition = 'none';
  progressFill.style.width = '0%';
  progressFill.style.opacity = '1';
  requestAnimationFrame(() => {
    progressFill.style.transition = 'width 1.4s cubic-bezier(0.4,0,0.6,1)';
    progressFill.style.width = '88%';
  });
  setTimeout(finishProgress, 800);
}

function finishProgress() {
  progressFill.style.transition = 'width 0.2s ease, opacity 0.4s ease';
  progressFill.style.width = '100%';
  setTimeout(() => {
    progressFill.style.opacity = '0';
    setTimeout(() => { progressFill.style.width = '0%'; }, 400);
  }, 200);
}

/* ─── URL BAR ─────────────────────────────────────── */
function activateUrlBar() {
  document.body.classList.add('url-active');
  const tab = getActiveTab();
  urlInput.value = tab ? (tab.url === 'safari://home' ? '' : tab.url) : '';
  urlInput.focus();
  urlInput.select();
  showSuggestions('');
}

function deactivateUrlBar() {
  document.body.classList.remove('url-active');
  urlInput.blur();
  hideSuggestions();
}

function handleUrlKeydown(e) {
  if (e.key === 'Enter') {
    const val = urlInput.value.trim();
    deactivateUrlBar();
    if (val) navigateTo(val);
    else navigateTo('safari://home');
  }
  if (e.key === 'Escape') {
    deactivateUrlBar();
  }
}

function handleUrlInput(val) {
  showSuggestions(val);
}

/* ─── SUGGESTIONS ─────────────────────────────────── */
function showSuggestions(query) {
  const q = query.toLowerCase();
  const matches = q
    ? SUGGESTIONS.filter(s =>
        s.title.toLowerCase().includes(q) ||
        s.url.toLowerCase().includes(q)
      )
    : SUGGESTIONS;

  if (!matches.length && q) {
    // Show search suggestion
    const html = `
      <div class="suggestion-item" onclick="pickSuggestion('${encodeURIComponent(query)}', true)">
        <div class="suggestion-icon">${svgSearch()}</div>
        <div class="suggestion-text">
          <div class="suggestion-title">Search for "<strong>${query}</strong>"</div>
          <div class="suggestion-sub">Google Search</div>
        </div>
      </div>`;
    urlSuggestions.innerHTML = html;
  } else {
    urlSuggestions.innerHTML = matches.map(s => `
      <div class="suggestion-item" onclick="pickSuggestion('${s.url}', false)">
        <div class="suggestion-icon">${iconForSugg(s.icon)}</div>
        <div class="suggestion-text">
          <div class="suggestion-title">${s.title}</div>
          <div class="suggestion-sub">${s.url}</div>
        </div>
      </div>
    `).join('');
  }
  urlSuggestions.classList.add('visible');
}

function hideSuggestions() {
  urlSuggestions.classList.remove('visible');
}

function pickSuggestion(urlEncoded, isSearch) {
  const url = decodeURIComponent(urlEncoded);
  deactivateUrlBar();
  navigateTo(isSearch ? url : url);
}

function svgSearch() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>`;
}

function iconForSugg(type) {
  const icons = {
    home:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
    globe:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/></svg>`,
    settings: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>`,
  };
  return icons[type] || icons.globe;
}

/* ─── TAB SYSTEM ──────────────────────────────────── */
function toggleTabView() {
  tabViewOpen = !tabViewOpen;
  if (tabViewOpen) {
    renderTabCards();
    tabViewOverlay.classList.add('visible');
  } else {
    tabViewOverlay.classList.remove('visible');
  }
}

function renderTabCards() {
  tabCardsGrid.innerHTML = '';
  tabs.forEach((tab, idx) => {
    const card = document.createElement('div');
    card.className = 'tab-card' + (tab.id === activeTabId ? ' active-tab' : '');
    card.style.animationDelay = `${idx * 0.04}s`;
    card.innerHTML = `
      <button class="tab-card-close" onclick="closeTab(event, ${tab.id})" title="Close tab">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
      <div class="tab-card-thumb">
        <iframe src="${tab.src}" tabindex="-1" aria-hidden="true"></iframe>
      </div>
      <div class="tab-card-footer">
        <div class="tab-card-title">${tab.title}</div>
        <div class="tab-card-url">${formatUrlDisplay(tab.url)}</div>
      </div>
    `;
    card.addEventListener('click', () => switchTab(tab.id));
    tabCardsGrid.appendChild(card);
  });
}

function switchTab(id) {
  if (id === activeTabId) {
    toggleTabView();
    return;
  }
  activeTabId = id;
  const tab = getActiveTab();
  startProgress();
  showTransition(() => {
    pageFrame.src = tab.src;
    urlText.textContent = formatUrlDisplay(tab.url);
    shareTitle.textContent = tab.title;
    shareUrl.textContent   = tab.url;
    updateNavButtons();
  });
  toggleTabView();
}

function addNewTab() {
  const newTab = {
    id: nextTabId++,
    title: 'New Tab',
    url: 'safari://home',
    src: 'pages/home.html',
    history: ['pages/home.html'],
    historyIndex: 0,
  };
  tabs.push(newTab);
  activeTabId = newTab.id;
  updateTabCount();

  startProgress();
  showTransition(() => {
    pageFrame.src = newTab.src;
    urlText.textContent = 'Home';
    updateNavButtons();
  });
  toggleTabView();
}

function closeTab(e, id) {
  e.stopPropagation();
  if (tabs.length === 1) {
    // Replace with fresh home
    tabs[0] = { id: 1, title: 'Home', url: 'safari://home', src: 'pages/home.html', history: ['pages/home.html'], historyIndex: 0 };
    activeTabId = 1;
    nextTabId = 2;
    renderTabCards();
    updateTabCount();
    return;
  }
  const idx = tabs.findIndex(t => t.id === id);
  tabs.splice(idx, 1);

  if (id === activeTabId) {
    const newActive = tabs[Math.min(idx, tabs.length - 1)];
    activeTabId = newActive.id;
    startProgress();
    showTransition(() => {
      pageFrame.src = newActive.src;
      urlText.textContent = formatUrlDisplay(newActive.url);
      updateNavButtons();
    });
  }
  updateTabCount();
  renderTabCards();
}

function updateTabCount() {
  const n = tabs.length;
  tabsCount.textContent = n > 99 ? '∞' : n;
}

/* ─── SHARE SHEET ─────────────────────────────────── */
function showShareSheet() {
  shareSheet.classList.add('visible');
  shareSheetBg.classList.add('visible');
}

function hideShareSheet() {
  shareSheet.classList.remove('visible');
  shareSheetBg.classList.remove('visible');
}

/* ─── BOOKMARKS ───────────────────────────────────── */
function toggleBookmarks() {
  const isVisible = bookmarksPanel.classList.contains('visible');
  if (isVisible) {
    bookmarksPanel.classList.remove('visible');
    bookmarksBg.classList.remove('visible');
  } else {
    renderBookmarks('bk');
    bookmarksPanel.classList.add('visible');
    bookmarksBg.classList.add('visible');
  }
}

function switchBkTab(btn, type) {
  document.querySelectorAll('.bk-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderBookmarks(type);
}

function renderBookmarks(type) {
  let items = [];
  if (type === 'bk') {
    items = BOOKMARKS.map(b => ({
      icon: b.emoji,
      title: b.title,
      url: b.url,
      isEmoji: true,
    }));
  } else if (type === 'rl') {
    items = [
      { icon: '📖', title: 'Reading List is Empty', url: null, isEmoji: true, disabled: true },
    ];
  } else {
    // History
    const tab = getActiveTab();
    items = (tab?.history || []).map((src, i) => ({
      icon: '🕐',
      title: pageTitleFromSrc(src),
      url: src,
      isEmoji: true,
    })).reverse();
  }

  bookmarksList.innerHTML = items.map(item => `
    <div class="bookmark-item" onclick="${item.url ? `navigateFromBookmark('${item.url}')` : ''}">
      <div class="bookmark-item-icon">${item.icon}</div>
      <div class="bookmark-item-info">
        <div class="bookmark-item-title">${item.title}</div>
        ${item.url ? `<div class="bookmark-item-url">${formatUrlDisplay(item.url)}</div>` : ''}
      </div>
    </div>
  `).join('');
}

function navigateFromBookmark(url) {
  toggleBookmarks();
  setTimeout(() => navigateTo(url), 200);
}

/* ─── DARK MODE ───────────────────────────────────── */
function toggleDarkMode() {
  isDark = !isDark;
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : '');
  darkIcon.style.display  = isDark ? 'none'  : 'block';
  lightIcon.style.display = isDark ? 'block' : 'none';
}

/* ─── INTER-FRAME MESSAGING ───────────────────────── */
window.addEventListener('message', (e) => {
  if (e.data?.type === 'navigate') {
    navigateTo(e.data.url);
  }
  if (e.data?.type === 'setTitle') {
    const tab = getActiveTab();
    if (tab) tab.title = e.data.title;
    urlText.textContent = e.data.title;
  }
});

/* ─── KEYBOARD SHORTCUT ───────────────────────────── */
document.addEventListener('keydown', (e) => {
  if (e.key === 'l' && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    activateUrlBar();
  }
  if (e.key === 'Escape') {
    if (document.body.classList.contains('url-active')) deactivateUrlBar();
    if (tabViewOpen) toggleTabView();
    hideShareSheet();
    if (bookmarksPanel.classList.contains('visible')) toggleBookmarks();
  }
});

/* ─── INIT ────────────────────────────────────────── */
(function init() {
  updateNavButtons();
  updateTabCount();
  backBtn.classList.add('disabled');
  fwdBtn.classList.add('disabled');
})();
