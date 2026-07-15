async function logActivity(type, label) {
  try {
    await sb.from("activity_log").insert({ type, label });
  } catch (e) {
    // no queremos que esto rompa nada si falla
    console.warn("No se pudo registrar la actividad:", e);
  }
}
// nombre de archivo random para evitar líos con Supabase Storage
function safeUploadPath(file, prefix) {
  const extMatch = file.name.match(/\.[a-zA-Z0-9]+$/);
  const ext = extMatch ? extMatch[0].toLowerCase() : "";
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix || ""}${Date.now()}-${rand}${ext}`;
}
