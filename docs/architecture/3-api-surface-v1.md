# 3) API Surface (v1)

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
