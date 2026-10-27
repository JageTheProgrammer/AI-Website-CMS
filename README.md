# AI Website CMS --- Project Guide

> Working name: **AI Website CMS**. Replace this name once the product
> brand is chosen.

A prompt-driven website builder and hosting platform inspired by tools
such as Lovable and Base44. Customers describe a business or website in
natural language, generate and edit a real project, connect data
features, preview it, publish it to a platform subdomain or custom
domain, and export the project to run locally.

## Product principles

1.  **Prompt to working website:** users describe what they need; AI
    helps create and iteratively modify a complete website project.
2.  **Ownable output:** generated projects must be exportable as source
    code, with setup instructions and an honest list of external
    services or environment variables required to run them.
3.  **Hosting choice:** publish to a platform-managed subdomain, and
    support custom domains when configured.
4.  **Data features included:** provide a clear path to databases and
    backend capabilities. Do not imply that a database is configured
    until credentials, schema, migrations, and connectivity actually
    work.
5.  **One consistent product UI:** shared design tokens, reusable
    components, clear loading/empty/error/success states, responsive
    behavior, keyboard accessibility, and coherent navigation.
6.  **Provider-independent AI:** local Ollama for development,
    production AI providers (including Anthropic Claude) behind a
    provider interface. Never hard-code a model or provider throughout
    the application.
7.  **Secure by default:** isolate customer projects and generated code;
    validate authorization server-side; keep secrets server-side; treat
    model output and user prompts as untrusted input.

## Repository layout

``` text
.
├── README.md                 # Product vision, architecture, project-wide rules
├── PROMPT_LOCAL_AI.md        # Phased instructions for local coding agents
├── api/
│   ├── README.md             # Express API responsibilities and conventions
│   ├── package.json
│   ├── tsconfig.json
│   ├── lib/env.ts
│   └── src/index.ts
└── web/
    ├── README.md             # Next.js app responsibilities and UI-first plan
    ├── AGENTS.md             # Keep agent instructions aligned with this guide
    └── src/
        ├── app/              # App Router pages, layouts and route handlers
        └── components/       # Shared UI and navigation
```

This guide reflects the currently supplied repository tree. Agents must
inspect actual files before assuming a feature, dependency, API route,
or data model exists.

## Planned stack

-   **Frontend:** Next.js App Router, React, TypeScript, CSS/Tailwind as
    already configured; shadcn/ui-style components where appropriate.
-   **Backend:** Express + TypeScript in `api/`.
-   **Development AI:** local Ollama through a configurable HTTP
    endpoint.
-   **Production AI:** provider adapters, initially including Anthropic
    Claude. Provider selection and secrets are backend-only.
-   **Database:** select a production database deliberately (for example
    PostgreSQL) and access it through a repository/data-access layer.
    Keep customer-project data isolated.
-   **Validation:** schema validation at API boundaries (Zod is a
    reasonable option if already installed or approved).
-   **Observability:** structured logs, request IDs, consistent error
    responses, health/readiness checks, and redacted error monitoring.
-   **Hosting:** deployment adapter for platform subdomains and custom
    domains; export/build pipeline must be independent of the dashboard
    UI.

Do not install a new dependency just because it is mentioned here.
Inspect package manifests first, then propose or add only what is
justified.

## Architecture boundaries

### Web app (`web/`)

Owns user experience: marketing pages, authentication screens,
dashboard, project creation, prompt editor, live preview, project
settings, deployment and domain UI, billing/profile pages, and admin UI.
It may call the Express API through a single typed API client.

Next.js route handlers currently exist under `web/src/app/api/`. During
migration, inventory each one and classify it: - **UI-specific/BFF
route:** may remain in Next.js if there is a clear reason. -
**Business/domain API:** should move to Express and be called through
the shared frontend API client. - **Legacy/duplicate:** remove only
after confirming callers and replacing the behavior.

