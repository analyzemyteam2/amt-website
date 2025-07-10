// Dr. Wright Chatbot Integration Script
// Loads the chatbot widget across all AMT website pages

(function() {
    'use strict';
    
    // Configuration
    const CHATBOT_CONFIG = {
        widgetUrl: 'chatbot-widget.html',
        loadDelay: 2000, // Load chatbot after 2 seconds
        excludePages: [], // Pages to exclude chatbot from
        debugMode: false
    };

    // Check if chatbot should load on current page
    function shouldLoadChatbot() {
        const currentPage = window.location.pathname;
        return !CHATBOT_CONFIG.excludePages.some(page => currentPage.includes(page));
    }

    // Load chatbot widget
    function loadChatbotWidget() {
        if (!shouldLoadChatbot()) return;

        // Prevent duplicate loading
        if (document.getElementById('amt-chatbot-widget')) return;

        // Create container for chatbot
        const container = document.createElement('div');
        container.id = 'amt-chatbot-container';

        // Fetch chatbot HTML
        fetch(CHATBOT_CONFIG.widgetUrl)
            .then(response => {
                if (!response.ok) throw new Error('Failed to load chatbot widget');
                return response.text();
            })
            .then(html => {
                // Parse the HTML
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                
                // Extract components
                const styles = doc.querySelector('style');
                const widget = doc.querySelector('.amt-chatbot-widget');
                const scripts = doc.querySelector('script');
                
                // Add styles to head
                if (styles && !document.querySelector('#amt-chatbot-styles')) {
                    styles.id = 'amt-chatbot-styles';
                    document.head.appendChild(styles);
                }
                
                // Add widget to body
                if (widget) {
                    document.body.appendChild(widget);
                }
                
                // Execute scripts
                if (scripts) {
                    const scriptElement = document.createElement('script');
                    scriptElement.textContent = scripts.textContent;
                    document.body.appendChild(scriptElement);
                }
                
                if (CHATBOT_CONFIG.debugMode) {
                    console.log('AMT Chatbot loaded successfully');
                }
            })
            .catch(error => {
                if (CHATBOT_CONFIG.debugMode) {
                    console.error('Failed to load AMT Chatbot:', error);
                }
            });
    }

    // Initialize chatbot loading
    function initializeChatbot() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(loadChatbotWidget, CHATBOT_CONFIG.loadDelay);
            });
        } else {
            setTimeout(loadChatbotWidget, CHATBOT_CONFIG.loadDelay);
        }
    }

    // Auto-initialize
    initializeChatbot();

    // Global functions for manual control
    window.AMTChatbot = {
        load: loadChatbotWidget,
        config: CHATBOT_CONFIG
    };
})();
