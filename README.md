# Delhi Dental Cosmetics - Website

Static site, hosted on GitHub Pages. Canonical domain when live: https://delhidentalcosmetics.com/

## Admin panel
- URL: /admin.html (noindex, excluded from sitemap)
- Default passcode: ddc-boss-6170  **CHANGE IT before the client uses the site** (see below)
- Data: appointments sync to a private cloud store; admin can confirm via WhatsApp draft, delete entries, export CSV.

## Change the admin passcode
1. Pick a new passcode.
2. Compute its SHA-256 hash and replace the value of AUTH_HASH in js/auth.js (any online SHA-256 tool, then commit).

## Security measures in place
- Strict Content-Security-Policy on every page (no inline scripts, no object/embed, controlled frame + connect origins)
- All user input HTML-escaped before render (XSS)
- Input validation + maxlength on every field, honeypot field, 30-second submit throttle
- Admin: SHA-256 passcode, 5-attempt lockout for 10 minutes, 20-minute session expiry, noindex/nofollow
- Admin excluded from sitemap and robots
- When moved to the client's real domain, add these server headers: X-Frame-Options: SAMEORIGIN, X-Content-Type-Options: nosniff, Strict-Transport-Security, Referrer-Policy

## Google Search Console
1. Add property for delhidentalcosmetics.com (domain property, DNS TXT record is easiest)
2. Or paste the meta token into the google-site-verification meta tag in every page head (placeholder already there)
3. Submit sitemap.xml from GSC
