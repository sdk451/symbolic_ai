Perfect ✅ — we’ll keep the webhook-specific refinements for Winston (Architect 🏗️) in the **architecture doc**. I’ll proceed to **finish drafting the Brownfield PRD** for you, covering all sections.

---

# 📋 Brownfield PRD — AI Consulting, Education & Automation Platform

## 1. Goals & Background Context

(✅ Locked earlier)

* Enhance existing brownfield site (Vite + TS + Supabase + Netlify) into a segmented AI consulting/education/automation platform.
* Target SMBs, solopreneurs, freelancers, executives.
* Drive users up the **offer ladder** from demos → consultations → audits → AI transformation partner.
* MVP focuses on demos, consultation booking, and basic education teasers.
* Future v2 adds subscriptions, courses, and enterprise features.

---

## 2. Requirements

(✅ Locked earlier + webhook refinements noted for architecture)

**MVP v1:**

* Supabase auth (email verification, persona segmentation).
* Personalized dashboard (demo cards, run history, teaser content).
* Secure demo execution via API → n8n webhooks → callback → run logs.
* Consultation booking (Calendly/Cal.com integration).
* Analytics (events + funnel by persona).

**Future v2:**

* Subscriptions & payments (Stripe).
* Full education platform (courses, progress, certifications).
* AI chatbot for executives (premium version).
* Team dashboards & RBAC.
* Automation deployment service.

---

## 3. User Interface Design Goals

* **Clean, executive-friendly branding**: credibility for SMB owners & execs.
* **Action-first dashboard**: demo cards as the centerpiece.
* **Segment-aware personalization**: dashboard tiles/content differ by persona.
* **Conversion-focused CTAs**: consultation booking highlighted in dashboard & landing.
* **Teaser previews**: lock icons on future features (courses, premium demos) to drive curiosity.
* **Mobile-friendly**: ensure usability on phones for solopreneurs/freelancers.

---

## 4. Success Metrics

**MVP Metrics:**

* % signups that complete email verification.
* Avg # demo runs per verified user.
* Conversion rate: dashboard → booked consultation.
* Engagement with content teasers (CTR).

**Future v2 Metrics:**

* Paid conversion rate (free → subscription).
* Course completion rate.
* Chatbot engagement (sessions/user).
* Team account adoption (# of org seats per account).

---

## 5. Risks & Mitigation

* **Security (Webhook exposure)**: All demo runs must go through server-side API with secrets.
* **Over-engineering v1**: Keep v1 scope tight (auth, dashboard, demos, consultations). Defer courses/payments to v2.
* **Abuse of demo system**: Rate limits + quotas.
* **Performance (slow demo runs)**: Show progress indicators, async callbacks.
* **Persona mismatch**: Use onboarding segmentation and test messaging per audience.

---

## 6. Roadmap

### Phase 1 — MVP (4–6 weeks)

* Landing page refresh (segment-aware CTAs).
* Supabase auth with verified email + persona selection.
* Authenticated dashboard with 3–5 demo cards.
* Demo → secure API → n8n webhook → callback → run logs.
* Consultation booking integration.
* Analytics instrumentation.

### Phase 1.5 (Incremental Enhancements)

* Add more demo cards (10+).
* Executive chatbot (beta, 10 free msgs/day).
* File upload support (CSV, PDF).
* Automated email drips per persona.

### Phase 2 — v2 Expansion (3–6 months)

* Stripe subscriptions + pricing tiers.
* Full education platform (multi-module, video hosting, quizzes).
* Executive chatbot premium mode with integrations.
* Team dashboards (multi-seat, RBAC, quotas).
* Automation deployment pipeline.

---

✅ That completes the **Brownfield PRD draft**.

Would you like me to now **hand this off to Winston (Architect 🏗️)** so he can create the **Brownfield Architecture doc**, incorporating your webhook flow requirements and Supabase/Netlify/n8n stack?
