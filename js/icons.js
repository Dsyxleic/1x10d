// ============================================================
// 1x10d — Iconos y colores de Elementos (P5X)
// Símbolos propios (no son el arte original del juego) pero con
// la misma lógica de color por elemento.
// ============================================================

const ELEMENTS = [
  {
    key: "physical", label: "Physical", color: "#c7c0d6",
    svg: `<path d="M12 3l1.8 6.6L20 8.5l-4.6 5.3L18 21l-6-3.4L6 21l2.6-7.2L4 8.5l6.2 1.1Z"/>`,
  },
  {
    key: "gun", label: "Gun", color: "#93a3b8",
    svg: `<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="7"/><line x1="12" y1="2" x2="12" y2="5.5"/><line x1="12" y1="18.5" x2="12" y2="22"/><line x1="2" y1="12" x2="5.5" y2="12"/><line x1="18.5" y1="12" x2="22" y2="12"/></g><circle cx="12" cy="12" r="1.6"/>`,
  },
  {
    key: "fire", label: "Fire", color: "#ff7a45",
    svg: `<path d="M12 2c-3 4-6 6.3-6 11a6 6 0 0 0 12 0c0-3-1.6-5.6-3.2-7.2.6 2.7-1 4.3-2.1 4.3-1.1 0-1.9-1-1.4-2.8C10.4 9 9 11 9 13a3 3 0 0 0 6 0"/>`,
  },
  {
    key: "ice", label: "Ice", color: "#7ec8e3",
    svg: `<g stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><line x1="12" y1="3" x2="12" y2="21"/><line x1="4.5" y1="7.5" x2="19.5" y2="16.5"/><line x1="19.5" y1="7.5" x2="4.5" y2="16.5"/><line x1="12" y1="3" x2="9.5" y2="6"/><line x1="12" y1="3" x2="14.5" y2="6"/><line x1="12" y1="21" x2="9.5" y2="18"/><line x1="12" y1="21" x2="14.5" y2="18"/></g>`,
  },
  {
    key: "electric", label: "Electric", color: "#f4d03f",
    svg: `<path d="M13 2L4.5 14H10l-1 8 8.5-12H12Z"/>`,
  },
  {
    key: "wind", label: "Wind", color: "#6fcf97",
    svg: `<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 8h10.5a2.75 2.75 0 1 0-2.75-2.75"/><path d="M3 12.5h14a2.75 2.75 0 1 1-2.75 2.75"/><path d="M3 17h8a2.25 2.25 0 1 1-2.25 2.25"/></g>`,
  },
  {
    key: "psychokinesis", label: "Psychokinesis", color: "#d179e0",
    svg: `<path d="M12 12.2a3.6 3.6 0 1 1 3.6-3.6 5.6 5.6 0 1 1-5.6 5.6 7.6 7.6 0 1 0 7.6-7.6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>`,
  },
  {
    key: "nuclear", label: "Nuclear", color: "#3ec9c9",
    svg: `<g fill="currentColor"><circle cx="12" cy="12" r="2.1"/><path d="M12 4.2a7.8 7.8 0 0 1 6.7 3.9l-3.7 2.1A3.8 3.8 0 0 0 12 8.2Z"/><path d="M4.5 15.7a7.8 7.8 0 0 1 0-7.8l3.7 2.1a3.8 3.8 0 0 0 0 3.6Z"/><path d="M19.5 15.7a7.8 7.8 0 0 1-6.7 3.9l-.5-4.2a3.8 3.8 0 0 0 3.5-1.8Z"/></g>`,
  },
  {
    key: "bless", label: "Bless", color: "#e8c34a",
    svg: `<g stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="12" cy="12" r="3.6" fill="currentColor" stroke="none"/><line x1="12" y1="2" x2="12" y2="4.6"/><line x1="12" y1="19.4" x2="12" y2="22"/><line x1="2" y1="12" x2="4.6" y2="12"/><line x1="19.4" y1="12" x2="22" y2="12"/><line x1="5" y1="5" x2="6.8" y2="6.8"/><line x1="17.2" y1="17.2" x2="19" y2="19"/><line x1="5" y1="19" x2="6.8" y2="17.2"/><line x1="17.2" y1="6.8" x2="19" y2="5"/></g>`,
  },
  {
    key: "curse", label: "Curse", color: "#9b6fd6",
    svg: `<path d="M15.5 3a9 9 0 1 0 5.4 16.2A9 9 0 0 1 15.5 3Z"/>`,
  },
];

function findElement(key) {
  return ELEMENTS.find((e) => e.key === key) || null;
}

function elementBadge(key, size) {
  const e = findElement(key);
  if (!e) return "";
  const s = size || 20;
  return `<span class="elem-badge" style="width:${s}px;height:${s}px;background:${e.color}22;border-color:${e.color};color:${e.color};" title="${e.label}"><svg viewBox="0 0 24 24" width="${Math.round(s * 0.62)}" height="${Math.round(s * 0.62)}" fill="currentColor">${e.svg}</svg></span>`;
}
