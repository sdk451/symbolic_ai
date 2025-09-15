# Epic 3: Phase 2 v2 Expansion - Subscriptions & Education Platform

## Epic Goal

Transform the platform into a comprehensive AI education and automation service with subscription monetization, full course platform, enterprise team features, and advanced AI capabilities to capture higher-value customers and recurring revenue.

## Epic Description

**Existing System Context:**
- Current functionality: MVP with demos, chatbot beta, file uploads, and email automation
- Technology stack: Vite, TypeScript, React, Supabase, Netlify Functions, n8n, Stripe integration
- Integration points: Existing user profiles, demo system, authentication, content modules

**Enhancement Details:**
- What's being added: Stripe subscription system, full education platform with courses and certifications, team dashboards with RBAC, premium chatbot with integrations, automation deployment service
- How it integrates: Extends existing user system with organizations, adds subscription management, builds on content modules for courses, enhances chatbot with premium features
- Success criteria: Users can subscribe to paid plans, access full courses, manage team accounts, use premium AI features, and deploy automations

## Stories

1. **Story 1:** Stripe Subscription System - Implement subscription tiers, payment processing, billing management, and entitlement-based access control
2. **Story 2:** Full Education Platform - Create course creation, enrollment, progress tracking, video hosting, quizzes, and certification system
3. **Story 3:** Team Dashboards & RBAC - Build organization management, multi-seat accounts, role-based access control, and team collaboration features
4. **Story 4:** Premium Executive Chatbot - Enhance chatbot with longer memory, org context, integrations, and advanced AI capabilities
5. **Story 5:** Automation Deployment Service - Create service for deploying customer automations with monitoring and management capabilities

## Compatibility Requirements

- [ ] Existing free users retain access to current features
- [ ] Subscription system integrates with existing user profiles
- [ ] Course platform builds on existing content module structure
- [ ] Team features extend current authentication system

## Risk Mitigation

- **Primary Risk:** Complex subscription billing and entitlement management causing user confusion or billing issues
- **Mitigation:** Clear pricing tiers, comprehensive testing, customer support processes, gradual rollout
- **Rollback Plan:** Feature flags for paid features, ability to revert to free-only mode, subscription pause capabilities

## Definition of Done

- [ ] All stories completed with acceptance criteria met
- [ ] Subscription system processing payments correctly
- [ ] Course platform fully functional with progress tracking
- [ ] Team management working with proper RBAC
- [ ] Premium chatbot delivering enhanced value
- [ ] Automation deployment service operational
- [ ] Migration path for existing users defined
- [ ] Customer support processes established

## Technical Implementation Notes

- Extend database schema with orgs, org_members, subscriptions, entitlements tables
- Implement Stripe webhooks for subscription lifecycle management
- Add video hosting integration (Vimeo/YouTube API)
- Create course progress tracking and certification system
- Implement organization-scoped data access with RLS
- Add automation deployment infrastructure and monitoring
