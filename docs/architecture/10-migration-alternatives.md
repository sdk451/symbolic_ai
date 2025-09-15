# 10) Migration & Alternatives

* **Stay on Supabase** for v1 (fastest path, great RLS/Realtime).
* If later you want your own API DB:

  * Keep **Postgres** on Supabase (managed) + **Hono** app as primary API (Drizzle ORM optional).
  * Or move to **Cloudflare Workers/D1** (tradeoffs: SQL features) or **Fly.io** (full Node/PG).
* If **Edge** becomes necessary (global low-latency): consider **Netlify Edge Functions** for reads + classic functions for writes.

---
