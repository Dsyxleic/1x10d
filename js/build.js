// ============================================================
// 1x10d — Build de personajes
// ============================================================

let BUILD_CHARACTERS = [];
let BUILD_MAP = {}; // character_id -> build row
let BUILD_FILTERS = { search: "", element: "", role: "", rarity: "" };
let EDIT_STATE = null; // build actualmente en edición dentro del modal
let EDIT_CHARACTER = null;

function escapeHtmlB(s) {
  return (s || "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

function defaultBuild(characterId) {
  return {
    character_id: characterId,
    rarity: null,
    level: 1,
    has_weapon: false,
    weapon_level: 0,
    mindscape: [
      { value: 0, max: 5 },
      { value: 0, max: 5 },
      { value: 0, max: 5 },
      { value: 0, max: 5 },
      { value: 0, max: 12 },
    ],
    cards: { sun: null, moon: null, star: null, sky: null, space: null },
    awareness: [false, false, false, false, false, false],
    notes: "",
  };
}

// ---------------- Carga ----------------

async function loadBuildData() {
  const [{ data: chars }, { data: builds }] = await Promise.all([
    sb.from("characters").select("*").order("sort_order"),
    sb.from("character_builds").select("*"),
  ]);

  BUILD_CHARACTERS = chars || [];
  BUILD_MAP = {};
  (builds || []).forEach((b) => (BUILD_MAP[b.character_id] = b));

  renderFilterChips();
  renderBuildTable();
}

function renderFilterChips() {
  const elBox = document.getElementById("filter-elements");
  elBox.innerHTML =
    `<button class="chip is-active" data-element="">Todos</button>` +
    ELEMENTS.map((e) => `<button class="chip" data-element="${e.key}">${e.icon} ${e.label}</button>`).join("");

  const roleBox = document.getElementById("filter-roles");
  roleBox.innerHTML =
    `<button class="chip is-active" data-role="">Todos</button>` +
    ROLES.map((r) => `<button class="chip" data-role="${r.key}">${r.icon} ${r.label}</button>`).join("");

  elBox.querySelectorAll(".chip").forEach((btn) => {
    btn.onclick = () => {
      BUILD_FILTERS.element = btn.dataset.element;
      elBox.querySelectorAll(".chip").forEach((b) => b.classList.toggle("is-active", b === btn));
      renderBuildTable();
    };
  });
  roleBox.querySelectorAll(".chip").forEach((btn) => {
    btn.onclick = () => {
      BUILD_FILTERS.role = btn.dataset.role;
      roleBox.querySelectorAll(".chip").forEach((b) => b.classList.toggle("is-active", b === btn));
      renderBuildTable();
    };
  });

  document.querySelectorAll("[data-rarity]").forEach((btn) => {
    btn.onclick = () => {
      BUILD_FILTERS.rarity = btn.dataset.rarity;
      document.querySelectorAll("[data-rarity]").forEach((b) => b.classList.toggle("is-active", b === btn));
      renderBuildTable();
    };
  });
  document.querySelector('[data-rarity=""]')?.classList.add("is-active");
}

// ---------------- Tabla ----------------

function mindscapeMiniHtml(build) {
  const cells = build?.mindscape || defaultBuild(null).mindscape;
  return `<div class="mini-pips">${cells
    .map((c) => {
      const maxed = c.value >= c.max && c.max > 0;
      const filled = c.value > 0;
      return `<span class="mini-pip ${filled ? "filled" : ""} ${maxed ? "maxed" : ""}" title="${c.value}/${c.max}"></span>`;
    })
    .join("")}</div>`;
}

function cardsMiniHtml(build) {
  const cards = build?.cards || {};
  const order = ["sun", "moon", "star", "sky", "space"];
  return `<div class="mini-cards">${order
    .map((k) => {
      const color = cards[k];
      const cls = color ? `c-${color}` : "";
      return `<span class="mini-card-dot ${cls}" title="${k}${color ? ": " + color : ""}"></span>`;
    })
    .join("")}</div>`;
}

function awarenessMiniHtml(build) {
  const arr = build?.awareness || [false, false, false, false, false, false];
  const count = arr.filter(Boolean).length;
  return `<span class="mono dim">${count}/6</span>`;
}

function renderBuildTable() {
  const tbody = document.getElementById("build-tbody");
  const f = BUILD_FILTERS;

  const filtered = BUILD_CHARACTERS.filter((c) => {
    if (f.search && !c.name.toLowerCase().includes(f.search.toLowerCase())) return false;
    if (f.element && c.element !== f.element) return false;
    if (f.role && c.role_combat !== f.role) return false;
    if (f.rarity) {
      const b = BUILD_MAP[c.id];
      if (!b || b.rarity !== f.rarity) return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="11" class="dim" style="padding:20px;">Nada coincide con el filtro.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered
    .map((c) => {
      const b = BUILD_MAP[c.id];
      return `
        <tr data-char-id="${c.id}">
          <td>${c.avatar_url ? `<img src="${c.avatar_url}" class="build-row-avatar" />` : ""}</td>
          <td class="build-row-name">${escapeHtmlB(c.name)}</td>
          <td>${c.element ? elementBadge(c.element) : ""}</td>
          <td>${c.role_combat ? roleBadge(c.role_combat) : ""}</td>
          <td>${b?.rarity ? `<span class="rarity-pill r${b.rarity}">${b.rarity}★</span>` : `<span class="dim">—</span>`}</td>
          <td>${b?.level || `<span class="dim">—</span>`}</td>
          <td>${b?.has_weapon ? `<span class="mono">Lv ${b.weapon_level || 0}</span>` : `<span class="dim">—</span>`}</td>
          <td>${mindscapeMiniHtml(b)}</td>
          <td>${cardsMiniHtml(b)}</td>
          <td>${awarenessMiniHtml(b)}</td>
          <td><button class="btn btn-ghost no-build-btn" data-open-id="${c.id}">${b ? "Editar" : "Crear build"}</button></td>
        </tr>
      `;
    })
    .join("");

  tbody.querySelectorAll("[data-open-id]").forEach((btn) => {
    btn.onclick = () => openBuildModal(btn.dataset.openId);
  });
}

// ---------------- Modal de edición ----------------

async function openBuildModal(characterId) {
  const character = BUILD_CHARACTERS.find((c) => c.id === characterId);
  if (!character) return;

  EDIT_CHARACTER = character;
  EDIT_STATE = BUILD_MAP[characterId]
    ? JSON.parse(JSON.stringify(BUILD_MAP[characterId]))
    : defaultBuild(characterId);

  document.getElementById("build-modal-name").textContent = character.name;
  const linkEl = document.getElementById("build-modal-link");
  if (character.link_url) {
    linkEl.href = character.link_url;
    linkEl.classList.remove("hidden");
  } else {
    linkEl.classList.add("hidden");
  }

  document.getElementById("build-modal").classList.remove("hidden");
  renderBuildModalBody();
}

function renderBuildModalBody() {
  const body = document.getElementById("build-modal-body");
  const s = EDIT_STATE;

  const cardDefs = [
    { key: "sun", label: "Sun" },
    { key: "moon", label: "Moon" },
    { key: "star", label: "Star" },
    { key: "sky", label: "Sky" },
    { key: "space", label: "Space" },
  ];

  body.innerHTML = `
    <div class="build-section">
      <h4>Datos generales</h4>
      <div class="field-row">
        <div>
          <label>Rareza</label>
          <select id="f-rarity">
            <option value="">— Sin especificar —</option>
            <option value="5" ${s.rarity === "5" ? "selected" : ""}>5★</option>
            <option value="4" ${s.rarity === "4" ? "selected" : ""}>4★</option>
          </select>
        </div>
        <div>
          <label>Nivel</label>
          <input id="f-level" type="number" min="1" value="${s.level ?? 1}" />
        </div>
        <div>
          <label style="display:flex; align-items:center; gap:6px; margin-top:6px;">
            <input id="f-has-weapon" type="checkbox" style="width:auto;" ${s.has_weapon ? "checked" : ""} />
            Tiene arma
          </label>
        </div>
        <div>
          <label>Nivel del arma</label>
          <input id="f-weapon-level" type="number" min="0" value="${s.weapon_level ?? 0}" ${s.has_weapon ? "" : "disabled"} />
        </div>
      </div>
    </div>

    <div class="build-section">
      <h4>Mindscape</h4>
      <div class="mindscape-row">
        ${s.mindscape
          .map((cell, i) => {
            const isBig = cell.max > 5;
            return `
            <div class="mindscape-cell">
              <div class="cell-label">Celda ${i + 1}${isBig ? " (max " + cell.max + ")" : ""}</div>
              <div class="pip-track" data-cell-index="${i}">
                ${Array.from({ length: cell.max })
                  .map(
                    (_, p) =>
                      `<span class="pip ${p < cell.value ? "filled" : ""} ${isBig ? "is-maxed-track" : ""}" data-pip="${p + 1}"></span>`
                  )
                  .join("")}
              </div>
              <div class="cell-value">${cell.value} / ${cell.max}${cell.value >= cell.max ? " ★ MAX" : ""}</div>
            </div>
          `;
          })
          .join("")}
      </div>
    </div>

    <div class="build-section">
      <h4>Cards</h4>
      <div class="cards-grid">
        ${cardDefs
          .map(
            (c) => `
          <div class="card-item">
            <div class="card-label">${c.label}</div>
            <div class="card-swatches" data-card-key="${c.key}">
              <button class="swatch sw-green ${s.cards[c.key] === "green" ? "is-active" : ""}" data-color="green" title="Verde"></button>
              <button class="swatch sw-yellow ${s.cards[c.key] === "yellow" ? "is-active" : ""}" data-color="yellow" title="Amarillo"></button>
              <button class="swatch sw-red ${s.cards[c.key] === "red" ? "is-active" : ""}" data-color="red" title="Rojo"></button>
            </div>
          </div>
        `
          )
          .join("")}
      </div>
    </div>

    <div class="build-section">
      <h4>Awareness</h4>
      <div class="awareness-row">
        ${s.awareness
          .map(
            (on, i) =>
              `<button class="awareness-pip ${on ? "is-active" : ""}" data-awareness-index="${i}">Awareness ${i + 1}</button>`
          )
          .join("")}
      </div>
    </div>

    <div class="build-section">
      <h4>Notas</h4>
      <textarea id="f-notes" rows="3" style="width:100%;">${escapeHtmlB(s.notes || "")}</textarea>
    </div>

    <div style="display:flex; gap:10px; align-items:center;">
      <button class="btn btn-primary" id="save-build-btn">Guardar</button>
      <button class="btn btn-ghost" id="reset-build-btn">Reiniciar build</button>
      <span id="build-save-status" class="dim"></span>
    </div>
  `;

  // ---- listeners ----
  document.getElementById("f-rarity").onchange = (e) => (EDIT_STATE.rarity = e.target.value || null);
  document.getElementById("f-level").onchange = (e) => (EDIT_STATE.level = parseInt(e.target.value, 10) || 1);
  document.getElementById("f-has-weapon").onchange = (e) => {
    EDIT_STATE.has_weapon = e.target.checked;
    renderBuildModalBody();
  };
  document.getElementById("f-weapon-level").onchange = (e) => (EDIT_STATE.weapon_level = parseInt(e.target.value, 10) || 0);
  document.getElementById("f-notes").oninput = (e) => (EDIT_STATE.notes = e.target.value);

  body.querySelectorAll(".pip-track").forEach((track) => {
    const idx = parseInt(track.dataset.cellIndex, 10);
    track.querySelectorAll(".pip").forEach((pip) => {
      pip.onclick = () => {
        const p = parseInt(pip.dataset.pip, 10);
        EDIT_STATE.mindscape[idx].value = EDIT_STATE.mindscape[idx].value === p ? p - 1 : p;
        renderBuildModalBody();
      };
    });
  });

  body.querySelectorAll(".card-swatches").forEach((row) => {
    const key = row.dataset.cardKey;
    row.querySelectorAll(".swatch").forEach((sw) => {
      sw.onclick = () => {
        const color = sw.dataset.color;
        EDIT_STATE.cards[key] = EDIT_STATE.cards[key] === color ? null : color;
        renderBuildModalBody();
      };
    });
  });

  body.querySelectorAll("[data-awareness-index]").forEach((btn) => {
    btn.onclick = () => {
      const i = parseInt(btn.dataset.awarenessIndex, 10);
      EDIT_STATE.awareness[i] = !EDIT_STATE.awareness[i];
      renderBuildModalBody();
    };
  });

  document.getElementById("save-build-btn").onclick = saveBuild;
  document.getElementById("reset-build-btn").onclick = () => {
    if (!confirm("¿Reiniciar esta build a valores por defecto? (no se guarda hasta que le des a Guardar)")) return;
    EDIT_STATE = defaultBuild(EDIT_CHARACTER.id);
    renderBuildModalBody();
  };
}

async function saveBuild() {
  const statusEl = document.getElementById("build-save-status");
  statusEl.textContent = "Guardando…";

  const isNewBuild = !BUILD_MAP[EDIT_CHARACTER.id];
  const payload = { ...EDIT_STATE, updated_at: new Date().toISOString() };
  delete payload.id;

  const { error } = await sb
    .from("character_builds")
    .upsert(payload, { onConflict: "character_id" });

  if (error) {
    statusEl.textContent = "Error: " + error.message;
    return;
  }

  if (isNewBuild) await logActivity("build", `Build creada: ${EDIT_CHARACTER.name}`);

  statusEl.textContent = "Guardado ✓";
  await loadBuildData();
}

// ---------------- Init ----------------

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("filter-search").addEventListener("input", (e) => {
    BUILD_FILTERS.search = e.target.value;
    renderBuildTable();
  });

  document.getElementById("build-modal-close-btn").addEventListener("click", () => {
    document.getElementById("build-modal").classList.add("hidden");
  });
  document.getElementById("build-modal").addEventListener("click", (e) => {
    if (e.target.id === "build-modal") e.target.classList.add("hidden");
  });

  MenheraAuth.onChange(() => loadBuildData());
});
