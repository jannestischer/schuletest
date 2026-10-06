/* ============================================================
   Schutz der Willkommens-Seite + Abmelden
   ============================================================ */

(function () {
    const emailEl = document.getElementById("user-email");
    const logoutBtn = document.getElementById("logout-btn");

    if (!isSupabaseConfigured()) {
        window.location.replace("index.html");
        return;
    }

    /* Kein eingeloggter User? Zurück zum Login. */
    supabaseClient.auth.getSession().then(({ data }) => {
        if (!data.session) {
            window.location.replace("index.html");
            return;
        }
        emailEl.textContent = data.session.user.email || "";
    });

    logoutBtn.addEventListener("click", async () => {
        logoutBtn.disabled = true;
        await supabaseClient.auth.signOut();
        window.location.href = "index.html";
    });
})();
