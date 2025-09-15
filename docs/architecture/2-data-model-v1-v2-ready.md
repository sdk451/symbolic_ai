# 2) Data Model (v1 → v2-ready)

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
