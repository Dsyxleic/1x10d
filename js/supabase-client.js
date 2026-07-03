// ============================================================
// 1x10d — Conexión a Supabase
// Rellena con los valores de TU proyecto NUEVO (no el de Menhera):
// Project Settings > API Keys > Project URL / anon-public / publishable key
// ============================================================

const SUPABASE_URL = "https://TU-PROYECTO.supabase.co";
const SUPABASE_ANON_KEY = "TU-ANON-KEY-AQUI";

window.sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