Do not blindly delete route handlers or rewrite auth/payment flows. Keep
compatibility until a migration is implemented and verified.

### API (`api/`)

Owns business rules and trusted operations: identity/session
verification, authorization, project CRUD, AI orchestration,
generated-file operations, database provisioning/configuration,
preview/build jobs, deployment, custom-domain verification, usage
limits, billing integrations, audit events, and support operations.

The API is the authority for permissions and state changes. A hidden
frontend button is not authorization.

### Generated customer project

A generated site is a separate artifact from the CMS dashboard. Store
source files, dependency metadata, project settings, version history and
deployment metadata. Execute builds in a restricted, isolated
environment; never run arbitrary generated code in the main API process.
Do not expose platform secrets to generated apps.

## Main user journey

1.  Sign up and sign in.
2.  Create a project and enter a prompt, optionally selecting a business
    type, visual direction and features.
3.  Generate a first version with progress and recoverable errors.
4.  Inspect the project in a preview; refine it with follow-up prompts.
5.  Edit files/settings where supported and review changes before
    applying risky operations.
6.  Configure data features and environment variables securely.
7.  Test the project, inspect logs/build errors, and fix issues.
8.  Publish to a platform subdomain or connect a custom domain.
9.  Manage versions, deployments, usage, billing and project settings.
10. Export a reproducible project archive with README, dependency
    manifest, setup instructions and `.env.example` (never real
    secrets).

## UI/UX direction

Aim for a polished, product-led React SaaS interface rather than a
generic AI-generated landing page.

-   Use a consistent spacing scale, typography hierarchy, neutral
    surfaces, restrained accent color, subtle borders and meaningful
    empty states.
-   Use icons (for example Lucide if available), not emoji as interface
    icons.
-   Use shadcn/ui patterns and accessible primitives where useful; do
    not copy components without understanding their states and keyboard
    behavior.
-   Prioritize responsive desktop dashboard/editor layouts while
    ensuring mobile navigation and core flows remain usable.
-   Include loading, skeleton, empty, validation, disabled, success,
    error and confirmation states.
-   Keep button labels specific. Every visible interactive control must
    work, navigate somewhere meaningful, or be clearly disabled with an
    explanation.
-   Avoid fake metrics, fake activity, invented customer testimonials,
    decorative controls that appear functional, and hard-coded claims
    about AI or hosting.
-   Use realistic demo data only when clearly labeled as sample/demo
    content.

## Current implementation status

### Backend (api/) — Complete foundations + auth + projects + AI generation

The Express API in `api/` includes:

**Infrastructure:**
- Environment validation at startup (`lib/env.ts`)
- Shared MySQL connection pool with health check (`lib/db.ts`)
- Structured logging with severity levels (`lib/logger.ts`)
- Request IDs on every request
- Centralized error handling middleware
- Helmet security headers, CORS allowlist, global rate limiting

**Authentication:**
- Signup (bcrypt password hashing, session creation)
- Login (credential verification, session start)
- Logout (session destroy)
- Session verification (`GET /api/auth/me`)
- Profile update (PATCH) and account deletion (DELETE)

**Projects:**
- CRUD with ownership enforcement on every operation
- Version history tracking
- Soft delete

**AI Generation:**
- Provider interface (Ollama for dev, Anthropic for production)
- Generation job creation and status polling
- Safe file storage with version boundaries
- Bounded timeouts and output sizes

**Other routes:**
- Admin stats and user management (admin role guard)
- Billing/pricing tiers and subscription info
- Domain management (platform subdomains + custom domains)
- Deployment tracking and status
- Support ticket creation and listing

### Frontend (web/) — Complete marketing pages, dashboard, editor, all pages

All frontend pages connect to the Express API through Next.js route handlers. The mock adapter (`lib/api/mock.ts`) is available for development without a running backend.

### Repository layout (current)

