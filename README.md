# NIGAR Gold Savings Android wrapper

This folder adds a small Android WebView wrapper around the existing web app in the repository root.

The GitHub Actions workflow copies:
- index.html
- styles.css
- app.js
- config.js
and optional web assets into the Android APK, then builds `app-debug.apk`.

Do not put a Supabase service-role/secret key in the web app. A Supabase anon/publishable key is designed for client-side use, with database access controlled by Supabase RLS policies.
