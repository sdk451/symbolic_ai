
# Brownfield Architecture Proposal

## 0) TL;DR

* **Keep**: Vite+TS front end, Netlify hosting, **Supabase** (Auth, Postgres, RLS, Realtime).
* **Add**: A thin **API layer** (Netlify Functions; consider **Hono** + **Zod**), strict **server→n8n** webhook pattern with **HMAC** + callbacks, **rate limits/quotas**, **persona-aware content**.
* **Prepare**: For v2, add Stripe, orgs/seats/RBAC, entitlements, course platform primitives.

---

## 1) High-Level System (v1)

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

## 2) Data Model (v1 → v2-ready)

**Core (v1)**

* `users` (Supabase)
* `profiles(user_id PK/FK, full_name, persona_segment enum[SMB, SOLO, EXEC, FREELANCER, ASPIRING], org_name, title, phone)`
* `demo_types(id, slug, name, description, icon, audience_tags text[], requires_params bool, enabled bool)`
* `demo_runs(id, user_id, demo_type_id, params jsonb, status enum[queued,running,succeeded,failed], started_at, finished_at, result jsonb, error text)`
* `consultations(id, user_id, dt, status, provider_id, notes)`
* `leads(id, user_id?, email unique, source, utm jsonb, notes, status)`
* `content_modules(id, slug, title, type enum[lesson,video,article], access_level enum[teaser,premium_future], body_md text, url text, audience_tags text[])`
* `audit_logs(id, user_id, action, entity, entity_id, meta jsonb, at)`

**v2 Extensions**

* `orgs(id, name, plan, owner_user_id)`
* `org_members(org_id, user_id, role enum[owner,admin,member], seat_active bool)`
* `entitlements(subject_type enum[user,org], subject_id, feature, limit, period)`
* `subscriptions(id, subject_type, subject_id, stripe_customer_id, stripe_sub_id, plan, status)`
* `courses(id, slug, …), course_modules(course_id, …), enrollments(subject_type, subject_id, course_id, progress jsonb)`

**Indexes & Constraints**

* `demo_runs(user_id, started_at desc)`
* `consultations(user_id, dt)`
* `leads(email unique)`
* RLS: users only see their own rows; admins via service role.

---

## 3) API Surface (v1)

* `POST /api/demos/:demoId/run` → Auth guard, quota check, create `demo_runs`, sign + call n8n webhook, return `{runId}`.
* `POST /api/demos/:runId/callback` → (n8n→server) verify HMAC, update status + result/error.
* `GET  /api/demos/runs?limit=20` → Recent runs for current user.
* `POST /api/consultations/book` → Store booking metadata (from Calendly/Cal.com webhook).
* `GET  /api/content/teasers` → Persona-aware teaser modules (server filters by `audience_tags`).
* (Optional) `POST /api/auth/webhook` → Sync Supabase auth → `profiles/leads`.

**Implementation Notes**

* Use **Hono** routes + **Zod** parsers; reject invalid input early.
* Wrap outbound n8n call in a **circuit breaker** or at least timeouts.
* Add **idempotency key** header for callbacks (prevent double updates).
* **Rate limits/quotas**: simple version: counters in Postgres; advanced: Redis later.

---

## 4) Security Model

* **No direct browser calls** to n8n; all flows via server.
* **HMAC** on both directions (server→n8n, n8n→server).
* **Rotate secrets** (table `webhook_secrets(name, secret, rotated_at)`).
* **JWT validation** at every API entry; server-side persona/entitlement checks.
* **RLS** for all user-facing data tables.
* **Audit logs** for sensitive actions (`demo_run_started`, `demo_run_callback`, `consultation_booked`).
* **Rate limiting** per user (and IP for unauth endpoints).
* Defensive payload size limits; sanitize outputs rendered in UI.

---

## 5) Frontend Application (v1)

**Routing & State**

* **Public**: `/` (landing), `/services`, `/playbooks`, `/contact`, `/login`, `/signup`.
* **Auth’d**: `/dashboard`, `/demos/:id`, `/learn`, `/chat`, `/settings`.
* Use **TanStack Router** or SvelteKit layouts for clean route data loading.
* Data fetching with **TanStack Query** (suspenseful loading, retries off for mutations).

**UI/UX**

* Component library: **shadcn/ui** (+ Lucide icons).
* Dashboard: persona-filtered demo grid; **Activity Drawer** for last runs; **Book Consult** banner.
* Result panels show run output, metadata, and “turn this on for your team” CTA.

---

## 6) n8n Flow Pattern (recommended)

1. **Server**: `POST /api/demos/:demoId/run`

   * Create `demo_runs`, status=`queued` → call **n8n webhook** with payload: `{runId, demoId, userContext, params, nonce, ts, hmac}`.
2. **n8n**:

   * Verify HMAC; process workflow; gather result or error.
   * POST to `/api/demos/:runId/callback` with `{status, result|error, ts, hmac}`.
