/* ============================================================
   Registrierungs-Logik
   ============================================================ */

(function () {
    const form = document.getElementById("register-form");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const confirmInput = document.getElementById("password-confirm");
    const submitBtn = document.getElementById("submit-btn");
    const errorBox = document.getElementById("error-box");
    const successBox = document.getElementById("success-box");

    /* E-Mail aus dem Link vom Login-Fehler vorbefüllen */
    const presetEmail = new URLSearchParams(window.location.search).get("email");
    if (presetEmail) emailInput.value = presetEmail;

    function showError(message) {
        successBox.hidden = true;
        errorBox.textContent = message;
        errorBox.hidden = false;
    }

    function showSuccess(html) {
        errorBox.hidden = true;
        successBox.replaceChildren();
        successBox.append(html);

        const br = document.createElement("br");
        const a = document.createElement("a");
        a.href = "index.html";
        a.textContent = "Zum Login";

        successBox.append(br, a);
        successBox.hidden = false;
    }

    function setLoading(loading) {
        submitBtn.disabled = loading;
        submitBtn.textContent = loading ? "Konto wird erstellt …" : "Konto erstellen";
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        errorBox.hidden = true;
        successBox.hidden = true;

        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const confirm = confirmInput.value;

        if (!email || !password || !confirm) {
            showError("Bitte fülle alle Felder aus.");
            return;
        }

        if (!/^\S+@\S+\.\S+$/.test(email)) {
            showError("Bitte gib eine gültige E-Mail-Adresse ein.");
            return;
        }

        if (password.length < 6) {
            showError("Das Passwort muss mindestens 6 Zeichen lang sein.");
            return;
        }

        if (password !== confirm) {
            showError("Die Passwörter stimmen nicht überein.");
            return;
        }

        if (!isSupabaseConfigured()) {
            showError("Supabase ist noch nicht konfiguriert – trage deine Daten in js/supabase-config.js ein.");
            return;
        }

        setLoading(true);

        try {
            const { data, error } = await supabaseClient.auth.signUp({
                email,
                password
            });

            if (error) {
                const msg = error.message.toLowerCase();
                const code = (error.code || "").toLowerCase();

                if (code === "user_already_exists" || msg.includes("already registered") || msg.includes("already been registered")) {
                    showError("Ein Konto mit dieser E-Mail existiert bereits.");
                } else if (msg.includes("password should be at least")) {
                    showError("Das Passwort muss mindestens 6 Zeichen lang sein.");
                } else if (msg.includes("rate limit") || msg.includes("too many")) {
                    showError("Zu viele Versuche. Bitte warte einen Moment und versuche es erneut.");
                } else {
                    console.error("Registrierung fehlgeschlagen:", error);
                    showError("Registrierung fehlgeschlagen. Bitte versuche es erneut.");
                }
                return;
            }

            /* Ohne E-Mail-Bestätigung gibt es direkt eine Session */
            if (data.session) {
                window.location.href = "welcome.html";
                return;
            }

            showSuccess("Konto erstellt! Wir haben dir eine Bestätigungs-E-Mail geschickt – bitte bestätige sie und melde dich dann an.");
        } catch (err) {
            console.error(err);
            showError("Es ist ein Fehler aufgetreten. Bitte versuche es erneut.");
        } finally {
            setLoading(false);
        }
    });
})();
