# Frontend Specification

## 1) App overview
- **Goal**: convert segmented audiences (SMB owners, solopreneurs/freelancers, executives/aspiring leaders) into booked consultations, using an authenticated, demo-centric dashboard with gated learning teasers.
- **Stack**: Vite + TypeScript + React (with TanStack Router + TanStack Query), shadcn/ui, Lucide icons, Supabase Auth.

## 2) Routes & pages
**Public**
- `/` Home (hero, value props, services, proof, FAQs, CTAs)
- `/services`
- `/playbooks` (short posts/demos overviews)
- `/contact` (form + Calendly embed)
- `/login`
- `/signup`

**Authenticated**
- `/dashboard` (persona-tailored demo grid, activity feed, consultation CTA)
- `/demos/:id` (demo detail + run history + “turn this on” CTA)
- `/learn` (teasers for courses/articles/videos based on persona)
- `/chat` (Exec Chatbot beta: 10 msgs/day; upsell to call)
- `/settings` (profile, org name, persona selection; API keys in future)

## 3) Key screens & components
... _(continues with component breakdown as in draft)_ ...