3. **Server**:

   * Verify HMAC + idempotency; update `demo_runs`, broadcast Realtime event.
4. **Client**:

   * Shows toast updates via Realtime or polls `/api/demos/runs`.

**Retries & Timeouts**

* Outbound to n8n: 8–10s timeout → if long-running, return early and rely on callback.
* n8n callback: retry up to 3 times with exponential backoff.

---

## 7) Observability

* **Request logging** (redact PII).
* **Structured logs** for demo lifecycle with `runId`.
* **Metrics**: API latency, error rates; n8n webhook success/fail counts.
* **Tracing** (optional): assign `traceId` in request headers; propagate to n8n.

---

## 8) Environments & Config

* **Secrets** via Netlify env vars (and Supabase project config).
* **Per-env** n8n base URLs + secrets (`N8N_BASE_URL`, `N8N_HMAC_SECRET`).
* `APP_URL`, `ALLOWED_ORIGINS` for CORS.
* Feature flags (PostHog or simple `features` table).

---

## 9) v2 Readiness (Design Now, Toggle Later)

* **Stripe**: model `subscriptions` and `entitlements` now; hide UI behind flags.
* **Orgs/Seats/RBAC**: add `orgs`, `org_members`, and policy scaffolding; keep UX off until needed.
* **Courses**: store `content_modules` as teasers now; design `courses`/`enrollments` schema for later.
* **Exec Chatbot**: v1 beta with rate limits; v2 adds **org context**, **longer memory**, **auditability**.

---

## 10) Migration & Alternatives

* **Stay on Supabase** for v1 (fastest path, great RLS/Realtime).
* If later you want your own API DB:

  * Keep **Postgres** on Supabase (managed) + **Hono** app as primary API (Drizzle ORM optional).
  * Or move to **Cloudflare Workers/D1** (tradeoffs: SQL features) or **Fly.io** (full Node/PG).
* If **Edge** becomes necessary (global low-latency): consider **Netlify Edge Functions** for reads + classic functions for writes.

---

## 11) Minimal Code Stubs (TypeScript, Hono-in-Functions)

```ts
// /netlify/functions/api.ts
import { Hono } from 'hono'
import { z } from 'zod'
import { verifyJwt, supabaseForUser, signHmac, verifyHmac } from './lib'

const app = new Hono()

app.post('/demos/:demoId/run', async (c) => {
  const user = await verifyJwt(c) // throws if invalid
  const params = await c.req.json().catch(() => ({}))
  z.object({}).passthrough().parse(params) // validate shape per demo

  const demoId = c.req.param('demoId')
  const db = supabaseForUser(user)
  const run = await db.createDemoRun({ userId: user.id, demoId, params })

  const payload = { runId: run.id, demoId, userId: user.id, params, ts: Date.now() }
  const h = signHmac(payload, process.env.N8N_HMAC_SECRET!)

  const n8nRes = await fetch(`${process.env.N8N_BASE_URL}/webhook/${demoId}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-hmac': h },
    body: JSON.stringify(payload)
  })

  // don’t block UI; even on timeout, client will get updates via callback
  return c.json({ runId: run.id })
})

app.post('/demos/:runId/callback', async (c) => {
  const body = await c.req.json()
  verifyHmac(body, c.req.header('x-hmac')!, process.env.N8N_HMAC_SECRET!)
  // upsert status/result; guard idempotency by runId + status
  // broadcast Realtime if desired
  return c.json({ ok: true })
})

export const handler = app.fetch
```

---

## 12) Execution Checklist (v1)

* [ ] Supabase Auth (email verification required for dashboard)
* [ ] `profiles.persona_segment` captured at signup
* [ ] DB tables + RLS policies created
* [ ] Netlify Functions scaffold with **Hono + Zod**
* [ ] `/api/demos/:demoId/run` + `/api/demos/:runId/callback` implemented
* [ ] HMAC secrets + rotation procedure in place
* [ ] Dashboard UI (persona-filtered cards + activity feed)
* [ ] Calendly/Cal.com webhooks → `consultations`
* [ ] Analytics events: `signup`, `email_verified`, `dashboard_view`, `demo_run_started/finished`, `consultation_booked`
* [ ] Basic email templates (welcome, run complete, consultation confirm)

---

## 13) Recommendations & Options

* **Stick with Supabase** for v1. It hits auth/DB/RLS/Realtime in one shot and keeps you shipping fast.
* **Hono + Netlify Functions** is a sweet spot: tiny, fast, and portable if you change hosts later.
* **Zod** everywhere: request bodies, env validation, response shapes.
* **PostHog** over Plausible if you want feature flags and cohorts; Plausible if you want dead-simple analytics.
* **shadcn/ui** for speed and a clean look; it reads well with your audience mix.
* **Keep persona-first UX** — it’s your differentiator for conversion.

---
