/**
 * js/safari-ui.js
 * Digital ATM â€“ iOS 26 Safari UI Controller
 * 
 * Handles:
 * - Safari-specific gesture detection (swipe on URL bar, swipe up on toolbar)
 * - Tab switching animations
 * - Address bar interactions (tap to show keyboard, long press)
 * - Toolbar collapse/expand with haptic feedback simulation
 * - Page load progress simulation
 * - Share sheet simulation
 * - Reader mode toggle
 * - Pull-to-refresh simulation
 * - Bottom sheet interactions
 * - Safari-specific animations (spring, bounce)
 * - Dynamic tinting (address bar color matches page)
 * - Floating pill interactions
 * - Back/forward gesture (edge swipe)
 * - Tab view switcher
 * - Private browsing mode indicator
 */

(function() {
    'use strict';

    // ============================================
    // SAFARI CONFIGURATION
    // ============================================

    const SAFARI_CONFIG = {
        // Gesture thresholds (in pixels)
        swipeThreshold: 30,
        longPressDuration: 500,
        edgeSwipeThreshold: 20,
        
        // Animation durations (ms)
        tabSwitchDuration: 350,
        toolbarCollapseDuration: 350,
        pageLoadDuration: 800,
        springBounceDuration: 500,
        
        // Haptic feedback (simulated with CSS)
        hapticEnabled: true,
        
        // Tab view settings
        maxTabsInView: 6,
        tabCardScale: 0.85,
        
        // Address bar tinting
        tintingEnabled: true,
        tintOpacity: 0.15,
        
        // Pull to refresh
        pullToRefreshThreshold: 80,
        refreshDuration: 1500,
        
        // Reader mode
        readerModeEnabled: true,
        
        // Private browsing
        privateBrowsingEnabled: true
    };

    // ============================================
    // STATE
    // ============================================

    const state = {
        // Safari-specific state
        isTabViewOpen: false,
        isShareSheetOpen: false,
        isReaderModeActive: false,
        isPrivateBrowsing: false,
        isPageLoading: false,
        isLoadingProgress: 0,
        isPullingToRefresh: false,
        pullOffset: 0,
        
        // Touch/gesture state
        touchStartX: 0,
        touchStartY: 0,
        touchCurrentX: 0,
        touchCurrentY: 0,
        isTouching: false,
        isSwiping: false,
        swipeDirection: null,
        
        // Long press state
        longPressTimer: null,
        isLongPressing: false,
        
        // Tab view state
        tabCards: [],
        activeTabIndex: 0,
        
        // Toolbar state
        isToolbarCollapsed: false,
        toolbarHeight: 52,
        toolbarCollapsedHeight: 38,
        
        // Address bar state
        isAddressBarFocused: false,
        addressBarText: 'digitalatm.com',
        
        // Page tinting
        currentTintColor: '#007aff',
        isTinted: false,
        
        // History
        history: [],
        historyIndex: -1
    };

    // ============================================
    // DOM CACHE (Safari-specific)
    // ============================================

    const DOM = {
        // Safari container
        container: null,
        content: null,
        stepContainer: null,
        toolbar: null,
        urlPill: null,
        backBtn: null,
        tabsBtn: null,
        moreBtn: null,
        statusBar: null,
        
        // Tab view (to be created dynamically)
        tabView: null,
        tabViewOverlay: null,
        
        // Share sheet (to be created dynamically)
        shareSheet: null,
        shareSheetOverlay: null,
        
        // Loading indicator
        loadingIndicator: null,
        progressBar: null,
        
        // Refresh indicator
        refreshIndicator: null,
        
        // Address bar popover
        addressPopover: null
    };

    // ============================================
    // HELPER FUNCTIONS
    // ============================================

    function log(message, type = 'info') {
        const prefix = 'ðŸ§­ [Safari UI]';
        switch (type) {
            case 'info': console.log(`${prefix} ${message}`); break;
            case 'warn': console.warn(`${prefix} âš ï¸ ${message}`); break;
            case 'error': console.error(`${prefix} âŒ ${message}`); break;
            case 'success': console.log(`${prefix} âœ… ${message}`); break;
        }
    }

    function generateId() {
        return 'safari-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    function getSafariContent() {
        return document.getElementById('safariContent');
    }

    function getSafariToolbar() {
        return document.getElementById('safariToolbar');
    }

    function getSafariStepContainer() {
        return document.getElementById('safariStepContainer');
    }

    function getSafariUrlPill() {
        return document.getElementById('safariUrl');
    }

    function getSafariTabsBtn() {
        return document.getElementById('safariTabsBtn');
    }

    function getSafariBackBtn() {
        return document.getElementById('safariBackBtn');
    }

    // ============================================
    // GESTURE DETECTION
    // ============================================

    function initGestures() {
        const content = getSafariContent();
        const toolbar = getSafariToolbar();
        const urlPill = getSafariUrlPill();
        
        if (!content || !toolbar) return;
        
        // ----- Touch events on content (for pull-to-refresh) -----
        content.addEventListener('touchstart', handleContentTouchStart, { passive: true });
        content.addEventListener('touchmove', handleContentTouchMove, { passive: false });
        content.addEventListener('touchend', handleContentTouchEnd, { passive: true });
        
        // ----- Touch events on URL pill (for swipe gestures) -----
        if (urlPill) {
            urlPill.addEventListener('touchstart', handleUrlTouchStart, { passive: true });
            urlPill.addEventListener('touchmove', handleUrlTouchMove, { passive: false });
            urlPill.addEventListener('touchend', handleUrlTouchEnd, { passive: true });
            
            // Click events for address bar interaction
            urlPill.addEventListener('click', handleUrlClick);
            urlPill.addEventListener('dblclick', handleUrlDoubleClick);
            
            // Long press
            urlPill.addEventListener('mousedown', handleUrlMouseDown);
            urlPill.addEventListener('mouseup', handleUrlMouseUp);
            urlPill.addEventListener('mouseleave', handleUrlMouseUp);
        }
        
        // ----- Edge swipe detection (back/forward) -----
        content.addEventListener('touchstart', handleEdgeTouchStart, { passive: true });
        content.addEventListener('touchmove', handleEdgeTouchMove, { passive: false });
        content.addEventListener('touchend', handleEdgeTouchEnd, { passive: true });
        
        // ----- Toolbar swipe up (show tabs) -----
        toolbar.addEventListener('touchstart', handleToolbarTouchStart, { passive: true });
        toolbar.addEventListener('touchmove', handleToolbarTouchMove, { passive: false });
        toolbar.addEventListener('touchend', handleToolbarTouchEnd, { passive: true });
        
        // ----- Mouse wheel for toolbar collapse -----
        content.addEventListener('scroll', handleContentScroll);
        
        log('Gestures initialized', 'success');
    }

    // ----- Content Touch Handlers (Pull to Refresh) -----

    let pullStartY = 0;
    let isPulling = false;

    function handleContentTouchStart(e) {
        if (e.touches.length === 1) {
            const content = getSafariContent();
            if (content && content.scrollTop === 0) {
                pullStartY = e.touches[0].clientY;
                isPulling = true;
            }
        }
    }

    function handleContentTouchMove(e) {
        if (!isPulling) return;
        
        const content = getSafariContent();
        if (!content) return;
        
        const deltaY = e.touches[0].clientY - pullStartY;
        
        if (deltaY > 0 && content.scrollTop === 0) {
            e.preventDefault();
            state.pullOffset = Math.min(deltaY, SAFARI_CONFIG.pullToRefreshThreshold);
            updatePullToRefreshIndicator(state.pullOffset);
            
            if (state.pullOffset >= SAFARI_CONFIG.pullToRefreshThreshold) {
                state.isPullingToRefresh = true;
                showPullToRefreshReady();
            } else {
                state.isPullingToRefresh = false;
            }
        }
    }

    function handleContentTouchEnd(e) {
        if (isPulling && state.isPullingToRefresh) {
            // Trigger refresh
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
            indicator.style.transform = `translateY(${Math.min(offset, 80)}px) scale(${Math.min(offset / 40, 1)})`;
            indicator.style.opacity = Math.min(offset / 40, 1);
        } else {
            indicator.style.transform = 'translateY(0) scale(0)';
            indicator.style.opacity = '0';
        }
    }

    function createPullToRefreshIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'safari-refresh-indicator';
        Object.assign(indicator.style, {
            position: 'absolute',
            top: '-60px',
            left: '50%',
            transform: 'translateX(-50%) scale(0)',
            background: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            borderRadius: '50%',
            width: '44px',
            height: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
            transition: 'transform 0.2s ease, opacity 0.2s ease',
            opacity: '0',
            zIndex: '20',
            pointerEvents: 'none'
        });
        indicator.textContent = 'â†»';
        
        const container = document.getElementById('safari-container');
        if (container) {
            container.style.position = 'relative';
            container.appendChild(indicator);
        }
        
        return indicator;
    }

    function showPullToRefreshReady() {
        const indicator = DOM.refreshIndicator;
        if (indicator) {
            indicator.style.background = 'rgba(52, 199, 89, 0.9)';
            indicator.textContent = 'âœ“';
            indicator.style.color = '#fff';
        }
    }

    function hidePullToRefreshIndicator() {
        const indicator = DOM.refreshIndicator;
        if (indicator) {
            indicator.style.transform = 'translateX(-50%) scale(0)';
            indicator.style.opacity = '0';
            setTimeout(() => {
                indicator.style.background = 'rgba(255,255,255,0.9)';
                indicator.textContent = 'â†»';
                indicator.style.color = '';
            }, 200);
        }
    }

    function triggerPullToRefresh() {
        log('Pull to refresh triggered', 'info');
        showToast('ðŸ”„ Refreshing...');
        
        // Simulate refresh
        setTimeout(() => {
            showToast('âœ… Page refreshed');
            log('Refresh complete', 'success');
            state.isPullingToRefresh = false;
        }, SAFARI_CONFIG.refreshDuration);
    }

    // ----- URL Pill Touch Handlers (Swipe to switch tabs) -----

    let urlTouchStartX = 0;
    let urlTouchStartY = 0;
    let isUrlSwiping = false;

    function handleUrlTouchStart(e) {
        if (e.touches.length === 1) {
            urlTouchStartX = e.touches[0].clientX;
            urlTouchStartY = e.touches[0].clientY;
            isUrlSwiping = true;
            
            // Haptic feedback (simulated)
            if (SAFARI_CONFIG.hapticEnabled) {
                simulateHaptic('light');
            }
        }
    }

    function handleUrlTouchMove(e) {
        if (!isUrlSwiping) return;
        
        const deltaX = e.touches[0].clientX - urlTouchStartX;
        const deltaY = e.touches[0].clientY - urlTouchStartY;
        
        // Only trigger if horizontal swipe
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > SAFARI_CONFIG.swipeThreshold) {
            e.preventDefault();
            state.isSwiping = true;
            state.swipeDirection = deltaX > 0 ? 'right' : 'left';
            
            // Update URL pill with swipe feedback
            const urlPill = getSafariUrlPill();
            if (urlPill) {
                const progress = Math.min(Math.abs(deltaX) / 100, 1);
                urlPill.style.transform = `translateX(${deltaX * 0.3}px)`;
                urlPill.style.opacity = 1 - progress * 0.3;
            }
        }
    }

    function handleUrlTouchEnd(e) {
        if (state.isSwiping && state.swipeDirection) {
            const direction = state.swipeDirection;
            log(`URL swipe detected: ${direction}`, 'info');
            
            // Switch tabs (simulated)
            if (direction === 'right') {
                showToast('â†» Switching to previous tab (simulated)');
            } else {
                showToast('â†» Switching to next tab (simulated)');
            }
            
            // Reset URL pill
            const urlPill = getSafariUrlPill();
            if (urlPill) {
                urlPill.style.transform = '';
                urlPill.style.opacity = '';
            }
            
            // Haptic feedback
            if (SAFARI_CONFIG.hapticEnabled) {
                simulateHaptic('medium');
            }
        }
        
        isUrlSwiping = false;
        state.isSwiping = false;
        state.swipeDirection = null;
    }

    // ----- URL Pill Click Handlers -----

    function handleUrlClick(e) {
        log('URL pill clicked', 'info');
        toggleAddressBarFocus();
    }

    function handleUrlDoubleClick(e) {
        log('URL pill double-clicked - select all', 'info');
        showToast('ðŸ“‹ URL selected (simulated)');
    }

    function handleUrlMouseDown(e) {
        state.longPressTimer = setTimeout(() => {
            state.isLongPressing = true;
            handleLongPress(e);
        }, SAFARI_CONFIG.longPressDuration);
    }

    function handleUrlMouseUp(e) {
        if (state.longPressTimer) {
            clearTimeout(state.longPressTimer);
            state.longPressTimer = null;
        }
        state.isLongPressing = false;
    }

    function handleLongPress(e) {
        log('Long press on URL pill', 'info');
        showToast('ðŸ“‹ Copy link address (simulated)');
        
        // Haptic feedback
        if (SAFARI_CONFIG.hapticEnabled) {
            simulateHaptic('heavy');
        }
    }

    // ----- Edge Swipe Handlers (Back/Forward gesture) -----

    let edgeStartX = 0;
    let isEdgeSwiping = false;

    function handleEdgeTouchStart(e) {
        if (e.touches.length === 1) {
            const touchX = e.touches[0].clientX;
            const content = getSafariContent();
            if (content) {
                const rect = content.getBoundingClientRect();
                // Only trigger if touch is near the left edge
                if (touchX - rect.left < SAFARI_CONFIG.edgeSwipeThreshold) {
                    edgeStartX = touchX;
                    isEdgeSwiping = true;
                }
            }
        }
    }

    function handleEdgeTouchMove(e) {
        if (!isEdgeSwiping) return;
        
        const deltaX = e.touches[0].clientX - edgeStartX;
        if (deltaX > SAFARI_CONFIG.swipeThreshold) {
            e.preventDefault();
            // Show back gesture visual feedback
            const content = getSafariContent();
            if (content) {
                const progress = Math.min(deltaX / 200, 1);
                content.style.transform = `translateX(${deltaX * 0.3}px)`;
                content.style.opacity = 1 - progress * 0.2;
            }
        }
    }

    function handleEdgeTouchEnd(e) {
        if (isEdgeSwiping) {
            const content = getSafariContent();
            if (content) {
                const currentTransform = content.style.transform;
                if (currentTransform && parseFloat(currentTransform.replace('translateX(', '')) > 50) {
                    // Trigger back
                    log('Edge swipe back gesture', 'info');
                    const simulator = window.Simulator;
                    if (simulator) {
                        simulator.back();
                    }
                    showToast('â—€ Swipe back');
                }
                content.style.transform = '';
                content.style.opacity = '';
            }
        }
        isEdgeSwiping = false;
    }

    // ----- Toolbar Touch Handlers (Swipe up to open tabs) -----

    let toolbarTouchStartY = 0;
    let isToolbarSwiping = false;

    function handleToolbarTouchStart(e) {
        if (e.touches.length === 1) {
            toolbarTouchStartY = e.touches[0].clientY;
            isToolbarSwiping = true;
        }
    }

    function handleToolbarTouchMove(e) {
        if (!isToolbarSwiping) return;
        
        const deltaY = e.touches[0].clientY - toolbarTouchStartY;
        if (deltaY < -SAFARI_CONFIG.swipeThreshold) {
            e.preventDefault();
            // Swipe up on toolbar - open tab view
            isToolbarSwiping = false;
            openTabView();
        }
    }

    function handleToolbarTouchEnd(e) {
        isToolbarSwiping = false;
    }

    // ----- Content Scroll Handler (Toolbar collapse) -----

    function handleContentScroll(e) {
        const content = getSafariContent();
        const toolbar = getSafariToolbar();
        if (!content || !toolbar) return;
        
        const isScrolled = content.scrollTop > 20;
        state.isToolbarCollapsed = isScrolled;
        toolbar.classList.toggle('collapsed', isScrolled);
        
        // Update toolbar height in state
        state.toolbarHeight = isScrolled ? 
            SAFARI_CONFIG.toolbarCollapsedHeight : 
            SAFARI_CONFIG.toolbarHeight;
    }

    // ============================================
    // ADDRESS BAR
    // ============================================

    function toggleAddressBarFocus() {
        state.isAddressBarFocused = !state.isAddressBarFocused;
        
        if (state.isAddressBarFocused) {
            showAddressBarPopover();
        } else {
            hideAddressBarPopover();
        }
    }

    function showAddressBarPopover() {
        const urlPill = getSafariUrlPill();
        if (!urlPill) return;
        
        // Create popover if it doesn't exist
        if (!DOM.addressPopover) {
            DOM.addressPopover = document.createElement('div');
            DOM.addressPopover.className = 'safari-address-popover';
            Object.assign(DOM.addressPopover.style, {
                position: 'absolute',
                bottom: '70px',
                left: '16px',
                right: '16px',
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(30px) saturate(1.4)',
                WebkitBackdropFilter: 'blur(30px) saturate(1.4)',
                borderRadius: '16px',
                padding: '16px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                border: '0.5px solid rgba(255,255,255,0.5)',
                zIndex: '15',
                animation: 'fadeIn 0.25s ease'
            });
            
            const input = document.createElement('input');
            input.type = 'text';
            input.value = state.addressBarText;
            Object.assign(input.style, {
                width: '100%',
                padding: '12px 16px',
                border: '1.5px solid #007aff',
                borderRadius: '12px',
                fontSize: '16px',
                fontFamily: 'inherit',
                background: 'white',
                color: '#1c1c1e',
                outline: 'none'
            });
            input.placeholder = 'Search or enter address';
            
            input.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    state.addressBarText = this.value;
                    updateUrlPill(state.addressBarText);
                    hideAddressBarPopover();
                    showToast(`ðŸ” Navigating to: ${this.value}`);
                }
                if (e.key === 'Escape') {
                    hideAddressBarPopover();
                }
            });
            
            input.addEventListener('blur', function() {
                setTimeout(hideAddressBarPopover, 200);
            });
            
            DOM.addressPopover.appendChild(input);
        }
        
        // Position and show
        const container = document.getElementById('safari-container');
        if (container) {
            container.style.position = 'relative';
            container.appendChild(DOM.addressPopover);
        }
        
        // Focus the input
        const input = DOM.addressPopover.querySelector('input');
        if (input) {
            setTimeout(() => input.focus(), 100);
            input.select();
        }
        
        // Update URL pill appearance
        urlPill.style.background = 'rgba(0,122,255,0.15)';
        urlPill.style.borderColor = 'rgba(0,122,255,0.3)';
    }

    function hideAddressBarPopover() {
        if (DOM.addressPopover) {
            DOM.addressPopover.remove();
        }
        
        const urlPill = getSafariUrlPill();
        if (urlPill) {
            urlPill.style.background = '';
            urlPill.style.borderColor = '';
        }
        
        state.isAddressBarFocused = false;
    }

    function updateUrlPill(text) {
        const urlPill = getSafariUrlPill();
        if (urlPill) {
            urlPill.textContent = text;
        }
    }

    // ============================================
    // TAB VIEW
    // ============================================

    function openTabView() {
        if (state.isTabViewOpen) {
            closeTabView();
            return;
        }
        
        log('Opening tab view', 'info');
        state.isTabViewOpen = true;
        
        // Create tab view if it doesn't exist
        if (!DOM.tabView) {
            createTabView();
        }
        
        // Show tab view with animation
        DOM.tabView.classList.add('active');
        DOM.tabView.style.animation = 'slideUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)';
        
        // Show overlay
        if (DOM.tabViewOverlay) {
            DOM.tabViewOverlay.classList.add('active');
        }
        
        // Update tab cards
        updateTabView();
        
        // Haptic feedback
        if (SAFARI_CONFIG.hapticEnabled) {
            simulateHaptic('medium');
        }
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
    }

    function createTabView() {
        // Overlay
        const overlay = document.createElement('div');
        overlay.className = 'safari-tab-overlay';
        Object.assign(overlay.style, {
            position: 'absolute',
            inset: '0',
            background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: '20',
            opacity: '0',
            transition: 'opacity 0.35s ease',
            pointerEvents: 'none',
            borderRadius: '36px',
            overflow: 'hidden'
        });
        overlay.addEventListener('click', closeTabView);
        DOM.tabViewOverlay = overlay;
        
        // Tab view
        const tabView = document.createElement('div');
        tabView.className = 'safari-tab-view';
        Object.assign(tabView.style, {
            position: 'absolute',
            bottom: '0',
            left: '0',
            right: '0',
            maxHeight: '80%',
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(40px) saturate(1.4)',
            WebkitBackdropFilter: 'blur(40px) saturate(1.4)',
            borderRadius: '24px 24px 0 0',
            padding: '20px 16px 30px',
            boxShadow: '0 -4px 32px rgba(0,0,0,0.1)',
            borderTop: '0.5px solid rgba(255,255,255,0.5)',
            zIndex: '21',
            transform: 'translateY(100%)',
            transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            overflow: 'hidden'
        });
        
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
        title.textContent = 'Tabs';
        Object.assign(title.style, {
            fontSize: '20px',
            fontWeight: '700',
            color: '#1c1c1e'
        });
        
        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'âœ•';
        Object.assign(closeBtn.style, {
            background: 'rgba(0,0,0,0.05)',
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
            this.style.background = 'rgba(0,0,0,0.1)';
        });
        closeBtn.addEventListener('mouseleave', function() {
            this.style.background = 'rgba(0,0,0,0.05)';
        });
        
        header.appendChild(title);
        header.appendChild(closeBtn);
        
        // Tab cards container
        const cardsContainer = document.createElement('div');
        Object.assign(cardsContainer.style, {
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            maxHeight: '400px',
            overflowY: 'auto',
            paddingRight: '4px'
        });
        cardsContainer.className = 'safari-tab-cards';
        
        // New tab button
        const newTabBtn = document.createElement('button');
        newTabBtn.textContent = 'âž• New Tab';
        Object.assign(newTabBtn.style, {
            width: '100%',
            padding: '14px',
            background: 'rgba(0,122,255,0.08)',
            border: '1.5px dashed rgba(0,122,255,0.3)',
            borderRadius: '14px',
            fontSize: '16px',
            fontWeight: '600',
            color: '#007aff',
            cursor: 'pointer',
            marginTop: '12px',
            transition: 'all 0.15s',
            fontFamily: 'inherit'
        });
        newTabBtn.addEventListener('click', function() {
            const simulator = window.Simulator;
            if (simulator) {
                simulator.addTab();
                updateTabView();
            }
            showToast('ðŸ“„ New tab opened (simulated)');
        });
        newTabBtn.addEventListener('mouseenter', function() {
            this.style.background = 'rgba(0,122,255,0.12)';
        });
        newTabBtn.addEventListener('mouseleave', function() {
            this.style.background = 'rgba(0,122,255,0.08)';
        });
        
        tabView.appendChild(header);
        tabView.appendChild(cardsContainer);
        tabView.appendChild(newTabBtn);
        
        DOM.tabView = tabView;
        
        // Add to container
        const container = document.getElementById('safari-container');
        if (container) {
            container.style.position = 'relative';
            container.appendChild(overlay);
            container.appendChild(tabView);
        }
    }

    function updateTabView() {
        const cardsContainer = DOM.tabView ? DOM.tabView.querySelector('.safari-tab-cards') : null;
        if (!cardsContainer) return;
        
        const tabCount = window.Simulator ? window.Simulator.getTabCount() : 3;
        const currentStep = window.Simulator ? window.Simulator.getCurrentStep() : 0;
        
        cardsContainer.innerHTML = '';
        
        for (let i = 0; i < tabCount; i++) {
            const card = document.createElement('div');
            const isActive = i === 0; // Simulate first tab as active
            
            Object.assign(card.style, {
                padding: '14px 16px',
                background: isActive ? '#ffffff' : 'rgba(255,255,255,0.5)',
                borderRadius: '14px',
                boxShadow: isActive ? '0 2px 12px rgba(0,0,0,0.06)' : '0 1px 4px rgba(0,0,0,0.02)',
                border: isActive ? '1px solid rgba(0,122,255,0.15)' : '0.5px solid rgba(0,0,0,0.04)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
            });
            
            const info = document.createElement('div');
            info.style.display = 'flex';
            info.style.alignItems = 'center';
            info.style.gap = '12px';
            info.style.overflow = 'hidden';
            
            const icon = document.createElement('span');
            icon.textContent = isActive ? 'ðŸŒ' : 'ðŸ“„';
            icon.style.fontSize = '20px';
            
            const text = document.createElement('span');
            text.textContent = isActive ? `Step ${currentStep + 1}` : `Tab ${i + 1}`;
            Object.assign(text.style, {
                fontSize: '14px',
                fontWeight: isActive ? '600' : '400',
                color: isActive ? '#1c1c1e' : '#8e8e93',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
            });
            
            const closeBtn = document.createElement('button');
            closeBtn.textContent = 'âœ•';
            Object.assign(closeBtn.style, {
                background: 'none',
                border: 'none',
                fontSize: '14px',
                color: '#8e8e93',
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: '6px',
                transition: 'background 0.15s'
            });
            closeBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                const simulator = window.Simulator;
                if (simulator) {
                    // Remove tab (simulated)
                    showToast(`ðŸ—‘ï¸ Closed tab ${i + 1} (simulated)`);
                }
            });
            closeBtn.addEventListener('mouseenter', function() {
                this.style.background = 'rgba(0,0,0,0.05)';
            });
            closeBtn.addEventListener('mouseleave', function() {
                this.style.background = 'none';
            });
            
            info.appendChild(icon);
            info.appendChild(text);
            card.appendChild(info);
            card.appendChild(closeBtn);
            
            card.addEventListener('click', function() {
                // Switch to this tab (simulated)
                showToast(`â†» Switched to tab ${i + 1} (simulated)`);
                closeTabView();
            });
            
            cardsContainer.appendChild(card);
        }
        
        // Update tab count badge
        const tabsBtn = getSafariTabsBtn();
        if (tabsBtn) {
            tabsBtn.textContent = tabCount > 99 ? '99+' : tabCount;
        }
    }

    // ============================================
    // SHARE SHEET
    // ============================================

    function openShareSheet() {
        if (state.isShareSheetOpen) {
            closeShareSheet();
            return;
        }
        
        log('Opening share sheet', 'info');
        state.isShareSheetOpen = true;
        
        // Create share sheet if it doesn't exist
        if (!DOM.shareSheet) {
            createShareSheet();
        }
        
        // Show with animation
        DOM.shareSheet.classList.add('active');
        DOM.shareSheet.style.animation = 'slideUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)';
        
        if (DOM.shareSheetOverlay) {
            DOM.shareSheetOverlay.classList.add('active');
        }
        
        if (SAFARI_CONFIG.hapticEnabled) {
            simulateHaptic('light');
        }
    }

    function closeShareSheet() {
        if (!state.isShareSheetOpen) return;
        
        state.isShareSheetOpen = false;
        
        if (DOM.shareSheet) {
            DOM.shareSheet.classList.remove('active');
            DOM.shareSheet.style.animation = '';
        }
        
        if (DOM.shareSheetOverlay) {
            DOM.shareSheetOverlay.classList.remove('active');
        }
    }

    function createShareSheet() {
        // Overlay
        const overlay = document.createElement('div');
        overlay.className = 'safari-share-overlay';
        Object.assign(overlay.style, {
            position: 'absolute',
            inset: '0',
            background: 'rgba(0,0,0,0.3)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            zIndex: '25',
            opacity: '0',
            transition: 'opacity 0.3s ease',
            pointerEvents: 'none',
            borderRadius: '36px',
            overflow: 'hidden'
        });
        overlay.addEventListener('click', closeShareSheet);
        DOM.shareSheetOverlay = overlay;
        
        // Share sheet
        const sheet = document.createElement('div');
        sheet.className = 'safari-share-sheet';
        Object.assign(sheet.style, {
            position: 'absolute',
            bottom: '0',
            left: '0',
            right: '0',
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(40px) saturate(1.4)',
            WebkitBackdropFilter: 'blur(40px) saturate(1.4)',
            borderRadius: '24px 24px 0 0',
            padding: '20px 16px 30px',
            boxShadow: '0 -4px 32px rgba(0,0,0,0.1)',
            borderTop: '0.5px solid rgba(255,255,255,0.5)',
            zIndex: '26',
            transform: 'translateY(100%)',
            transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            overflow: 'hidden'
        });
        
        // Handle/drag indicator
        const handle = document.createElement('div');
        Object.assign(handle.style, {
            width: '36px',
            height: '4px',
            background: 'rgba(0,0,0,0.15)',
            borderRadius: '2px',
            margin: '0 auto 16px',
            cursor: 'pointer'
        });
        handle.addEventListener('click', closeShareSheet);
        
        // Title
        const title = document.createElement('div');
        title.textContent = 'Share';
        Object.assign(title.style, {
            fontSize: '18px',
            fontWeight: '700',
            color: '#1c1c1e',
            textAlign: 'center',
            marginBottom: '16px'
        });
        
        // Share options grid
        const grid = document.createElement('div');
        Object.assign(grid.style, {
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px',
            marginBottom: '16px'
        });
        
        const shareOptions = [
            { icon: 'ðŸ’¬', label: 'Messages' },
            { icon: 'ðŸ“§', label: 'Mail' },
            { icon: 'ðŸ“±', label: 'Copy' },
            { icon: 'ðŸ“‹', label: 'More' }
        ];
        
        shareOptions.forEach(option => {
            const btn = document.createElement('button');
            Object.assign(btn.style, {
                background: 'rgba(0,0,0,0.02)',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
                transition: 'background 0.15s',
                fontFamily: 'inherit'
            });
            
            const icon = document.createElement('span');
            icon.textContent = option.icon;
            icon.style.fontSize = '28px';
            
            const label = document.createElement('span');
            label.textContent = option.label;
            Object.assign(label.style, {
                fontSize: '11px',
                fontWeight: '500',
                color: '#6c6c70'
            });
            
            btn.appendChild(icon);
            btn.appendChild(label);
            
            btn.addEventListener('click', function() {
                showToast(`ðŸ“¤ Shared via ${option.label} (simulated)`);
                closeShareSheet();
            });
            
            btn.addEventListener('mouseenter', function() {
                this.style.background = 'rgba(0,0,0,0.04)';
            });
            btn.addEventListener('mouseleave', function() {
                this.style.background = 'rgba(0,0,0,0.02)';
            });
            
            grid.appendChild(btn);
        });
        
        // Cancel button
        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'Cancel';
        Object.assign(cancelBtn.style, {
            width: '100%',
            padding: '14px',
            background: 'rgba(0,0,0,0.04)',
            border: 'none',
            borderRadius: '14px',
            fontSize: '16px',
            fontWeight: '600',
            color: '#1c1c1e',
            cursor: 'pointer',
            transition: 'background 0.15s',
            fontFamily: 'inherit'
        });
        cancelBtn.addEventListener('click', closeShareSheet);
        cancelBtn.addEventListener('mouseenter', function() {
            this.style.background = 'rgba(0,0,0,0.08)';
        });
        cancelBtn.addEventListener('mouseleave', function() {
            this.style.background = 'rgba(0,0,0,0.04)';
        });
        
        sheet.appendChild(handle);
        sheet.appendChild(title);
        sheet.appendChild(grid);
        sheet.appendChild(cancelBtn);
        
        DOM.shareSheet = sheet;
        
        const container = document.getElementById('safari-container');
        if (container) {
            container.style.position = 'relative';
            container.appendChild(overlay);
            container.appendChild(sheet);
        }
    }

    // ============================================
    // HAPTIC FEEDBACK (Simulated)
    // ============================================

    function simulateHaptic(intensity = 'light') {
        // Simulate haptic feedback with a subtle visual/audio cue
        const intensities = {
            light: { scale: 0.98, duration: 50 },
            medium: { scale: 0.96, duration: 80 },
            heavy: { scale: 0.93, duration: 120 }
        };
        
        const config = intensities[intensity] || intensities.light;
        
        // Create a subtle visual pulse on the toolbar
        const toolbar = getSafariToolbar();
        if (toolbar) {
            toolbar.style.transition = `transform ${config.duration}ms ease`;
            toolbar.style.transform = `scale(${config.scale})`;
            setTimeout(() => {
                toolbar.style.transform = 'scale(1)';
            }, config.duration);
        }
        
        // Also try to play a subtle sound if available
        try {
            // Use Web Audio API for a subtle click
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800 + Math.random() * 200;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.03, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.05);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.05);
        } catch (e) {
            // Audio not available, just use visual
        }
    }

    // ============================================
    // READER MODE
    // ============================================

    function toggleReaderMode() {
        state.isReaderModeActive = !state.isReaderModeActive;
        
        const content = getSafariContent();
        if (content) {
            if (state.isReaderModeActive) {
                content.style.fontSize = '18px';
                content.style.lineHeight = '1.8';
                content.style.color = '#1c1c1e';
                content.style.background = '#f8f5f0';
                content.style.padding = '20px 24px 100px';
                showToast('ðŸ“– Reader mode activated');
                log('Reader mode activated', 'info');
            } else {
                content.style.fontSize = '';
                content.style.lineHeight = '';
                content.style.color = '';
                content.style.background = '';
                content.style.padding = '';
                showToast('ðŸ“– Reader mode deactivated');
                log('Reader mode deactivated', 'info');
            }
        }
    }

    // ============================================
    // TOAST NOTIFICATION
    // ============================================

    function showToast(message, duration = 2000) {
        // Use the global toast if available
        if (window.Simulator && window.Simulator.showToast) {
            window.Simulator.showToast(message, duration);
            return;
        }
        
        // Fallback toast
        const existing = document.querySelector('.safari-toast');
        if (existing) existing.remove();
        
        const toast = document.createElement('div');
        toast.className = 'safari-toast';
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
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '500',
            zIndex: '50',
            maxWidth: '90%',
            textAlign: 'center',
            pointerEvents: 'none',
            animation: 'fadeIn 0.3s ease',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            border: '0.5px solid rgba(255,255,255,0.1)'
        });
        toast.textContent = message;
        
        const container = document.getElementById('safari-container');
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
    // PAGE LOAD SIMULATION
    // ============================================

    function simulatePageLoad() {
        if (state.isPageLoading) return;
        
        state.isPageLoading = true;
        state.isLoadingProgress = 0;
        
        log('Page load started', 'info');
        showToast('ðŸŒ Loading...');
        
        // Create progress bar if it doesn't exist
        if (!DOM.progressBar) {
            const progressBar = document.createElement('div');
            Object.assign(progressBar.style, {
                position: 'absolute',
                top: '0',
                left: '0',
                height: '3px',
                background: 'linear-gradient(90deg, #007aff, #5856d6)',
                width: '0%',
                zIndex: '15',
                transition: 'width 0.3s ease',
                borderRadius: '0 2px 2px 0'
            });
            DOM.progressBar = progressBar;
            
            const container = document.getElementById('safari-container');
            if (container) {
                container.style.position = 'relative';
                container.appendChild(progressBar);
            }
        }
        
        // Simulate loading progress
        const interval = setInterval(() => {
            state.isLoadingProgress += 10 + Math.random() * 20;
            if (state.isLoadingProgress >= 100) {
                state.isLoadingProgress = 100;
                clearInterval(interval);
                completePageLoad();
            }
            if (DOM.progressBar) {
                DOM.progressBar.style.width = state.isLoadingProgress + '%';
            }
        }, 300);
    }

    function completePageLoad() {
        state.isPageLoading = false;
        
        // Flash effect
        const content = getSafariContent();
        if (content) {
            content.style.transition = 'opacity 0.3s ease';
            content.style.opacity = '0.7';
            setTimeout(() => {
                content.style.opacity = '1';
            }, 100);
        }
        
        // Hide progress bar after a moment
        setTimeout(() => {
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
        }, 500);
        
        log('Page load complete', 'success');
        showToast('âœ… Page loaded');
    }

    // ============================================
    // PRIVATE BROWSING
    // ============================================

    function togglePrivateBrowsing() {
        state.isPrivateBrowsing = !state.isPrivateBrowsing;
        
        const container = document.getElementById('safari-container');
        if (container) {
            if (state.isPrivateBrowsing) {
                container.style.background = '#1a1a1e';
                const statusBar = document.querySelector('.safari-status-bar');
                if (statusBar) {
                    statusBar.style.color = '#8e8e93';
                }
                const urlPill = getSafariUrlPill();
                if (urlPill) {
                    urlPill.style.background = 'rgba(255,255,255,0.05)';
                    urlPill.style.color = '#8e8e93';
                }
                showToast('ðŸ”’ Private browsing activated');
                log('Private browsing activated', 'info');
            } else {
                container.style.background = '';
                const statusBar = document.querySelector('.safari-status-bar');
                if (statusBar) {
                    statusBar.style.color = '';
                }
                const urlPill = getSafariUrlPill();
                if (urlPill) {
                    urlPill.style.background = '';
                    urlPill.style.color = '';
                }
                showToast('ðŸ”“ Private browsing deactivated');
                log('Private browsing deactivated', 'info');
            }
        }
    }

    // ============================================
    // DYNAMIC TINTING (Address bar matches page color)
    // ============================================

    function applyDynamicTinting(color) {
        if (!SAFARI_CONFIG.tintingEnabled) return;
        
        const toolbar = getSafariToolbar();
        const urlPill = getSafariUrlPill();
        
        if (!toolbar || !urlPill) return;
        
        state.currentTintColor = color || '#007aff';
        state.isTinted = true;
        
        // Apply tint to toolbar background
        const tintColor = state.currentTintColor;
        toolbar.style.background = `rgba(255,255,255,0.85)`;
        toolbar.style.boxShadow = `0 4px 20px rgba(0,0,0,0.06), 0 0 0 0.5px ${tintColor}40`;
        
        // Tint the URL pill
        urlPill.style.background = `${tintColor}15`;
        urlPill.style.borderColor = `${tintColor}30`;
        
        // Tint the tabs button
        const tabsBtn = getSafariTabsBtn();
        if (tabsBtn) {
            tabsBtn.style.background = `${tintColor}15`;
            tabsBtn.style.color = tintColor;
        }
    }

    function clearDynamicTinting() {
        state.isTinted = false;
        
        const toolbar = getSafariToolbar();
        const urlPill = getSafariUrlPill();
        const tabsBtn = getSafariTabsBtn();
        
        if (toolbar) {
            toolbar.style.background = '';
            toolbar.style.boxShadow = '';
        }
        if (urlPill) {
            urlPill.style.background = '';
            urlPill.style.borderColor = '';
        }
        if (tabsBtn) {
            tabsBtn.style.background = '';
            tabsBtn.style.color = '';
        }
    }

    // ============================================
    // PUBLIC API
    // ============================================

    const SafariUI = {
        // Gestures
        initGestures: initGestures,
        
        // Tab view
        openTabView: openTabView,
        closeTabView: closeTabView,
        updateTabView: updateTabView,
        isTabViewOpen: function() { return state.isTabViewOpen; },
        
        // Share sheet
        openShareSheet: openShareSheet,
        closeShareSheet: closeShareSheet,
        isShareSheetOpen: function() { return state.isShareSheetOpen; },
        
        // Address bar
        toggleAddressBarFocus: toggleAddressBarFocus,
        updateUrlPill: updateUrlPill,
        getAddressBarText: function() { return state.addressBarText; },
        setAddressBarText: function(text) { 
            state.addressBarText = text;
            updateUrlPill(text);
        },
        
        // Reader mode
        toggleReaderMode: toggleReaderMode,
        isReaderModeActive: function() { return state.isReaderModeActive; },
        
        // Private browsing
        togglePrivateBrowsing: togglePrivateBrowsing,
        isPrivateBrowsing: function() { return state.isPrivateBrowsing; },
        
        // Page load
        simulatePageLoad: simulatePageLoad,
        isPageLoading: function() { return state.isPageLoading; },
        
        // Dynamic tinting
        applyDynamicTinting: applyDynamicTinting,
        clearDynamicTinting: clearDynamicTinting,
        isTinted: function() { return state.isTinted; },
        
        // Haptic feedback
        simulateHaptic: simulateHaptic,
        
        // Toast
        showToast: showToast,
        
        // State
        getState: function() { return { ...state }; },
        
        // Cleanup
        destroy: function() {
            // Clean up event listeners
            const content = getSafariContent();
            if (content) {
                content.removeEventListener('touchstart', handleContentTouchStart);
                content.removeEventListener('touchmove', handleContentTouchMove);
                content.removeEventListener('touchend', handleContentTouchEnd);
                content.removeEventListener('scroll', handleContentScroll);
            }
            
            // Remove dynamically created elements
            if (DOM.tabView) {
                DOM.tabView.remove();
                DOM.tabView = null;
            }
            if (DOM.tabViewOverlay) {
                DOM.tabViewOverlay.remove();
                DOM.tabViewOverlay = null;
            }
            if (DOM.shareSheet) {
                DOM.shareSheet.remove();
                DOM.shareSheet = null;
            }
            if (DOM.shareSheetOverlay) {
                DOM.shareSheetOverlay.remove();
                DOM.shareSheetOverlay = null;
            }
            if (DOM.progressBar) {
                DOM.progressBar.remove();
                DOM.progressBar = null;
            }
            if (DOM.refreshIndicator) {
                DOM.refreshIndicator.remove();
                DOM.refreshIndicator = null;
            }
            if (DOM.addressPopover) {
                DOM.addressPopover.remove();
                DOM.addressPopover = null;
            }
            
            // Reset state
            state.isTabViewOpen = false;
            state.isShareSheetOpen = false;
            state.isReaderModeActive = false;
            state.isPrivateBrowsing = false;
            state.isPageLoading = false;
            
            log('Safari UI destroyed', 'info');
        }
    };

    // ============================================
    // AUTO-INIT
    // ============================================

    // Expose globally
    window.SafariUI = SafariUI;

    // Initialize when DOM is ready and Safari container exists
    function autoInit() {
        const container = document.getElementById('safari-container');
        if (container) {
            // Initialize Safari-specific styles
            const style = document.createElement('style');
            style.textContent = `
                @keyframes slideUp {
                    from { transform: translateY(100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .safari-tab-overlay.active,
                .safari-share-overlay.active {
                    opacity: 1 !important;
                    pointer-events: auto !important;
                }
                .safari-tab-view.active,
                .safari-share-sheet.active {
                    transform: translateY(0) !important;
                }
            `;
            document.head.appendChild(style);
            
            // Initialize gestures
            setTimeout(initGestures, 300);
            
            log('Safari UI initialized', 'success');
            log('ðŸ’¡ Swipe left/right on URL pill to switch tabs', 'info');
            log('ðŸ’¡ Swipe up on toolbar to open tab view', 'info');
            log('ðŸ’¡ Swipe from left edge to go back', 'info');
            log('ðŸ’¡ Pull down from top to refresh', 'info');
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', autoInit);
    } else {
        autoInit();
    }

})();
