/**
 * script.js
 * Safari iOS 26 Simulator - Complete JavaScript
 * 
 * Based on iOS 26 Safari features:
 * - Liquid Glass design with translucent elements [citation:1]
 * - Compact layout with gestures (swipe on URL bar to switch tabs) [citation:2]
 * - Three toolbar modes: Compact, Bottom, Top [citation:3]
 * - Tab management with card view [citation:7]
 * - Private browsing mode [citation:7]
 * - Collapsible toolbar on scroll [citation:1]
 * 
 * References:
 * - MacRumors: iOS 26 Safari Features Guide [citation:1]
 * - 9to5Mac: iOS 26 Safari toolbar design [citation:2]
 * - MacRumors: Restore Safari's old layout [citation:3]
 * - MacObserver: Safari Tabs in iOS 26 [citation:7]
 */

(function() {
    'use strict';

    // ============================================
    // STATE
    // ============================================

    const state = {
        // Tabs
        tabs: [
            { id: 'tab-1', title: 'Google', url: 'google.com', isActive: true }
        ],
        activeTabIndex: 0,
        tabCount: 1,
        
        // Private browsing
        isPrivate: false,
        
        // Tab view
        isTabViewOpen: false,
        
        // Current page
        currentPage: 'google', // 'google' | 'search' | 'website'
        currentUrl: 'google.com',
        searchQuery: '',
        
        // History (for back/forward)
        history: ['google.com'],
        historyIndex: 0,
        
        // UI state
        isSearching: false,
        isTyping: false,
        
        // Toolbar layout: 'compact' | 'bottom' | 'top'
        toolbarLayout: 'compact',
        
        // Toolbar collapsed state (for scroll)
        isToolbarCollapsed: false
    };

    // ============================================
    // DOM CACHE
    // ============================================

    const DOM = {
        // Status bar
        statusTime: null,
        
        // Google page
        googlePage: null,
        searchInput: null,
        micBtn: null,
        cameraBtn: null,
        trendingItems: null,
        trendingContainer: null,
        
        // Bottom toolbar (Compact layout)
        toolbarCompact: null,
        compactBackBtn: null,
        compactForwardBtn: null,
        compactTabsBtn: null,
        compactMoreBtn: null,
        compactUrlBar: null,
        compactTabBadge: null,
        
        // Bottom toolbar (Bottom layout - iOS 18 style)
        toolbarBottom: null,
        bottomBackBtn: null,
        bottomForwardBtn: null,
        bottomShareBtn: null,
        bottomBookmarksBtn: null,
        bottomTabsBtn: null,
        bottomUrlBar: null,
        bottomTabBadge: null,
        
        // Top toolbar (Top layout)
        toolbarTop: null,
        topUrlBar: null,
        topBackBtn: null,
        topForwardBtn: null,
        topShareBtn: null,
        topBookmarksBtn: null,
        topTabsBtn: null,
        topTabBadge: null,
        
        // Tab view (overlay)
        tabView: null,
        tabViewOverlay: null,
        tabCardsContainer: null,
        tabViewCloseBtn: null,
        tabViewPrivateToggle: null,
        tabViewNewTabBtn: null,
        tabViewTabCount: null,
        
        // More menu (Compact layout)
        moreMenu: null,
        moreMenuOverlay: null,
        
        // Search results
        searchResultsPage: null,
        resultsContainer: null
    };

    // ============================================
    // SEARCH DATA (Mock results)
    // ============================================

    const searchData = {
        'venezuela earthquakes': [
            { title: 'Venezuela earthquake: 6.5 magnitude strikes near Caracas', url: 'https://www.bbc.com/news/world-latin-america-1234567', description: 'A powerful earthquake with a magnitude of 6.5 has struck near the Venezuelan capital, Caracas, causing buildings to shake across the region.' },
            { title: 'Venezuela earthquake latest news and updates', url: 'https://www.reuters.com/world/americas/venezuela-earthquake-2026-1234567', description: 'Follow live updates on the earthquake that hit Venezuela, including damage reports, aftershocks, and government response.' },
            { title: 'Earthquake in Venezuela - USGS report', url: 'https://earthquake.usgs.gov/earthquakes/eventpage/venezuela2026', description: 'USGS earthquake report for the Venezuela seismic event. Magnitude, depth, location, and shake maps available.' }
        ],
        'gta vi pre orders': [
            { title: 'GTA VI pre-orders now open - official Rockstar announcement', url: 'https://www.rockstargames.com/gta-vi/preorder', description: 'Grand Theft Auto VI is now available for pre-order. Coming to PlayStation 5, Xbox Series X|S, and PC in 2026.' },
            { title: 'GTA VI pre-order: Editions, bonuses, and prices', url: 'https://www.ign.com/articles/gta-6-preorder-guide', description: 'Complete guide to GTA VI pre-orders including Standard, Deluxe, and Collector\'s Editions with exclusive bonuses.' },
            { title: 'Where to pre-order GTA VI - Best deals and offers', url: 'https://www.gamespot.com/articles/gta-6-pre-order-guide/1100-6543210/', description: 'Compare prices and pre-order bonuses for GTA VI across major retailers including Amazon, Best Buy, and GameStop.' }
        ],
        'deltarune chapter 5 secret boss': [
            { title: 'Deltarune Chapter 5 Secret Boss: Complete Guide', url: 'https://www.gamerant.com/deltarune-chapter-5-secret-boss-guide', description: 'A complete guide to finding and defeating the secret boss in Deltarune Chapter 5. Includes location, strategy, and rewards.' },
            { title: 'Deltarune Chapter 5 Easter eggs and secrets', url: 'https://www.polygon.com/deltarune-chapter-5-secrets', description: 'Every secret and easter egg in Deltarune Chapter 5, including hidden dialogue and alternate paths.' }
        ],
        'slate trucks': [
            { title: 'Slate Trucks - Electric truck lineup for 2026', url: 'https://www.slatetrucks.com/2026-lineup', description: 'Slate Trucks announces their 2026 electric truck lineup with extended range and advanced towing capabilities.' },
            { title: 'Slate Trucks review: The new standard in electric pickups', url: 'https://www.caranddriver.com/reviews/slate-trucks-2026', description: 'In-depth review of the 2026 Slate Trucks electric pickup. Range, performance, interior, and price.' }
        ]
    };

    // ============================================
    // INITIALIZATION
    // ============================================

    function init() {
        console.log('🧭 Safari iOS 26 Simulator starting...');
        
        // Cache DOM elements
        cacheDOM();
        
        // Update status bar time
        updateStatusBarTime();
        setInterval(updateStatusBarTime, 30000);
        
        // Set up tab count badge
        updateTabBadge();
        
        // Set up initial UI
        updateToolbarLayout('compact');
        
        // Bind events
        bindEvents();
        
        // Populate trending searches
        populateTrendingSearches();
        
        console.log('✅ Safari iOS 26 Simulator ready!');
        console.log('📱 Features: Liquid Glass design, Compact layout, Gesture support, Tab management');
        console.log('💡 Tips:');
        console.log('  - Swipe up on toolbar to open tab view');
        console.log('  - Swipe left/right on URL bar to switch tabs');
        console.log('  - Long press back button for history');
        console.log('  - Press "T" for new tab, "P" for private mode');
    }

    // ============================================
    // DOM CACHING
    // ============================================

    function cacheDOM() {
        // Status bar
        DOM.statusTime = document.getElementById('statusTime');
        
        // Google page
        DOM.googlePage = document.getElementById('googlePage');
        DOM.searchInput = document.getElementById('searchInput');
        DOM.micBtn = document.getElementById('micBtn');
        DOM.cameraBtn = document.getElementById('cameraBtn');
        DOM.trendingItems = document.querySelectorAll('.trending-item');
        DOM.trendingContainer = document.querySelector('.trending-section');
        
        // Search results
        DOM.searchResultsPage = document.getElementById('searchResultsPage');
        DOM.resultsContainer = document.getElementById('resultsContainer');
        
        // Compact toolbar
        DOM.toolbarCompact = document.querySelector('.toolbar-compact');
        DOM.compactBackBtn = document.getElementById('compactBackBtn');
        DOM.compactForwardBtn = document.getElementById('compactForwardBtn');
        DOM.compactTabsBtn = document.getElementById('compactTabsBtn');
        DOM.compactMoreBtn = document.getElementById('compactMoreBtn');
        DOM.compactUrlBar = document.getElementById('compactUrlBar');
        DOM.compactTabBadge = document.getElementById('compactTabBadge');
        
        // Bottom toolbar
        DOM.toolbarBottom = document.querySelector('.toolbar-bottom');
        DOM.bottomBackBtn = document.getElementById('bottomBackBtn');
        DOM.bottomForwardBtn = document.getElementById('bottomForwardBtn');
        DOM.bottomShareBtn = document.getElementById('bottomShareBtn');
        DOM.bottomBookmarksBtn = document.getElementById('bottomBookmarksBtn');
        DOM.bottomTabsBtn = document.getElementById('bottomTabsBtn');
        DOM.bottomUrlBar = document.getElementById('bottomUrlBar');
        DOM.bottomTabBadge = document.getElementById('bottomTabBadge');
        
        // Top toolbar
        DOM.toolbarTop = document.querySelector('.toolbar-top');
        DOM.topUrlBar = document.getElementById('topUrlBar');
        DOM.topBackBtn = document.getElementById('topBackBtn');
        DOM.topForwardBtn = document.getElementById('topForwardBtn');
        DOM.topShareBtn = document.getElementById('topShareBtn');
        DOM.topBookmarksBtn = document.getElementById('topBookmarksBtn');
        DOM.topTabsBtn = document.getElementById('topTabsBtn');
        DOM.topTabBadge = document.getElementById('topTabBadge');
        
        // Tab view
        DOM.tabView = document.getElementById('tabView');
        DOM.tabViewOverlay = document.getElementById('tabViewOverlay');
        DOM.tabCardsContainer = document.getElementById('tabCardsContainer');
        DOM.tabViewCloseBtn = document.getElementById('tabViewCloseBtn');
        DOM.tabViewPrivateToggle = document.getElementById('tabViewPrivateToggle');
        DOM.tabViewNewTabBtn = document.getElementById('tabViewNewTabBtn');
        DOM.tabViewTabCount = document.getElementById('tabViewTabCount');
        
        // More menu
        DOM.moreMenu = document.getElementById('moreMenu');
        DOM.moreMenuOverlay = document.getElementById('moreMenuOverlay');
    }

    // ============================================
    // STATUS BAR
    // ============================================

    function updateStatusBarTime() {
        if (!DOM.statusTime) return;
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        DOM.statusTime.textContent = `${hours}:${minutes}`;
    }

    // ============================================
    // TOOLBAR LAYOUT
    // ============================================

    function updateToolbarLayout(layout) {
        state.toolbarLayout = layout;
        
        // Hide all toolbars
        if (DOM.toolbarCompact) DOM.toolbarCompact.classList.remove('active');
        if (DOM.toolbarBottom) DOM.toolbarBottom.classList.remove('active');
        if (DOM.toolbarTop) DOM.toolbarTop.classList.remove('active');
        
        // Show selected toolbar
        switch(layout) {
            case 'compact':
                if (DOM.toolbarCompact) DOM.toolbarCompact.classList.add('active');
                break;
            case 'bottom':
                if (DOM.toolbarBottom) DOM.toolbarBottom.classList.add('active');
                break;
            case 'top':
                if (DOM.toolbarTop) DOM.toolbarTop.classList.add('active');
                break;
        }
        
        // Update URL bars
        updateUrlBars();
    }

    function updateUrlBars() {
        const url = state.currentUrl;
        if (DOM.compactUrlBar) DOM.compactUrlBar.textContent = url;
        if (DOM.bottomUrlBar) DOM.bottomUrlBar.textContent = url;
        if (DOM.topUrlBar) DOM.topUrlBar.textContent = url;
    }

    function updateTabBadge() {
        const count = state.tabCount;
        const display = count > 99 ? '99+' : count;
        
        if (DOM.compactTabBadge) DOM.compactTabBadge.textContent = display;
        if (DOM.bottomTabBadge) DOM.bottomTabBadge.textContent = display;
        if (DOM.topTabBadge) DOM.topTabBadge.textContent = display;
        if (DOM.tabViewTabCount) DOM.tabViewTabCount.textContent = `${count} Tabs`;
    }

    function toggleToolbarCollapse(collapsed) {
        state.isToolbarCollapsed = collapsed;
        
        const toolbars = [DOM.toolbarCompact, DOM.toolbarBottom, DOM.toolbarTop];
        toolbars.forEach(toolbar => {
            if (toolbar) {
                toolbar.classList.toggle('collapsed', collapsed);
            }
        });
    }

    // ============================================
    // TAB MANAGEMENT
    // ============================================

    function addTab(url = 'google.com', title = 'New Tab') {
        const newTab = {
            id: `tab-${Date.now()}`,
            title: title,
            url: url,
            isActive: false
        };
        state.tabs.push(newTab);
        state.tabCount = state.tabs.length;
        state.activeTabIndex = state.tabs.length - 1;
        
        // Update UI
        updateTabBadge();
        updateUrlBars();
        
        // Update active states
        state.tabs.forEach((tab, index) => {
            tab.isActive = index === state.activeTabIndex;
        });
        
        // Load the tab
        loadTab(state.activeTabIndex);
        
        return newTab;
    }

    function closeTab(index) {
        if (state.tabs.length <= 1) {
            showToast('Cannot close last tab');
            return;
        }
        
        state.tabs.splice(index, 1);
        state.tabCount = state.tabs.length;
        
        if (state.activeTabIndex >= state.tabs.length) {
            state.activeTabIndex = state.tabs.length - 1;
        }
        
        state.tabs.forEach((tab, i) => {
            tab.isActive = i === state.activeTabIndex;
        });
        
        updateTabBadge();
        updateUrlBars();
        loadTab(state.activeTabIndex);
        
        // Update tab view if open
        if (state.isTabViewOpen) {
            renderTabCards();
        }
    }

    function switchTab(index) {
        if (index < 0 || index >= state.tabs.length) return;
        
        state.activeTabIndex = index;
        state.tabs.forEach((tab, i) => {
            tab.isActive = i === index;
        });
        
        updateTabBadge();
        updateUrlBars();
        loadTab(index);
        
        if (state.isTabViewOpen) {
            renderTabCards();
        }
    }

    function loadTab(index) {
        const tab = state.tabs[index];
        if (!tab) return;
        
        state.currentUrl = tab.url;
        state.currentPage = tab.url === 'google.com' ? 'google' : 'website';
        
        updateUrlBars();
        
        // Show/hide pages
        if (DOM.googlePage) {
            DOM.googlePage.style.display = state.currentPage === 'google' ? 'block' : 'none';
        }
        if (DOM.searchResultsPage) {
            DOM.searchResultsPage.style.display = state.currentPage === 'search' ? 'block' : 'none';
        }
        
        // Update search input
        if (DOM.searchInput && state.currentPage === 'google') {
            DOM.searchInput.value = '';
        }
    }

    // ============================================
    // TAB VIEW (Swipe up on toolbar to open) [citation:2][citation:5]
    // ============================================

    function openTabView() {
        if (state.isTabViewOpen) return;
        
        state.isTabViewOpen = true;
        renderTabCards();
        
        if (DOM.tabView) {
            DOM.tabView.classList.add('active');
        }
        if (DOM.tabViewOverlay) {
            DOM.tabViewOverlay.classList.add('active');
        }
    }

    function closeTabView() {
        if (!state.isTabViewOpen) return;
        
        state.isTabViewOpen = false;
        
        if (DOM.tabView) {
            DOM.tabView.classList.remove('active');
        }
        if (DOM.tabViewOverlay) {
            DOM.tabViewOverlay.classList.remove('active');
        }
    }

    function renderTabCards() {
        if (!DOM.tabCardsContainer) return;
        
        DOM.tabCardsContainer.innerHTML = '';
        
        state.tabs.forEach((tab, index) => {
            const card = document.createElement('div');
            card.className = `tab-card ${tab.isActive ? 'active' : ''}`;
            
            card.innerHTML = `
                <div class="tab-card-info">
                    <span class="tab-card-icon">${tab.isActive ? '●' : '○'}</span>
                    <span class="tab-card-title">${tab.title}</span>
                    <span class="tab-card-url">${tab.url}</span>
                </div>
                <button class="tab-card-close" data-index="${index}">✕</button>
            `;
            
            // Click to switch to tab
            card.addEventListener('click', function(e) {
                if (e.target.classList.contains('tab-card-close')) return;
                switchTab(index);
                closeTabView();
            });
            
            // Close button
            const closeBtn = card.querySelector('.tab-card-close');
            closeBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                closeTab(index);
            });
            
            DOM.tabCardsContainer.appendChild(card);
        });
    }

    // ============================================
    // PRIVATE BROWSING [citation:7]
    // ============================================

    function togglePrivateBrowsing() {
        state.isPrivate = !state.isPrivate;
        
        const container = document.querySelector('.iphone-screen');
        if (container) {
            if (state.isPrivate) {
                container.classList.add('private-mode');
                showToast('🔒 Private browsing activated');
            } else {
                container.classList.remove('private-mode');
                showToast('🔓 Private browsing deactivated');
            }
        }
        
        if (DOM.tabViewPrivateToggle) {
            DOM.tabViewPrivateToggle.textContent = state.isPrivate ? 'Private' : 'All';
            DOM.tabViewPrivateToggle.classList.toggle('active', state.isPrivate);
        }
    }

    // ============================================
    // MORE MENU (Compact layout) [citation:1][citation:2]
    // ============================================

    function toggleMoreMenu() {
        const isOpen = DOM.moreMenu && DOM.moreMenu.classList.contains('active');
        
        if (isOpen) {
            closeMoreMenu();
        } else {
            openMoreMenu();
        }
    }

    function openMoreMenu() {
        if (DOM.moreMenu) {
            DOM.moreMenu.classList.add('active');
        }
        if (DOM.moreMenuOverlay) {
            DOM.moreMenuOverlay.classList.add('active');
        }
    }

    function closeMoreMenu() {
        if (DOM.moreMenu) {
            DOM.moreMenu.classList.remove('active');
        }
        if (DOM.moreMenuOverlay) {
            DOM.moreMenuOverlay.classList.remove('active');
        }
    }

    // ============================================
    // SEARCH
    // ============================================

    function performSearch(query) {
        if (!query || query.trim() === '') return;
        
        state.searchQuery = query.trim().toLowerCase();
        state.currentPage = 'search';
        
        // Show search results page
        if (DOM.googlePage) DOM.googlePage.style.display = 'none';
        if (DOM.searchResultsPage) DOM.searchResultsPage.style.display = 'block';
        
        // Update URL bar
        state.currentUrl = `search?q=${encodeURIComponent(state.searchQuery)}`;
        updateUrlBars();
        
        // Find results
        const results = searchData[state.searchQuery] || [];
        
        if (DOM.resultsContainer) {
            if (results.length === 0) {
                DOM.resultsContainer.innerHTML = `
                    <div class="no-results">
                        <div class="no-results-icon">🔍</div>
                        <div class="no-results-title">No results found</div>
                        <div class="no-results-text">Try a different search term</div>
                    </div>
                `;
                return;
            }
            
            DOM.resultsContainer.innerHTML = results.map(result => `
                <div class="search-result" data-url="${result.url}">
                    <div class="search-result-title">${result.title}</div>
                    <div class="search-result-url">${result.url}</div>
                    <div class="search-result-desc">${result.description}</div>
                </div>
            `).join('');
            
            // Bind click events to results
            DOM.resultsContainer.querySelectorAll('.search-result').forEach(el => {
                el.addEventListener('click', function() {
                    const url = this.dataset.url;
                    const title = this.querySelector('.search-result-title').textContent;
                    navigateTo(url, title);
                });
            });
        }
    }

    function navigateTo(url, title = 'Website') {
        state.currentUrl = url;
        state.currentPage = 'website';
        updateUrlBars();
        
        // Update active tab
        const activeTab = state.tabs[state.activeTabIndex];
        if (activeTab) {
            activeTab.url = url;
            activeTab.title = title || url;
        }
        
        // Add to history
        state.history.push(url);
        state.historyIndex = state.history.length - 1;
        
        // Show/hide pages
        if (DOM.googlePage) DOM.googlePage.style.display = 'none';
        if (DOM.searchResultsPage) DOM.searchResultsPage.style.display = 'none';
        
        // Show website content
        const websiteContent = document.getElementById('websiteContent');
        if (websiteContent) {
            websiteContent.style.display = 'block';
            const websiteUrl = document.getElementById('websiteUrl');
            if (websiteUrl) websiteUrl.textContent = url;
            const websiteTitle = document.getElementById('websiteTitle');
            if (websiteTitle) websiteTitle.textContent = title || 'Website';
        }
        
        // Update back/forward buttons
        updateNavigationButtons();
        
        // Close tab view if open
        closeTabView();
    }

    function goBack() {
        if (state.historyIndex > 0) {
            state.historyIndex--;
            const url = state.history[state.historyIndex];
            navigateTo(url);
            updateNavigationButtons();
            showToast('◀ Back');
        }
    }

    function goForward() {
        if (state.historyIndex < state.history.length - 1) {
            state.historyIndex++;
            const url = state.history[state.historyIndex];
            navigateTo(url);
            updateNavigationButtons();
            showToast('▶ Forward');
        }
    }

    function updateNavigationButtons() {
        const backEnabled = state.historyIndex > 0;
        const forwardEnabled = state.historyIndex < state.history.length - 1;
        
        const backBtns = [
            DOM.compactBackBtn, DOM.bottomBackBtn, DOM.topBackBtn
        ];
        const forwardBtns = [
            DOM.compactForwardBtn, DOM.bottomForwardBtn, DOM.topForwardBtn
        ];
        
        backBtns.forEach(btn => {
            if (btn) {
                btn.disabled = !backEnabled;
                btn.style.opacity = backEnabled ? '1' : '0.3';
            }
        });
        forwardBtns.forEach(btn => {
            if (btn) {
                btn.disabled = !forwardEnabled;
                btn.style.opacity = forwardEnabled ? '1' : '0.3';
            }
        });
    }

    // ============================================
    // TRENDING SEARCHES
    // ============================================

    function populateTrendingSearches() {
        if (!DOM.trendingContainer) return;
        
        const searches = [
            'venezuela earthquakes',
            'gta vi pre orders',
            'deltarune chapter 5 secret boss',
            'slate trucks'
        ];
        
        // Add heading if not exists
        let heading = DOM.trendingContainer.querySelector('.trending-label');
        if (!heading) {
            heading = document.createElement('div');
            heading.className = 'trending-label';
            heading.textContent = 'Trending searches';
            DOM.trendingContainer.prepend(heading);
        }
        
        // Clear existing items (keep heading)
        const items = DOM.trendingContainer.querySelectorAll('.trending-item');
        items.forEach(item => item.remove());
        
        searches.forEach(search => {
            const item = document.createElement('div');
            item.className = 'trending-item';
            item.textContent = search;
            item.addEventListener('click', function() {
                if (DOM.searchInput) DOM.searchInput.value = this.textContent;
                performSearch(this.textContent);
            });
            DOM.trendingContainer.appendChild(item);
        });
    }

    // ============================================
    // SHARE SHEET (Simulated)
    // ============================================

    function openShareSheet() {
        const options = ['Messages', 'Mail', 'Copy Link', 'Add to Bookmarks', 'More'];
        // Simple alert for now - in a real implementation this would be a bottom sheet
        showToast('📤 Share sheet opened (simulated)');
        
        // Could expand to a full share sheet UI here
    }

    // ============================================
    // BOOKMARKS (Simulated)
    // ============================================

    function openBookmarks() {
        showToast('⭐ Bookmarks (simulated)');
    }

    // ============================================
    // TOAST NOTIFICATION
    // ============================================

    function showToast(message, duration = 2000) {
        // Remove existing toast
        const existing = document.querySelector('.toast-notification');
        if (existing) existing.remove();
        
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.textContent = message;
        Object.assign(toast.style, {
            position: 'absolute',
            bottom: '100px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            color: '#fff',
            padding: '10px 20px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '500',
            zIndex: '1000',
            maxWidth: '90%',
            textAlign: 'center',
            pointerEvents: 'none',
            animation: 'fadeIn 0.3s ease',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            border: '0.5px solid rgba(255,255,255,0.1)'
        });
        
        const screen = document.querySelector('.iphone-screen');
        if (screen) {
            screen.appendChild(toast);
        }
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    // ============================================
    // KEYBOARD SHORTCUTS
    // ============================================

    function handleKeyboardShortcuts(e) {
        // Don't trigger if typing in input
        if (e.target.tagName === 'INPUT') return;
        
        switch(e.key) {
            case 't':
            case 'T':
                e.preventDefault();
                addTab();
                showToast('📄 New tab opened');
                break;
            case 'w':
            case 'W':
                e.preventDefault();
                closeTab(state.activeTabIndex);
                break;
            case 'p':
            case 'P':
                e.preventDefault();
                togglePrivateBrowsing();
                break;
            case 'ArrowLeft':
                // Only if not in input
                if (document.activeElement?.tagName !== 'INPUT') {
                    e.preventDefault();
                    goBack();
                }
                break;
            case 'ArrowRight':
                if (document.activeElement?.tagName !== 'INPUT') {
                    e.preventDefault();
                    goForward();
                }
                break;
            case 'l':
            case 'L':
                e.preventDefault();
                if (DOM.searchInput) {
                    DOM.searchInput.focus();
                    DOM.searchInput.select();
                }
                break;
        }
    }

    // ============================================
    // EVENT BINDING
    // ============================================

    function bindEvents() {
        // ----- Search -----
        if (DOM.searchInput) {
            DOM.searchInput.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    performSearch(this.value);
                }
            });
        }
        
        // ----- Mic button -----
        if (DOM.micBtn) {
            DOM.micBtn.addEventListener('click', function() {
                showToast('🎤 Voice search (simulated)');
            });
        }
        
        // ----- Camera button -----
        if (DOM.cameraBtn) {
            DOM.cameraBtn.addEventListener('click', function() {
                showToast('📷 Camera search (simulated)');
            });
        }
        
        // ----- Compact toolbar -----
        if (DOM.compactBackBtn) {
            DOM.compactBackBtn.addEventListener('click', goBack);
        }
        if (DOM.compactForwardBtn) {
            DOM.compactForwardBtn.addEventListener('click', goForward);
        }
        if (DOM.compactTabsBtn) {
            DOM.compactTabsBtn.addEventListener('click', openTabView);
        }
        if (DOM.compactMoreBtn) {
            DOM.compactMoreBtn.addEventListener('click', toggleMoreMenu);
        }
        
        // ----- Bottom toolbar -----
        if (DOM.bottomBackBtn) {
            DOM.bottomBackBtn.addEventListener('click', goBack);
        }
        if (DOM.bottomForwardBtn) {
            DOM.bottomForwardBtn.addEventListener('click', goForward);
        }
        if (DOM.bottomShareBtn) {
            DOM.bottomShareBtn.addEventListener('click', openShareSheet);
        }
        if (DOM.bottomBookmarksBtn) {
            DOM.bottomBookmarksBtn.addEventListener('click', openBookmarks);
        }
        if (DOM.bottomTabsBtn) {
            DOM.bottomTabsBtn.addEventListener('click', openTabView);
        }
        
        // ----- Top toolbar -----
        if (DOM.topBackBtn) {
            DOM.topBackBtn.addEventListener('click', goBack);
        }
        if (DOM.topForwardBtn) {
            DOM.topForwardBtn.addEventListener('click', goForward);
        }
        if (DOM.topShareBtn) {
            DOM.topShareBtn.addEventListener('click', openShareSheet);
        }
        if (DOM.topBookmarksBtn) {
            DOM.topBookmarksBtn.addEventListener('click', openBookmarks);
        }
        if (DOM.topTabsBtn) {
            DOM.topTabsBtn.addEventListener('click', openTabView);
        }
        
        // ----- Tab view -----
        if (DOM.tabViewCloseBtn) {
            DOM.tabViewCloseBtn.addEventListener('click', closeTabView);
        }
        if (DOM.tabViewOverlay) {
            DOM.tabViewOverlay.addEventListener('click', closeTabView);
        }
        if (DOM.tabViewPrivateToggle) {
            DOM.tabViewPrivateToggle.addEventListener('click', togglePrivateBrowsing);
        }
        if (DOM.tabViewNewTabBtn) {
            DOM.tabViewNewTabBtn.addEventListener('click', function() {
                addTab();
                renderTabCards();
                showToast('📄 New tab opened');
            });
        }
        
        // ----- More menu items -----
        document.querySelectorAll('.more-menu-item').forEach(item => {
            item.addEventListener('click', function() {
                const action = this.dataset.action;
                closeMoreMenu();
                switch(action) {
                    case 'new-tab':
                        addTab();
                        showToast('📄 New tab opened');
                        break;
                    case 'new-private-tab':
                        addTab();
                        togglePrivateBrowsing();
                        showToast('🔒 New private tab');
                        break;
                    case 'bookmarks':
                        openBookmarks();
                        break;
                    case 'share':
                        openShareSheet();
                        break;
                    case 'reader':
                        showToast('📖 Reader mode (simulated)');
                        break;
                    case 'translate':
                        showToast('🌐 Translate (simulated)');
                        break;
                    case 'settings':
                        showToast('⚙️ Settings (simulated)');
                        break;
                }
            });
        });
        
        // ----- URL bar click (Compact) -----
        if (DOM.compactUrlBar) {
            DOM.compactUrlBar.addEventListener('click', function() {
                if (DOM.searchInput) {
                    DOM.searchInput.focus();
                    DOM.searchInput.select();
                }
            });
        }
        
        // ----- Scroll to collapse toolbar [citation:1] -----
        const content = document.querySelector('.browser-content');
        if (content) {
            content.addEventListener('scroll', function() {
                const collapsed = this.scrollTop > 20;
                toggleToolbarCollapse(collapsed);
            });
        }
        
        // ----- Long press on back button for history -----
        const backBtns = [DOM.compactBackBtn, DOM.bottomBackBtn, DOM.topBackBtn];
        backBtns.forEach(btn => {
            if (btn) {
                let pressTimer = null;
                btn.addEventListener('mousedown', function() {
                    pressTimer = setTimeout(() => {
                        showToast('📜 Recent history (simulated)');
                    }, 500);
                });
                btn.addEventListener('mouseup', function() {
                    clearTimeout(pressTimer);
                });
                btn.addEventListener('mouseleave', function() {
                    clearTimeout(pressTimer);
                });
            }
        });
        
        // ----- Keyboard shortcuts -----
        document.addEventListener('keydown', handleKeyboardShortcuts);
        
        // ----- Resize handler -----
        window.addEventListener('resize', function() {
            // Adjust UI if needed
        });
        
        // ----- Toolbar swipe gestures (simulated with mouse) -----
        // Swipe up on toolbar to open tab view [citation:2]
        const toolbars = [DOM.toolbarCompact, DOM.toolbarBottom, DOM.toolbarTop];
        toolbars.forEach(toolbar => {
            if (!toolbar) return;
            
            let touchStartY = 0;
            toolbar.addEventListener('touchstart', function(e) {
                if (e.touches.length === 1) {
                    touchStartY = e.touches[0].clientY;
                }
            });
            
            toolbar.addEventListener('touchmove', function(e) {
                if (e.touches.length === 1) {
                    const deltaY = e.touches[0].clientY - touchStartY;
                    if (deltaY < -30) {
                        // Swipe up detected
                        openTabView();
                        e.preventDefault();
                    }
                }
            });
        });
        
        // Swipe on URL bar to switch tabs [citation:2]
        const urlBars = [DOM.compactUrlBar, DOM.bottomUrlBar, DOM.topUrlBar];
        urlBars.forEach(urlBar => {
            if (!urlBar) return;
            
            let touchStartX = 0;
            urlBar.addEventListener('touchstart', function(e) {
                if (e.touches.length === 1) {
                    touchStartX = e.touches[0].clientX;
                }
            });
            
            urlBar.addEventListener('touchmove', function(e) {
                if (e.touches.length === 1) {
                    const deltaX = e.touches[0].clientX - touchStartX;
                    if (Math.abs(deltaX) > 40) {
                        // Swipe left or right detected
                        if (deltaX > 0 && state.activeTabIndex > 0) {
                            // Swipe right - previous tab
                            switchTab(state.activeTabIndex - 1);
                        } else if (deltaX < 0 && state.activeTabIndex < state.tabs.length - 1) {
                            // Swipe left - next tab
                            switchTab(state.activeTabIndex + 1);
                        }
                        e.preventDefault();
                        touchStartX = e.touches[0].clientX; // Reset for continuous swipes
                    }
                }
            });
        });
        
        // ------ Long press on tabs button to open new tab -----
        const tabsBtns = [DOM.compactTabsBtn, DOM.bottomTabsBtn, DOM.topTabsBtn];
        tabsBtns.forEach(btn => {
            if (btn) {
                let pressTimer = null;
                btn.addEventListener('mousedown', function() {
                    pressTimer = setTimeout(() => {
                        addTab();
                        showToast('📄 New tab opened');
                    }, 500);
                });
                btn.addEventListener('mouseup', function() {
                    clearTimeout(pressTimer);
                });
                btn.addEventListener('mouseleave', function() {
                    clearTimeout(pressTimer);
                });
            }
        });

        // ----- Back to Google button on search results -----
        const backToGoogle = document.getElementById('backToGoogle');
        if (backToGoogle) {
            backToGoogle.addEventListener('click', function() {
                state.currentPage = 'google';
                state.currentUrl = 'google.com';
                if (DOM.googlePage) DOM.googlePage.style.display = 'block';
                if (DOM.searchResultsPage) DOM.searchResultsPage.style.display = 'none';
                updateUrlBars();
                // Update active tab
                const activeTab = state.tabs[state.activeTabIndex];
                if (activeTab) {
                    activeTab.url = 'google.com';
                    activeTab.title = 'Google';
                }
            });
        }

        // ----- Back to Google from website -----
        const backToGoogleFromSite = document.getElementById('backToGoogleFromSite');
        if (backToGoogleFromSite) {
            backToGoogleFromSite.addEventListener('click', function() {
                state.currentPage = 'google';
                state.currentUrl = 'google.com';
                if (DOM.googlePage) DOM.googlePage.style.display = 'block';
                const websiteContent = document.getElementById('websiteContent');
                if (websiteContent) websiteContent.style.display = 'none';
                updateUrlBars();
                // Update active tab
                const activeTab = state.tabs[state.activeTabIndex];
                if (activeTab) {
                    activeTab.url = 'google.com';
                    activeTab.title = 'Google';
                }
            });
        }

        // ----- Close website button -----
        const closeWebsite = document.getElementById('closeWebsite');
        if (closeWebsite) {
            closeWebsite.addEventListener('click', function() {
                state.currentPage = 'google';
                state.currentUrl = 'google.com';
                if (DOM.googlePage) DOM.googlePage.style.display = 'block';
                const websiteContent = document.getElementById('websiteContent');
                if (websiteContent) websiteContent.style.display = 'none';
                updateUrlBars();
            });
        }

        console.log('✅ Events bound');
    }

    // ============================================
    // PUBLIC API
    // ============================================

    window.SafariSimulator = {
        // Navigation
        goBack: goBack,
        goForward: goForward,
        navigateTo: navigateTo,
        performSearch: performSearch,
        
        // Tabs
        addTab: addTab,
        closeTab: closeTab,
        switchTab: switchTab,
        getTabs: function() { return state.tabs; },
        getActiveTab: function() { return state.tabs[state.activeTabIndex]; },
        
        // Tab view
        openTabView: openTabView,
        closeTabView: closeTabView,
        
        // Private browsing
        togglePrivateBrowsing: togglePrivateBrowsing,
        isPrivate: function() { return state.isPrivate; },
        
        // Toolbar layout
        setLayout: function(layout) {
            if (['compact', 'bottom', 'top'].includes(layout)) {
                updateToolbarLayout(layout);
                showToast(`📐 Switched to ${layout} layout`);
            }
        },
        getLayout: function() { return state.toolbarLayout; },
        
        // Toast
        showToast: showToast,
        
        // State
        getState: function() { return { ...state }; },
        
        // Reset
        reset: function() {
            state.tabs = [{ id: 'tab-1', title: 'Google', url: 'google.com', isActive: true }];
            state.activeTabIndex = 0;
            state.tabCount = 1;
            state.history = ['google.com'];
            state.historyIndex = 0;
            state.currentPage = 'google';
            state.currentUrl = 'google.com';
            state.isPrivate = false;
            state.isTabViewOpen = false;
            
            updateTabBadge();
            updateUrlBars();
            updateNavigationButtons();
            
            if (DOM.googlePage) DOM.googlePage.style.display = 'block';
            if (DOM.searchResultsPage) DOM.searchResultsPage.style.display = 'none';
            const websiteContent = document.getElementById('websiteContent');
            if (websiteContent) websiteContent.style.display = 'none';
            
            const container = document.querySelector('.iphone-screen');
            if (container) container.classList.remove('private-mode');
            
            closeTabView();
            showToast('🔄 Safari reset');
        }
    };

    // ============================================
    // AUTO-INIT
    // ============================================

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    console.log('📱 Safari iOS 26 Simulator loaded');
    console.log('⌨️ Keyboard shortcuts:');
    console.log('  T - New tab');
    console.log('  W - Close tab');
    console.log('  P - Private mode');
    console.log('  L - Focus URL bar');
    console.log('  ← → - Back/Forward');

})();
