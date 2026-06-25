/**
 * js/simulator.js
 * Digital ATM – Core Simulator Engine
 * 
 * Handles:
 * - State management (platform, customer type, current step, tab count)
 * - Navigation (next, back, jump to step, reset)
 * - Rendering (step content injection)
 * - Event binding (buttons, keyboard shortcuts, gestures)
 * - Platform switching
 * - Toolbar collapse management
 * - URL updates
 * - Data validation
 * - Console commands for debugging
 */

(function() {
    'use strict';

    // ============================================
    // SIMULATOR CONFIGURATION
    // ============================================

    const CONFIG = {
        // Step transition animation duration (ms)
        animationDuration: 300,
        
        // Scroll threshold for toolbar collapse (px)
        toolbarCollapseThreshold: 20,
        
        // Maximum tabs allowed
        maxTabs: 99,
        
        // Default tab count
        defaultTabCount: 3,
        
        // Debug mode (logs more info)
        debug: true,
        
        // Step data path (for error messages)
        dataPath: 'js/data.js'
    };

    // ============================================
    // STATE
    // ============================================

    const state = {
        // Current platform: 'safari' | 'chrome' | null
        platform: null,
        
        // Customer type: 'core' | 'vip'
        customerType: 'core',
        
        // Current step index (0-based)
        currentStep: 0,
        
        // Total number of steps (calculated from data)
        totalSteps: 0,
        
        // Number of open tabs (simulated)
        tabCount: CONFIG.defaultTabCount,
        
        // Whether the toolbar is collapsed
        isToolbarCollapsed: false,
        
        // Last scroll position (for restoration)
        lastScrollPosition: 0,
        
        // Whether we're in the middle of a transition
        isTransitioning: false,
        
        // Step data cache
        _stepsCache: null,
        
        // Platform-specific content references
        _contentRefs: {
            safari: null,
            chrome: null
        }
    };

    // ============================================
    // DOM CACHE
    // ============================================

    const DOM = {
        // Platform selector
        platformSelector: null,
        
        // Safari container
        safariContainer: null,
        safariContent: null,
        safariStepContainer: null,
        safariToolbar: null,
        safariUrl: null,
        safariTabsBtn: null,
        safariBackBtn: null,
        
        // Chrome container
        chromeContainer: null,
        chromeContent: null,
        chromeStepContainer: null,
        chromeUrl: null,
        chromeTabCount: null,
        chromeBackBtn: null,
        chromeHomeBtn: null,
        chromeNewTabBtn: null,
        chromeTabsBtn: null,
        chromeMenuBtn: null,
        chromeMoreBtn: null,
        
        // Shared
        customerToggle: null
    };

    // ============================================
    // HELPER FUNCTIONS
    // ============================================

    function log(message, type = 'info') {
        if (!CONFIG.debug) return;
        
        const prefix = '📱 [Simulator]';
        switch (type) {
            case 'info':
                console.log(`${prefix} ${message}`);
                break;
            case 'warn':
                console.warn(`${prefix} ⚠️ ${message}`);
                break;
            case 'error':
                console.error(`${prefix} ❌ ${message}`);
                break;
            case 'success':
                console.log(`${prefix} ✅ ${message}`);
                break;
        }
    }

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function getSteps() {
        // Check if data is loaded
        if (!window.STEP_DATA) {
            log('STEP_DATA not loaded!', 'error');
            return [];
        }
        
        const steps = window.STEP_DATA[state.customerType];
        if (!steps || !Array.isArray(steps) || steps.length === 0) {
            log(`No steps found for customer type: ${state.customerType}`, 'error');
            return [];
        }
        
        return steps;
    }

    function getCurrentStepData() {
        const steps = getSteps();
        if (steps.length === 0) return null;
        
        // Clamp current step
        state.currentStep = clamp(state.currentStep, 0, steps.length - 1);
        state.totalSteps = steps.length;
        
        return steps[state.currentStep];
    }

    function getCustomerLabel() {
        return state.customerType === 'core' ? 'Core Standard' : 'VIP Speedrun';
    }

    function getPlatformLabel() {
        return state.platform === 'safari' ? 'iOS 26 Safari' : 'Android Chrome';
    }

    function getStepUrl() {
        const stepNumber = state.currentStep + 1;
        return `digitalatm.com/step-${stepNumber}`;
    }

    function getFormattedUrl() {
        const url = getStepUrl();
        const parts = url.split('.');
        if (parts.length > 0) {
            return {
                full: url,
                domain: parts[0] || 'digitalatm',
                path: parts.slice(1).join('.') || 'com'
            };
        }
        return {
            full: url,
            domain: 'digitalatm',
            path: 'com'
        };
    }

    // ============================================
    // RENDER ENGINE
    // ============================================

    function renderStep() {
        // Check if DOM is ready
        if (!DOM.safariStepContainer || !DOM.chromeStepContainer) {
            log('DOM containers not ready', 'error');
            return;
        }

        // Get step data
        const step = getCurrentStepData();
        if (!step) {
            showError('No step data available. Please check that js/data.js is loaded correctly.');
            return;
        }

        // Update tab count display
        updateTabCount();

        // Update URL display
        updateUrl();

        // Build HTML
        const html = buildStepHTML(step);

        // Inject into both containers
        DOM.safariStepContainer.innerHTML = html;
        DOM.chromeStepContainer.innerHTML = html;

        // Bind events for the newly rendered content
        bindStepEvents();

        // Update toolbar collapse state
        updateToolbarCollapse();

        // Scroll to top
        scrollToTop();

        // Log current state
        log(`Rendered step ${state.currentStep + 1}/${state.totalSteps} (${getCustomerLabel()})`, 'info');

        // Trigger any post-render animations
        triggerPostRenderAnimations();

        // Update any external state (like URL hash)
        updateUrlHash();
    }

    function buildStepHTML(step) {
        const stepNumber = state.currentStep + 1;
        const total = state.totalSteps;
        const customerLabel = getCustomerLabel();
        const isVip = state.customerType === 'vip';
        const stepId = step.id || `step-${stepNumber}`;

        let html = `
            <div class="step-content active" data-step-id="${stepId}" data-step-number="${stepNumber}">
                <div class="step-indicator">
                    ${customerLabel} · Step ${stepNumber} of ${total}
                </div>
        `;

        // VIP badge
        if (isVip || step.isVip) {
            html += `<div class="vip-badge">⭐ VIP Speedrun</div>`;
        }

        // Title
        if (step.title) {
            html += `<h2>${step.title}</h2>`;
        }

        // Subtitle
        if (step.subtitle) {
            html += `<div class="subtitle">${step.subtitle}</div>`;
        }

        // Video placeholder
        if (step.showVideo) {
            html += buildVideoHTML(step);
        }

        // Progress bar
        if (step.progress) {
            html += buildProgressHTML(step);
        }

        // Paragraphs (filtering out bullet items)
        if (step.paragraphs && step.paragraphs.length > 0) {
            const nonBullets = step.paragraphs.filter(p => !p.startsWith('•'));
            nonBullets.forEach(function(p) {
                html += `<p>${p}</p>`;
            });
        }

        // Bullet lists
        if (step.paragraphs && step.paragraphs.length > 0) {
            const bullets = step.paragraphs.filter(p => p.startsWith('•'));
            if (bullets.length > 0) {
                html += `<ul class="bullet-list">`;
                bullets.forEach(function(b) {
                    html += `<li>${b.replace('•', '').trim()}</li>`;
                });
                html += `</ul>`;
            }
        }

        // Product card
        if (step.product) {
            html += buildProductHTML(step);
        }

        // Name suggestions
        if (step.nameSuggestions) {
            html += buildNameSuggestionsHTML(step);
        }

        // AI prompts
        if (step.aiPrompts) {
            html += buildAIPromptsHTML(step);
        }

        // Example products
        if (step.exampleProducts) {
            html += buildExampleProductsHTML(step);
        }

        // Live URL display
        if (step.liveUrl) {
            html += buildLiveUrlHTML(step);
        }

        // Support callout
        if (step.supportPhone || step.supportLabel) {
            html += buildSupportHTML(step);
        }

        // Buttons
        if (step.primaryButton) {
            html += `<button class="btn-primary" data-action="primary">${step.primaryButton}</button>`;
        }
        if (step.secondaryButton) {
            html += `<button class="btn-secondary" data-action="secondary">${step.secondaryButton}</button>`;
        }

        // Navigation
        html += buildNavigationHTML();

        html += `</div>`;

        return html;
    }

    // ----- HTML BUILDERS -----

    function buildVideoHTML(step) {
        return `
            <div class="video-container" data-action="play-video">
                <div class="play-icon">▶</div>
                <div class="duration">${step.videoDuration || '1:40'}</div>
                <div class="video-label">🎬 HEY, I'M RYAN.</div>
            </div>
        `;
    }

    function buildProgressHTML(step) {
        return `
            <div class="progress-bar">
                <span>Now: <span class="highlight">${step.progress.now || ''}</span></span>
                <span>·</span>
                <span>Next: ${step.progress.next || ''}</span>
            </div>
        `;
    }

    function buildProductHTML(step) {
        return `
            <div class="product-card">
                <div class="product-title">${step.product.name || step.product.shortName || 'Product'}</div>
                ${step.product.shortName ? `<div class="product-sub">${step.product.shortName}</div>` : ''}
            </div>
        `;
    }

    function buildNameSuggestionsHTML(step) {
        let html = `<div class="name-suggestions">`;
        step.nameSuggestions.forEach(function(suggestion) {
            html += `<span class="chip" data-action="suggestion">${suggestion}</span>`;
        });
        html += `</div>`;
        if (step.inputPlaceholder) {
            html += `<input class="input-field" type="text" placeholder="${step.inputPlaceholder}" data-action="name-input" />`;
        }
        return html;
    }

    function buildAIPromptsHTML(step) {
        let html = `<div class="ai-prompts">`;
        step.aiPrompts.forEach(function(prompt, index) {
            html += `
                <div class="prompt-group">
                    <label>${prompt.label} <span class="hint">(optional)</span></label>
                    <textarea placeholder="${prompt.placeholder}" data-action="ai-prompt" data-index="${index}"></textarea>
                </div>
            `;
        });
        html += `</div>`;
        return html;
    }

    function buildExampleProductsHTML(step) {
        let html = `<div class="example-products">`;
        html += `<span class="label">📦 Pick one to start:</span>`;
        step.exampleProducts.forEach(function(product) {
            html += `
                <div class="product-item" data-action="example-product">
                    ${product}
                </div>
            `;
        });
        html += `</div>`;
        return html;
    }

    function buildLiveUrlHTML(step) {
        return `
            <div class="live-url-display">
                <div class="label">🌐 Live at:</div>
                <div class="url">${step.liveUrl}</div>
                ${step.author ? `<div class="author">by ${step.author}</div>` : ''}
            </div>
        `;
    }

    function buildSupportHTML(step) {
        return `
            <div class="support-callout">
                ${step.supportPhone ? `<div class="phone">📞 ${step.supportPhone}</div>` : ''}
                ${step.supportLabel ? `<div>${step.supportLabel}</div>` : ''}
            </div>
        `;
    }

    function buildNavigationHTML() {
        const isFirst = state.currentStep === 0;
        const isLast = state.currentStep === state.totalSteps - 1;
        
        return `
            <div class="content-nav">
                <button class="btn-back" data-action="back" ${isFirst ? 'disabled' : ''}>
                    ← Back
                </button>
                <button class="btn-next" data-action="next">
                    ${isLast ? '✅ Done' : 'Next →'}
                </button>
            </div>
        `;
    }

    // ----- EVENT BINDING -----

    function bindStepEvents() {
        // Use event delegation on containers
        const containers = [DOM.safariStepContainer, DOM.chromeStepContainer];
        
        containers.forEach(container => {
            if (!container) return;
            
            // Remove old listeners by cloning and replacing
            // We'll use a clean approach with data attributes
            
            // Navigation: Back
            const backBtns = container.querySelectorAll('[data-action="back"]');
            backBtns.forEach(btn => {
                btn.removeEventListener('click', handleBack);
                btn.addEventListener('click', handleBack);
            });
            
            // Navigation: Next
            const nextBtns = container.querySelectorAll('[data-action="next"]');
            nextBtns.forEach(btn => {
                btn.removeEventListener('click', handleNext);
                btn.addEventListener('click', handleNext);
            });
            
            // Primary button
            const primaryBtns = container.querySelectorAll('[data-action="primary"]');
            primaryBtns.forEach(btn => {
                btn.removeEventListener('click', handlePrimary);
                btn.addEventListener('click', handlePrimary);
            });
            
            // Secondary button
            const secondaryBtns = container.querySelectorAll('[data-action="secondary"]');
            secondaryBtns.forEach(btn => {
                btn.removeEventListener('click', handleSecondary);
                btn.addEventListener('click', handleSecondary);
            });
            
            // Name suggestions
            const suggestionChips = container.querySelectorAll('[data-action="suggestion"]');
            suggestionChips.forEach(chip => {
                chip.removeEventListener('click', handleSuggestion);
                chip.addEventListener('click', handleSuggestion);
            });
            
            // Example products
            const exampleProducts = container.querySelectorAll('[data-action="example-product"]');
            exampleProducts.forEach(item => {
                item.removeEventListener('click', handleExampleProduct);
                item.addEventListener('click', handleExampleProduct);
            });
            
            // Video play
            const videoContainers = container.querySelectorAll('[data-action="play-video"]');
            videoContainers.forEach(video => {
                video.removeEventListener('click', handleVideoPlay);
                video.addEventListener('click', handleVideoPlay);
            });
            
            // AI prompts (auto-expand on focus)
            const aiTextareas = container.querySelectorAll('[data-action="ai-prompt"]');
            aiTextareas.forEach(textarea => {
                textarea.removeEventListener('focus', handleAIFocus);
                textarea.addEventListener('focus', handleAIFocus);
            });
            
            // Name input
            const nameInputs = container.querySelectorAll('[data-action="name-input"]');
            nameInputs.forEach(input => {
                input.removeEventListener('keydown', handleNameInput);
                input.addEventListener('keydown', handleNameInput);
            });
        });
    }

    // ----- EVENT HANDLERS -----

    function handleBack(e) {
        e.stopPropagation();
        if (state.currentStep > 0) {
            state.currentStep--;
            renderStep();
            scrollToTop();
            log(`Navigated back to step ${state.currentStep + 1}`, 'info');
        }
    }

    function handleNext(e) {
        e.stopPropagation();
        if (state.currentStep < state.totalSteps - 1) {
            state.currentStep++;
            renderStep();
            scrollToTop();
            log(`Navigated forward to step ${state.currentStep + 1}`, 'info');
        }
    }

    function handlePrimary(e) {
        e.stopPropagation();
        const btn = e.currentTarget;
        const text = btn.textContent.trim();
        
        log(`Primary button clicked: "${text}"`, 'info');
        
        // Check if this button should advance to next step
        const advanceTriggers = [
            'Publish my site',
            'Let\'s get this one live',
            'That\'s my note, continue',
            'Yes, that\'s it',
            'I watched it, let\'s build',
            'This is my address',
            'Done, bookmarked',
            'Keep going in the playbook',
            'Add it to my site',
            'Claim My Digital Real Estate',
            'Start My Done-With-You Setup',
            'Visit my site',
            'That\'s the link',
            'Write the page'
        ];
        
        if (advanceTriggers.some(trigger => text.includes(trigger) || trigger.includes(text))) {
            if (state.currentStep < state.totalSteps - 1) {
                state.currentStep++;
                renderStep();
                scrollToTop();
                log(`Advanced after "${text}"`, 'success');
            } else {
                log('Already on last step', 'warn');
                showToast('🎉 You\'ve completed all steps!');
            }
        } else {
            // Just show feedback for other buttons
            showToast(`🔘 "${text}" clicked (simulated)`);
        }
    }

    function handleSecondary(e) {
        e.stopPropagation();
        const btn = e.currentTarget;
        const text = btn.textContent.trim();
        
        log(`Secondary button clicked: "${text}"`, 'info');
        
        if (text.includes('Talk to someone') || text.includes('Do it for me')) {
            showToast(`📞 "${text}" clicked (simulated)`);
        } else if (text === 'Show me others') {
            showToast('📦 Showing more product suggestions (simulated)');
        } else if (text === 'Just chat instead') {
            showToast('💬 Chat mode activated (simulated)');
        } else {
            showToast(`🔘 "${text}" clicked (simulated)`);
        }
    }

    function handleSuggestion(e) {
        const chip = e.currentTarget;
        const text = chip.textContent.trim();
        
        // Find the input field in the same container
        const container = chip.closest('.step-content');
        const input = container ? container.querySelector('[data-action="name-input"]') : null;
        
        if (input) {
            input.value = text;
            input.style.borderColor = '#4caf50';
            input.style.background = '#e8f5e9';
            setTimeout(() => {
                input.style.borderColor = '';
                input.style.background = '';
            }, 1000);
            
            log(`Selected name suggestion: "${text}"`, 'success');
            showToast(`✅ Name set to: "${text}"`);
        }
    }

    function handleExampleProduct(e) {
        const item = e.currentTarget;
        const text = item.textContent.trim();
        log(`Selected example product: "${text}"`, 'info');
        showToast(`📦 Selected: "${text.substring(0, 40)}..."`);
    }

    function handleVideoPlay(e) {
        log('Video play button clicked', 'info');
        showToast('▶️ Video playing (simulated)');
        const container = e.currentTarget;
        const playIcon = container.querySelector('.play-icon');
        if (playIcon) {
            playIcon.textContent = '⏸';
            setTimeout(() => {
                playIcon.textContent = '▶';
            }, 3000);
        }
    }

    function handleAIFocus(e) {
        const textarea = e.currentTarget;
        textarea.style.borderColor = '#007aff';
        textarea.style.background = '#ffffff';
        log(`AI prompt focused: "${textarea.placeholder}"`, 'info');
    }

    function handleNameInput(e) {
        if (e.key === 'Enter') {
            const input = e.currentTarget;
            const value = input.value.trim();
            if (value) {
                log(`Name entered: "${value}"`, 'success');
                showToast(`✅ Site name: "${value}"`);
            }
        }
    }

    // ============================================
    // UI UPDATES
    // ============================================

    function updateTabCount() {
        const count = state.tabCount;
        if (DOM.safariTabsBtn) {
            DOM.safariTabsBtn.textContent = count > 99 ? '99+' : count;
        }
        if (DOM.chromeTabCount) {
            DOM.chromeTabCount.textContent = count > 99 ? '99+' : count;
        }
    }

    function updateUrl() {
        const url = getStepUrl();
        const urlData = getFormattedUrl();
        
        if (DOM.safariUrl) {
            DOM.safariUrl.textContent = url;
        }
        
        if (DOM.chromeUrl) {
            DOM.chromeUrl.innerHTML = `
                <span class="domain">${urlData.domain}</span>.${urlData.path}
            `;
        }
    }

    function updateUrlHash() {
        const hash = `#step-${state.currentStep + 1}`;
        if (window.history && window.history.replaceState) {
            try {
                window.history.replaceState(null, '', hash);
            } catch (e) {
                // Ignore errors
            }
        }
    }

    function updateToolbarCollapse() {
        const content = state.platform === 'safari' ? DOM.safariContent : DOM.chromeContent;
        if (!content) return;
        
        const isScrolled = content.scrollTop > CONFIG.toolbarCollapseThreshold;
        state.isToolbarCollapsed = isScrolled;
        
        if (state.platform === 'safari' && DOM.safariToolbar) {
            DOM.safariToolbar.classList.toggle('collapsed', isScrolled);
        }
    }

    function scrollToTop() {
        const content = state.platform === 'safari' ? DOM.safariContent : DOM.chromeContent;
        if (content) {
            content.scrollTop = 0;
            state.lastScrollPosition = 0;
            // Update toolbar after scroll
            setTimeout(updateToolbarCollapse, 50);
        }
    }

    function showToast(message, duration = 2500) {
        // Remove existing toast
        const existing = document.querySelector('.simulator-toast');
        if (existing) existing.remove();
        
        const toast = document.createElement('div');
        toast.className = 'simulator-toast';
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
            padding: '12px 24px',
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
        
        // Find the phone screen
        const phoneScreen = document.querySelector('.phone-screen');
        if (phoneScreen) {
            phoneScreen.style.position = 'relative';
            phoneScreen.appendChild(toast);
        } else {
            document.body.appendChild(toast);
        }
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    function showError(message) {
        const errorHTML = `
            <div style="padding: 40px 20px; text-align: center; color: #8e8e93;">
                <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
                <h3 style="font-size: 18px; font-weight: 600; color: #1c1c1e; margin-bottom: 8px;">Error Loading Data</h3>
                <p style="font-size: 14px; line-height: 1.6; margin-bottom: 8px;">${message}</p>
                <p style="font-size: 13px; color: #6c6c70;">File path: <code style="background: #f1f1f4; padding: 2px 8px; border-radius: 4px;">${CONFIG.dataPath}</code></p>
                <button onclick="location.reload()" style="margin-top: 16px; padding: 10px 24px; background: #007aff; color: #fff; border: none; border-radius: 10px; font-weight: 600; cursor: pointer;">
                    ↻ Reload
                </button>
            </div>
        `;
        
        if (DOM.safariStepContainer) {
            DOM.safariStepContainer.innerHTML = errorHTML;
        }
        if (DOM.chromeStepContainer) {
            DOM.chromeStepContainer.innerHTML = errorHTML;
        }
    }

    function triggerPostRenderAnimations() {
        // Any post-render animations can go here
        // For example, highlighting new elements
    }

    // ============================================
    // PLATFORM SWITCHING
    // ============================================

    function switchPlatform(platform) {
        if (!platform || (platform !== 'safari' && platform !== 'chrome')) {
            log('Invalid platform specified', 'error');
            return;
        }
        
        if (state.platform === platform) {
            log(`Already on ${platform}`, 'warn');
            return;
        }
        
        log(`Switching to ${platform === 'safari' ? 'iOS 26 Safari' : 'Android Chrome'}`, 'info');
        
        state.platform = platform;
        
        // Hide platform selector
        if (DOM.platformSelector) {
            DOM.platformSelector.classList.add('hidden');
        }
        
        // Hide all browser containers
        if (DOM.safariContainer) {
            DOM.safariContainer.classList.remove('active');
        }
        if (DOM.chromeContainer) {
            DOM.chromeContainer.classList.remove('active');
        }
        
        // Show selected
        if (platform === 'safari' && DOM.safariContainer) {
            DOM.safariContainer.classList.add('active');
            // Store content reference
            state._contentRefs.safari = DOM.safariContent;
        } else if (platform === 'chrome' && DOM.chromeContainer) {
            DOM.chromeContainer.classList.add('active');
            state._contentRefs.chrome = DOM.chromeContent;
        }
        
        // Attach scroll listeners
        const content = platform === 'safari' ? DOM.safariContent : DOM.chromeContent;
        if (content) {
            content.removeEventListener('scroll', updateToolbarCollapse);
            content.addEventListener('scroll', updateToolbarCollapse);
        }
        
        // Render step
        renderStep();
        
        log(`Switched to ${getPlatformLabel()}`, 'success');
    }

    // ============================================
    // CUSTOMER TYPE SWITCHING
    // ============================================

    function setCustomerType(type) {
        if (type !== 'core' && type !== 'vip') {
            log(`Invalid customer type: ${type}. Use 'core' or 'vip'`, 'error');
            return;
        }
        
        if (state.customerType === type) {
            log(`Already on ${type}`, 'warn');
            return;
        }
        
        log(`Switching to ${type === 'core' ? 'Core Standard' : 'VIP Speedrun'}`, 'info');
        
        state.customerType = type;
        state.currentStep = 0;
        
        // Update any toggle UI
        updateCustomerToggleUI();
        
        renderStep();
        scrollToTop();
        
        log(`Switched to ${getCustomerLabel()}`, 'success');
    }

    function updateCustomerToggleUI() {
        // If we have a toggle in the UI, update it
        const toggles = document.querySelectorAll('.customer-toggle-wrapper button');
        toggles.forEach(btn => {
            const type = btn.dataset.customerType;
            btn.classList.toggle('active', type === state.customerType);
        });
    }

    // ============================================
    // NAVIGATION METHODS
    // ============================================

    function goToStep(index) {
        const steps = getSteps();
        if (steps.length === 0) return;
        
        const target = clamp(index, 0, steps.length - 1);
        if (target === state.currentStep) return;
        
        state.currentStep = target;
        renderStep();
        scrollToTop();
        log(`Jumped to step ${target + 1}`, 'info');
    }

    function goToFirstStep() {
        goToStep(0);
    }

    function goToLastStep() {
        const steps = getSteps();
        if (steps.length > 0) {
            goToStep(steps.length - 1);
        }
    }

    function resetSimulator() {
        state.currentStep = 0;
        state.tabCount = CONFIG.defaultTabCount;
        state.isToolbarCollapsed = false;
        state.lastScrollPosition = 0;
        
        renderStep();
        scrollToTop();
        
        log('Simulator reset', 'info');
        showToast('🔄 Simulator reset');
    }

    // ============================================
    // TAB MANAGEMENT
    // ============================================

    function addTab() {
        state.tabCount = Math.min(state.tabCount + 1, CONFIG.maxTabs);
        updateTabCount();
        log(`Tab count: ${state.tabCount}`, 'info');
    }

    function removeTab() {
        state.tabCount = Math.max(state.tabCount - 1, 1);
        updateTabCount();
        log(`Tab count: ${state.tabCount}`, 'info');
    }

    function resetTabs() {
        state.tabCount = CONFIG.defaultTabCount;
        updateTabCount();
        log(`Tab count reset to ${state.tabCount}`, 'info');
    }

    // ============================================
    // KEYBOARD SHORTCUTS
    // ============================================

    function handleKeyboardShortcuts(e) {
        // Don't trigger if typing in input/textarea
        const tag = e.target.tagName.toLowerCase();
        if (tag === 'input' || tag === 'textarea') return;
        
        switch (e.key) {
            case 'ArrowRight':
            case 'ArrowDown':
                e.preventDefault();
                if (state.currentStep < state.totalSteps - 1) {
                    state.currentStep++;
                    renderStep();
                    scrollToTop();
                }
                break;
                
            case 'ArrowLeft':
            case 'ArrowUp':
                e.preventDefault();
                if (state.currentStep > 0) {
                    state.currentStep--;
                    renderStep();
                    scrollToTop();
                }
                break;
                
            case 'c':
            case 'C':
                e.preventDefault();
                const newType = state.customerType === 'core' ? 'vip' : 'core';
                setCustomerType(newType);
                break;
                
            case 'r':
            case 'R':
                e.preventDefault();
                resetSimulator();
                break;
                
            case 't':
            case 'T':
                e.preventDefault();
                addTab();
                break;
                
            case 'Home':
                e.preventDefault();
                goToFirstStep();
                break;
                
            case 'End':
                e.preventDefault();
                goToLastStep();
                break;
                
            case '?':
                e.preventDefault();
                showHelp();
                break;
        }
    }

    function showHelp() {
        const helpMessage = `
📱 Digital ATM Simulator – Keyboard Shortcuts

← / ↑  : Previous step
→ / ↓  : Next step
C      : Toggle customer type (Core ↔ VIP)
R      : Reset simulator to step 1
T      : Add a new tab
Home   : Go to first step
End    : Go to last step
?      : Show this help message
        `;
        console.log(helpMessage);
        showToast('⌨️ Help: Press ? for shortcuts');
        
        // Also log to console with better formatting
        console.log('%c📱 Digital ATM Simulator Shortcuts', 'font-size:16px;font-weight:bold;');
        console.log('  ← / ↑  : Previous step');
        console.log('  → / ↓  : Next step');
        console.log('  C      : Toggle customer type');
        console.log('  R      : Reset simulator');
        console.log('  T      : Add tab');
        console.log('  Home   : Go to first step');
        console.log('  End    : Go to last step');
        console.log('  ?      : Show this help');
    }

    // ============================================
    // INITIALIZATION
    // ============================================

    function init() {
        log('Initializing Digital ATM Simulator...', 'info');
        
        // Cache DOM elements
        cacheDOM();
        
        // Check if data is loaded
        if (!window.STEP_DATA) {
            log('STEP_DATA not found. Make sure js/data.js is loaded.', 'error');
            showError('Data file not loaded. Please ensure js/data.js exists and is properly linked.');
            return;
        }
        
        // Log data stats
        const coreSteps = window.STEP_DATA.core ? window.STEP_DATA.core.length : 0;
        const vipSteps = window.STEP_DATA.vip ? window.STEP_DATA.vip.length : 0;
        log(`Data loaded: ${coreSteps} Core steps, ${vipSteps} VIP steps`, 'success');
        
        // Set initial state
        state.totalSteps = getSteps().length;
        
        // Show platform selector
        if (DOM.platformSelector) {
            DOM.platformSelector.classList.remove('hidden');
        }
        
        // Hide all browser containers
        if (DOM.safariContainer) {
            DOM.safariContainer.classList.remove('active');
        }
        if (DOM.chromeContainer) {
            DOM.chromeContainer.classList.remove('active');
        }
        
        // Bind platform selector events
        document.querySelectorAll('.platform-btn').forEach(function(btn) {
            btn.removeEventListener('click', handlePlatformSelect);
            btn.addEventListener('click', handlePlatformSelect);
        });
        
        // Bind browser controls
        bindBrowserControls();
        
        // Bind keyboard shortcuts
        document.removeEventListener('keydown', handleKeyboardShortcuts);
        document.addEventListener('keydown', handleKeyboardShortcuts);
        
        // Handle window resize for responsive adjustments
        window.removeEventListener('resize', handleResize);
        window.addEventListener('resize', handleResize);
        
        // Handle scroll on content
        const content = state.platform === 'safari' ? DOM.safariContent : DOM.chromeContent;
        if (content) {
            content.removeEventListener('scroll', updateToolbarCollapse);
            content.addEventListener('scroll', updateToolbarCollapse);
        }
        
        // Check URL hash for step
        checkUrlHash();
        
        log('Simulator initialized successfully', 'success');
        log('💡 Select a platform to begin', 'info');
        log('⌨️ Press "?" for keyboard shortcuts', 'info');
    }

    function cacheDOM() {
        DOM.platformSelector = document.getElementById('platformSelector');
        
        DOM.safariContainer = document.getElementById('safari-container');
        DOM.safariContent = document.getElementById('safariContent');
        DOM.safariStepContainer = document.getElementById('safariStepContainer');
        DOM.safariToolbar = document.getElementById('safariToolbar');
        DOM.safariUrl = document.getElementById('safariUrl');
        DOM.safariTabsBtn = document.getElementById('safariTabsBtn');
        DOM.safariBackBtn = document.getElementById('safariBackBtn');
        
        DOM.chromeContainer = document.getElementById('chrome-container');
        DOM.chromeContent = document.getElementById('chromeContent');
        DOM.chromeStepContainer = document.getElementById('chromeStepContainer');
        DOM.chromeUrl = document.getElementById('chromeUrl');
        DOM.chromeTabCount = document.getElementById('chromeTabCount');
        DOM.chromeBackBtn = document.getElementById('chromeBackBtn');
        DOM.chromeHomeBtn = document.getElementById('chromeHomeBtn');
        DOM.chromeNewTabBtn = document.getElementById('chromeNewTabBtn');
        DOM.chromeTabsBtn = document.getElementById('chromeTabsBtn');
        DOM.chromeMenuBtn = document.getElementById('chromeMenuBtn');
        DOM.chromeMoreBtn = document.getElementById('chromeMoreBtn');
        
        // Validate required elements
        const required = [
            DOM.platformSelector,
            DOM.safariContainer,
            DOM.safariContent,
            DOM.safariStepContainer,
            DOM.chromeContainer,
            DOM.chromeContent,
            DOM.chromeStepContainer
        ];
        
        required.forEach(function(el) {
            if (!el) {
                log('Required DOM element not found', 'error');
            }
        });
    }

    // ----- EVENT HANDLERS (bound) -----

    function handlePlatformSelect(e) {
        const platform = this.dataset.platform;
        if (platform) {
            switchPlatform(platform);
        }
    }

    function bindBrowserControls() {
        // Safari controls
        if (DOM.safariBackBtn) {
            DOM.safariBackBtn.removeEventListener('click', function() { goToStep(state.currentStep - 1); });
            DOM.safariBackBtn.addEventListener('click', function() {
                if (state.currentStep > 0) {
                    state.currentStep--;
                    renderStep();
                    scrollToTop();
                }
            });
        }
        
        if (DOM.safariTabsBtn) {
            DOM.safariTabsBtn.removeEventListener('click', addTab);
            DOM.safariTabsBtn.addEventListener('click', addTab);
        }
        
        // Chrome controls
        if (DOM.chromeBackBtn) {
            DOM.chromeBackBtn.removeEventListener('click', function() { goToStep(state.currentStep - 1); });
            DOM.chromeBackBtn.addEventListener('click', function() {
                if (state.currentStep > 0) {
                    state.currentStep--;
                    renderStep();
                    scrollToTop();
                }
            });
        }
        
        if (DOM.chromeTabsBtn) {
            DOM.chromeTabsBtn.removeEventListener('click', addTab);
            DOM.chromeTabsBtn.addEventListener('click', addTab);
        }
        
        if (DOM.chromeHomeBtn) {
            DOM.chromeHomeBtn.removeEventListener('click', goToFirstStep);
            DOM.chromeHomeBtn.addEventListener('click', goToFirstStep);
        }
        
        if (DOM.chromeNewTabBtn) {
            DOM.chromeNewTabBtn.removeEventListener('click', addTab);
            DOM.chromeNewTabBtn.addEventListener('click', addTab);
        }
        
        if (DOM.chromeMenuBtn) {
            DOM.chromeMenuBtn.removeEventListener('click', function() {
                showToast('📱 Chrome menu opened (simulated)');
            });
            DOM.chromeMenuBtn.addEventListener('click', function() {
                showToast('📱 Chrome menu opened (simulated)');
            });
        }
        
        if (DOM.chromeMoreBtn) {
            DOM.chromeMoreBtn.removeEventListener('click', function() {
                showToast('📱 Chrome more options (simulated)');
            });
            DOM.chromeMoreBtn.addEventListener('click', function() {
                showToast('📱 Chrome more options (simulated)');
            });
        }
        
        // Also bind any safari more button (the ... button)
        const safariMoreBtn = document.querySelector('.safari-toolbar .more-btn');
        if (safariMoreBtn) {
            safariMoreBtn.removeEventListener('click', function() {
                showToast('📱 Safari more options (simulated)');
            });
            safariMoreBtn.addEventListener('click', function() {
                showToast('📱 Safari more options (simulated)');
            });
        }
    }

    function handleResize() {
        // Update toolbar on resize
        updateToolbarCollapse();
    }

    function checkUrlHash() {
        if (window.location.hash) {
            const match = window.location.hash.match(/step-(\d+)/);
            if (match && match[1]) {
                const stepIndex = parseInt(match[1], 10) - 1;
                if (stepIndex >= 0 && stepIndex < state.totalSteps) {
                    state.currentStep = stepIndex;
                    renderStep();
                }
            }
        }
    }

    // ============================================
    // PUBLIC API
    // ============================================

    // Expose methods globally
    window.Simulator = {
        // Navigation
        goToStep: goToStep,
        goToFirst: goToFirstStep,
        goToLast: goToLastStep,
        next: function() {
            if (state.currentStep < state.totalSteps - 1) {
                state.currentStep++;
                renderStep();
                scrollToTop();
            }
        },
        back: function() {
            if (state.currentStep > 0) {
                state.currentStep--;
                renderStep();
                scrollToTop();
            }
        },
        reset: resetSimulator,
        
        // Customer type
        setCustomerType: setCustomerType,
        getCustomerType: function() { return state.customerType; },
        toggleCustomerType: function() {
            const newType = state.customerType === 'core' ? 'vip' : 'core';
            setCustomerType(newType);
        },
        
        // Platform
        switchPlatform: switchPlatform,
        getPlatform: function() { return state.platform; },
        
        // Tabs
        addTab: addTab,
        removeTab: removeTab,
        resetTabs: resetTabs,
        getTabCount: function() { return state.tabCount; },
        
        // State
        getState: function() { return { ...state }; },
        getCurrentStep: function() { return state.currentStep; },
        getTotalSteps: function() { return state.totalSteps; },
        getStepData: getCurrentStepData,
        getAllSteps: getSteps,
        
        // Rendering
        render: renderStep,
        
        // Utility
        showToast: showToast,
        showHelp: showHelp,
        
        // Debug
        debug: function() {
            console.log('%c📱 Simulator Debug Info', 'font-size:14px;font-weight:bold;');
            console.log('State:', state);
            console.log('DOM:', DOM);
            console.log('Config:', CONFIG);
            console.log('Step Data:', window.STEP_DATA);
            console.log('Current Step:', getCurrentStepData());
        }
    };

    // ============================================
    // AUTO-INIT
    // ============================================

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        // DOM is already ready
        init();
    }

    log('Simulator module loaded', 'success');
    log('Use window.Simulator for API access', 'info');

})();
