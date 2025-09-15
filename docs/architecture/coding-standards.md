# Coding Standards

## Language & tooling
- TypeScript strict mode, no `any`.
- Prettier + ESLint with `@typescript-eslint`.
- Conventional commits.
- Branching model: main, next, feature/*.

## React/UI
- Functional components with hooks.
- Component-level tests.
- Loading skeletons preferred.
- Accessibility: ARIA, keyboard navigation.

## State & data
- TanStack Query for server state.
- Zod validation on client + server.

## Security
- No secrets in client.
- All n8n calls server-only.
- Enforce Supabase RLS.

## Error handling
- Friendly UX messages, structured logs.

## Testing
- Unit: Vitest + RTL.
- Integration: msw.
- e2e (optional): Playwright.
