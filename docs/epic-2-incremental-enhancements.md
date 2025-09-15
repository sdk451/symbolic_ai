# Epic 2: Phase 1.5 Incremental Enhancements

## Epic Goal

Expand the MVP platform with additional demo capabilities, executive chatbot beta, file upload support, and automated email marketing to increase user engagement and conversion opportunities.

## Epic Description

**Existing System Context:**
- Current functionality: Working MVP with authentication, dashboard, demo execution, and consultation booking
- Technology stack: Vite, TypeScript, React, Supabase, Netlify Functions, n8n webhooks
- Integration points: Existing demo system, user profiles, email infrastructure

**Enhancement Details:**
- What's being added: Expanded demo library (10+ demos), executive chatbot with rate limits, file upload capabilities, automated email drip campaigns
- How it integrates: Builds on existing demo execution system, adds new content types, extends user engagement workflows
- Success criteria: Users have access to diverse demo portfolio, can interact with AI chatbot, upload files for processing, and receive targeted email communications

## Stories

1. **Story 1:** Expanded Demo Library - Add 7+ additional demo cards covering different AI use cases and business scenarios
2. **Story 2:** Executive Chatbot Beta - Implement AI chatbot with 10 free messages/day limit, basic conversation memory, and executive-focused responses
3. **Story 3:** File Upload Support - Add CSV and PDF upload capabilities for demo processing with secure file handling and validation
4. **Story 4:** Automated Email Drips - Create persona-specific email sequences for onboarding, engagement, and conversion

## Compatibility Requirements

- [ ] New demos follow existing demo execution patterns
- [ ] Chatbot integrates with existing user authentication
- [ ] File uploads work within current security model
- [ ] Email system uses existing user profile data

## Risk Mitigation

- **Primary Risk:** Chatbot abuse or inappropriate responses affecting brand reputation
- **Mitigation:** Rate limiting, content filtering, human oversight, clear usage guidelines
- **Rollback Plan:** Feature flags for chatbot, ability to disable specific demos, email sequence controls

## Definition of Done

- [ ] All stories completed with acceptance criteria met
- [ ] 10+ demo cards available and functional
- [ ] Chatbot responding appropriately within rate limits
- [ ] File upload system secure and working
- [ ] Email sequences triggered correctly by user actions
- [ ] Performance impact minimal on existing system
- [ ] User feedback collected and incorporated

## Technical Implementation Notes

- Extend existing demo_types table for new demos
- Implement file storage in Supabase Storage with RLS
- Use existing n8n workflows for email automation
- Add conversation history table for chatbot
- Implement content moderation for chatbot responses
