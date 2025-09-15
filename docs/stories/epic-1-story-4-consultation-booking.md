# Story 1.4: Consultation Booking Integration

**Status:** 📋 Ready for Development  
**Priority:** Medium (Epic 1 - MVP Core Platform)  
**Estimated Effort:** 5-8 story points  
**Dependencies:** Story 1.2 (Personalized Dashboard) must be complete

## User Story

As a **dashboard user interested in AI transformation**,
I want **to easily book a consultation through integrated scheduling**,
So that **I can get personalized advice and move from demo experience to actual implementation planning**.

## Story Context

**Existing System Integration:**
- Integrates with: Dashboard CTAs, Calendly/Cal.com scheduling, user profiles
- Technology: Calendly/Cal.com webhooks, Netlify Functions, Supabase storage
- Follows pattern: Webhook integration pattern for external service integration (see `docs/architecture/6-n8n-flow-pattern-recommended.md`)
- Touch points: Dashboard booking CTAs, webhook endpoints, consultation data storage
- **Architecture Reference**: `docs/architecture/3-api-surface-v1.md` for API patterns

## Acceptance Criteria

**Functional Requirements:**

1. **Booking Integration**: Calendly/Cal.com embedded or linked booking interface
2. **Webhook Handling**: POST /api/consultations/book endpoint to receive booking confirmations
3. **Consultation Storage**: Booked consultations stored in database with user association
4. **Dashboard Integration**: Booking CTAs prominently displayed based on user persona
5. **Email Confirmation**: Users receive confirmation emails for booked consultations
6. **Booking Management**: Users can view and manage their upcoming consultations

**Integration Requirements:**

7. **Dashboard CTAs**: Booking buttons integrated into dashboard design
8. **User Profile Integration**: Consultations linked to user profiles and persona data
9. **Existing Email System**: Integration with existing email infrastructure

**Quality Requirements:**

10. **User Experience**: Seamless booking flow with clear next steps
11. **Data Consistency**: Booking data properly synchronized between systems
12. **Error Handling**: Graceful handling of booking failures or webhook issues

## Technical Notes

- **Integration Approach**: Integrate Calendly/Cal.com webhooks with Netlify Functions
- **Existing Pattern Reference**: Follow existing webhook integration patterns (see `docs/architecture/6-n8n-flow-pattern-recommended.md`)
- **Key Files to Create/Modify**:
  - `src/components/ConsultationCTA.tsx` - Booking call-to-action component
  - `src/components/ConsultationModal.tsx` - Modal for booking interface
  - `netlify/functions/consultation-webhook.ts` - Webhook handler for booking confirmations
  - `src/services/consultation.ts` - Consultation booking service functions
  - `src/pages/consultations.tsx` - User consultation management page
  - `supabase/migrations/` - Add consultations table schema
- **External Service Setup**: Configure Calendly/Cal.com webhook endpoints and API keys
- **Key Constraints**: Must maintain user experience, handle webhook reliability

## Definition of Done

- [ ] Calendly/Cal.com integration implemented (embedded or linked)
- [ ] Webhook endpoint for booking confirmations functional
- [ ] Consultation database schema and storage implemented
- [ ] Dashboard booking CTAs implemented and persona-aware
- [ ] Email confirmation system working
- [ ] User consultation management interface created
- [ ] Webhook error handling and retry logic implemented
- [ ] Integration with existing email system verified
- [ ] Tests cover booking flow, webhook handling, and error scenarios
- [ ] Documentation updated for consultation booking process

## Risk and Compatibility Check

**Primary Risk:** Webhook reliability issues or booking data inconsistency
**Mitigation:** Robust webhook handling, data validation, retry logic, manual reconciliation process
**Rollback:** Ability to disable webhook integration and use manual booking process

**Compatibility Verification:**
- [ ] No breaking changes to existing dashboard or user flows
- [ ] Database changes are additive only
- [ ] External service integration doesn't impact existing functionality
- [ ] Performance impact is minimal
