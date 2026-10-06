/* ============================================================
   Login-Logik
   ------------------------------------------------------------
   Ablauf beim Absenden des Formulars:
   1. Prüfen, ob die E-Mail in der Tabelle "profiles" existiert.
      -> Nein:  "Kein Konto gefunden." + Link zur Registrierung
      -> Ja:    Passwort-Login versuchen
   ============================================================ */

(function () {
    const form = document.getElementById("login-form");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const submitBtn = document.getElementById("submit-btn");
    const errorBox = document.getElementById("error-box");

    /* Bereits eingeloggt? Dann direkt weiterleiten. */
    if (isSupabaseConfigured()) {
        supabaseClient.auth.getSession().then(({ data }) => {
            if (data.session) window.location.replace("welcome.html");
        });
    }

    function showError(message, link) {
        errorBox.replaceChildren();
        errorBox.append(message);
        if (link) {
            const a = document.createElement("a");
            a.href = link.href;
            a.textContent = link.text;
            errorBox.append(document.createElement("br"), a);
        }
        errorBox.hidden = false;
    }

    function clearError() {
        errorBox.hidden = true;
        errorBox.replaceChildren();
    }

    function setLoading(loading) {
        submitBtn.disabled = loading;
        submitBtn.textContent = loading ? "Anmeldung läuft …" : "Anmelden";
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        clearError();

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        if (!email || !password) {
            showError("Bitte gib E-Mail-Adresse und Passwort ein.");
            return;
        }

        if (!isSupabaseConfigured()) {
            showError("Supabase ist noch nicht konfiguriert – trage deine Daten in js/supabase-config.js ein.");
            return;
        }

        setLoading(true);

        try {
            /* 1) Existiert das Konto überhaupt? */
            const { data: profile, error: profileError } = await supabaseClient
                .from("profiles")
                .select("id")
                .eq("email", email)
                .maybeSingle();

            if (profileError) {
                console.error("profiles-Abfrage fehlgeschlagen:", profileError);
                showError(
                    "Die Datenbank ist noch nicht eingerichtet oder der API-Key stimmt nicht. " +
                    "Technisch: " + profileError.message
                );
                return;
            }

            if (!profile) {
                showError(
                    "Kein Konto gefunden.",
                    {
                        href: "register.html?email=" + encodeURIComponent(email),
                        text: "Noch kein Konto? Jetzt registrieren"
                    }
                );
                return;
            }

            /* 2) Konto existiert -> Passwort prüfen */
            const { error: signInError } = await supabaseClient.auth.signInWithPassword({
                email,
                password
            });

            if (signInError) {
                const msg = signInError.message.toLowerCase();

                if (msg.includes("invalid login credentials")) {
                    showError("Falsches Passwort.");
                } else if (msg.includes("email not confirmed")) {
                    showError("Bitte bestätige zuerst deine E-Mail-Adresse.");
                } else {
                    console.error("Login fehlgeschlagen:", signInError);
                    showError("Anmeldung fehlgeschlagen: " + signInError.message);
                }
                return;
            }

            /* 3) Erfolg */
            window.location.href = "welcome.html";
        } catch (err) {
            console.error(err);
            showError("Es ist ein Fehler aufgetreten. Bitte versuche es erneut.");
        } finally {
            setLoading(false);
        }
    });
})();
