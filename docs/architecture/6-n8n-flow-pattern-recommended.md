# 6) n8n Flow Pattern (recommended)

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
