# Story 1.2: Personalized Dashboard

**Status:** 📋 Ready for Development  
**Priority:** High (Epic 1 - MVP Core Platform)  
**Estimated Effort:** 8-13 story points  
**Dependencies:** Story 1.1 (User Authentication & Onboarding) must be complete

## User Story

As a **verified user with completed onboarding**,
I want **to access a personalized dashboard with demo cards and content tailored to my persona**,
So that **I can quickly discover relevant AI capabilities and take action on demos that match my role and needs**.

## Story Context

**Existing System Integration:**
- Integrates with: User profiles with persona segments, existing UI components
- Technology: React, TypeScript, Supabase queries, Tailwind CSS
- Follows pattern: Existing component structure and styling patterns (see `docs/architecture/front-end-spec.md`)
- Touch points: Dashboard route, user profile data, demo card components
- **Architecture Reference**: `docs/architecture/5-frontend-application-v1.md` for UI patterns

## Acceptance Criteria

**Functional Requirements:**

1. **Persona-Aware Content**: Dashboard displays demo cards and content filtered by user's persona segment
2. **Demo Card Grid**: 3-5 demo cards displayed with titles, descriptions, and run buttons
3. **Activity Feed**: Recent demo runs and activity history displayed in sidebar or drawer
4. **Consultation CTA**: Prominent consultation booking call-to-action based on persona
5. **Teaser Content**: Locked/preview content for future features to drive curiosity

**Integration Requirements:**

6. **User Profile Integration**: Dashboard content filtered by existing user persona data
7. **Existing UI Patterns**: New dashboard follows existing component and styling patterns
8. **Navigation Integration**: Dashboard integrates with existing routing and navigation

**Quality Requirements:**

9. **Responsive Design**: Dashboard works on mobile and desktop devices
10. **Loading States**: Proper loading indicators while fetching user data and demo content
11. **Error Handling**: Graceful handling of data fetch failures

## Technical Notes

- **Integration Approach**: Create new dashboard route that queries user profile and demo data
- **Existing Pattern Reference**: Follow existing component structure and Supabase query patterns (see `docs/architecture/source-tree.md`)
- **Key Files to Create/Modify**:
  - `src/pages/Dashboard.tsx` - Main dashboard page component
  - `src/components/DemoCard.tsx` - Individual demo card component
  - `src/components/ActivityFeed.tsx` - Recent activity sidebar component
  - `src/components/ConsultationCTA.tsx` - Consultation booking call-to-action
  - `src/hooks/useDashboard.ts` - Dashboard data fetching hook
  - `src/services/dashboard.ts` - Dashboard API service functions
- **Key Constraints**: Must be responsive, persona-aware, and integrate with existing auth

## Definition of Done

- [ ] Dashboard route created and accessible to authenticated users
- [ ] Persona-based content filtering implemented
- [ ] Demo card grid component created and functional
- [ ] Activity feed showing recent demo runs
- [ ] Consultation booking CTA prominently displayed
- [ ] Teaser content for future features implemented
- [ ] Responsive design working on all device sizes
- [ ] Loading states and error handling implemented
- [ ] Integration with existing navigation and auth verified
- [ ] Tests cover dashboard functionality and persona filtering

## Risk and Compatibility Check

**Primary Risk:** Performance issues with multiple data queries or complex filtering
**Mitigation:** Efficient Supabase queries, proper loading states, data caching
**Rollback:** Feature flag to disable dashboard and redirect to simple landing

**Compatibility Verification:**
- [ ] No breaking changes to existing routes or components
- [ ] Database queries are optimized and don't impact performance
- [ ] UI follows existing design system and patterns
- [ ] Mobile responsiveness maintained
