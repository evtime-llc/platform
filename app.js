// app.js - Global header functionality for EVTime
(function() {
  'use strict';

  // Load Crisp chat widget
  function loadCrispChat() {
    if (window.$crisp) return; // Already loaded
    
    window.$crisp = [];
    window.CRISP_WEBSITE_ID = "782a825d-c11b-4dcf-8a44-656bd6ddc5ad";
    
    (function() {
      var d = document, s = d.createElement("script");
      s.src = "https://client.crisp.chat/l.js";
      s.async = 1;
      d.getElementsByTagName("head")[0].appendChild(s);
    })();
  }

  // Initialize chat button functionality
  function initChatButton() {
    document.addEventListener('click', function(e) {
      if (e.target.closest('.nav-btn') && e.target.closest('.nav-btn').textContent.trim() === 'Chat') {
        e.preventDefault();
        if (window.$crisp) {
          $crisp.push(['do', 'chat:open']);
        } else {
          loadCrispChat();
          setTimeout(() => {
            if (window.$crisp) $crisp.push(['do', 'chat:open']);
          }, 1000);
        }
        return false;
      }
    });
  }

  // Initialize search functionality
  function initSearch() {
    document.addEventListener('click', function(e) {
      if (e.target.closest('.search-icon')) {
        if (window.openSearch && typeof window.openSearch === 'function') {
          window.openSearch();
        }
      }
    });

    // Also handle Enter key on search icon
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && e.target.closest('.search-icon')) {
        if (window.openSearch && typeof window.openSearch === 'function') {
          window.openSearch();
        }
      }
    });
  }

  // Initialize active page highlighting
  function initActivePage() {
    try {
      var page = document.body.getAttribute('data-page');
      if (!page) return;
      
      var links = document.querySelectorAll('.nav .nav-btn');
      links.forEach(function(link) {
        var href = link.getAttribute('href');
        if (!href) return;
        
        // Simple matching logic
        if ((href === './' + page + '.html') || 
            (page === 'home' && href === '/') ||
            (page === 'index' && href === '/')) {
          link.style.color = '#c98c5b';
        }
      });
    } catch (e) {
      console.error('Error in active page init:', e);
    }
  }

  // Main initialization
  function init() {
    loadCrispChat();
    initChatButton();
    initSearch();
    initActivePage();
    
    // Dispatch event that header is ready
    window.dispatchEvent(new CustomEvent('header-ready'));
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Make functions available globally for edge cases
  window.evtimeHeader = {
    loadCrispChat: loadCrispChat,
    openChat: function() {
      if (window.$crisp) {
        $crisp.push(['do', 'chat:open']);
      } else {
        loadCrispChat();
        setTimeout(() => {
          if (window.$crisp) $crisp.push(['do', 'chat:open']);
        }, 1000);
      }
    }
  };
})();
