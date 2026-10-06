# schuletest

Login-Website mit **Supabase** – reines HTML/CSS/JS, kein Build-Schritt nötig.

**Seiten:**

| Datei            | Zweck                                                        |
| ---------------- | ------------------------------------------------------------ |
| `index.html`     | Login (zeigt zunächst nur „Login" + Formular)                |
| `register.html`  | Registrierung                                                |
| `welcome.html`   | Geschützte Willkommens-Seite nach erfolgreichem Login        |

---

## 1. Supabase einrichten

### a) Projekt anlegen

1. Gehe zu <https://supabase.com> und melde dich an.
2. **New project** → Name frei wählbar (z. B. `schuletest`), ein Passwort für die DB setzen, Region **Frankfurt (eu-central-1)** wählen → **Create new project**.
3. Warte, bis das Projekt fertig aufgebaut ist (dauert ca. 1–2 Minuten).

### b) Zugangsdaten kopieren

1. Im Projekt: **Project Settings → API**
2. Kopiere zwei Werte:
   - **Project URL** → z. B. `https://abcdefgh.supabase.co`
   - **anon public** → der lange Key unter „Project API keys"

### c) In die Website eintragen

Öffne `js/supabase-config.js` und trage die Werte ein:

```js
const SUPABASE_URL = "https://abcdefgh.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_…"; // oder der JWT-Key, der mit eyJ… beginnt
```

### d) Datenbank-Tabelle anlegen

1. Im Supabase-Projekt: **SQL Editor → New query**
2. Den kompletten Inhalt von [`sql/setup-profiles.sql`](sql/setup-profiles.sql) einfügen und mit **Run** ausführen.

Das legt die Tabelle `profiles` an, befüllt sie über einen Trigger automatisch beim Registrieren und erlaubt das Auslesen der E-Mail-Adresse – genau das braucht die Meldung „Kein Konto gefunden." beim Login.

### e) E-Mail-Bestätigung (optional, empfohlen zum Testen)

Standardmäßig schickt Supabase eine Bestätigungs-E-Mail, erst danach funktioniert der Login.

- Zum Testen deaktivieren: **Authentication → Sign In / Providers → Email** → **Confirm email** ausschalten.
- Später wieder einschalten, wenn die Seite „echt" genutzt werden soll.

---

## 2. Lokal testen

Ein einfacher Webserver reicht (ES-Datenbanken/Supabase funktionieren über `file://` nicht zuverlässig):

```bash
python3 -m http.server 8000
```

Dann öffnen: <http://localhost:8000>

---

## 3. Abläufe

### Login (`index.html`)

1. Seite zeigt zunächst nur die Überschrift **Login** und das Formular.
2. Beim Absenden wird zuerst geprüft, ob die E-Mail in `profiles` existiert.
   - **Nein** → Fehlermeldung **„Kein Konto gefunden."** plus Link
     **„Noch kein Konto? Jetzt registrieren"** → `register.html` (E-Mail wird vorbefüllt).
   - **Ja** → Passwort-Login über Supabase:
     - falsches Passwort → „Falsches Passwort."
     - E-Mail nicht bestätigt → „Bitte bestätige zuerst deine E-Mail-Adresse."
     - Erfolg → Weiterleitung zu `welcome.html`

### Registrierung (`register.html`)

- Validierung: alle Felder, gültige E-Mail, Passwort min. 6 Zeichen, Passwörter stimmen überein.
- Bereits vorhandene E-Mail → „Ein Konto mit dieser E-Mail existiert bereits."
- Erfolg → Hinweis, die E-Mail zu bestätigen (bzw. direkter Weiter zum Login, wenn die
  Bestätigung deaktiviert ist).

### Willkommens-Seite (`welcome.html`)

- Prüft beim Laden die Session → ohne Login wird sofort auf `index.html` zurückgeleitet.
- Zeigt die angemeldete E-Mail und einen **Abmelden**-Button.

---

## 4. Struktur

```
├── index.html               Login
├── register.html            Registrierung
├── welcome.html             Geschützte Willkommens-Seite
├── css/style.css            Design (responsiv)
├── js/
│   ├── supabase-config.js   ← hier deine URL + Key eintragen
│   ├── supabase-client.js   Client-Init + Config-Prüfung
│   ├── login.js             Login-Logik & Fehlermeldungen
│   ├── register.js          Registrierungs-Logik
│   └── session.js           Session-Schutz + Abmelden
└── sql/setup-profiles.sql   Datenbank-Skript
```

## 5. Hinweis zur Sicherheit

Dass man anhand der Fehlermeldung erkennen kann, welche E-Mail-Adressen ein Konto haben
sogenanntes *User Enumeration* – das ist hier bewusst so gewünscht. Für einen öffentlichen
Betrieb würde man das vermeiden (z. B. mit einer generischen Meldung
„E-Mail oder Passwort falsch").
