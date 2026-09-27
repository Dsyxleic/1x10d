document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".settings-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".settings-tab").forEach((b) => b.classList.toggle("is-active", b === btn));
      document.querySelectorAll(".settings-panel").forEach((p) =>
        p.classList.toggle("is-active", p.dataset.panel === btn.dataset.tab)
      );
    });
  });
});
