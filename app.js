// app.js - Global functionality for EVTime
(function() {
  'use strict';

  // Load Google Analytics
  function loadGA() {
    if (window._gaLoaded) return;
    window._gaLoaded = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=G-GGBQKG3B3G';
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', 'G-GGBQKG3B3G');
  }

  // Load Microsoft Clarity
  function loadClarity() {
    if (window.clarity) return;
    (function(c,l,a,r,i,t,y){
      c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
      t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
      y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "viz1414e67");
  }

  // Load Crisp chat widget
  function loadCrispChat() {
    if (window.$crisp) return;
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
    loadGA();
    loadClarity();
    loadCrispChat();
    initChatButton();
    initSearch();
    initActivePage();
    window.dispatchEvent(new CustomEvent('header-ready'));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

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

// Auth link: swap between Sign In / Account
(function() {
  var link = document.getElementById('authLink');
  if (!link) return;
  var sb = typeof getSb === 'function' ? getSb() : null;
  if (!sb) return;
  sb.auth.getSession().then(function(res) {
    if (res.data && res.data.session) {
      link.textContent = 'Account';
      link.href = '/account.html';
    }
  });
  sb.auth.onAuthStateChange(function(event) {
    if (event === 'SIGNED_IN') {
      link.textContent = 'Account';
      link.href = '/account.html';
    } else if (event === 'SIGNED_OUT') {
      link.textContent = 'Sign In';
      link.href = '/login.html';
    }
  });
})();
