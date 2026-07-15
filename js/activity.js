// ============================================================
// 1x10d — Registro de actividad (changelog)
// ============================================================

async function logActivity(type, label) {
  try {
    await sb.from("activity_log").insert({ type, label });
  } catch (e) {
    // silencioso: el changelog no debe romper el flujo principal
    console.warn("No se pudo registrar la actividad:", e);
  }
}

// ---------------- Nombre de archivo seguro para Supabase Storage ----------------
// Evita el error "Invalid key" cuando el nombre original tiene tildes,
// espacios, emojis, o caracteres de otros alfabetos (coreano, japonés, etc).
function safeUploadPath(file, prefix) {
  const extMatch = file.name.match(/\.[a-zA-Z0-9]+$/);
  const ext = extMatch ? extMatch[0].toLowerCase() : "";
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix || ""}${Date.now()}-${rand}${ext}`;
}
