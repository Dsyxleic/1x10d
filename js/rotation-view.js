// ============================================================
// MENHERA — Vista de rotación (solo lectura)
// ============================================================

function escapeHtml(s) {
  return (s || "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

async function loadRotation() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  if (!id) {
    document.getElementById("rv-title").textContent = "Rotación no encontrada";
    return;
  }

  const { data: r, error } = await sb.from("rotations").select("*").eq("id", id).single();
  if (error || !r) {
    document.getElementById("rv-title").textContent = "Rotación no encontrada";
    return;
  }

  document.getElementById("rv-title").textContent = r.title;
  document.getElementById("rv-edit-link").href = `tactic-maker.html?id=${r.id}`;

  const metaParts = [];
  if (r.boss_id) {
    const { data: boss } = await sb.from("bosses").select("name").eq("id", r.boss_id).single();
    if (boss) metaParts.push(`Jefe: ${boss.name}`);
  }
  if (r.game_mode_id) {
    const { data: mode } = await sb.from("game_modes").select("name").eq("id", r.game_mode_id).single();
    if (mode) metaParts.push(`Modo: ${mode.name}`);
  }
  if (r.dps_character_id) {
    const { data: c } = await sb.from("characters").select("name").eq("id", r.dps_character_id).single();
    if (c) metaParts.push(`DPS: ${c.name}`);
  }
  document.getElementById("rv-meta").textContent = metaParts.join("   //   ");

  if (r.notes) {
    document.getElementById("rv-notes").classList.remove("hidden");
    document.getElementById("rv-notes").innerHTML = `<strong>Notas:</strong> ${escapeHtml(r.notes)}`;
  }

  const grid0 = r.grid || {};
  const personaIds = (grid0.wonder?.personas || []).filter((s) => s && s.personaId).map((s) => s.personaId);
  let personaMap = {};
  if (personaIds.length) {
    const { data: personas } = await sb.from("personas").select("*").in("id", personaIds);
    (personas || []).forEach((p) => (personaMap[p.id] = p));
  }

  if (r.wonder_knife || personaIds.length) {
    document.getElementById("rv-wonder").classList.remove("hidden");
    const personaCells = (grid0.wonder?.personas || [])
      .filter((s) => s && s.personaId)
      .map((s) => {
        const p = personaMap[s.personaId];
        return `<td>${p && p.avatar_url ? `<img src="${p.avatar_url}" class="th-avatar" />` : ""}${p ? escapeHtml(p.name) : ""}${s.skillLabel ? ` — ${escapeHtml(s.skillLabel)}` : ""}</td>`;
      })
      .join("");
    document.getElementById("rv-wonder").innerHTML = `
      <table class="export-header-table">
        <tr>
          ${r.wonder_knife ? `<td><strong>Cuchillo</strong><br>${escapeHtml(r.wonder_knife)}</td>` : ""}
          ${personaCells}
        </tr>
      </table>
    `;
  }

  const grid = r.grid || { columns: [], turns: [] };
  const allCharIds = new Set(grid.columns.filter(Boolean));
  const allPersonaIds = new Set();
  (grid.turns || []).forEach((turn) => {
    turn.cells.forEach((cell) => {
      cell.forEach((entry) => {
        if (entry?.characterId) allCharIds.add(entry.characterId);
        if (entry?.personaId) allPersonaIds.add(entry.personaId);
      });
    });
  });
  const { data: chars } = await sb.from("characters").select("*").in("id", [...allCharIds]);
  const charMap = {};
  (chars || []).forEach((c) => (charMap[c.id] = c));

  let entryPersonaMap = {};
  if (allPersonaIds.size) {
    const { data: entryPersonas } = await sb.from("personas").select("*").in("id", [...allPersonaIds]);
    (entryPersonas || []).forEach((p) => (entryPersonaMap[p.id] = p));
  }

  // Iconos por skill: de los personajes implicados y, si hay, de sus Personas
  let actionIconMap = {}; // "characterId||label" -> icon_url
  if (allCharIds.size) {
    const { data: actions } = await sb.from("character_actions").select("*").in("character_id", [...allCharIds]);
    (actions || []).forEach((a) => { if (a.icon_url) actionIconMap[`${a.character_id}||${a.label}`] = a.icon_url; });
  }
  let personaSkillIconMap = {}; // "personaId||label" -> icon_url
  if (allPersonaIds.size) {
    const { data: pskills } = await sb.from("persona_skills").select("*").in("persona_id", [...allPersonaIds]);
    (pskills || []).forEach((s) => { if (s.icon_url) personaSkillIconMap[`${s.persona_id}||${s.label}`] = s.icon_url; });
  }

  const TAG_COLORS = { hl: "#e8c34a", navi: "#9fe6a0", teurgia: "#9fd0f0", miku: "#39c5bb", extra: "#c99ee8" };

  const colWidthPct = (100 / grid.columns.length).toFixed(3);

  let html = `<table class="export-table" style="width:100%;">
    <colgroup>
      <col class="export-turn-th" />
      ${grid.columns.map(() => `<col style="width:${colWidthPct}%;" />`).join("")}
    </colgroup>
    <thead><tr>
      <th class="export-turn-th"></th>
      ${grid.columns.map((id) => {
      const c = charMap[id];
      return `<th style="background:${c ? c.color_bg : "#2c1f21"}; color:${c ? c.color_text : "#efe6dd"}">
        ${c && c.avatar_url ? `<img src="${c.avatar_url}" class="th-avatar" />` : ""}
        ${c ? escapeHtml(c.name) : "—"}
      </th>`;
    }).join("")}</tr></thead>
    <tbody>`;

  (grid.turns || []).forEach((turn, turnIdx) => {
    const turnColor = turn.tag ? TAG_COLORS[turn.tag] : null;
    const rowStyle = turnColor ? ` style="background:${turnColor}1a;"` : "";
    const turnCellStyle = turnColor ? `background:${turnColor}4d; color:${turnColor};` : "color:var(--red-glow);";

    html += `<tr${rowStyle}>`;
    html += `<td class="export-turn-td" style="${turnCellStyle}">${turnIdx + 1}</td>`;

    turn.cells.forEach((cell, colIdx) => {
      const columnCharId = grid.columns[colIdx];
      if (cell.length === 0) {
        html += `<td></td>`;
        return;
      }
      const actionsHtml = cell
        .map((entry) => {
          const color = entry?.tag ? TAG_COLORS[entry.tag] : null;
          const lineStyle = color ? `background:${color}2e; color:${color}; font-weight:600;` : "";
          const entryCharId = entry.characterId || columnCharId;
          const entryChar = charMap[entryCharId];
          const isWonderEntry = entryChar && entryChar.name.trim().toLowerCase() === "wonder";
          const showAvatar = isWonderEntry || entryCharId !== columnCharId;
          const avatarSrc = isWonderEntry ? entryPersonaMap[entry.personaId]?.avatar_url : entryChar?.avatar_url;
          const avatarImg = showAvatar && avatarSrc ? `<img src="${avatarSrc}" class="td-avatar" />` : "";
          let skillIconUrl = null;
          if (entry.actionLabel) {
            skillIconUrl = isWonderEntry
              ? personaSkillIconMap[`${entry.personaId}||${entry.actionLabel}`]
              : actionIconMap[`${entryChar?.id}||${entry.actionLabel}`];
          }
          const skillIconImg = skillIconUrl ? `<img src="${skillIconUrl}" class="td-skill-icon" />` : "";
          return `<div class="cell-action" style="${lineStyle}">${avatarImg}${skillIconImg}${escapeHtml(entry.actionLabel || "")}</div>`;
        })
        .join("");
      html += `<td>${actionsHtml}</td>`;
    });

    html += "</tr>";
  });

  html += `</tbody></table>`;
  document.getElementById("rv-target").innerHTML = `<div class="export-sheet">${html}</div>`;
}

document.addEventListener("DOMContentLoaded", () => {
  loadRotation();
  MenheraAuth.onChange(() => {
    document.querySelectorAll("[data-admin-only]").forEach((el) => {
      el.classList.toggle("hidden", !MenheraAuth.getIsAdmin());
    });
  });

  document.getElementById("rv-delete-btn").addEventListener("click", async () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (!id) return;
    if (!confirm("¿Eliminar esta rotación? No se puede deshacer.")) return;
    const { error } = await sb.from("rotations").delete().eq("id", id);
    if (error) {
      alert("Error: " + error.message);
      return;
    }
    window.location.href = "library.html";
  });
});
