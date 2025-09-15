# Epic 1: MVP Core Platform - Authentication, Dashboard, Demo System

## Epic Goal

Establish the foundational MVP platform that enables authenticated users to access personalized dashboards, execute AI demos through secure webhook integration, and book consultations - creating the core user journey from landing to conversion.

## Epic Description

**Existing System Context:**
- Current functionality: Static Vite + TypeScript website with Supabase integration
- Technology stack: Vite, TypeScript, React, Supabase (Auth, Postgres, RLS), Netlify hosting
- Integration points: Supabase auth, Netlify Functions for API layer, n8n for automation workflows

**Enhancement Details:**
- What's being added: Complete authenticated user experience with persona-aware dashboard, secure demo execution system, and consultation booking integration
- How it integrates: Builds on existing Supabase auth, adds Netlify Functions API layer, integrates with n8n webhooks for demo execution
- Success criteria: Users can sign up, verify email, access personalized dashboard, run demos, and book consultations

## Stories

1. **Story 1:** User Authentication & Onboarding - Implement Supabase email verification, persona segmentation capture, and user profile creation
2. **Story 2:** Personalized Dashboard - Create persona-aware dashboard with demo cards, activity feed, and consultation booking CTAs
3. **Story 3:** Secure Demo Execution System - Build API layer for demo execution via n8n webhooks with HMAC security and callback handling
4. **Story 4:** Consultation Booking Integration - Integrate Calendly/Cal.com webhooks for consultation scheduling and management

## Compatibility Requirements

- [ ] Existing landing page and public routes remain unchanged
- [ ] Supabase auth integration follows existing patterns
- [ ] Netlify deployment process remains compatible
- [ ] Database schema additions are backward compatible

## Risk Mitigation

- **Primary Risk:** Security vulnerabilities in webhook integration exposing demo system
- **Mitigation:** Implement HMAC signing, server-side API layer, rate limiting, and audit logging
- **Rollback Plan:** Feature flags for new functionality, ability to disable demo system while maintaining auth

## Definition of Done

- [ ] All stories completed with acceptance criteria met
- [ ] Email verification flow working end-to-end
- [ ] Dashboard renders correctly for all persona segments
- [ ] Demo execution system secure and functional
- [ ] Consultation booking integration working
- [ ] Analytics events properly instrumented
- [ ] No regression in existing public pages
- [ ] Security audit completed for webhook integration

## Technical Implementation Notes

- Use Hono + Zod for API layer validation
- Implement RLS policies for user data isolation
- Add rate limiting and quota management
- Create audit logging for sensitive operations
- Use Supabase Realtime for demo status updates
