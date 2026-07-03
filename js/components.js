// ============================================================
// 1x10d — Barra lateral y footer compartidos
// ============================================================

function renderHeader(activePage) {
  const el = document.getElementById("site-header");
  if (!el) return;

  const links = [
    { href: "index.html", ch: "01", label: "Inicio", key: "home" },
    { href: "tactic-maker.html", ch: "02", label: "Constructor", key: "maker" },
    { href: "library.html", ch: "03", label: "Biblioteca", key: "library" },
    { href: "characters.html", ch: "04", label: "Personajes", key: "characters" },
    { href: "personas.html", ch: "05", label: "Personas", key: "personas" },
    { href: "build.html", ch: "06", label: "Build", key: "build" },
    { href: "notes.html", ch: "07", label: "Notas", key: "notes" },
  ];

  el.innerHTML = `
    <aside class="sidebar">
      <div class="sidebar-logo">
        <img src="assets/brand.png" alt="" class="logo-mark-img" onerror="this.style.display='none'" />
        <div>
          <span class="mark">1x10d</span>
          <span class="sub">P5:TPX</span>
        </div>
      </div>
      <nav class="sidebar-nav">
        ${links
          .map(
            (l) =>
              `<a href="${l.href}" data-ch="${l.ch}" class="${l.key === activePage ? "active" : ""}">${l.label}</a>`
          )
          .join("")}
      </nav>
      <div class="session-slot" id="session-slot"></div>
    </aside>
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
        <div class="footer-credits">
          <span><span class="label">Discord</span>1x10d</span>
          <span><span class="label">Correo</span>dsyxleic24@gmail.com</span>
        </div>
      </div>
    </footer>
  `;
}

function mountChrome(activePage) {
  renderHeader(activePage);
  renderFooter();
}
