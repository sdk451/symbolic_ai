# Story 1.5: Speed to Lead Qualification Agent Demo Implementation

**Status:** Approved  
**Priority:** High (Epic 1 - MVP Core Platform)  
**Estimated Effort:** 8-10 story points  
**Dependencies:** Story 1.3 (Secure Demo Execution) must be complete

## Story

**As a** dashboard user interested in AI lead qualification automation,  
**I want** to experience a complete Speed to Lead Qualification agent demo with form submission, VAPI call, and call summary display,  
**so that** I can understand how AI can automatically qualify leads and schedule appointments for my business.

## Acceptance Criteria

1. **Pre-populated Demo Modal Form**: When "Start Demo" is clicked for Speed to Lead Qualification agent, a modal opens with form fields for name, email, phone number, and free text request area, with name, email, and phone pre-populated from user's profile data
2. **Form Validation**: All form fields are properly validated with appropriate error messages and user feedback
3. **Webhook Integration**: Form submission triggers secure webhook request to n8n with form data and user context
4. **VAPI Call Initiation**: n8n workflow initiates VAPI agent call to the provided phone number
5. **Call Status Tracking**: User receives real-time updates about call status (initiated, in-progress, completed)
6. **Call Summary Display**: When call completes, VAPI/n8n sends summary back via webhook and displays in new modal
7. **Error Handling**: Graceful handling of form submission errors, webhook failures, and call failures
8. **User Experience**: Seamless flow from demo start to call summary with clear progress indicators
9. **Data Persistence**: Demo run data stored in database with proper user association and audit trail
10. **Security Compliance**: All webhook communications use HMAC verification and follow security model

## Tasks / Subtasks

- [ ] **Task 1: Create Lead Qualification Demo Modal Component** (AC: 1, 2)
  - [ ] Create `src/components/demo/LeadQualificationModal.tsx` with form fields
  - [ ] Implement user profile data pre-population (name, email, phone)
  - [ ] Add fallback handling for missing profile information
  - [ ] Implement form validation using Zod schemas
  - [ ] Add proper error handling and user feedback
  - [ ] Integrate with existing modal system and styling

- [ ] **Task 2: Implement Demo Form Submission API** (AC: 3, 9)
  - [ ] Create `POST /api/demos/lead-qualification/run` endpoint in `netlify/functions/api.ts`
  - [ ] Add HMAC signing for n8n webhook payload
  - [ ] Store demo run record in `demo_runs` table with proper status tracking
  - [ ] Implement rate limiting and quota checks

- [ ] **Task 3: Create Call Summary Display Modal** (AC: 6)
  - [ ] Create `src/components/demo/CallSummaryModal.tsx` for displaying call results
  - [ ] Design summary layout with call details, qualification score, and next steps
  - [ ] Add proper styling consistent with existing design system

- [ ] **Task 4: Implement Webhook Callback Handler** (AC: 5, 6, 9)
  - [ ] Create `POST /api/demos/lead-qualification/callback` endpoint
  - [ ] Implement HMAC verification for incoming webhook
  - [ ] Update demo run status and store call summary data
  - [ ] Broadcast real-time updates to frontend

- [ ] **Task 5: Integrate with Existing Demo System** (AC: 1, 8)
  - [ ] Update `src/components/DemoCard.tsx` to handle lead qualification demo type
  - [ ] Modify demo execution flow to show lead qualification modal
  - [ ] Add demo type configuration for lead qualification agent
  - [ ] Update demo status tracking and display

- [ ] **Task 6: User Profile Integration** (AC: 1, 9)
  - [ ] Implement user profile data retrieval for form pre-population
  - [ ] Add fallback handling for missing profile information
  - [ ] Ensure proper data validation and sanitization
  - [ ] Update profile data access patterns if needed

- [ ] **Task 7: Database Schema Updates** (AC: 9)
  - [ ] Add lead qualification specific fields to `demo_runs` table if needed
  - [ ] Create migration for any new schema requirements
  - [ ] Update RLS policies for new data access patterns

- [ ] **Task 8: Error Handling and Edge Cases** (AC: 7, 10)
  - [ ] Implement comprehensive error handling for all failure scenarios
  - [ ] Add retry logic for webhook failures
  - [ ] Handle VAPI call failures and timeouts
  - [ ] Add proper logging and audit trail

- [ ] **Task 9: Testing Implementation** (AC: All)
  - [ ] Create unit tests for modal components using Vitest + RTL
  - [ ] Add integration tests for API endpoints
  - [ ] Test webhook security and HMAC verification
  - [ ] Add end-to-end tests for complete demo flow

## Dev Notes

### Previous Story Insights
- Story 1.3 established secure demo execution patterns with HMAC webhook security
- Story 1.7 established user profile data pre-population patterns for appointment scheduler
- Existing `useDemoExecution` hook provides demo status tracking infrastructure
- Demo card system already supports different demo types and status display

