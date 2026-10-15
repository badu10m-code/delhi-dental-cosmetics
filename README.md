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

## Operations notes (Oct 15, 2026 build v5)

### Google Search Console (steps for the owner)
1. Open https://search.google.com/search-console and add property "URL prefix": https://badu10m-code.github.io/delhi-dental-cosmetics/
2. Choose verification method "HTML tag". Google shows a meta tag like <meta name="google-site-verification" content="XXXX">.
3. Send that content value to the developer (or Fo). It replaces PASTE-GSC-TOKEN-HERE in every page's <head>, one commit and the site is verified.
4. Then submit the sitemap: https://badu10m-code.github.io/delhi-dental-cosmetics/sitemap.xml (17 URLs) under Sitemaps.
5. When the real domain delhidentalcosmetics.com goes live: verify that property too, then replace badu10m-code.github.io/delhi-dental-cosmetics with delhidentalcosmetics.com in canonical/OG tags, robots.txt, sitemap.xml and llms.txt (find-replace across the repo). That is a deliberate switch: canonicals must point at whichever address is actually serving the site.

### Admin dashboard (admin.html, passcode-protected)
- Tabs: Dashboard (stats + latest requests), Appointments (search, status filter, newest/oldest, status workflow new > confirmed > done/cancelled, WhatsApp confirm button, delete, CSV export), Banners (form + live preview + activate/deactivate), Blog posts, Clinic settings (phone/WhatsApp/hours/address apply site-wide), Security (change passcode; new hash stored in the cloud store, old hash stays as fallback).
- Session ends after 20 minutes idle; 5 wrong attempts lock the device for 10 minutes.
- Default passcode: ddc-boss-6170. Change it from the Security tab after handover.

### Booking data safety
- Every save reads the latest store state first and merges, then writes. If the write fails it retries twice. A local backup copy of the data also stays on each admin device (localStorage "ddc_backup") so nothing is lost if the cloud store is briefly unreachable.

### Banner
- One banner can be active at a time. A default welcome banner is seeded in the store; change or replace it from the admin Banners tab.
