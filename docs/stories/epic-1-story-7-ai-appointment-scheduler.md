# Story 1.7: AI Appointment Scheduler Demo Implementation

**Status:** Approved  
**Priority:** High (Epic 1 - MVP Core Platform)  
**Estimated Effort:** 6-8 story points  
**Dependencies:** Story 1.3 (Secure Demo Execution) must be complete

## Story

**As a** dashboard user interested in AI appointment scheduling automation,  
**I want** to experience an AI-powered appointment scheduler that calls me and finds available times,  
**so that** I can understand how AI can automate appointment scheduling and calendar management for my business.

## Acceptance Criteria

1. **Pre-populated Modal Form**: When "Start Demo" is clicked for AI Appointment Scheduler, a modal opens with user's name, phone number, and email pre-populated from profile
2. **Call Me Button**: Modal contains a prominent "Call Me" button to initiate the VAPI agent call
3. **VAPI Call Initiation**: Clicking "Call Me" triggers webhook to n8n to engage VAPI agent for appointment scheduling
4. **Call Status Tracking**: User receives real-time updates about call status (initiated, in-progress, completed)
5. **Appointment Scheduling**: VAPI agent finds available appointment times and schedules the appointment
6. **Thank You Popup**: When call completes, a thank you popup displays with appointment confirmation details
7. **Error Handling**: Graceful handling of form submission errors, webhook failures, and call failures
8. **User Experience**: Seamless flow from demo start to appointment confirmation with clear progress indicators
9. **Data Persistence**: Demo run data and appointment details stored in database with proper user association
10. **Security Compliance**: All webhook communications use HMAC verification and follow security model

## Tasks / Subtasks

- [ ] **Task 1: Create Appointment Scheduler Demo Modal Component** (AC: 1, 2, 7)
  - [ ] Create `src/components/demo/AppointmentSchedulerModal.tsx` with pre-populated form
  - [ ] Implement user profile data pre-population (name, phone, email)
  - [ ] Add "Call Me" button with proper styling and state management
  - [ ] Integrate with existing modal system and styling

- [ ] **Task 2: Implement Appointment Scheduling API** (AC: 3, 8, 9)
  - [ ] Create `POST /api/demos/appointment-scheduler/run` endpoint in `netlify/functions/api.ts`
  - [ ] Add HMAC signing for n8n webhook payload with user contact information
  - [ ] Store demo run record in `demo_runs` table with appointment scheduling context
  - [ ] Implement rate limiting and quota checks

- [ ] **Task 3: Create Thank You Confirmation Popup** (AC: 6)
  - [ ] Create `src/components/demo/AppointmentConfirmationPopup.tsx` for displaying appointment details
  - [ ] Design confirmation layout with appointment time, date, and next steps
  - [ ] Add proper styling consistent with existing design system
  - [ ] Include option to add appointment to user's calendar

- [ ] **Task 4: Implement Webhook Callback Handler** (AC: 4, 5, 6, 9)
  - [ ] Create `POST /api/demos/appointment-scheduler/callback` endpoint
  - [ ] Implement HMAC verification for incoming webhook
  - [ ] Update demo run status and store appointment details
  - [ ] Broadcast real-time updates to frontend for call status

- [ ] **Task 5: Integrate with Existing Demo System** (AC: 1, 8)
  - [ ] Update `src/components/DemoCard.tsx` to handle appointment scheduler demo type
  - [ ] Modify demo execution flow to show appointment scheduler modal
  - [ ] Add demo type configuration for AI appointment scheduler
  - [ ] Update demo status tracking and display

- [ ] **Task 6: User Profile Integration** (AC: 1, 9)
  - [ ] Implement user profile data retrieval for form pre-population
  - [ ] Add fallback handling for missing profile information
  - [ ] Ensure proper data validation and sanitization
  - [ ] Update profile data access patterns if needed

- [ ] **Task 7: Database Schema Updates** (AC: 9)
  - [ ] Add appointment-specific fields to `demo_runs` table if needed
  - [ ] Create migration for appointment data storage
  - [ ] Update RLS policies for appointment data access patterns
  - [ ] Add appointment confirmation and calendar integration fields

- [ ] **Task 8: Error Handling and Edge Cases** (AC: 7, 10)
  - [ ] Implement comprehensive error handling for all failure scenarios
  - [ ] Add retry logic for webhook failures
  - [ ] Handle VAPI call failures and appointment scheduling errors
  - [ ] Add proper logging and audit trail

- [ ] **Task 9: Testing Implementation** (AC: All)
  - [ ] Create unit tests for modal and confirmation popup components
  - [ ] Add integration tests for API endpoints
  - [ ] Test webhook security and HMAC verification
  - [ ] Add end-to-end tests for complete appointment scheduling flow