### Data Models
**Source: architecture/2-data-model-v1-v2-ready.md**
- `demo_runs` table: `(id, user_id, demo_type_id, params jsonb, status enum[queued,running,succeeded,failed], started_at, finished_at, result jsonb, error text)`
- `demo_types` table: `(id, slug, name, description, icon, audience_tags text[], requires_params bool, enabled bool)`
- `profiles` table: `(user_id PK/FK, full_name, persona_segment, org_name, title, phone)`
- Lead qualification demo will use `demo_type_id` for "speed-to-lead-qualification" slug
- Form data stored in `params` jsonb field: `{name, email, phone, request}` (pre-populated from profile)
- Call summary stored in `result` jsonb field: `{callId, duration, qualificationScore, summary, nextSteps}`

### API Specifications
**Source: architecture/3-api-surface-v1.md**
- Follow existing pattern: `POST /api/demos/:demoId/run` → Auth guard, quota check, create `demo_runs`, sign + call n8n webhook
- Callback pattern: `POST /api/demos/:runId/callback` → verify HMAC, update status + result/error
- Use Hono routes + Zod parsers for input validation
- Implement idempotency key header for callbacks to prevent double updates

### Component Specifications
**Source: architecture/5-frontend-application-v1.md**
- Use shadcn/ui components for consistent styling
- Follow existing modal patterns from consultation booking
- Integrate with TanStack Query for data fetching and real-time updates
- Use existing demo card system for consistent user experience

### File Locations
**Source: architecture/source-tree.md**
- Modal components: `src/components/demo/LeadQualificationModal.tsx`, `src/components/demo/CallSummaryModal.tsx`
- API endpoints: `netlify/functions/api.ts` (extend existing Hono routes)
- Demo configuration: Update `src/services/dashboard.ts` for demo types
- Database migrations: `supabase/migrations/` directory

### User Profile Integration
**Source: architecture/2-data-model-v1-v2-ready.md**
- Access user profile data from `profiles` table via `user_id`
- Pre-populate form fields: `full_name`, `phone`, `email` (if available from auth)
- Handle cases where profile data is incomplete or missing
- Ensure proper data validation and sanitization before webhook transmission
- Follow established pattern from Story 1.7 for consistent user experience

### Testing Requirements
**Source: architecture/coding-standards.md, architecture/brownfield-enhancement-architecture.md**
- **Framework**: Vitest + React Testing Library
- **Location**: `src/__tests__/components/` for component tests, `src/__tests__/services/` for API tests
- **Coverage**: 80%+ coverage requirement
- **Test Types**: Unit tests for components, integration tests for API endpoints, security tests for HMAC verification
- **Setup**: Use existing test configuration in `vitest.config.ts`

### Technical Constraints
**Source: architecture/4-security-model.md**
- **No direct browser calls** to n8n; all flows via server
- **HMAC** on both directions (server→n8n, n8n→server)
- **JWT validation** at every API entry; server-side persona/entitlement checks
- **RLS** for all user-facing data tables
- **Audit logs** for sensitive actions (`demo_run_started`, `demo_run_callback`)
- **Rate limiting** per user

### Project Structure Notes
- Follows existing demo execution pattern established in Story 1.3
- Integrates with existing `DemoCard` component and `useDemoExecution` hook
- Uses established webhook security patterns with HMAC verification
- Maintains consistency with existing modal and form patterns

## Testing

### Testing Standards
**Source: architecture/coding-standards.md, architecture/brownfield-enhancement-architecture.md**

**Test File Location**: `src/__tests__/components/` and `src/__tests__/services/`

**Test Standards**:
- Use Vitest + React Testing Library for component testing
- Use MSW (Mock Service Worker) for API integration testing
- Maintain 80%+ code coverage requirement
- Test accessibility with ARIA attributes and keyboard navigation

**Testing Frameworks and Patterns**:
- **Unit Tests**: Component isolation testing with mocked dependencies
- **Integration Tests**: API endpoint testing with database integration
- **Security Tests**: HMAC verification and authentication flow testing
- **User Interaction Tests**: Form submission, modal interactions, error handling

**Specific Testing Requirements for This Story**:
- Test form pre-population with user profile data
- Test form validation and error states
- Test fallback handling for missing profile information
- Test webhook security and HMAC verification
- Test real-time status updates and call summary display
- Test error handling for all failure scenarios
- Test integration with existing demo system and user profile data

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|---------|
| 2024-12-19 | 1.0 | Initial story creation for Speed to Lead Qualification agent demo | Scrum Master |
| 2024-12-19 | 1.1 | Enhanced with user profile data pre-population for improved UX | Scrum Master |

## Dev Agent Record

*This section will be populated by the development agent during implementation*

### Agent Model Used
*To be filled by dev agent*

### Debug Log References
*To be filled by dev agent*

### Completion Notes List
*To be filled by dev agent*

### File List
*To be filled by dev agent*

## QA Results

*Results from QA Agent review will be added here after implementation*
