# 0) TL;DR

* **Keep**: Vite+TS front end, Netlify hosting, **Supabase** (Auth, Postgres, RLS, Realtime).
* **Add**: A thin **API layer** (Netlify Functions; consider **Hono** + **Zod**), strict **server→n8n** webhook pattern with **HMAC** + callbacks, **rate limits/quotas**, **persona-aware content**.
* **Prepare**: For v2, add Stripe, orgs/seats/RBAC, entitlements, course platform primitives.

---
