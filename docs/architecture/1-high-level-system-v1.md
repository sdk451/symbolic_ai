# 1) High-Level System (v1)

**Frontend (Netlify, Vite+TS)**

* React (with TanStack Router + Query) or SvelteKit (if you prefer file-based routing).
* Auth via Supabase JS; **verified email gates** the dashboard.
* Dashboard renders **persona-tailored** demo cards + teaser content.

**API Layer (Netlify Functions)**

* Framework: **Hono** (tiny, fast) with **Zod** validation.
* Endpoints under `/api/*` handle: auth guard, quotas, calling **n8n webhooks**, receiving **n8n callbacks**, and returning demo run history.
* Signed cookies/JWT via Supabase auth helpers.

**Data (Supabase Postgres)**

* Tables for `profiles`, `demo_types`, `demo_runs`, `consultations`, `content_modules`, `leads`, `audit_logs`.
* **RLS** for user isolation.
* **Realtime** channel for demo run status updates (optional; polling fallback).

**Automations (self-hosted n8n)**

* **Never** called from the browser.
* API calls **n8n webhook** with **HMAC** (header) + **short-lived secret**.
* n8n **calls back** to `/api/demos/:runId/callback` with its own HMAC.
* n8n retries (max 3; exponential backoff) on delivery failures.

**Third-party**

* Calendly/Cal.com for booking + webhook → `/api/consultations/book`.
* Email (Resend/Postmark) for verification/notifications.
* Analytics (PostHog or Plausible + simple custom events).

---