``` text
.
├── README.md                 # Product vision and architecture rules
├── api/
│   ├── .env.example          # All env vars with placeholders
│   ├── lib/                  # Shared infrastructure
│   │   ├── env.ts            # Config validation + typed exports
│   │   ├── db.ts             # MySQL pool, health check
│   │   └── logger.ts         # Structured logging
│   ├── src/
│   │   ├── app.ts            # Express composition root (routes, middleware)
│   │   ├── index.ts          # Entry — validates, connects, starts server
│   │   ├── routes/           # API route modules
│   │   │   ├── health.routes.ts
│   │   │   ├── auth.routes.ts       # signup, login, logout, me, profile
│   │   │   ├── projects.routes.ts   # CRUD + versions + ownership
│   │   │   ├── generation.routes.ts # AI job creation + status
│   │   │   ├── admin.routes.ts      # stats + user list (admin)
│   │   │   ├── billing.routes.ts    # pricing + subscription
│   │   │   ├── domains.routes.ts    # subdomain + custom domain mgmt
│   │   │   ├── deployments.routes.ts# deployment tracking
│   │   │   └── support.routes.ts    # ticket creation/listing
│   │   ├── middleware/
│   │   │   ├── authenticate.ts      # Session-based auth
│   │   │   ├── authorize.ts         # Role checks (admin)
│   │   │   ├── validate.ts          # Zod input validation
│   │   │   ├── error-handler.ts     # Centralized Express errors
│   │   │   ├── request-id.ts        # Request ID assignment
│   │   │   └── rate-limit.ts
│   │   └── modules/ai/providers/    # AI provider interface
│   │       └── base.ts              # Ollama + Anthropic impls
│   ├── migrations/           # Future schema migrations
│   └── sql/schema.sql        # 14-table MySQL schema
└── web/
    ├── src/app/api/          # Next.js BFF route handlers (proxy → Express)
    │   ├── auth/             # login, signup, me, verify, role-check
    │   ├── generate/         # AI generation proxy
    │   ├── pricing/          # Pricing tiers proxy
    │   ├── profile/          # profile CRUD
    │   ├── projects/         # Project CRUD proxy
    │   ├── deployments/      # Deployment proxy
    │   ├── domains/          # Domain proxy
    │   ├── billing/          # Billing proxy
    │   ├── stripe/           # Stripe (stub) + webhook
    │   └── support/          # Support ticket proxy
    ├── src/app/(base)/       # Dashboard pages
    ├── src/app/(auth)/       # Login/signup pages
    ├── src/components/ui/    # 15 reusable UI components
    ├── src/components/layout/# AppShell, sidebar nav
    ├── src/lib/api/          # Typed API client + mock adapter + proxy helper
    └── src/types/            # Shared type definitions
```

### How to run locally

**Backend:**
```bash
cd api
cp .env.example .env        # then edit DB_PASSWORD
npm install
npm run dev                 # → http://localhost:4000
```

**Frontend:**
```bash
cd web
cp .env.example .env.local  # NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
npm install
npm run dev                 # → http://localhost:3000
```

### Security highlights

- Passwords hashed with bcrypt (cost factor 12)
- Sessions via secure cookie, never stored client-side
- All project operations enforce server-side ownership checks
- Input validation at every API boundary (Zod + manual checks)
- Helmet security headers on all responses
- CORS limited to configured origin allowlist
- Rate limiting on auth endpoints (20 req/15min) and globally
- AI model output treated as untrusted — validated before use
- No secrets returned to clients in any response

## Delivery phases --- mandatory order

The project is currently in an early scaffold. Work in these phases; do
not skip ahead because a backend feature seems exciting.

### Phase 0 --- Audit and plan

-   Read root, web and api docs and inspect all current source files and
    package manifests.
-   Record what exists, what works, what is duplicated, and what is only
    a placeholder.
-   Build a route/page inventory and feature matrix.
-   Propose folder structures and component architecture before broad
    edits.
-   Preserve existing behavior unless a change is required and
    documented.

