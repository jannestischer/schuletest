/* ============================================================
   Gemeinsamer Supabase-Client
   - prüft, ob die Config bereits ausgefüllt wurde
   - zeigt auf den Seiten einen Hinweis, falls nicht
   ============================================================ */

const supabaseClient = (function () {
    const urlOk =
        typeof SUPABASE_URL === "string" &&
        /^https?:\/\//.test(SUPABASE_URL) &&
        !SUPABASE_URL.includes("DEINE_");

    const keyOk =
        typeof SUPABASE_ANON_KEY === "string" &&
        SUPABASE_ANON_KEY.length > 20 &&
        !SUPABASE_ANON_KEY.includes("DEINE_");

    if (!urlOk || !keyOk) {
        console.warn(
            "Supabase ist noch nicht konfiguriert. " +
            "Bitte js/supabase-config.js ausfüllen."
        );
        const hint = document.getElementById("setup-hint");
        if (hint) hint.hidden = false;
        return null;
    }

    return window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
})();

function isSupabaseConfigured() {
    return supabaseClient !== null;
}