## Dev Notes

### Previous Story Insights
- Story 1.3 established secure demo execution patterns with HMAC webhook security
- Story 1.5 established modal form patterns and VAPI integration for lead qualification
- Story 1.6 established modal patterns and real-time status updates
- Existing `useDemoExecution` hook provides demo status tracking infrastructure
- Demo card system already supports different demo types and status display

### Data Models
**Source: architecture/2-data-model-v1-v2-ready.md**
- `demo_runs` table: `(id, user_id, demo_type_id, params jsonb, status enum[queued,running,succeeded,failed], started_at, finished_at, result jsonb, error text)`
- `demo_types` table: `(id, slug, name, description, icon, audience_tags text[], requires_params bool, enabled bool)`
- `profiles` table: `(user_id PK/FK, full_name, persona_segment, org_name, title, phone)`
- Appointment scheduler demo will use `demo_type_id` for "appointment-scheduler" slug
- User contact data stored in `params` jsonb field: `{name, phone, email, requestedTime}`
- Appointment details stored in `result` jsonb field: `{appointmentId, scheduledTime, duration, confirmationCode, calendarLink}`

### API Specifications
**Source: architecture/3-api-surface-v1.md**
- Follow existing pattern: `POST /api/demos/:demoId/run` → Auth guard, quota check, create `demo_runs`, sign + call n8n webhook
- Callback pattern: `POST /api/demos/:runId/callback` → verify HMAC, update status + result/error
- Use Hono routes + Zod parsers for input validation
- Implement idempotency key header for callbacks to prevent double updates

### Component Specifications
**Source: architecture/5-frontend-application-v1.md**
- Use shadcn/ui components for consistent styling
- Follow existing modal patterns from previous demo implementations
- Integrate with TanStack Query for data fetching and real-time updates
- Use existing demo card system for consistent user experience

### File Locations
**Source: architecture/source-tree.md**
- Modal components: `src/components/demo/AppointmentSchedulerModal.tsx`, `src/components/demo/AppointmentConfirmationPopup.tsx`
- API endpoints: `netlify/functions/api.ts` (extend existing Hono routes)
- Demo configuration: Update `src/services/dashboard.ts` for demo types
- Database migrations: `supabase/migrations/` directory

### User Profile Integration
**Source: architecture/2-data-model-v1-v2-ready.md**
- Access user profile data from `profiles` table via `user_id`
- Pre-populate form fields: `full_name`, `phone`, `email` (if available)
- Handle cases where profile data is incomplete or missing
- Ensure proper data validation and sanitization before webhook transmission

### VAPI Integration Pattern
**Source: Previous stories and n8n workflow patterns**
- Follow established VAPI integration pattern from Story 1.5
- Use n8n workflow to handle VAPI agent call initiation
- Implement proper call status tracking and real-time updates
- Handle appointment scheduling logic within n8n workflow
- Return appointment confirmation details via webhook callback

### Testing Requirements
**Source: architecture/coding-standards.md, architecture/brownfield-enhancement-architecture.md**
- **Framework**: Vitest + React Testing Library
- **Location**: `src/__tests__/components/` for component tests, `src/__tests__/services/` for API tests
- **Coverage**: 80%+ coverage requirement
- **Test Types**: Unit tests for modal components, integration tests for API endpoints, security tests for HMAC verification
- **Setup**: Use existing test configuration in `vitest.config.ts`

### Technical Constraints
**Source: architecture/4-security-model.md**
- **No direct browser calls** to n8n; all flows via server
- **HMAC** on both directions (server→n8n, n8n→server)
- **JWT validation** at every API entry; server-side persona/entitlement checks
- **RLS** for all user-facing data tables
- **Audit logs** for sensitive actions (`demo_run_started`, `demo_run_callback`, `appointment_scheduled`)
- **Rate limiting** per user

### Project Structure Notes
- Follows existing demo execution pattern established in Story 1.3
- Integrates with existing `DemoCard` component and `useDemoExecution` hook
- Uses established modal patterns from Stories 1.5 and 1.6
- Maintains consistency with existing VAPI integration and webhook security patterns

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
- **User Interaction Tests**: Form pre-population, button interactions, modal flows

**Specific Testing Requirements for This Story**:
- Test form pre-population with user profile data
- Test "Call Me" button functionality and state management
- Test webhook security and HMAC verification
- Test real-time status updates and appointment confirmation display
- Test error handling for all failure scenarios
- Test integration with existing demo system and user profile data

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|---------|
| 2024-12-19 | 1.0 | Initial story creation for AI Appointment Scheduler demo | Scrum Master |

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