### Phase 1 --- Frontend architecture and design system

-   Finalize frontend folder structure.
-   Establish tokens, typography, layout primitives, buttons, inputs,
    cards, dialogs, dropdowns, tabs, badges, tables, toasts, skeletons,
    empty/error states, navigation and page containers.
-   Use existing packages first; add shadcn/ui or other dependencies
    only after checking compatibility and documenting the choice.
-   Build reusable components before building every page independently.

### Phase 2 --- Complete frontend pages

-   Implement all page layouts and responsive behavior using shared
    components.
-   Connect all controls to frontend state, navigation, validation, and
    clearly defined typed service interfaces.
-   Where the backend is not ready, use a typed mock adapter with
    explicit demo/mock status. Do not pretend persistence or real
    deployment occurred.
-   Implement accessible forms and realistic loading, empty, success and
    failure states.
-   Audit every button, link, menu, modal and form.

### Phase 3 --- Frontend feature and UX audit

-   Test every route, viewport, navigation item and interactive state.
-   Run lint, typecheck, build and tests where available.
-   Fix errors before starting backend implementation.
-   Document the frontend API contracts required from Express.

### Phase 4 --- Backend architecture and implementation

-   Only after the UI and frontend audit are complete, build the Express
    API in coherent modules.
-   Implement configuration validation, request IDs, structured logging,
    centralized error handling, validation, auth/authorization, rate
    limits, audit logging, health/readiness endpoints and tests.
-   Implement domain services and persistence behind interfaces; do not
    put all logic in `src/index.ts`.
-   Implement provider adapters for Ollama and production providers.
-   Implement project storage, versioning, build/deploy job
    abstractions, domains, exports and billing integrations
    incrementally.
-   Use migrations and explicit schema/version management for persistent
    data.

### Phase 5 --- Integration and production readiness

-   Replace mock adapters with real API calls one feature at a time.
-   Verify auth, ownership checks, failure behavior, retry behavior,
    logs and rate limits.
-   Test export/import and a complete publish lifecycle in a safe
    staging environment.
-   Complete security review, accessibility review, dependency audit,
    backups and operational documentation.

## Quality gates

Before declaring a task complete: - Inspect the diff and keep changes
focused. - Run available lint, typecheck, tests and production build;
state exactly which commands passed or failed. - Test the relevant
page/API path, not only compilation. - Check mobile/responsive layout
and keyboard behavior for UI changes. - Confirm secrets are not
committed or returned to clients. - Confirm errors are actionable to
users and detailed enough in redacted server logs. - Update
documentation when architecture, scripts, env vars or contracts
change. - Do not claim a feature works unless it has been implemented
and verified.

## Security requirements

-   Never commit `.env` files, API keys, cookies, tokens, private keys
    or customer secrets.
-   Commit `.env.example` files with placeholders only.
-   Validate environment at startup; fail clearly for required
    production values.
-   Enforce project ownership and role permissions on every API
    operation.
-   Use secure, HttpOnly, SameSite cookies where cookie sessions are
    chosen; protect state-changing requests against CSRF as appropriate.
-   Rate-limit authentication, AI generation, uploads and expensive
    operations.
-   Limit request size, upload size, prompt length, output size,
    execution time and resource usage.
-   Treat prompts, uploaded files, tool output and generated code as
    untrusted.
-   Never execute generated code in the API process or a privileged
    shared runtime.
-   Redact secrets and personal data from logs; never log full auth
    headers, cookies or provider keys.
-   Verify payment webhooks cryptographically and make handlers
    idempotent.
-   Custom domain verification must prevent domain takeover; validate
    DNS/ownership before activation.
-   Export archives must not include secrets, credentials, private
    uploads or other customers' data.

## Definition of done

A feature is done only when its UI and/or API behavior is implemented,
loading and error states exist, authorization and validation are covered
where applicable, tests or a documented manual verification are
performed, and relevant documentation is updated.
