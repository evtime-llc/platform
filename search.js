// search.js - Smart Search for EVTime (vertical + copper-matched) - UI polish pass
(function () {
  const pageIndex = {
    "/sell.html": { title: "Sell Your Car", desc: "Get an honest offer for your vehicle", keywords: ["sell","selling","offer","vin","trade in","my car","cash","quote"] },
    "/share.html": { title: "Browse Inventory", desc: "Tesla and EV marketplace", keywords: ["inventory","browse","buy","buying","tesla","ev","cars","vehicles","shop","marketplace"] },
    "/escrow.html": { title: "Escrow Services", desc: "Safe and secure transactions", keywords: ["escrow","payment","safe","secure","protection","transaction","funds"] },
    "/dmv.html": { title: "DMV Services", desc: "Title transfer and registration help", keywords: ["dmv","title","registration","transfer","paperwork","tags","plates","license"] },
    "/about.html": { title: "How It Works", desc: "Learn about our process", keywords: ["how it works","why","about","process","team","info","information"] },
    "/support.html": { title: "Support", desc: "Get help 24/7", keywords: ["support","help","contact","phone","email","faq","ticket","questions","assistance"] },
    "/legal.html": { title: "Legal & Privacy", desc: "Terms and privacy policy", keywords: ["legal","privacy","terms","policy","disclaimer","rules"] },
    "/": { title: "Home", desc: "EVTime - Car marketplace built on trust", keywords: ["home","main","start","evtime"] }
  };

  const SUPABASE_URL = (window.SUPABASE_URL || "https://tgkvhmxrftcegpryptwq.supabase.co").trim();
  const SUPABASE_ANON_KEY = (window.SUPABASE_ANON_KEY || "").trim();
  let supabase = null;
  if (window.supabase && SUPABASE_ANON_KEY) supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const modalHTML = `
    <div id="searchModal" class="search-modal" aria-hidden="true">
      <div class="search-modal-content" role="dialog" aria-modal="true" aria-label="Search">
        <div class="search-top">
          <div class="search-title">Search</div>
          <button id="closeSearch" class="search-close" aria-label="Close">×</button>
        </div>

        <div class="search-stack">
          <input type="text" id="searchInput" placeholder="Search vehicles, pages, services..." autocomplete="off">
          <div class="search-subhint">Try: “Model Y”, “registration”, “sell my car”</div>
        </div>

        <div id="searchResults" class="search-results">
          <div class="search-hint">Start typing to search...</div>
        </div>
      </div>
    </div>
  `;

  const styles = `
  <style>
    :root{
      --ev-black:#0b0a09;
      --ev-copper:#c98c5b;
      --ev-surface:#f2efea;   /* warm light */
      --ev-card:#fbfaf8;      /* slightly brighter card */
      --ev-ink:#14110f;
      --ev-muted:#6b625b;
      --ev-line:rgba(20,17,15,.12);
      --ev-copper-line:rgba(201,140,91,.38);
    }

    .search-modal{
      display:none;
      position:fixed; inset:0;
      background:rgba(0,0,0,.70);
      z-index:10000;
      align-items:flex-start;
      justify-content:center;
      padding:86px 14px 26px;
      backdrop-filter: blur(8px);
    }
    .search-modal.open{display:flex}

    /* Make it FEEL vertical: narrower, taller */
    .search-modal-content{
      width:92%;
      max-width:560px;
      max-height:76vh;
      border-radius:18px;
      overflow:hidden;
      background:var(--ev-surface);
      box-shadow: 0 30px 90px rgba(0,0,0,.58);
      border:1px solid var(--ev-copper-line);
      display:flex;
      flex-direction:column;
    }

    .search-top{
      display:flex;
      align-items:center;
      justify-content:space-between;
      padding:14px 16px;
      background: rgba(11,10,9,.98);
      border-bottom: 1px solid var(--ev-copper-line);
    }
    .search-title{
      color:#fff;
      font-weight:900;
      letter-spacing:.14em;
      font-size:12px;
      text-transform:uppercase;
    }
    .search-close{
      width:36px;height:36px;
      border:none;
      border-radius:12px;
      background: rgba(255,255,255,.08);
      color:#fff;
      font-size:22px;
      cursor:pointer;
      line-height:36px;
    }
    .search-close:hover{ background: rgba(255,255,255,.14); }

    .search-stack{
      padding:14px 16px 12px;
      display:flex;
      flex-direction:column;
      gap:10px;
      background:var(--ev-surface);
      border-bottom:1px solid rgba(0,0,0,.06);
    }

    #searchInput{
      width:100%;
      border-radius:14px;
      padding:14px 14px;
      font-size:16px;
      outline:none;
      border:1px solid var(--ev-line);
      background:var(--ev-card);
      color:var(--ev-ink);
      box-shadow: 0 10px 22px rgba(0,0,0,.10);
    }
    #searchInput:focus{
      border-color:var(--ev-copper);
      box-shadow: 0 0 0 3px rgba(201,140,91,.22), 0 10px 22px rgba(0,0,0,.10);
    }

    .search-subhint{
      font-size:12px;
      color:var(--ev-muted);
    }

    .search-results{
      padding:12px 10px 14px;
      overflow:auto;
      background:var(--ev-surface);
    }

    .search-hint{
      padding:18px 10px;
      text-align:center;
      color:var(--ev-muted);
      font-size:13px;
    }

    .search-category{
      font-size:11px;
      font-weight:900;
      color:var(--ev-ink);
      opacity:.78;
      padding:12px 10px 6px;
      text-transform:uppercase;
      letter-spacing:.14em;
    }

    /* TRUE vertical card layout */
    .search-result{
      display:flex;
      flex-direction:column;
      gap:8px;
      padding:14px 14px;
      border-radius:16px;
      cursor:pointer;
      border:1px solid rgba(20,17,15,.10);
      background:var(--ev-card);
      margin:10px 6px;
      box-shadow: 0 10px 18px rgba(0,0,0,.08);
      transition: transform .12s ease, border-color .12s ease, box-shadow .12s ease;
    }
    .search-result:hover{
      transform: translateY(-1px);
      border-color: rgba(201,140,91,.62);
      box-shadow: 0 16px 30px rgba(0,0,0,.14);
    }

    .search-result-title{
      font-weight:950;
      color:var(--ev-ink);
      font-size:15px;
      line-height:1.2;
      letter-spacing:.01em;
    }
    .search-result-desc{
      font-size:13px;
      color:#4a3f37;
      line-height:1.35;
    }

    .search-result-meta{
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:10px;
    }

    .search-result-type{
      display:inline-flex;
      align-items:center;
      justify-content:center;
      font-size:11px;
      font-weight:900;
      letter-spacing:.12em;
      padding:6px 10px;
      border-radius:999px;
      background:rgba(11,10,9,.96);
      color:#fff;
      border:1px solid rgba(201,140,91,.45);
      white-space:nowrap;
    }

    .search-result-arrow{
      color:rgba(20,17,15,.45);
      font-weight:900;
      font-size:14px;
    }

    @media (max-width: 520px){
      .search-modal{ padding-top:72px; }
      .search-modal-content{ max-height:80vh; max-width:520px; }
      .search-result{ margin:10px 4px; }
    }
  </style>
  `;

  function initSearch() {
    if (document.getElementById("searchModal")) return;

    document.head.insertAdjacentHTML("beforeend", styles);
    document.body.insertAdjacentHTML("beforeend", modalHTML);

    const modal = document.getElementById("searchModal");
    const input = document.getElementById("searchInput");
    const results = document.getElementById("searchResults");
    const closeBtn = document.getElementById("closeSearch");

    window.openSearch = function () {
      modal.classList.add("open");
      modal.setAttribute("aria-hidden", "false");
      input.focus();
    };

    function closeSearch() {
      modal.classList.remove("open");
      modal.setAttribute("aria-hidden", "true");
      input.value = "";
      results.innerHTML = '<div class="search-hint">Start typing to search...</div>';
    }

    closeBtn.onclick = closeSearch;
    modal.onclick = function (e) { if (e.target === modal) closeSearch(); };

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeSearch();
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); window.openSearch(); }
    });

    let searchTimeout;
    input.addEventListener("input", function () {
      clearTimeout(searchTimeout);
      const query = input.value.trim().toLowerCase();
      if (!query) {
        results.innerHTML = '<div class="search-hint">Start typing to search...</div>';
        return;
      }
      searchTimeout = setTimeout(function () { performSearch(query); }, 180);
    });

    // Safe result clicking (no inline onclick strings)
    results.addEventListener("click", function (e) {
      var el = e.target;
      while (el && el !== results && (!el.classList || !el.classList.contains("search-result"))) el = el.parentNode;
      if (el && el.classList && el.classList.contains("search-result")) {
        var u = el.getAttribute("data-url");
        if (u) location.href = u;
      }
    });

    async function performSearch(query) {
      results.innerHTML = '<div class="search-hint">Searching...</div>';

      const pageResults = searchPages(query);
      const inventoryResults = await searchInventory(query);

      if (!pageResults.length && !inventoryResults.length) {
        results.innerHTML = '<div class="search-hint">No results found.</div>';
        return;
      }

      let html = "";
      if (pageResults.length) {
        html += '<div class="search-category">Pages</div>';
        pageResults.forEach(function (r) {
          html +=
            '<div class="search-result" data-url="' + r.url + '">' +
              '<div class="search-result-title">' + r.title + '</div>' +
              '<div class="search-result-desc">' + r.desc + '</div>' +
              '<div class="search-result-meta">' +
                '<span class="search-result-type">PAGE</span>' +
                '<span class="search-result-arrow">→</span>' +
              "</div>" +
            "</div>";
        });
      }

      if (inventoryResults.length) {
        html += '<div class="search-category">Vehicles</div>';
        inventoryResults.forEach(function (r) {
          html +=
            '<div class="search-result" data-url="' + r.url + '">' +
              '<div class="search-result-title">' + r.title + '</div>' +
              '<div class="search-result-desc">' + r.desc + '</div>' +
              '<div class="search-result-meta">' +
                '<span class="search-result-type">VEHICLE</span>' +
                '<span class="search-result-arrow">→</span>' +
              "</div>" +
            "</div>";
        });
      }

      results.innerHTML = html;
    }

    // FIXED: better page matching (tokens + scoring)
    function searchPages(query) {
      const q = (query || "").toLowerCase().trim();
      if (!q) return [];
      const tokens = q.split(/\s+/).filter(Boolean);

      const scored = [];
      for (const url in pageIndex) {
        const page = pageIndex[url];
        const hay = (page.title + " " + page.desc + " " + page.keywords.join(" ")).toLowerCase();

        let score = 0;
        if (hay.includes(q)) score += 6;

        tokens.forEach(function (t) {
          if (t.length < 2) return;
          if (hay.includes(t)) score += 2;
        });

        if (q === "dmv" && url === "/dmv.html") score += 5;
        if ((q === "help" || q === "support") && url === "/support.html") score += 3;

        if (score > 0) scored.push({ url: url, title: page.title, desc: page.desc, score: score });
      }

      scored.sort(function (a, b) { return b.score - a.score; });
      return scored.slice(0, 6).map(function (r) { return { url: r.url, title: r.title, desc: r.desc }; });
    }

    async function searchInventory(query) {
      if (!supabase) return [];
      try {
        const res = await supabase
          .from("listing")
          .select("id, year, make, model, trim, price, city, vin")
          .eq("status", "live")
          .limit(25);

        if (res.error || !res.data) return [];

        const matches = res.data.filter(function (item) {
          const text = [item.year, item.make, item.model, item.trim, item.city, item.vin].filter(Boolean).join(" ").toLowerCase();
          return text.includes(query);
        });

        return matches.slice(0, 6).map(function (item) {
          const title = ((item.year || "") + " " + (item.make || "") + " " + (item.model || "") + " " + (item.trim || "")).trim();
          const priceStr = item.price ? "$" + Number(item.price).toLocaleString() : "";
          const desc = [priceStr, item.city].filter(Boolean).join(" • ") || "View details";
          return { url: "./listing.html?id=" + item.id, title: title, desc: desc };
        });
      } catch (e) {
        return [];
      }
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initSearch);
  else initSearch();
})();
