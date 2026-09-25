let BOSS_CACHE = [];

function escapeHtmlBoss(s) {
  return (s || "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

async function loadBosses() {
  const box = document.getElementById("boss-list");
  if (!box) return;

  const { data, error } = await sb.from("bosses").select("*").order("name");

  if (error) {
    box.innerHTML = `<p class="dim">Error cargando jefes: ${error.message}</p>`;
    return;
  }

  BOSS_CACHE = data || [];

  if (BOSS_CACHE.length === 0) {
    box.innerHTML = `<p class="dim">Todavía no hay jefes. Añade el primero arriba.</p>`;
    return;
  }

  box.innerHTML = BOSS_CACHE
    .map(
      (b) => `
      <div class="boss-row" data-id="${b.id}" style="border-left-color:${b.color || "#7a1518"};">
        <input type="text" data-boss-name value="${escapeHtmlBoss(b.name)}" />
        <input type="color" data-boss-color value="${b.color || "#7a1518"}" />
        <button class="btn btn-ghost" data-boss-save>Guardar</button>
        <button class="btn btn-ghost" data-boss-delete>Eliminar</button>
      </div>
    `
    )
    .join("");

  box.querySelectorAll("[data-boss-save]").forEach((btn) => {
    btn.onclick = async () => {
      const row = btn.closest(".boss-row");
      const id = row.dataset.id;
      const name = row.querySelector("[data-boss-name]").value.trim();
      const color = row.querySelector("[data-boss-color]").value;
      if (!name) return;
      const { error } = await sb.from("bosses").update({ name, color }).eq("id", id);
      if (error) { alert("Error: " + error.message); return; }
      await loadBosses();
    };
  });

  box.querySelectorAll("[data-boss-delete]").forEach((btn) => {
    btn.onclick = async () => {
      const row = btn.closest(".boss-row");
      if (!confirm("¿Eliminar este jefe? Las rotaciones que lo usaban se quedan sin jefe asignado.")) return;
      const { error } = await sb.from("bosses").delete().eq("id", row.dataset.id);
      if (error) { alert("Error: " + error.message); return; }
      await loadBosses();
    };
  });
}

async function saveNewBoss() {
  const statusEl = document.getElementById("boss-save-status");
  const name = document.getElementById("new-boss-name").value.trim();
  const color = document.getElementById("new-boss-color").value;

  if (!name) {
    statusEl.textContent = "Ponle un nombre al jefe.";
    return;
  }

  const { error } = await sb.from("bosses").insert({ name, color });
  if (error) {
    statusEl.textContent = "Error: " + error.message;
    return;
  }

  statusEl.textContent = "Guardado ✓";
  document.getElementById("new-boss-name").value = "";
  await loadBosses();
}

document.addEventListener("DOMContentLoaded", () => {
  const saveBtn = document.getElementById("save-boss-btn");
  if (saveBtn) saveBtn.addEventListener("click", saveNewBoss);

  MenheraAuth.onChange(() => loadBosses());
});
