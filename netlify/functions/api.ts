// Hono API entrypoint for Netlify Functions
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { z } from 'zod'
import { verifyUser, sbForUser, insertAudit, hmacSign, hmacVerify, withEnv } from './lib/core'

const app = new Hono()
app.use('*', cors({ origin: withEnv('ALLOWED_ORIGINS').split(','), credentials: true }))

// POST /api/demos/:demoId/run
app.post('/api/demos/:demoId/run', async (c) => {
  // ... implementation as in draft ...
})

export const handler = app.fetch

