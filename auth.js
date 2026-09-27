window.MenheraAuth = (function () {
  let currentUser = null;
  let isAdmin = false;
  const listeners = [];
  const isLoginPage = document.body.dataset.publicPage === "true";

  async function init() {
    const { data: { session } } = await sb.auth.getSession();
    await applySession(session);

    sb.auth.onAuthStateChange(async (_event, session) => {
      await applySession(session);
    });
  }

  async function applySession(session) {
    currentUser = session ? session.user : null;
    isAdmin = false;

    if (currentUser) {
      const { data, error } = await sb.rpc("is_admin");
      if (!error) isAdmin = !!data;
    }

    // si no eres admin, fuera
    if (!isLoginPage && !isAdmin) {
      window.location.href = "login.html";
      return;
    }

    document.body.classList.remove("auth-checking");

    listeners.forEach((fn) => fn({ user: currentUser, isAdmin }));
    renderSessionSlot();
  }

  function onChange(fn) {
    listeners.push(fn);
  }

  async function login(email, password) {
    const { error } = await sb.auth.signInWithPassword({ email, password });
    return error;
  }

  async function logout() {
    await sb.auth.signOut();
    window.location.href = "login.html";
  }

  function renderSessionSlot() {
    const slot = document.getElementById("session-slot");
    if (!slot) return;

    if (currentUser && isAdmin) {
      slot.innerHTML = `
        <span class="session-pill is-admin">◉ ${currentUser.email}</span>
        <button class="btn btn-ghost" id="logout-btn">Salir</button>
      `;
      document.getElementById("logout-btn").onclick = () => logout();
    } else {
      slot.innerHTML = "";
    }
  }

  return { init, onChange, login, logout, getIsAdmin: () => isAdmin, getUser: () => currentUser };
})();

document.addEventListener("DOMContentLoaded", () => {
  window.MenheraAuth.init();
});
