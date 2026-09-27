function escapeHtmlHome(s) {
  return (s || "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return "justo ahora";
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`;
  const days = Math.floor(diff / 86400);
  return `hace ${days} día${days === 1 ? "" : "s"}`;
}

const TYPE_LABELS = {
  character: "Personaje",
  persona: "Persona",
  rotation: "Rotación",
  build: "Build",
  note: "Nota",
};

async function loadActivity() {
  const box = document.getElementById("activity-feed");

  const { data, error } = await sb
    .from("activity_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(15);

  if (error || !data || data.length === 0) {
    box.innerHTML = `<p class="dim">Todavía no hay actividad registrada.</p>`;
    return;
  }

  box.innerHTML = data
    .map(
      (a) => `
      <div class="recent-item">
        <span class="recent-item-title"><span class="activity-tag">${TYPE_LABELS[a.type] || a.type}</span>${escapeHtmlHome(a.label)}</span>
        <span class="recent-item-meta">${timeAgo(a.created_at)}</span>
      </div>
    `
    )
    .join("");
}

document.addEventListener("DOMContentLoaded", () => {
  MenheraAuth.onChange(() => loadActivity());
});
