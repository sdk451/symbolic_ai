# Story 1.6: Customer Service Chatbot Demo Implementation

**Status:** Approved  
**Priority:** High (Epic 1 - MVP Core Platform)  
**Estimated Effort:** 6-8 story points  
**Dependencies:** Story 1.3 (Secure Demo Execution) must be complete

## Story

**As a** dashboard user interested in AI customer service automation,  
**I want** to experience an interactive customer service chatbot demo with real-time conversation capabilities,  
**so that** I can understand how AI can handle customer inquiries and provide intelligent responses for my business.

## Acceptance Criteria

1. **Modal Chat Window**: When "Start Demo" is clicked for Customer Service Chatbot, a modal chat window opens centered on screen with proper overlay
2. **Chat Widget Integration**: Modal contains n8n chat widget configured to communicate with n8n chatbot workflow
3. **Real-time Messaging**: Users can send messages and receive real-time responses from the chatbot workflow
4. **Message History**: Chat maintains conversation history during the demo session
5. **Error Handling**: Graceful handling of chat widget loading failures and workflow communication errors
6. **Responsive Design**: Chat interface works properly across different screen sizes and devices
7. **Modal Controls**: Users can close the modal and return to dashboard
8. **Demo Tracking**: Chat interactions are tracked and stored for demo analytics
9. **Security Compliance**: All chat communications follow established security patterns
10. **User Experience**: Smooth, intuitive chat experience with proper loading states and feedback

## Tasks / Subtasks

- [ ] **Task 1: Create Chatbot Demo Modal Component** (AC: 1, 2, 7)
  - [ ] Create `src/components/demo/ChatbotModal.tsx` with modal structure
  - [ ] Implement modal overlay and centering functionality
  - [ ] Add close button and modal state management
  - [ ] Integrate with existing modal system and styling

- [ ] **Task 2: Integrate n8n Chat Widget** (AC: 2, 3, 4)
  - [ ] Install and configure `@n8n/chat` package or use CDN integration
  - [ ] Create chat widget container within modal
  - [ ] Configure webhook URL for n8n chatbot workflow
  - [ ] Implement chat widget initialization and cleanup

- [ ] **Task 3: Implement Chat API Integration** (AC: 3, 8, 9)
  - [ ] Create `POST /api/demos/chatbot/run` endpoint for demo initialization
  - [ ] Store demo run record in `demo_runs` table with chat session tracking
  - [ ] Implement chat message logging and analytics
  - [ ] Add proper authentication and rate limiting

- [ ] **Task 4: Create Chat Widget Wrapper Component** (AC: 2, 3, 4, 6)
  - [ ] Create `src/components/demo/ChatWidget.tsx` wrapper component
  - [ ] Handle chat widget lifecycle and error states
  - [ ] Implement responsive design for different screen sizes
  - [ ] Add proper TypeScript interfaces for chat functionality

- [ ] **Task 5: Integrate with Existing Demo System** (AC: 1, 8)
  - [ ] Update `src/components/DemoCard.tsx` to handle chatbot demo type
  - [ ] Modify demo execution flow to show chatbot modal
  - [ ] Add demo type configuration for customer service chatbot
  - [ ] Update demo status tracking and display

- [ ] **Task 6: Error Handling and Edge Cases** (AC: 5, 9)
  - [ ] Implement comprehensive error handling for chat widget failures
  - [ ] Handle n8n workflow unavailability and timeouts
  - [ ] Add proper loading states and user feedback
  - [ ] Implement fallback UI for chat widget loading failures

- [ ] **Task 7: Database Schema Updates** (AC: 8)
  - [ ] Add chatbot-specific fields to `demo_runs` table if needed
  - [ ] Create migration for chat session tracking
  - [ ] Update RLS policies for chat data access patterns
  - [ ] Add chat message logging schema if required

- [ ] **Task 8: Testing Implementation** (AC: All)
  - [ ] Create unit tests for modal and chat widget components
  - [ ] Add integration tests for chat API endpoints
  - [ ] Test chat widget integration and error handling
  - [ ] Add end-to-end tests for complete chatbot demo flow

## Dev Notes

### Previous Story Insights
- Story 1.3 established secure demo execution patterns with HMAC webhook security
- Story 1.5 established modal form patterns for demo interactions
- Existing `useDemoExecution` hook provides demo status tracking infrastructure
- Demo card system already supports different demo types and status display

