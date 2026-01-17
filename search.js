// search.js - restyled (vertical + nicer) + no new global colors
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
          <div class="search-subhint">Tip: try “Model Y”, “registration”, “sell my car”</div>
        </div>

        <div id="searchResults" class="search-results">
          <div class="search-hint">Start typing to search...</div>
        </div>
      </div>
    </div>
  `;

  const styles = `
  <style>
    .search-modal{
      display:none;
      position:fixed; inset:0;
      background:rgba(0,0,0,.72);
      z-index:10000;
      align-items:flex-start;
      justify-content:center;
      padding:84px 14px 24px;
      backdrop-filter: blur(6px);
    }
    .search-modal.open{display:flex}

    .search-modal-content{
      width:92%;
      max-width:720px;
      max-height:72vh;
      border-radius:18px;
      overflow:hidden;
      background: #e9e9e9; /* 3rd color: light surface (only here) */
      box-shadow: 0 26px 80px rgba(0,0,0,.55);
      border:1px solid rgba(255,255,255,.18);
      display:flex;
      flex-direction:column;
    }

    .search-top{
      display:flex;
      align-items:center;
      justify-content:space-between;
      padding:14px 16px;
      background: rgba(11,10,9,.92);
      border-bottom: 1px solid rgba(201,140,91,.25);
    }
    .search-title{
      color:#fff;
      font-weight:800;
      letter-spacing:.02em;
      font-size:14px;
      text-transform:uppercase;
    }
    .search-close{
      width:36px;height:36px;
      border:none;
      border-radius:10px;
      background: rgba(255,255,255,.08);
      color:#fff;
      font-size:22px;
      cursor:pointer;
      line-height:36px;
    }
    .search-close:hover{ background: rgba(255,255,255,.14); }

    .search-stack{
      padding:14px 16px 10px;
      display:flex;
      flex-direction:column;
      gap:8px;
      background: #e9e9e9; /* same surface */
    }

    #searchInput{
      width:100%;
      border-radius:14px;
      padding:14px 14px;
      font-size:16px;
      outline:none;
      border:1px solid rgba(0,0,0,.18);
      background:#f7f7f7;
      color:#111;
      box-shadow: 0 10px 24px rgba(0,0,0,.10);
    }
    #searchInput:focus{
      border-color:#c98c5b;
      box-shadow: 0 0 0 3px rgba(201,140,91,.22), 0 10px 24px rgba(0,0,0,.10);
    }

    .search-subhint{
      font-size:12px;
      color:#555;
    }

    .search-results{
      padding:10px 10px 14px;
      overflow:auto;
      background:#e9e9e9;
    }

    .search-hint{
      padding:18px 10px;
      text-align:center;
      color:#666;
      font-size:13px;
    }

    .search-category{
      font-size:12px;
      font-weight:900;
      color:#111;
      opacity:.75;
      padding:10px 10px 6px;
      text-transform:uppercase;
      letter-spacing:.08em;
    }

    .search-result{
      padding:12px 12px;
      border-radius:14px;
      cursor:pointer;
      border:1px solid rgba(0,0,0,.10);
      background:#f7f7f7;
      margin:8px 6px;
      box-shadow: 0 10px 18px rgba(0,0,0,.08);
      transition: transform .12s ease, border-color .12s ease, box-shadow .12s ease;
    }
    .search-result:hover{
      transform: translateY(-1px);
      border-color: rgba(201,140,91,.55);
      box-shadow: 0 14px 26px rgba(0,0,0,.12);
    }

    .search-result-title{
      font-weight:900;
      color:#111;
      margin-bottom:4px;
      font-size:14px;
    }
    .search-result-desc{
      font-size:13px;
      color:#444;
    }

    .search-result-type{
      display:inline-block;
      margin-top:8px;
      font-size:11px;
      font-weight:900;
      letter-spacing:.06em;
      padding:4px 10px;
      border-radius:999px;
      background:#0b0a09;
      color:#fff;
      border:1px solid rgba(201,140,91,.35);
    }

    @media (max-width: 520px){
      .search-modal{ padding-top:72px; }
      .search-modal-content{ max-height:78vh; }
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
            '<div class="search-result" onclick="location.href=\'' + r.url + '\'">' +
              '<div class="search-result-title">' + r.title + '</div>' +
              '<div class="search-result-desc">' + r.desc + '</div>' +
              '<span class="search-result-type">PAGE</span>' +
            "</div>";
        });
      }

      if (inventoryResults.length) {
        html += '<div class="search-category">Vehicles</div>';
        inventoryResults.forEach(function (r) {
          html +=
            '<div class="search-result" onclick="location.href=\'' + r.url + '\'">' +
              '<div class="search-result-title">' + r.title + '</div>' +
              '<div class="search-result-desc">' + r.desc + '</div>' +
              '<span class="search-result-type">VEHICLE</span>' +
            "</div>";
        });
      }

      results.innerHTML = html;
    }

    function searchPages(query) {
      const matches = [];
      for (const url in pageIndex) {
        const page = pageIndex[url];
        const searchText = (page.title + " " + page.desc + " " + page.keywords.join(" ")).toLowerCase();
        if (searchText.includes(query)) matches.push({ url, title: page.title, desc: page.desc });
      }
      return matches.slice(0, 6);
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
