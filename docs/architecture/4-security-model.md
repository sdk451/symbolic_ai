# 4) Security Model

* **No direct browser calls** to n8n; all flows via server.
* **HMAC** on both directions (server→n8n, n8n→server).
* **Rotate secrets** (table `webhook_secrets(name, secret, rotated_at)`).
* **JWT validation** at every API entry; server-side persona/entitlement checks.
* **RLS** for all user-facing data tables.
* **Audit logs** for sensitive actions (`demo_run_started`, `demo_run_callback`, `consultation_booked`).
* **Rate limiting** per user (and IP for unauth endpoints).
* Defensive payload size limits; sanitize outputs rendered in UI.

---
