// ============================================================
// 1x10d — Header y footer compartidos
// ============================================================

function renderHeader(activePage) {
  const el = document.getElementById("site-header");
  if (!el) return;

  const links = [
    { href: "index.html", ch: "01", label: "INICIO", key: "home" },
    { href: "tactic-maker.html", ch: "02", label: "CONSTRUCTOR", key: "maker" },
    { href: "library.html", ch: "03", label: "BIBLIOTECA", key: "library" },
    { href: "characters.html", ch: "04", label: "PERSONAJES", key: "characters" },
    { href: "personas.html", ch: "05", label: "PERSONAS", key: "personas" },
    { href: "build.html", ch: "06", label: "BUILD", key: "build" },
    { href: "notes.html", ch: "07", label: "NOTAS", key: "notes" },
  ];

  el.innerHTML = `
    <header class="site-header">
      <div class="wrap">
        <div class="logo">
          <img src="assets/brand.png" alt="" class="logo-mark-img" onerror="this.style.display='none'" />
          <span class="mark">1x10d</span>
          <span class="sub">P5:TPX</span>
        </div>
        <nav class="nav-channels">
          ${links
            .map(
              (l) =>
                `<a href="${l.href}" data-ch="${l.ch}" class="${l.key === activePage ? "active" : ""}">${l.label}</a>`
            )
            .join("")}
        </nav>
        <div class="session-slot" id="session-slot"></div>
      </div>
    </header>
    <div class="channel-bar"></div>
  `;
}

function renderFooter() {
  const el = document.getElementById("site-footer");
  if (!el) return;

  el.innerHTML = `
    <footer class="site-footer">
      <div class="wrap">
        <div class="footer-brand">
          <img src="assets/brand.png" alt="" class="footer-brand-img" onerror="this.style.display='none'" />
          1x10d — uso personal
        </div>
      </div>
    </footer>
  `;
}

function mountChrome(activePage) {
  renderHeader(activePage);
  renderFooter();
}
