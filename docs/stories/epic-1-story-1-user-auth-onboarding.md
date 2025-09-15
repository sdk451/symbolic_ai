# Story 1.1: User Authentication & Onboarding

**Status:** 📋 Ready for Development  
**Priority:** High (Epic 1 - MVP Core Platform)  
**Estimated Effort:** 5-8 story points  
**Dependencies:** Story 1.0 (Local Development Environment Setup) must be complete

## User Story

As a **new user visiting the platform**,
I want **to sign up with email verification and select my persona segment**,
So that **I can access personalized content and features tailored to my role and needs**.

## Story Context

**Existing System Integration:**
- Integrates with: Supabase Auth system, existing landing page
- Technology: Supabase Auth, React components, TypeScript
- Follows pattern: Existing Supabase auth integration patterns (see `docs/architecture/tech-stack.md`)
- Touch points: Signup form, email verification flow, user profile creation
- **Architecture Reference**: `docs/architecture/4-security-model.md` for auth patterns

## Acceptance Criteria

**Functional Requirements:**

1. **Email Signup Flow**: Users can sign up with email and receive verification email
2. **Persona Selection**: After email verification, users select from persona segments (SMB, SOLO, EXEC, FREELANCER, ASPIRING)
3. **Profile Creation**: User profile is created with persona segment, basic info, and org details
4. **Dashboard Access**: Verified users with completed onboarding can access personalized dashboard

**Integration Requirements:**

5. **Existing Landing Page**: Public landing page continues to work unchanged
6. **Supabase Integration**: New functionality follows existing Supabase auth patterns
7. **Email System**: Integration with existing email infrastructure maintains current behavior

**Quality Requirements:**

8. **Security**: Email verification is required before dashboard access
9. **Validation**: All form inputs are properly validated and sanitized
10. **Error Handling**: Clear error messages for failed signup, verification, or onboarding steps

## Technical Notes

- **Integration Approach**: Extend existing Supabase auth flow with additional onboarding steps
- **Existing Pattern Reference**: Follow current Supabase auth implementation in `src/lib/supabase.ts` and `src/hooks/useAuth.ts`
- **Key Files to Create/Modify**:
  - `src/components/AuthModal.tsx` - Extend existing auth modal with onboarding steps
  - `src/components/PersonaSelector.tsx` - New component for persona selection
  - `src/pages/auth/onboarding.tsx` - New onboarding page
  - `src/services/auth.ts` - Extend with onboarding flow functions
  - `supabase/migrations/` - Add user profile and persona fields
- **Key Constraints**: Must maintain existing public page functionality, email verification required

## Definition of Done

- [ ] Email signup form functional with validation
- [ ] Email verification flow working end-to-end
- [ ] Persona selection interface implemented
- [ ] User profile creation with persona data
- [ ] Dashboard access gated by completed onboarding
- [ ] Existing landing page functionality preserved
- [ ] Error handling and user feedback implemented
- [ ] Tests cover signup, verification, and onboarding flows
- [ ] Documentation updated for new auth flow

## Risk and Compatibility Check

**Primary Risk:** Breaking existing auth flow or public page functionality
**Mitigation:** Feature flags for new onboarding steps, thorough testing of existing flows
**Rollback:** Ability to disable new onboarding steps and revert to basic auth

**Compatibility Verification:**
- [ ] No breaking changes to existing auth APIs
- [ ] Database changes are additive only (new profile fields)
- [ ] UI changes follow existing design patterns
- [ ] Performance impact is minimal
