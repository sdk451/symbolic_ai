# 11) Minimal Code Stubs (TypeScript, Hono-in-Functions)

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
