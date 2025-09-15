.
├─ netlify/
│  └─ functions/
│     ├─ api.ts                   # Hono entrypoint
│     └─ lib/
│        └─ core.ts              # auth/db/crypto helpers
│
├─ src/
│  ├─ app/
│  │  ├─ routes/                 # TanStack Router files
│  │  │  ├─ index.tsx            # /
│  │  │  ├─ services.tsx         # /services
│  │  │  ├─ playbooks.tsx        # /playbooks
│  │  │  ├─ contact.tsx          # /contact
│  │  │  ├─ login.tsx            # /login
│  │  │  ├─ signup.tsx           # /signup
│  │  │  ├─ dashboard.tsx        # /dashboard
│  │  │  ├─ demos.$id.tsx        # /demos/:id
│  │  │  ├─ learn.tsx            # /learn
│  │  │  ├─ chat.tsx             # /chat
│  │  │  └─ settings.tsx         # /settings
│  │  ├─ providers/              # QueryClient, Supabase client, Theme
│  │  └─ hooks/
│  │     ├─ useProfile.ts
│  │     ├─ useDemoTypes.ts
│  │     └─ useDemoRuns.ts
│  │
│  ├─ components/
│  │  ├─ layout/
│  │  │  ├─ AppHeader.tsx
│  │  │  ├─ AppFooter.tsx
│  │  │  └─ AuthGate.tsx
│  │  ├─ dashboard/
│  │  │  ├─ PersonaBanner.tsx
│  │  │  ├─ DemoCard.tsx
│  │  │  ├─ DemoCardGrid.tsx
│  │  │  ├─ ActivityFeed.tsx
│  │  │  └─ ConsultationBanner.tsx
│  │  ├─ demo/
│  │  │  ├─ RunButton.tsx
│  │  │  ├─ RunStatus.tsx
│  │  │  ├─ RunResultPanel.tsx
│  │  │  └─ RunHistory.tsx
│  │  ├─ learn/
│  │  │  └─ ContentTeaserCard.tsx
│  │  └─ common/
│  │     ├─ CTASection.tsx
│  │     ├─ ProofStrip.tsx
│  │     ├─ Hero.tsx
│  │     └─ forms/
│  │        ├─ LoginForm.tsx
│  │        └─ SignupForm.tsx
│  │
│  ├─ lib/
│  │  ├─ api.ts                  # fetch wrappers with Zod parsing
│  │  ├─ supabase.ts             # Supabase client
│  │  ├─ analytics.ts            # PostHog/Plausible
│  │  └─ zod-schemas.ts
│  │
│  ├─ styles/
│  ├─ types/
│  └─ test/
│
├─ public/
│  └─ assets/
│
├─ scripts/
│  ├─ seed.sql
│  └─ migrate.sql
│
├─ docs/
│  ├─ prd.md
│  ├─ architecture.md
│  ├─ coding-standards.md
│  ├─ tech-stack.md
│  └─ source-tree.md
│
├─ package.json
└─ vite.config.ts
