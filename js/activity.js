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
