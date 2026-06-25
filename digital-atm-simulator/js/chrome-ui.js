/**
 * js/chrome-ui.js
 * Digital ATM – Android Chrome UI Controller
 * 
 * Handles:
 * - Chrome-specific UI controls (bottom bar, top bar)
 * - Tab switcher with card view
 * - Overflow menu with options
 * - Address bar interactions
 * - Pull to refresh
 * - Page load progress
 * - Tab management (new tab, close tab, switch tab)
 * - Bookmark/reading list simulation
 * - Incognito mode toggle
 * - Bottom bar hide/show on scroll
 * - Long press interactions (back button history)
 * - URL bar focus and keyboard simulation
 * - Home button functionality
 * - Tabs count badge
 * - Chrome animations (Material transitions)
 * - Contextual menu on long press
 */

(function() {
    'use strict';

    // ============================================
    // CHROME CONFIGURATION
    // ============================================

    const CHROME_CONFIG = {
        // Animation durations (ms)
        tabSwitchDuration: 300,
        menuOpenDuration: 250,
        bottomBarHideThreshold: 20,
        
        // Tab settings
        maxTabs: 99,
        defaultTabCount: 3,
        
        // Pull to refresh
        pullToRefreshThreshold: 80,
        refreshDuration: 1200,
        
        // Bottom bar
        bottomBarHeight: 56,
        
        // URL bar
        urlBarHeight: 44,
        
        // Gesture thresholds
        swipeThreshold: 30,
        longPressDuration: 500,
        
        // Incognito mode
        incognitoEnabled: true
    };

    // ============================================
    // STATE
    // ============================================

    const state = {
        // Chrome-specific state
        isTabViewOpen: false,
        isMenuOpen: false,
        isIncognito: false,
        isPageLoading: false,
        isLoadingProgress: 0,
        isPullingToRefresh: false,
        pullOffset: 0,
        
        // Tab management
        tabCount: CHROME_CONFIG.defaultTabCount,
        activeTabIndex: 0,
        tabs: [],
        
        // UI state
        isBottomBarVisible: true,
        lastScrollPosition: 0,
        isUrlBarFocused: false,
        urlBarText: 'digitalatm.com',
        
        // Touch/gesture state
        touchStartX: 0,
        touchStartY: 0,
        isTouching: false,
        isSwiping: false,
        
        // Menu state
        menuItems: [
            { icon: '⭐', label: 'Bookmarks' },
            { icon: '📖', label: 'Reading list' },
            { icon: '📜', label: 'History' },
            { icon: '🔍', label: 'Find in page' },
            { icon: '📄', label: 'Desktop site' },
            { icon: '⚙️', label: 'Settings' },
            { icon: '📤', label: 'Share' },
            { icon: '🔒', label: 'Incognito mode' },
            { icon: 'ℹ️', label: 'About Chrome' }
        ],
        
        // History (for back/forward)
        history: [],
        historyIndex: -1
    };

    // ============================================
    // DOM CACHE (Chrome-specific)
    // ============================================

    const DOM = {
        // Chrome container
        container: null,
        content: null,
        stepContainer: null,
        
        // Top bar
        topBar: null,
        backBtn: null,
        urlBar: null,
        urlText: null,
        menuBtn: null,
        
        // Bottom bar
        bottomBar: null,
        homeBtn: null,
        newTabBtn: null,
        tabsBtn: null,
        tabCount: null,
        moreBtn: null,
        
        // Tab view (dynamic)
        tabView: null,
        tabViewOverlay: null,
        
        // Menu (dynamic)
        menuOverlay: null,
        menuSheet: null,
        
        // Loading indicator
        progressBar: null,
        
        // Refresh indicator
        refreshIndicator: null,
        
        // Toast
        toast: null
    };

    // ============================================
    // HELPER FUNCTIONS
    // ============================================

    function log(message, type = 'info') {
        const prefix = '🌐 [Chrome UI]';
        switch (type) {
            case 'info': console.log(`${prefix} ${message}`); break;
            case 'warn': console.warn(`${prefix} ⚠️ ${message}`); break;
            case 'error': console.error(`${prefix} ❌ ${message}`); break;
            case 'success': console.log(`${prefix} ✅ ${message}`); break;
        }
    }

    function getChromeContent() {
        return document.getElementById('chromeContent');
    }

    function getChromeStepContainer() {
        return document.getElementById('chromeStepContainer');
    }

    function getChromeUrlText() {
        return document.getElementById('chromeUrl');
    }

    function getChromeTabCount() {
        return document.getElementById('chromeTabCount');
    }

    function getChromeBackBtn() {
        return document.getElementById('chromeBackBtn');
    }

    function getChromeMenuBtn() {
        return document.getElementById('chromeMenuBtn');
    }

    function getChromeHomeBtn() {
        return document.getElementById('chromeHomeBtn');
    }

    function getChromeNewTabBtn() {
        return document.getElementById('chromeNewTabBtn');
    }

    function getChromeTabsBtn() {
        return document.getElementById('chromeTabsBtn');
    }

    function getChromeMoreBtn() {
        return document.getElementById('chromeMoreBtn');
    }

    function generateId() {
        return 'chrome-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    // ============================================
    // INITIALIZATION
    // ============================================

    function init() {
        log('Initializing Chrome UI...', 'info');
        
        // Cache DOM elements
        cacheDOM();
        
        // Initialize tab data
        initTabs();
        
        // Bind events
        bindEvents();
        
        // Set up initial state
        updateTabCount();
        updateUrlBar();
        
        // Add Chrome-specific styles
        injectStyles();
        
        log('Chrome UI initialized successfully', 'success');
        log('💡 Tap URL bar to focus', 'info');
        log('💡 Tap tabs button to open tab switcher', 'info');
        log('💡 Tap menu button for overflow options', 'info');
        log('💡 Pull down from top to refresh', 'info');
    }

    function cacheDOM() {
        DOM.container = document.getElementById('chrome-container');
        DOM.content = document.getElementById('chromeContent');
        DOM.stepContainer = document.getElementById('chromeStepContainer');
        
        DOM.topBar = document.querySelector('.chrome-topbar');
        DOM.backBtn = getChromeBackBtn();
        DOM.urlBar = document.querySelector('.chrome-topbar .url-bar');
        DOM.urlText = getChromeUrlText();
        DOM.menuBtn = getChromeMenuBtn();
        
        DOM.bottomBar = document.querySelector('.chrome-bottombar');
        DOM.homeBtn = getChromeHomeBtn();
        DOM.newTabBtn = getChromeNewTabBtn();
        DOM.tabsBtn = getChromeTabsBtn();
        DOM.tabCount = getChromeTabCount();
        DOM.moreBtn = getChromeMoreBtn();
    }

    function initTabs() {
        state.tabs = [];
        state.tabCount = CHROME_CONFIG.defaultTabCount;
        
        for (let i = 0; i < state.tabCount; i++) {
            state.tabs.push({
                id: generateId(),
                title: i === 0 ? 'Digital ATM' : `Tab ${i + 1}`,
                url: i === 0 ? 'digitalatm.com' : `tab-${i + 1}.com`,
                isActive: i === 0
            });
        }
        state.activeTabIndex = 0;
    }

    // ============================================
    // STYLE INJECTION
    // ============================================

    function injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes chromeSlideUp {
                from { transform: translateY(100%); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            @keyframes chromeSlideDown {
                from { transform: translateY(-100%); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            @keyframes chromeFadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes chromeSpin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            .chrome-tab-overlay.active,
            .chrome-menu-overlay.active {
                opacity: 1 !important;
                pointer-events: auto !important;
            }
            .chrome-tab-view.active {
                transform: translateY(0) !important;
            }
            .chrome-menu-sheet.active {
                transform: translateY(0) !important;
            }
            .chrome-bottom-bar-hidden {
                transform: translateY(100%) !important;
                transition: transform 0.3s ease !important;
            }
            .chrome-top-bar-hidden {
                transform: translateY(-100%) !important;
                transition: transform 0.3s ease !important;
            }
            .chrome-refresh-spinner {
                animation: chromeSpin 0.8s linear infinite;
            }
            .chrome-tab-card {
                transition: all 0.25s ease;
            }
            .chrome-tab-card:active {
                transform: scale(0.97);
            }
        `;
        document.head.appendChild(style);
    }

    // ============================================
    // EVENT BINDING
    // ============================================

    function bindEvents() {
        // ----- URL Bar -----
        if (DOM.urlBar) {
            DOM.urlBar.addEventListener('click', handleUrlBarClick);
            DOM.urlBar.addEventListener('dblclick', handleUrlBarDoubleClick);
        }
        
        // ----- Back Button -----
        if (DOM.backBtn) {
            DOM.backBtn.addEventListener('click', handleBack);
            DOM.backBtn.addEventListener('longpress', handleBackLongPress);
        }
        
        // ----- Menu Button -----
        if (DOM.menuBtn) {
            DOM.menuBtn.addEventListener('click', toggleMenu);
        }
        
        // ----- Bottom Bar Buttons -----
        if (DOM.homeBtn) {
            DOM.homeBtn.addEventListener('click', handleHome);
        }
        if (DOM.newTabBtn) {
            DOM.newTabBtn.addEventListener('click', handleNewTab);
        }
        if (DOM.tabsBtn) {
            DOM.tabsBtn.addEventListener('click', toggleTabView);
        }
        if (DOM.moreBtn) {
            DOM.moreBtn.addEventListener('click', handleMore);
        }
        
        // ----- Content Scroll -----
        const content = getChromeContent();
        if (content) {
            content.addEventListener('scroll', handleContentScroll);
        }
        
        // ----- Pull to Refresh -----
        if (content) {
            content.addEventListener('touchstart', handleTouchStart, { passive: true });
            content.addEventListener('touchmove', handleTouchMove, { passive: false });
            content.addEventListener('touchend', handleTouchEnd, { passive: true });
        }
        
        // ----- Keyboard Shortcuts -----
        document.addEventListener('keydown', handleKeyboardShortcuts);
        
        // ----- Window Resize -----
        window.addEventListener('resize', handleResize);
        
        log('Events bound successfully', 'success');
    }

    // ============================================
    // URL BAR HANDLERS
    // ============================================

    function handleUrlBarClick(e) {
        log('URL bar clicked', 'info');
        toggleUrlBarFocus();
    }

    function handleUrlBarDoubleClick(e) {
        log('URL bar double-clicked', 'info');
        showToast('📋 URL selected (simulated)');
    }

    function toggleUrlBarFocus() {
        state.isUrlBarFocused = !state.isUrlBarFocused;
        
        if (state.isUrlBarFocused) {
            // Create input overlay
            const input = document.createElement('input');
            input.type = 'text';
            input.value = state.urlBarText;
            input.className = 'chrome-url-input';
            Object.assign(input.style, {
                position: 'absolute',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                padding: '6px 16px',
                border: '2px solid #1a73e8',
                borderRadius: '24px',
                fontSize: '14px',
                fontFamily: 'inherit',
                background: '#fff',
                color: '#1a1a1e',
                outline: 'none',
                zIndex: '10',
                boxShadow: '0 0 0 4px rgba(26,115,232,0.15)'
            });
            
            if (DOM.urlBar) {
                DOM.urlBar.style.position = 'relative';
                DOM.urlBar.appendChild(input);
                setTimeout(() => {
                    input.focus();
                    input.select();
                }, 100);
                
                input.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter') {
                        state.urlBarText = this.value;
                        updateUrlBar();
                        showToast(`🔍 Navigating to: ${this.value}`);
                        state.isUrlBarFocused = false;
                        this.remove();
                    }
                    if (e.key === 'Escape') {
                        state.isUrlBarFocused = false;
                        this.remove();
                    }
                });
                
                input.addEventListener('blur', function() {
                    setTimeout(() => {
                        if (state.isUrlBarFocused) {
                            state.isUrlBarFocused = false;
                            this.remove();
                        }
                    }, 200);
                });
            }
        }
    }

    function updateUrlBar() {
        if (DOM.urlText) {
            const urlData = parseUrl(state.urlBarText);
            DOM.urlText.innerHTML = `
                <span class="domain">${urlData.domain}</span>.${urlData.path}
            `;
        }
    }

    function parseUrl(url) {
        const parts = url.split('.');
        if (parts.length > 0) {
            return {
                domain: parts[0] || 'digitalatm',
                path: parts.slice(1).join('.') || 'com'
            };
        }
        return {
            domain: 'digitalatm',
            path: 'com'
        };
    }

    // ============================================
    // BACK BUTTON HANDLERS
    // ============================================

    function handleBack(e) {
        log('Back button clicked', 'info');
        
        // Use the simulator's back function
        const simulator = window.Simulator;
        if (simulator && simulator.back) {
            simulator.back();
        } else {
            showToast('◀ Going back (simulated)');
        }
    }

    function handleBackLongPress(e) {
        log('Back button long-pressed - showing history', 'info');
        showToast('📜 History (simulated)');
    }

    // ============================================
    // HOME BUTTON HANDLER
    // ============================================

    function handleHome(e) {
        log('Home button clicked', 'info');
        
        const simulator = window.Simulator;
        if (simulator && simulator.goToFirst) {
            simulator.goToFirst();
            showToast('🏠 Going to step 1');
        } else {
            showToast('🏠 Home (simulated)');
        }
    }

    // ============================================
    // NEW TAB HANDLER
    // ============================================

    function handleNewTab(e) {
        log('New tab button clicked', 'info');
        
        if (state.tabCount < CHROME_CONFIG.maxTabs) {
            state.tabCount++;
            state.tabs.push({
                id: generateId(),
                title: `Tab ${state.tabCount}`,
                url: `tab-${state.tabCount}.com`,
                isActive: false
            });
            updateTabCount();
            showToast(`📄 New tab opened (${state.tabCount} tabs)`);
            log(`Tab count: ${state.tabCount}`, 'success');
        } else {
            showToast('⚠️ Max tabs reached');
        }
    }

    // ============================================
    // TAB VIEW
    // ============================================

    function toggleTabView() {
        if (state.isTabViewOpen) {
            closeTabView();
        } else {
            openTabView();
        }
    }

    function openTabView() {
        if (state.isTabViewOpen) return;
        
        log('Opening tab view', 'info');
        state.isTabViewOpen = true;
        
        // Create tab view if it doesn't exist
        if (!DOM.tabView) {
            createTabView();
        }
        
        // Update tab cards
        updateTabViewCards();
        
        // Show with animation
        if (DOM.tabView) {
            DOM.tabView.classList.add('active');
            DOM.tabView.style.animation = 'chromeSlideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
        }
        if (DOM.tabViewOverlay) {
            DOM.tabViewOverlay.classList.add('active');
        }
        
        // Hide bottom bar
        hideBottomBar();
    }

    function closeTabView() {
        if (!state.isTabViewOpen) return;
        
        log('Closing tab view', 'info');
        state.isTabViewOpen = false;
        
        if (DOM.tabView) {
            DOM.tabView.classList.remove('active');
            DOM.tabView.style.animation = '';
        }
        if (DOM.tabViewOverlay) {
            DOM.tabViewOverlay.classList.remove('active');
        }
        
        // Show bottom bar
        showBottomBar();
    }

    function createTabView() {
        // Overlay
        const overlay = document.createElement('div');
        overlay.className = 'chrome-tab-overlay';
        Object.assign(overlay.style, {
            position: 'absolute',
            inset: '0',
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            zIndex: '30',
            opacity: '0',
            transition: 'opacity 0.3s ease',
            pointerEvents: 'none',
            borderRadius: '36px',
            overflow: 'hidden'
        });
        overlay.addEventListener('click', closeTabView);
        DOM.tabViewOverlay = overlay;
        
        // Tab view
        const tabView = document.createElement('div');
        tabView.className = 'chrome-tab-view';
        Object.assign(tabView.style, {
            position: 'absolute',
            bottom: '0',
            left: '0',
            right: '0',
            maxHeight: '85%',
            background: '#f8f9fa',
            borderRadius: '20px 20px 0 0',
            padding: '20px 16px 30px',
            boxShadow: '0 -4px 32px rgba(0,0,0,0.12)',
            zIndex: '31',
            transform: 'translateY(100%)',
            transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            overflow: 'hidden'
        });
        
        // Handle indicator
        const handle = document.createElement('div');
        Object.assign(handle.style, {
            width: '36px',
            height: '4px',
            background: 'rgba(0,0,0,0.15)',
            borderRadius: '2px',
            margin: '0 auto 16px',
            cursor: 'pointer'
        });
        handle.addEventListener('click', closeTabView);
        
        // Header
        const header = document.createElement('div');
        Object.assign(header.style, {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
            paddingBottom: '12px',
            borderBottom: '0.5px solid rgba(0,0,0,0.06)'
        });
        
        const title = document.createElement('span');
        title.textContent = `Tabs (${state.tabCount})`;
        Object.assign(title.style, {
            fontSize: '18px',
            fontWeight: '600',
            color: '#1a1a1e'
        });
        
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '✕';
        Object.assign(closeBtn.style, {
            background: 'rgba(0,0,0,0.04)',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            fontSize: '16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.15s'
        });
        closeBtn.addEventListener('click', closeTabView);
        closeBtn.addEventListener('mouseenter', function() {
            this.style.background = 'rgba(0,0,0,0.08)';
        });
        closeBtn.addEventListener('mouseleave', function() {
            this.style.background = 'rgba(0,0,0,0.04)';
        });
        
        header.appendChild(title);
        header.appendChild(closeBtn);
        
        // Tab cards container
        const cardsContainer = document.createElement('div');
        Object.assign(cardsContainer.style, {
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            maxHeight: '400px',
            overflowY: 'auto',
            paddingRight: '4px'
        });
        cardsContainer.className = 'chrome-tab-cards';
        
        // New tab button
        const newTabBtn = document.createElement('button');
        newTabBtn.textContent = '+ New tab';
        Object.assign(newTabBtn.style, {
            width: '100%',
            padding: '14px',
            background: 'rgba(26,115,232,0.06)',
            border: '1.5px dashed rgba(26,115,232,0.2)',
            borderRadius: '12px',
            fontSize: '15px',
            fontWeight: '500',
            color: '#1a73e8',
            cursor: 'pointer',
            marginTop: '12px',
            transition: 'all 0.15s',
            fontFamily: 'inherit'
        });
        newTabBtn.addEventListener('click', function() {
            handleNewTab();
            updateTabViewCards();
            showToast('📄 New tab opened');
        });
        newTabBtn.addEventListener('mouseenter', function() {
            this.style.background = 'rgba(26,115,232,0.10)';
        });
        newTabBtn.addEventListener('mouseleave', function() {
            this.style.background = 'rgba(26,115,232,0.06)';
        });
        
        tabView.appendChild(handle);
        tabView.appendChild(header);
        tabView.appendChild(cardsContainer);
        tabView.appendChild(newTabBtn);
        
        DOM.tabView = tabView;
        
        const container = document.getElementById('chrome-container');
        if (container) {
            container.style.position = 'relative';
            container.appendChild(overlay);
            container.appendChild(tabView);
        }
    }

    function updateTabViewCards() {
        const cardsContainer = DOM.tabView ? DOM.tabView.querySelector('.chrome-tab-cards') : null;
        if (!cardsContainer) return;
        
        cardsContainer.innerHTML = '';
        
        state.tabs.forEach((tab, index) => {
            const card = document.createElement('div');
            card.className = 'chrome-tab-card';
            const isActive = index === state.activeTabIndex;
            
            Object.assign(card.style, {
                padding: '14px 16px',
                background: isActive ? '#ffffff' : 'rgba(255,255,255,0.6)',
                borderRadius: '12px',
                boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.06)' : '0 1px 2px rgba(0,0,0,0.02)',
                border: isActive ? '1px solid rgba(26,115,232,0.15)' : '0.5px solid rgba(0,0,0,0.04)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
            });
            
            const info = document.createElement('div');
            info.style.display = 'flex';
            info.style.alignItems = 'center';
            info.style.gap = '12px';
            info.style.overflow = 'hidden';
            info.style.flex = '1';
            
            const icon = document.createElement('span');
            icon.textContent = isActive ? '🌐' : '📄';
            icon.style.fontSize = '18px';
            
            const textContainer = document.createElement('div');
            textContainer.style.overflow = 'hidden';
            
            const title = document.createElement('div');
            title.textContent = tab.title;
            Object.assign(title.style, {
                fontSize: '14px',
                fontWeight: isActive ? '600' : '400',
                color: isActive ? '#1a1a1e' : '#3c4043',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
            });
            
            const url = document.createElement('div');
            url.textContent = tab.url;
            Object.assign(url.style, {
                fontSize: '11px',
                color: '#5f6368',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                marginTop: '2px'
            });
            
            textContainer.appendChild(title);
            textContainer.appendChild(url);
            
            const closeBtn = document.createElement('button');
            closeBtn.textContent = '✕';
            Object.assign(closeBtn.style, {
                background: 'none',
                border: 'none',
                fontSize: '14px',
                color: '#8e8e93',
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: '6px',
                transition: 'background 0.15s',
                flexShrink: '0'
            });
            closeBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                if (state.tabs.length > 1) {
                    state.tabs.splice(index, 1);
                    state.tabCount = state.tabs.length;
                    if (state.activeTabIndex >= state.tabs.length) {
                        state.activeTabIndex = state.tabs.length - 1;
                    }
                    updateTabCount();
                    updateTabViewCards();
                    showToast(`🗑️ Closed tab ${index + 1}`);
                    log(`Tab ${index + 1} closed, ${state.tabs.length} remaining`, 'info');
                } else {
                    showToast('⚠️ Cannot close last tab');
                }
            });
            closeBtn.addEventListener('mouseenter', function() {
                this.style.background = 'rgba(0,0,0,0.04)';
            });
            closeBtn.addEventListener('mouseleave', function() {
                this.style.background = 'none';
            });
            
            info.appendChild(icon);
            info.appendChild(textContainer);
            card.appendChild(info);
            card.appendChild(closeBtn);
            
            card.addEventListener('click', function() {
                state.activeTabIndex = index;
                state.tabs.forEach((t, i) => {
                    t.isActive = i === index;
                });
                updateTabCount();
                updateTabViewCards();
                showToast(`↻ Switched to ${tab.title}`);
                closeTabView();
                log(`Switched to tab: ${tab.title}`, 'info');
            });
            
            cardsContainer.appendChild(card);
        });
        
        // Update header title
        const header = DOM.tabView ? DOM.tabView.querySelector('.chrome-tab-view > div:first-child + div') : null;
        if (header) {
            const titleSpan = header.querySelector('span');
            if (titleSpan) {
                titleSpan.textContent = `Tabs (${state.tabs.length})`;
            }
        }
    }

    // ============================================
    // MENU
    // ============================================

    function toggleMenu() {
        if (state.isMenuOpen) {
            closeMenu();
        } else {
            openMenu();
        }
    }

    function openMenu() {
        if (state.isMenuOpen) return;
        
        log('Opening menu', 'info');
        state.isMenuOpen = true;
        
        if (!DOM.menuSheet) {
            createMenu();
        }
        
        if (DOM.menuSheet) {
            DOM.menuSheet.classList.add('active');
            DOM.menuSheet.style.animation = 'chromeSlideUp 0.25s ease';
        }
        if (DOM.menuOverlay) {
            DOM.menuOverlay.classList.add('active');
        }
    }

    function closeMenu() {
        if (!state.isMenuOpen) return;
        
        state.isMenuOpen = false;
        
        if (DOM.menuSheet) {
            DOM.menuSheet.classList.remove('active');
            DOM.menuSheet.style.animation = '';
        }
        if (DOM.menuOverlay) {
            DOM.menuOverlay.classList.remove('active');
        }
    }

    function createMenu() {
        // Overlay
        const overlay = document.createElement('div');
        overlay.className = 'chrome-menu-overlay';
        Object.assign(overlay.style, {
            position: 'absolute',
            inset: '0',
            background: 'rgba(0,0,0,0.3)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            zIndex: '35',
            opacity: '0',
            transition: 'opacity 0.25s ease',
            pointerEvents: 'none',
            borderRadius: '36px',
            overflow: 'hidden'
        });
        overlay.addEventListener('click', closeMenu);
        DOM.menuOverlay = overlay;
        
        // Menu sheet
        const sheet = document.createElement('div');
        sheet.className = 'chrome-menu-sheet';
        Object.assign(sheet.style, {
            position: 'absolute',
            top: '60px',
            right: '12px',
            minWidth: '200px',
            background: '#ffffff',
            borderRadius: '12px',
            padding: '8px 0',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            zIndex: '36',
            transform: 'translateY(-10px) scale(0.95)',
            opacity: '0',
            transition: 'all 0.25s ease',
            border: '0.5px solid rgba(0,0,0,0.04)',
            overflow: 'hidden'
        });
        
        state.menuItems.forEach(item => {
            const menuItem = document.createElement('div');
            Object.assign(menuItem.style, {
                padding: '10px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                transition: 'background 0.15s',
                fontSize: '14px',
                color: '#1a1a1e',
                fontFamily: 'inherit'
            });
            
            const icon = document.createElement('span');
            icon.textContent = item.icon;
            icon.style.fontSize = '18px';
            
            const label = document.createElement('span');
            label.textContent = item.label;
            
            menuItem.appendChild(icon);
            menuItem.appendChild(label);
            
            menuItem.addEventListener('click', function() {
                const isIncognito = item.label === 'Incognito mode';
                if (isIncognito) {
                    toggleIncognito();
                    closeMenu();
                    return;
                }
                showToast(`📱 ${item.label} (simulated)`);
                closeMenu();
                log(`Menu item clicked: ${item.label}`, 'info');
            });
            
            menuItem.addEventListener('mouseenter', function() {
                this.style.background = 'rgba(0,0,0,0.04)';
            });
            menuItem.addEventListener('mouseleave', function() {
                this.style.background = 'none';
            });
            
            sheet.appendChild(menuItem);
        });
        
        DOM.menuSheet = sheet;
        
        const container = document.getElementById('chrome-container');
        if (container) {
            container.style.position = 'relative';
            container.appendChild(overlay);
            container.appendChild(sheet);
        }
    }

    // ============================================
    // MORE / OVERFLOW BUTTON
    // ============================================

    function handleMore(e) {
        log('More button clicked', 'info');
        // This could open a bottom sheet or additional options
        showToast('📱 More options (simulated)');
    }

    // ============================================
    // CONTENT SCROLL HANDLER
    // ============================================

    function handleContentScroll(e) {
        const content = getChromeContent();
        if (!content) return;
        
        const scrollDelta = content.scrollTop - state.lastScrollPosition;
        state.lastScrollPosition = content.scrollTop;
        
        // Hide bottom bar when scrolling down, show when scrolling up
        if (scrollDelta > CHROME_CONFIG.bottomBarHideThreshold && state.isBottomBarVisible) {
            hideBottomBar();
        } else if (scrollDelta < -CHROME_CONFIG.bottomBarHideThreshold && !state.isBottomBarVisible) {
            showBottomBar();
        }
        
        // Also handle top bar visibility
        if (scrollDelta > CHROME_CONFIG.bottomBarHideThreshold * 2) {
            hideTopBar();
        } else if (scrollDelta < -CHROME_CONFIG.bottomBarHideThreshold * 2) {
            showTopBar();
        }
    }

    function hideBottomBar() {
        if (!state.isBottomBarVisible) return;
        state.isBottomBarVisible = false;
        if (DOM.bottomBar) {
            DOM.bottomBar.classList.add('chrome-bottom-bar-hidden');
        }
        // Add padding to content
        const content = getChromeContent();
        if (content) {
            content.style.paddingBottom = '16px';
        }
    }

    function showBottomBar() {
        if (state.isBottomBarVisible) return;
        state.isBottomBarVisible = true;
        if (DOM.bottomBar) {
            DOM.bottomBar.classList.remove('chrome-bottom-bar-hidden');
        }
        const content = getChromeContent();
        if (content) {
            content.style.paddingBottom = '';
        }
    }

    function hideTopBar() {
        if (DOM.topBar) {
            DOM.topBar.classList.add('chrome-top-bar-hidden');
        }
    }

    function showTopBar() {
        if (DOM.topBar) {
            DOM.topBar.classList.remove('chrome-top-bar-hidden');
        }
    }

    // ============================================
    // PULL TO REFRESH
    // ============================================

    let pullStartY = 0;
    let isPulling = false;

    function handleTouchStart(e) {
        const content = getChromeContent();
        if (content && content.scrollTop === 0 && e.touches.length === 1) {
            pullStartY = e.touches[0].clientY;
            isPulling = true;
        }
    }

    function handleTouchMove(e) {
        if (!isPulling) return;
        
        const content = getChromeContent();
        if (!content) return;
        
        const deltaY = e.touches[0].clientY - pullStartY;
        
        if (deltaY > 0 && content.scrollTop === 0) {
            e.preventDefault();
            state.pullOffset = Math.min(deltaY, CHROME_CONFIG.pullToRefreshThreshold);
            updatePullToRefreshIndicator(state.pullOffset);
            
            if (state.pullOffset >= CHROME_CONFIG.pullToRefreshThreshold) {
                state.isPullingToRefresh = true;
                showPullToRefreshReady();
            } else {
                state.isPullingToRefresh = false;
            }
        }
    }

    function handleTouchEnd(e) {
        if (isPulling && state.isPullingToRefresh) {
            triggerPullToRefresh();
        }
        isPulling = false;
        state.pullOffset = 0;
        hidePullToRefreshIndicator();
    }

    function updatePullToRefreshIndicator(offset) {
        let indicator = DOM.refreshIndicator;
        if (!indicator) {
            indicator = createPullToRefreshIndicator();
            DOM.refreshIndicator = indicator;
        }
        
        if (offset > 0) {
            const progress = Math.min(offset / CHROME_CONFIG.pullToRefreshThreshold, 1);
            indicator.style.transform = `translateY(${Math.min(offset, 80)}px) scale(${0.5 + progress * 0.5})`;
            indicator.style.opacity = Math.min(offset / 30, 1);
        } else {
            indicator.style.transform = 'translateY(0) scale(0)';
            indicator.style.opacity = '0';
        }
    }

    function createPullToRefreshIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'chrome-refresh-indicator';
        Object.assign(indicator.style, {
            position: 'absolute',
            top: '-50px',
            left: '50%',
            transform: 'translateX(-50%) scale(0)',
            background: 'rgba(255,255,255,0.9)',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            transition: 'transform 0.2s ease, opacity 0.2s ease',
            opacity: '0',
            zIndex: '20',
            pointerEvents: 'none',
            border: '1px solid rgba(0,0,0,0.04)'
        });
        indicator.textContent = '⟳';
        indicator.className = 'chrome-refresh-spinner';
        
        const container = document.getElementById('chrome-container');
        if (container) {
            container.style.position = 'relative';
            container.appendChild(indicator);
        }
        
        return indicator;
    }

    function showPullToRefreshReady() {
        const indicator = DOM.refreshIndicator;
        if (indicator) {
            indicator.style.background = 'rgba(52, 168, 83, 0.9)';
            indicator.textContent = '✓';
            indicator.style.color = '#fff';
            indicator.className = '';
        }
    }

    function hidePullToRefreshIndicator() {
        const indicator = DOM.refreshIndicator;
        if (indicator) {
            indicator.style.transform = 'translateX(-50%) scale(0)';
            indicator.style.opacity = '0';
            setTimeout(() => {
                indicator.style.background = 'rgba(255,255,255,0.9)';
                indicator.textContent = '⟳';
                indicator.style.color = '';
                indicator.className = 'chrome-refresh-spinner';
            }, 200);
        }
    }

    function triggerPullToRefresh() {
        log('Pull to refresh triggered', 'info');
        showToast('🔄 Refreshing...');
        
        // Show progress bar
        showProgressBar();
        
        setTimeout(() => {
            hideProgressBar();
            showToast('✅ Page refreshed');
            log('Refresh complete', 'success');
            state.isPullingToRefresh = false;
        }, CHROME_CONFIG.refreshDuration);
    }

    // ============================================
    // PROGRESS BAR
    // ============================================

    function showProgressBar() {
        if (!DOM.progressBar) {
            const progressBar = document.createElement('div');
            Object.assign(progressBar.style, {
                position: 'absolute',
                top: '0',
                left: '0',
                height: '3px',
                background: 'linear-gradient(90deg, #1a73e8, #34a853)',
                width: '0%',
                zIndex: '15',
                transition: 'width 0.3s ease',
                borderRadius: '0 2px 2px 0'
            });
            DOM.progressBar = progressBar;
            
            const container = document.getElementById('chrome-container');
            if (container) {
                container.style.position = 'relative';
                container.appendChild(progressBar);
            }
        }
        
        DOM.progressBar.style.width = '0%';
        DOM.progressBar.style.opacity = '1';
        
        // Simulate progress
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10 + Math.random() * 20;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
            }
            if (DOM.progressBar) {
                DOM.progressBar.style.width = progress + '%';
            }
        }, 300);
        
        state.isPageLoading = true;
        state._progressInterval = interval;
    }

    function hideProgressBar() {
        if (DOM.progressBar) {
            DOM.progressBar.style.opacity = '0';
            DOM.progressBar.style.transition = 'opacity 0.5s ease';
            setTimeout(() => {
                if (DOM.progressBar) {
                    DOM.progressBar.style.width = '0%';
                    DOM.progressBar.style.opacity = '1';
                }
            }, 500);
        }
        if (state._progressInterval) {
            clearInterval(state._progressInterval);
            state._progressInterval = null;
        }
        state.isPageLoading = false;
    }

    // ============================================
    // INCOGNITO MODE
    // ============================================

    function toggleIncognito() {
        state.isIncognito = !state.isIncognito;
        
        const container = document.getElementById('chrome-container');
        if (container) {
            if (state.isIncognito) {
                container.style.background = '#1a1a1e';
                container.style.color = '#8e8e93';
                
                // Update top bar
                if (DOM.topBar) {
                    DOM.topBar.style.background = '#2d2d30';
                    DOM.topBar.style.borderBottom = '0.5px solid rgba(255,255,255,0.05)';
                }
                if (DOM.urlBar) {
                    DOM.urlBar.style.background = '#3a3a3d';
                    DOM.urlBar.style.color = '#e8e8ea';
                }
                if (DOM.backBtn) {
                    DOM.backBtn.style.color = '#e8e8ea';
                }
                if (DOM.menuBtn) {
                    DOM.menuBtn.style.color = '#e8e8ea';
                }
                
                // Update bottom bar
                if (DOM.bottomBar) {
                    DOM.bottomBar.style.background = '#2d2d30';
                    DOM.bottomBar.style.borderTop = '0.5px solid rgba(255,255,255,0.05)';
                }
                
                // Add incognito indicator
                addIncognitoIndicator();
                
                showToast('🔒 Incognito mode activated');
                log('Incognito mode activated', 'info');
            } else {
                container.style.background = '';
                container.style.color = '';
                
                if (DOM.topBar) {
                    DOM.topBar.style.background = '';
                    DOM.topBar.style.borderBottom = '';
                }
                if (DOM.urlBar) {
                    DOM.urlBar.style.background = '';
                    DOM.urlBar.style.color = '';
                }
                if (DOM.backBtn) {
                    DOM.backBtn.style.color = '';
                }
                if (DOM.menuBtn) {
                    DOM.menuBtn.style.color = '';
                }
                if (DOM.bottomBar) {
                    DOM.bottomBar.style.background = '';
                    DOM.bottomBar.style.borderTop = '';
                }
                
                removeIncognitoIndicator();
                
                showToast('🔓 Incognito mode deactivated');
                log('Incognito mode deactivated', 'info');
            }
        }
    }

    function addIncognitoIndicator() {
        let indicator = document.querySelector('.chrome-incognito-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.className = 'chrome-incognito-indicator';
            Object.assign(indicator.style, {
                position: 'absolute',
                top: '0',
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#1a73e8',
                color: '#fff',
                fontSize: '10px',
                fontWeight: '600',
                padding: '2px 16px',
                borderRadius: '0 0 8px 8px',
                zIndex: '20',
                letterSpacing: '0.5px',
                textTransform: 'uppercase'
            });
            indicator.textContent = '🔒 Incognito';
            
            const container = document.getElementById('chrome-container');
            if (container) {
                container.style.position = 'relative';
                container.appendChild(indicator);
            }
        }
        indicator.style.display = 'block';
    }

    function removeIncognitoIndicator() {
        const indicator = document.querySelector('.chrome-incognito-indicator');
        if (indicator) {
            indicator.style.display = 'none';
        }
    }

    // ============================================
    // TAB COUNT UPDATE
    // ============================================

    function updateTabCount() {
        const count = state.tabs.length;
        if (DOM.tabCount) {
            DOM.tabCount.textContent = count > 99 ? '99+' : count;
        }
    }

    // ============================================
    // TOAST NOTIFICATION
    // ============================================

    function showToast(message, duration = 2000) {
        // Use the simulator's toast if available
        if (window.Simulator && window.Simulator.showToast) {
            window.Simulator.showToast(message, duration);
            return;
        }
        
        // Fallback toast
        const existing = document.querySelector('.chrome-toast');
        if (existing) existing.remove();
        
        const toast = document.createElement('div');
        toast.className = 'chrome-toast';
        Object.assign(toast.style, {
            position: 'absolute',
            bottom: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            color: '#fff',
            padding: '10px 20px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            zIndex: '50',
            maxWidth: '90%',
            textAlign: 'center',
            pointerEvents: 'none',
            animation: 'chromeFadeIn 0.3s ease',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
        });
        toast.textContent = message;
        
        const container = document.getElementById('chrome-container');
        if (container) {
            container.appendChild(toast);
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
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        // Only when Chrome is active
        const container = document.getElementById('chrome-container');
        if (!container || !container.classList.contains('active')) return;
        
        switch (e.key) {
            case 't':
            case 'T':
                e.preventDefault();
                handleNewTab();
                break;
            case 'w':
            case 'W':
                e.preventDefault();
                if (state.tabs.length > 1) {
                    const index = state.activeTabIndex;
                    state.tabs.splice(index, 1);
                    state.tabCount = state.tabs.length;
                    if (state.activeTabIndex >= state.tabs.length) {
                        state.activeTabIndex = state.tabs.length - 1;
                    }
                    updateTabCount();
                    showToast(`🗑️ Closed tab`);
                    log('Tab closed via keyboard', 'info');
                }
                break;
            case 'n':
            case 'N':
                e.preventDefault();
                toggleIncognito();
                break;
            case 'l':
            case 'L':
                e.preventDefault();
                toggleUrlBarFocus();
                break;
            case 'h':
            case 'H':
                e.preventDefault();
                handleHome();
                break;
        }
    }

    // ============================================
    // WINDOW RESIZE
    // ============================================

    function handleResize() {
        // Adjust UI for screen size changes
        // Nothing needed here currently
    }

    // ============================================
    // PUBLIC API
    // ============================================

    const ChromeUI = {
        // Initialization
        init: init,
        destroy: function() {
            // Clean up event listeners
            const content = getChromeContent();
            if (content) {
                content.removeEventListener('scroll', handleContentScroll);
                content.removeEventListener('touchstart', handleTouchStart);
                content.removeEventListener('touchmove', handleTouchMove);
                content.removeEventListener('touchend', handleTouchEnd);
            }
            
            // Remove dynamic elements
            if (DOM.tabView) {
                DOM.tabView.remove();
                DOM.tabView = null;
            }
            if (DOM.tabViewOverlay) {
                DOM.tabViewOverlay.remove();
                DOM.tabViewOverlay = null;
            }
            if (DOM.menuSheet) {
                DOM.menuSheet.remove();
                DOM.menuSheet = null;
            }
            if (DOM.menuOverlay) {
                DOM.menuOverlay.remove();
                DOM.menuOverlay = null;
            }
            if (DOM.progressBar) {
                DOM.progressBar.remove();
                DOM.progressBar = null;
            }
            if (DOM.refreshIndicator) {
                DOM.refreshIndicator.remove();
                DOM.refreshIndicator = null;
            }
            
            log('Chrome UI destroyed', 'info');
        },
        
        // Tabs
        getTabCount: function() { return state.tabs.length; },
        addTab: handleNewTab,
        closeTab: function(index) {
            if (state.tabs.length > 1 && index < state.tabs.length) {
                state.tabs.splice(index, 1);
                state.tabCount = state.tabs.length;
                if (state.activeTabIndex >= state.tabs.length) {
                    state.activeTabIndex = state.tabs.length - 1;
                }
                updateTabCount();
                showToast(`🗑️ Closed tab ${index + 1}`);
            }
        },
        switchTab: function(index) {
            if (index < state.tabs.length) {
                state.activeTabIndex = index;
                state.tabs.forEach((t, i) => {
                    t.isActive = i === index;
                });
                updateTabCount();
                showToast(`↻ Switched to tab ${index + 1}`);
            }
        },
        
        // Tab view
        openTabView: openTabView,
        closeTabView: closeTabView,
        toggleTabView: toggleTabView,
        isTabViewOpen: function() { return state.isTabViewOpen; },
        
        // Menu
        openMenu: openMenu,
        closeMenu: closeMenu,
        toggleMenu: toggleMenu,
        isMenuOpen: function() { return state.isMenuOpen; },
        
        // Incognito
        toggleIncognito: toggleIncognito,
        isIncognito: function() { return state.isIncognito; },
        
        // URL bar
        toggleUrlBarFocus: toggleUrlBarFocus,
        updateUrlBar: updateUrlBar,
        getUrlBarText: function() { return state.urlBarText; },
        setUrlBarText: function(text) {
            state.urlBarText = text;
            updateUrlBar();
        },
        
        // Progress bar
        showProgressBar: showProgressBar,
        hideProgressBar: hideProgressBar,
        isPageLoading: function() { return state.isPageLoading; },
        
        // Toast
        showToast: showToast,
        
        // State
        getState: function() { return { ...state }; },
        
        // Refresh
        triggerRefresh: triggerPullToRefresh,
        
        // Navigation
        goHome: handleHome,
        goBack: handleBack
    };

    // ============================================
    // AUTO-INIT
    // ============================================

    // Expose globally
    window.ChromeUI = ChromeUI;

    // Initialize when DOM is ready
    function autoInit() {
        const container = document.getElementById('chrome-container');
        if (container) {
            setTimeout(init, 300);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', autoInit);
    } else {
        autoInit();
    }

})();
