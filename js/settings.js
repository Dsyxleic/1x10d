// ============================================================
// 1x10d — Ajustes: iconos personalizados por elemento
// ============================================================

function renderIconSettings() {
  const box = document.getElementById("icon-settings-grid");

  box.innerHTML = ELEMENTS.map((e) => {
    const custom = ICON_OVERRIDES[e.key];
    return `
      <div class="panel icon-setting-card" data-key="${e.key}">
        <div class="icon-setting-preview" style="border-color:${e.color}; background:${e.color}22;">
          ${custom ? `<img src="${custom}" alt="${e.label}" />` : `<svg viewBox="0 0 24 24" width="30" height="30" fill="${e.color}">${e.svg}</svg>`}
        </div>
        <div class="icon-setting-name">${e.label}</div>
        <input type="file" accept="image/*" data-file-input />
        <div class="icon-setting-actions">
          <button class="btn btn-primary" data-upload>Subir</button>
          <button class="btn btn-ghost" data-clear ${custom ? "" : "disabled"}>Quitar</button>
        </div>
        <div class="icon-setting-status dim" data-status></div>
      </div>
    `;
  }).join("");

  box.querySelectorAll("[data-upload]").forEach((btn) => {
    btn.onclick = () => uploadIcon(btn.closest(".icon-setting-card"));
  });
  box.querySelectorAll("[data-clear]").forEach((btn) => {
    btn.onclick = () => clearIcon(btn.closest(".icon-setting-card"));
  });
}

async function uploadIcon(card) {
  const key = card.dataset.key;
  const fileInput = card.querySelector("[data-file-input]");
  const statusEl = card.querySelector("[data-status]");
  const file = fileInput.files[0];

  if (!file) {
    statusEl.textContent = "Elige un archivo primero.";
    return;
  }

  statusEl.textContent = "Subiendo…";

  const path = safeUploadPath(file, `icons/element-${key}-`);
  const { error: uploadError } = await sb.storage.from("images").upload(path, file);
  if (uploadError) {
    statusEl.textContent = "Error: " + uploadError.message;
    return;
  }

  const { data: urlData } = sb.storage.from("images").getPublicUrl(path);

  const { error } = await sb
    .from("icon_assets")
    .upsert({ category: "element", key, image_url: urlData.publicUrl, updated_at: new Date().toISOString() }, { onConflict: "category,key" });

  if (error) {
    statusEl.textContent = "Error: " + error.message;
    return;
  }

  statusEl.textContent = "Guardado ✓";
  await loadIconOverrides();
  renderIconSettings();
}

async function clearIcon(card) {
  const key = card.dataset.key;
  const statusEl = card.querySelector("[data-status]");

  const { error } = await sb.from("icon_assets").delete().eq("category", "element").eq("key", key);
  if (error) {
    statusEl.textContent = "Error: " + error.message;
    return;
  }

  await loadIconOverrides();
  renderIconSettings();
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".settings-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".settings-tab").forEach((b) => b.classList.toggle("is-active", b === btn));
      document.querySelectorAll(".settings-panel").forEach((p) =>
        p.classList.toggle("is-active", p.dataset.panel === btn.dataset.tab)
      );
    });
  });

  MenheraAuth.onChange(async () => {
    await loadIconOverrides();
    renderIconSettings();
  });
});
