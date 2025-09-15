# 12) Execution Checklist (v1)

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
