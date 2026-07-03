// ============================================================
// 1x10d — Conexión a Supabase
// ============================================================
 
const SUPABASE_URL = "https://peqxailtallctteudcum.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_x9vdx5j15-OpDvdoSKKyGw_-Kp9Utj8";
 
window.sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
 
