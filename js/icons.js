// ============================================================
// 1x10d — Iconos y colores de Elementos y Roles (P5X)
// ============================================================

const ELEMENTS = [
  { key: "physical", label: "Physical", icon: "👊", color: "#b8b0c0" },
  { key: "gun", label: "Gun", icon: "🔫", color: "#8899aa" },
  { key: "fire", label: "Fire", icon: "🔥", color: "#ff6b35" },
  { key: "ice", label: "Ice", icon: "❄️", color: "#7ec8e3" },
  { key: "electric", label: "Electric", icon: "⚡", color: "#f4d03f" },
  { key: "wind", label: "Wind", icon: "🌪️", color: "#6fcf97" },
  { key: "psychokinesis", label: "Psychokinesis", icon: "🔮", color: "#d179e0" },
  { key: "nuclear", label: "Nuclear", icon: "☢️", color: "#3ec9c9" },
  { key: "bless", label: "Bless", icon: "✨", color: "#e8c34a" },
  { key: "curse", label: "Curse", icon: "💀", color: "#9b6fd6" },
];

const ROLES = [
  { key: "assassin", label: "Assassin", icon: "🗡️", color: "#d64b4b" },
  { key: "sweeper", label: "Sweeper", icon: "💫", color: "#e07b3f" },
  { key: "medic", label: "Medic", icon: "✚", color: "#4bd67f" },
  { key: "saboteur", label: "Saboteur", icon: "🎭", color: "#a054d6" },
  { key: "guardian", label: "Guardian", icon: "🛡️", color: "#4b8ed6" },
  { key: "strategist", label: "Strategist", icon: "♟️", color: "#d1a13d" },
  { key: "navigator", label: "Navigator", icon: "🧭", color: "#3ec9a8" },
];

function findElement(key) {
  return ELEMENTS.find((e) => e.key === key) || null;
}
function findRole(key) {
  return ROLES.find((r) => r.key === key) || null;
}

function elementBadge(key, size) {
  const e = findElement(key);
  if (!e) return "";
  const s = size || 18;
  return `<span class="elem-badge" style="width:${s}px;height:${s}px;font-size:${Math.round(s * 0.6)}px;background:${e.color}22;border-color:${e.color};" title="${e.label}">${e.icon}</span>`;
}
function roleBadge(key, size) {
  const r = findRole(key);
  if (!r) return "";
  const s = size || 18;
  return `<span class="elem-badge" style="width:${s}px;height:${s}px;font-size:${Math.round(s * 0.6)}px;background:${r.color}22;border-color:${r.color};" title="${r.label}">${r.icon}</span>`;
}
