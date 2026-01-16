// search.js - Smart Search for EVTime
(function() {
  // Page index with keywords
  const pageIndex = {
    '/sell.html': {
      title: 'Sell Your Car',
      desc: 'Get an honest offer for your vehicle',
      keywords: ['sell', 'selling', 'offer', 'VIN', 'trade in', 'my car', 'cash', 'quote']
    },
    '/share.html': {
      title: 'Browse Inventory',
      desc: 'Tesla and EV marketplace',
      keywords: ['inventory', 'browse', 'buy', 'buying', 'tesla', 'ev', 'cars', 'vehicles', 'shop', 'marketplace']
    },
    '/escrow.html': {
      title: 'Escrow Services',
      desc: 'Safe and secure transactions',
      keywords: ['escrow', 'payment', 'safe', 'secure', 'protection', 'transaction', 'funds']
    },
    '/dmv.html': {
      title: 'DMV Services',
      desc: 'Title transfer and registration help',
      keywords: ['dmv', 'title', 'registration', 'transfer', 'paperwork', 'tags', 'plates', 'license']
    },
    '/about.html': {
      title: 'How It Works',
      desc: 'Learn about our process',
      keywords: ['how it works', 'why', 'about', 'process', 'team', 'info', 'information']
    },
    '/support.html': {
      title: 'Support',
      desc: 'Get help 24/7',
      keywords: ['support', 'help', 'contact', 'phone', 'email', 'faq', 'ticket', 'questions', 'assistance']
    },
    '/legal.html': {
      title: 'Legal & Privacy',
      desc: 'Terms and privacy policy',
      keywords: ['legal', 'privacy', 'terms', 'policy', 'disclaimer', 'rules']
    },
    '/': {
      title: 'Home',
      desc: 'EVTime - Car marketplace built on trust',
      keywords: ['home', 'main', 'start', 'evtime']
    }
  };

  // Supabase config
  const SUPABASE_URL = (window.SUPABASE_URL || 'https://tgkvhmxrftcegpryptwq.supabase.co').trim();
  const SUPABASE_ANON_KEY = (window.SUPABASE_ANON_KEY || '').trim();
  let supabase = null;
  
  if (window.supabase && SUPABASE_ANON_KEY) {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  // Create search modal HTML
  const modalHTML = `
    <div id="searchModal" class="search-modal">
      <div class="search-modal-content">
        <div class="search-header">
          <input type="text" id="searchInput" placeholder="Search vehicles, pages, services..." autocomplete="off">
          <button id="closeSearch" class="search-close">&times;</button>
        </div>
        <div id="searchResults" class="search-results">
          <div class="search-hint">Start typing to search...</div>
        </div>
      </div>
    </div>
  `;

  // CSS styles
  const styles = `
    <style>
      .search-modal {
        display: none;
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.7);
        z-index: 10000;
        align-items: flex-start;
        justify-content: center;
        padding-top: 80px;
      }
      .search-modal.open { display: flex; }
      .search-modal-content {
        background: #fff;
        border-radius: 12px;
        width: 90%;
        max-width: 640px;
        max-height: 70vh;
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        display: flex;
        flex-direction: column;
      }
      .search-header {
        padding: 16px;
        border-bottom: 1px solid #e7e5e4;
        display: flex;
        gap: 8px;
      }
      #searchInput {
        flex: 1;
        border: 2px solid #c98c5b;
        border-radius: 8px;
        padding: 12px;
        font-size: 16px;
        outline: none;
      }
      #searchInput:focus { border-color: #9e6d45; }
      .search-close {
        width: 40px;
        height: 40px;
        border: none;
        background: #f5f5f4;
        border-radius: 8px;
        font-size: 24px;
        cursor: pointer;
        color: #44403c;
      }
      .search-close:hover { background: #e7e5e4; }
      .search-results {
        overflow-y: auto;
        padding: 8px;
        max-height: calc(70vh - 80px);
      }
      .search-hint {
        padding: 24px;
        text-align: center;
        color: #78716c;
        font-size: 14px;
      }
      .search-result {
        padding: 12px;
        border-radius: 8px;
        cursor: pointer;
        border: 1px solid transparent;
        margin-bottom: 4px;
      }
      .search-result:hover {
        background: #f5eae0;
        border-color: #c98c5b;
      }
      .search-result-title {
        font-weight: 700;
        color: #1c1917;
        margin-bottom: 4px;
      }
      .search-result-desc {
        font-size: 13px;
        color: #57534e;
      }
      .search-result-type {
        display: inline-block;
        font-size: 11px;
        background: #c98c5b;
        color: #fff;
        padding: 2px 8px;
        border-radius: 12px;
        margin-top: 4px;
        font-weight: 600;
      }
      .search-category {
        font-size: 12px;
        font-weight: 700;
        color: #78716c;
        padding: 8px 12px;
        margin-top: 8px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
    </style>
  `;

  // Inject HTML and CSS
  document.addEventListener('DOMContentLoaded', function() {
    document.head.insertAdjacentHTML('beforeend', styles);
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const modal = document.getElementById('searchModal');
    const input = document.getElementById('searchInput');
    const results = document.getElementById('searchResults');
    const closeBtn = document.getElementById('closeSearch');

    // Open search
    window.openSearch = function() {
      modal.classList.add('open');
      input.focus();
    };

    // Close search
    function closeSearch() {
      modal.classList.remove('open');
      input.value = '';
      results.innerHTML = '<div class="search-hint">Start typing to search...</div>';
    }

    closeBtn.onclick = closeSearch;
    modal.onclick = function(e) {
      if (e.target === modal) closeSearch();
    };
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') closeSearch();
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        openSearch();
      }
    });

    // Search function
    let searchTimeout;
    input.addEventListener('input', function() {
      clearTimeout(searchTimeout);
      const query = input.value.trim().toLowerCase();
      
      if (!query) {
        results.innerHTML = '<div class="search-hint">Start typing to search...</div>';
        return;
      }

      searchTimeout = setTimeout(() => performSearch(query), 200);
    });

    async function performSearch(query) {
      results.innerHTML = '<div class="search-hint">Searching...</div>';

      const pageResults = searchPages(query);
      const inventoryResults = await searchInventory(query);

      if (pageResults.length === 0 && inventoryResults.length === 0) {
        results.innerHTML = '<div class="search-hint">No results found. Try different keywords.</div>';
        return;
      }

      let html = '';

      if (pageResults.length > 0) {
        html += '<div class="search-category">Pages & Services</div>';
        pageResults.forEach(r => {
          html += `
            <div class="search-result" onclick="location.href='${r.url}'">
              <div class="search-result-title">${r.title}</div>
              <div class="search-result-desc">${r.desc}</div>
              <span class="search-result-type">PAGE</span>
            </div>
          `;
        });
      }

      if (inventoryResults.length > 0) {
        html += '<div class="search-category">Vehicles</div>';
        inventoryResults.forEach(r => {
          html += `
            <div class="search-result" onclick="location.href='${r.url}'">
              <div class="search-result-title">${r.title}</div>
              <div class="search-result-desc">${r.desc}</div>
              <span class="search-result-type">VEHICLE</span>
            </div>
          `;
        });
      }

      results.innerHTML = html;
    }

    function searchPages(query) {
      const matches = [];
      for (const [url, page] of Object.entries(pageIndex)) {
        const searchText = (page.title + ' ' + page.desc + ' ' + page.keywords.join(' ')).toLowerCase();
        if (searchText.includes(query)) {
          matches.push({ url, title: page.title, desc: page.desc });
        }
      }
      return matches.slice(0, 5);
    }

    async function searchInventory(query) {
      if (!supabase) return [];
      
      try {
        const { data, error } = await supabase
          .from('listing')
          .select('id, year, make, model, trim, price, city, vin')
          .eq('status', 'live')
          .limit(10);

        if (error || !data) return [];

        const matches = data.filter(item => {
          const searchText = [
            item.year, item.make, item.model, item.trim, 
            item.city, item.vin
          ].filter(Boolean).join(' ').toLowerCase();
          return searchText.includes(query);
        });

        return matches.slice(0, 5).map(item => {
          const title = `${item.year || ''} ${item.make || ''} ${item.model || ''} ${item.trim || ''}`.trim();
          const priceStr = item.price ? `$${Number(item.price).toLocaleString()}` : '';
          const desc = [priceStr, item.city].filter(Boolean).join(' • ');
          return {
            url: './listing.html?id=' + item.id,
            title,
            desc: desc || 'View details'
          };
        });
      } catch (e) {
        console.error('Search error:', e);
        return [];
      }
    }
  });
})();