### Data Models
**Source: architecture/2-data-model-v1-v2-ready.md**
- `demo_runs` table: `(id, user_id, demo_type_id, params jsonb, status enum[queued,running,succeeded,failed], started_at, finished_at, result jsonb, error text)`
- `demo_types` table: `(id, slug, name, description, icon, audience_tags text[], requires_params bool, enabled bool)`
- Chatbot demo will use `demo_type_id` for "customer-service-chatbot" slug
- Chat session data stored in `params` jsonb field: `{sessionId, messageCount, startTime}`
- Chat analytics stored in `result` jsonb field: `{totalMessages, avgResponseTime, userSatisfaction, conversationSummary}`

### API Specifications
**Source: architecture/3-api-surface-v1.md**
- Follow existing pattern: `POST /api/demos/:demoId/run` → Auth guard, quota check, create `demo_runs`
- Chat widget will communicate directly with n8n webhook (following security model)
- Use Hono routes + Zod parsers for input validation
- Implement proper CORS configuration for chat widget domain access

### Component Specifications
**Source: architecture/5-frontend-application-v1.md**
- Use shadcn/ui components for consistent modal styling
- Follow existing modal patterns from lead qualification demo
- Integrate with TanStack Query for demo status tracking
- Use existing demo card system for consistent user experience

### File Locations
**Source: architecture/source-tree.md**
- Modal components: `src/components/demo/ChatbotModal.tsx`, `src/components/demo/ChatWidget.tsx`
- API endpoints: `netlify/functions/api.ts` (extend existing Hono routes)
- Demo configuration: Update `src/services/dashboard.ts` for demo types
- Database migrations: `supabase/migrations/` directory

### n8n Chat Widget Integration
**Source: @n8n/chat package documentation**
- **CDN Integration**: Use CDN for quick integration without build complexity
- **Package Installation**: Alternative npm package installation for more control
- **Configuration**: Webhook URL configuration for n8n chatbot workflow
- **Styling**: Custom CSS integration with existing design system
- **Error Handling**: Proper error states and fallback UI

**Implementation Options**:
```html
<!-- CDN Integration -->
<link href="https://cdn.jsdelivr.net/npm/@n8n/chat/style.css" rel="stylesheet" />
<script type="module">
  import { createChat } from 'https://cdn.jsdelivr.net/npm/@n8n/chat/chat.bundle.es.js';
  createChat({
    webhookUrl: 'YOUR_N8N_WEBHOOK_URL'
  });
</script>
```

### Testing Requirements
**Source: architecture/coding-standards.md, architecture/brownfield-enhancement-architecture.md**
- **Framework**: Vitest + React Testing Library
- **Location**: `src/__tests__/components/` for component tests, `src/__tests__/services/` for API tests
- **Coverage**: 80%+ coverage requirement
- **Test Types**: Unit tests for modal components, integration tests for chat widget, security tests for webhook communication
- **Setup**: Use existing test configuration in `vitest.config.ts`

### Technical Constraints
**Source: architecture/4-security-model.md**
- **CORS Configuration**: n8n Chat Trigger node must include domain in Allowed Origins
- **Webhook Security**: Follow established webhook patterns for n8n communication
- **JWT validation** at demo initialization API entry
- **RLS** for all user-facing data tables
- **Audit logs** for demo interactions and chat sessions
- **Rate limiting** per user for demo usage

### Project Structure Notes
- Follows existing demo execution pattern established in Story 1.3
- Integrates with existing `DemoCard` component and `useDemoExecution` hook
- Uses established modal patterns from Story 1.5
- Maintains consistency with existing chat widget integration patterns

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
- **Unit Tests**: Modal component testing, chat widget wrapper testing
- **Integration Tests**: Chat widget initialization, n8n webhook communication
- **Security Tests**: CORS configuration, webhook security validation
- **User Interaction Tests**: Modal interactions, chat message sending, error handling

**Specific Testing Requirements for This Story**:
- Test modal opening and closing functionality
- Test chat widget initialization and configuration
- Test real-time messaging and response handling
- Test error handling for chat widget failures
- Test responsive design across different screen sizes
- Test integration with existing demo system

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|---------|
| 2024-12-19 | 1.0 | Initial story creation for Customer Service Chatbot demo | Scrum Master |

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
