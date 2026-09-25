let FOLDERS = [];
let NOTES = [];
let NOTE_CHARACTERS = [];
let SELECTED_NOTE_ID = null;
let SAVE_TIMER = null;
let ACTIVE_CHAR_FILTER = "";

function escapeHtmlN(s) {
  return (s || "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

async function loadNotesData() {
  const [{ data: folders }, { data: notes }, { data: chars }] = await Promise.all([
    sb.from("note_folders").select("*").order("sort_order"),
    sb.from("notes").select("*").order("updated_at", { ascending: false }),
    sb.from("characters").select("*").order("sort_order"),
  ]);

  FOLDERS = folders || [];
  NOTES = notes || [];
  NOTE_CHARACTERS = chars || [];

  renderCharacterFilter();
  renderFolderSelect();
  renderCharacterSelect();
  renderFolderTree();
}

function renderCharacterFilter() {
  const sel = document.getElementById("character-filter-select");
  sel.innerHTML =
    `<option value="">— Todas las notas —</option>` +
    NOTE_CHARACTERS.map((c) => `<option value="${c.id}">${escapeHtmlN(c.name)}</option>`).join("");
  sel.value = ACTIVE_CHAR_FILTER;
}

function renderFolderSelect() {
  const sel = document.getElementById("note-folder-select");
  sel.innerHTML =
    `<option value="">Sin carpeta</option>` +
    FOLDERS.map((f) => `<option value="${f.id}">${escapeHtmlN(f.name)}</option>`).join("");
}

function renderCharacterSelect() {
  const sel = document.getElementById("note-character-select");
  sel.innerHTML =
    `<option value="">Sin personaje</option>` +
    NOTE_CHARACTERS.map((c) => `<option value="${c.id}">${escapeHtmlN(c.name)}</option>`).join("");
}

function renderFolderTree() {
  const box = document.getElementById("folder-tree");

  if (ACTIVE_CHAR_FILTER) {
    const char = NOTE_CHARACTERS.find((c) => c.id === ACTIVE_CHAR_FILTER);
    const charNotes = NOTES.filter((n) => n.character_id === ACTIVE_CHAR_FILTER);
    box.innerHTML = `
      <div class="folder-block">
        <div class="folder-head" style="cursor:default;">
          <span class="folder-name">${char ? escapeHtmlN(char.name) : "Personaje"} <span class="dim">(${charNotes.length})</span></span>
        </div>
        <div class="note-list">
          ${charNotes
            .map(
              (n) =>
                `<div class="note-item ${n.id === SELECTED_NOTE_ID ? "is-active" : ""}" data-note-id="${n.id}">${escapeHtmlN(n.title || "Sin título")}</div>`
            )
            .join("") || `<div class="dim" style="padding:6px 10px; font-size:12px;">Sin notas todavía</div>`}
        </div>
      </div>
    `;
    box.querySelectorAll("[data-note-id]").forEach((el) => {
      el.onclick = () => selectNote(el.dataset.noteId);
    });
    return;
  }

  const groups = [{ id: null, name: "Sin carpeta" }, ...FOLDERS];

  box.innerHTML = groups
    .map((f) => {
      const notesInFolder = NOTES.filter((n) => n.folder_id === f.id);
      return `
        <div class="folder-block">
          <div class="folder-head">
            <span class="folder-name">${f.id ? "📁" : "📄"} ${escapeHtmlN(f.name)} <span class="dim">(${notesInFolder.length})</span></span>
            ${f.id ? `<button class="folder-del" data-del-folder="${f.id}">✕</button>` : ""}
          </div>
          <div class="note-list">
            ${notesInFolder
              .map(
                (n) =>
                  `<div class="note-item ${n.id === SELECTED_NOTE_ID ? "is-active" : ""}" data-note-id="${n.id}">${escapeHtmlN(n.title || "Sin título")}</div>`
              )
              .join("") || `<div class="dim" style="padding:6px 10px; font-size:12px;">Vacío</div>`}
          </div>
        </div>
      `;
    })
    .join("");

  box.querySelectorAll("[data-note-id]").forEach((el) => {
    el.onclick = () => selectNote(el.dataset.noteId);
  });
  box.querySelectorAll("[data-del-folder]").forEach((btn) => {
    btn.onclick = async (e) => {
      e.stopPropagation();
      if (!confirm("¿Eliminar esta carpeta? Las notas de dentro no se borran, se quedan sin carpeta.")) return;
      await sb.from("note_folders").delete().eq("id", btn.dataset.delFolder);
      await loadNotesData();
    };
  });
}

function selectNote(id) {
  SELECTED_NOTE_ID = id;
  const note = NOTES.find((n) => n.id === id);
  if (!note) return;

  document.getElementById("editor-empty").classList.add("hidden");
  document.getElementById("editor-form").classList.remove("hidden");

  document.getElementById("note-title").value = note.title || "";
  document.getElementById("note-content").value = note.content || "";
  document.getElementById("note-folder-select").value = note.folder_id || "";
  document.getElementById("note-character-select").value = note.character_id || "";
  document.getElementById("note-save-status").textContent = "";

  renderFolderTree();
}

function scheduleAutosave() {
  clearTimeout(SAVE_TIMER);
  document.getElementById("note-save-status").textContent = "Escribiendo…";
  SAVE_TIMER = setTimeout(saveCurrentNote, 700);
}

async function saveCurrentNote() {
  if (!SELECTED_NOTE_ID) return;
  const statusEl = document.getElementById("note-save-status");

  const payload = {
    title: document.getElementById("note-title").value.trim() || "Sin título",
    content: document.getElementById("note-content").value,
    folder_id: document.getElementById("note-folder-select").value || null,
    character_id: document.getElementById("note-character-select").value || null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await sb.from("notes").update(payload).eq("id", SELECTED_NOTE_ID);
  statusEl.textContent = error ? "Error: " + error.message : "Guardado ✓";

  const idx = NOTES.findIndex((n) => n.id === SELECTED_NOTE_ID);
  if (idx >= 0) NOTES[idx] = { ...NOTES[idx], ...payload };
  renderFolderTree();
}

async function createNote() {
  const payload = { title: "Sin título", content: "", folder_id: null };
  if (ACTIVE_CHAR_FILTER) payload.character_id = ACTIVE_CHAR_FILTER;

  const { data, error } = await sb.from("notes").insert(payload).select().single();

  if (error) {
    alert("Error: " + error.message);
    return;
  }

  NOTES.unshift(data);
  renderFolderTree();
  selectNote(data.id);
  document.getElementById("note-title").focus();
}

async function deleteCurrentNote() {
  if (!SELECTED_NOTE_ID) return;
  if (!confirm("¿Eliminar esta nota? No se puede deshacer.")) return;

  await sb.from("notes").delete().eq("id", SELECTED_NOTE_ID);
  NOTES = NOTES.filter((n) => n.id !== SELECTED_NOTE_ID);
  SELECTED_NOTE_ID = null;

  document.getElementById("editor-form").classList.add("hidden");
  document.getElementById("editor-empty").classList.remove("hidden");
  renderFolderTree();
}

async function createFolder() {
  const name = prompt("Nombre de la carpeta:");
  if (!name) return;
  const { error } = await sb.from("note_folders").insert({ name: name.trim(), sort_order: FOLDERS.length });
  if (error) { alert("Error: " + error.message); return; }
  await loadNotesData();
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("new-folder-btn").addEventListener("click", createFolder);
  document.getElementById("new-note-btn").addEventListener("click", createNote);
  document.getElementById("delete-note-btn").addEventListener("click", deleteCurrentNote);
  document.getElementById("note-title").addEventListener("input", scheduleAutosave);
  document.getElementById("note-content").addEventListener("input", scheduleAutosave);
  document.getElementById("note-folder-select").addEventListener("change", saveCurrentNote);
  document.getElementById("note-character-select").addEventListener("change", saveCurrentNote);
  document.getElementById("character-filter-select").addEventListener("change", (e) => {
    ACTIVE_CHAR_FILTER = e.target.value;
    renderFolderTree();
  });

  MenheraAuth.onChange(() => loadNotesData());
});
