# 5) Frontend Application (v1)

**Routing & State**

* **Public**: `/` (landing), `/services`, `/playbooks`, `/contact`, `/login`, `/signup`.
* **Auth’d**: `/dashboard`, `/demos/:id`, `/learn`, `/chat`, `/settings`.
* Use **TanStack Router** or SvelteKit layouts for clean route data loading.
* Data fetching with **TanStack Query** (suspenseful loading, retries off for mutations).

**UI/UX**

* Component library: **shadcn/ui** (+ Lucide icons).
* Dashboard: persona-filtered demo grid; **Activity Drawer** for last runs; **Book Consult** banner.
* Result panels show run output, metadata, and “turn this on for your team” CTA.

---
