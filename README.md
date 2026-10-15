# Delhi Dental Cosmetics - React Application

A modern React (Vite) + TypeScript application rewritten from the original static website for **Delhi Dental Cosmetics** (GTB Nagar, Delhi), led by Dr. Animesh Agarwal and Dr. Neha Singhal.

## Features & Architecture

- **React SPA**: Built with Vite and TypeScript, listening on `0.0.0.0:3000`.
- **Preserved Design & Aesthetics**: Original typography (`Playfair Display` & `Jost`), styling (`style.css`), colors, layouts, before-and-after smile results, and team photos.
- **Client Routing & Pages**:
  - **Home**: Hero with live typewriter animation, Google 4.9 rating badge with 881 reviews, animated statistics counters, before-and-after smile results, treatment highlights, patient testimonials, clinic photos, and featured guides.
  - **Treatments**: All 10 dental treatments with comprehensive explanations, cost transparency lines, and direct links to in-depth clinical guides.
  - **Our Team**: Detailed profiles and credentials for Dr. Animesh Agarwal (BDS, MDS, 17+ years) and Dr. Neha Singhal (BDS, Orthodontics).
  - **Gallery**: High-resolution operatory, lounge, reception, and patient smile makeover results.
  - **Blog & Clinical Guides**: Category filter chips, 9 clinical guides written by the clinic desk, plus dynamic clinic announcements.
  - **Article Reader**: Clean reading experience with tables, clinical stages, bullet points, author card, and related guides.
  - **Contact & Appointment Request**: Interactive date picker with Sunday guard, quick slot selection (9:30 AM, 11:00 AM, 5:00 PM, 6:30 PM), anti-spam honeypot, duplicate appointment prevention, and instant confirmation reference.
  - **FAQs**: Searchable interactive accordion covering appointments, accessibility, payments, and emergency care.
  - **Privacy**: Transparent plain-language data privacy details.
  - **Staff Admin Dashboard** (`#admin`): Passcode gate (`ddc-boss-6170`), rate-limited brute force protection (5 attempts -> 10m lock), session timeout (20m), appointment requests management with status changes, WhatsApp confirmation drafts, CSV export, banner manager with live preview, dynamic blog post publisher, clinic settings updater, and SHA-256 passcode changer.

## Cloud Storage & Offline Resilience

- Synced with the clinic cloud JSON store (`https://extendsclass.com/api/json-storage/bin/ecbafad`).
- Safe optimistic updates with automatic retry and local storage fallback (`ddc_backup`).

## Running the App

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```
