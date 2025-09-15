# Story 1.3: Secure Demo Execution System

**Status:** 📋 Ready for Development  
**Priority:** High (Epic 1 - MVP Core Platform)  
**Estimated Effort:** 13-21 story points  
**Dependencies:** Story 1.2 (Personalized Dashboard) must be complete

## User Story

As a **dashboard user**,
I want **to execute AI demos through a secure system that processes my requests and returns results**,
So that **I can experience AI capabilities safely while maintaining system security and preventing abuse**.

## Story Context

**Existing System Integration:**
- Integrates with: Dashboard demo cards, n8n automation workflows, user profiles
- Technology: Netlify Functions, Hono, Zod, n8n webhooks, HMAC authentication
- Follows pattern: Server-side API pattern with webhook integration
- Touch points: Demo execution API, n8n webhook calls, callback handling, demo run storage

## Acceptance Criteria

**Functional Requirements:**

1. **Secure API Endpoint**: POST /api/demos/:demoId/run endpoint with authentication and validation
2. **HMAC Security**: All webhook communications signed with HMAC for security
3. **Demo Run Tracking**: Demo runs stored in database with status tracking (queued, running, succeeded, failed)
4. **n8n Integration**: Secure calls to n8n webhooks with proper payload structure
5. **Callback Handling**: POST /api/demos/:runId/callback endpoint for n8n to report results
6. **Real-time Updates**: Demo status updates displayed to user via polling or real-time updates

**Integration Requirements:**

7. **Dashboard Integration**: Demo cards connect to execution API seamlessly
8. **User Authentication**: All API calls properly authenticated with Supabase JWT
9. **Existing Security**: New system maintains existing security standards

**Quality Requirements:**

10. **Rate Limiting**: Demo execution rate limited per user to prevent abuse
11. **Error Handling**: Comprehensive error handling for webhook failures and timeouts
12. **Audit Logging**: All demo executions logged for security and debugging

## Technical Notes

- **Integration Approach**: Create Netlify Functions with Hono for API layer, integrate with n8n webhooks
- **Existing Pattern Reference**: Follow existing API patterns and security measures
- **Key Constraints**: Must be secure, handle failures gracefully, prevent abuse

## Definition of Done

- [ ] Demo execution API endpoint implemented with Hono + Zod
- [ ] HMAC signing and verification working for webhook communications
- [ ] Demo run database schema and storage implemented
- [ ] n8n webhook integration functional with proper payload structure
- [ ] Callback endpoint handling n8n responses correctly
- [ ] Real-time status updates working in dashboard
- [ ] Rate limiting implemented to prevent abuse
- [ ] Comprehensive error handling and logging
- [ ] Security audit completed for webhook integration
- [ ] Tests cover API endpoints, webhook flow, and error scenarios

## Risk and Compatibility Check

**Primary Risk:** Security vulnerabilities in webhook integration or API exposure
**Mitigation:** HMAC authentication, server-side only execution, rate limiting, audit logging
**Rollback:** Feature flag to disable demo execution, ability to block n8n webhooks

**Compatibility Verification:**
- [ ] No breaking changes to existing API structure
- [ ] Database schema changes are additive only
- [ ] Security measures don't impact existing functionality
- [ ] Performance impact is minimal with proper rate limiting
