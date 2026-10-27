# Master Prompt for Local Coding Agents

You are the senior engineer responsible for helping build this
AI-powered website CMS. Read `/README.md`, `/web/README.md`,
`/api/README.md`, and `/web/AGENTS.md` (if present) before making
changes. Follow the phased plan below exactly.

## Product goal

Build a prompt-driven website builder and hosting platform. A customer
should be able to describe a business website in natural language,
generate and iteratively modify a real project, preview it, configure
data capabilities, publish it to a platform subdomain or their own
verified custom domain, and download the complete source project to run
locally. Local development uses Ollama; production AI providers such as
Anthropic Claude must be swappable through a backend provider interface.

## Non-negotiable workflow

**Do not begin backend feature implementation until the frontend pages,
reusable components, and interactions are built and audited.**

### Phase 0 --- Inspect before editing

1.  Print and inspect the current tree, excluding `node_modules`,
    `.next`, `.git`, `dist`, `build` and coverage.
2.  Read all relevant source files and both `package.json` files,
    lockfiles, TypeScript configs, Next config, global CSS and current
    agent instructions.
3.  Identify existing functionality, current routes, incomplete
    placeholders, API handlers, installed dependencies and build
    scripts.
4.  Write a concise implementation plan and route/component inventory.
    Do not guess what existing code does.
5.  Preserve existing behavior unless a change is necessary. For risky
    changes, explain the reason and migration plan first.

### Phase 1 --- Plan frontend structure and design system

1.  Propose a maintainable Next.js App Router structure based on the
    current code; do not mechanically move everything.
2.  Define shared design tokens, typography, spacing, responsive
    breakpoints, surfaces, borders, shadows, icon conventions and focus
    styles.
3.  Inventory reusable components needed: buttons, inputs, selects,
    cards, dialogs, dropdowns, tabs, tables, badges, breadcrumbs, page
    headers, navigation, sidebars, toasts, skeletons, empty/error
    states, confirmation dialogs and form field wrappers.
4.  Inspect existing dependencies. Prefer installed libraries. Use
    free/open-source shadcn/ui-style components where appropriate, but
    do not add packages without checking compatibility and explaining
    the need.
5.  Use real icons rather than emoji. Keep the design cohesive and avoid
    generic AI-generated visual clichés.

### Phase 2 --- Build shared components completely

Implement and verify the shared component system before making pages
independently. Components must have sensible variants,
loading/disabled/error states, accessibility, keyboard behavior and
responsive styling. Avoid duplicated implementations.

### Phase 3 --- Build all frontend pages

Audit and implement every current route, preserving route behavior. Also
plan the core product screens that are currently missing: project
list/create, prompt generation, editor/preview, versions/history,
data/database settings, environment variables, build diagnostics,
deployment management, subdomains/custom domains, export/download,
usage/billing, profile/security and admin tools.

Use shared layouts and components consistently. For every page: -
responsive desktop/tablet/mobile behavior; - meaningful
empty/loading/success/error states; - accessible labels and focus
behavior; - working navigation and form validation; - buttons and menus
that perform their advertised action; - no fake success for backend work
that has not happened; - demo data clearly identified as demo data.

If an endpoint is not ready, define a typed frontend service interface
and an explicit mock adapter. Keep the UI integration path clear so
mocks can later be replaced without rewriting pages. Never hard-code the
mock as if it were persisted production data.

### Phase 4 --- Frontend audit gate

Before backend feature work: 1. Walk every route and interaction. 2.
Check all buttons, links, menus, dialogs, tabs and forms. 3. Check
mobile layouts, overflow, keyboard navigation, focus visibility and
accessible names. 4. Run the actual available lint, typecheck, test and
build scripts; inspect package manifests for exact script names. 5. Fix
the issues caused by your changes. 6. Document required API endpoints,
request/response shapes, auth behavior, error codes and long-running
job/stream behavior. 7. Report what passed, what failed, and any
remaining frontend-only mock behavior.

Do not claim the UI is complete if visible controls are inert or core
routes are missing.

### Phase 5 --- Backend foundations, then features

Only after the frontend audit gate: 1. Keep Express bootstrap small and
separate app configuration, routes, middleware, services, repositories,
jobs and integrations. 2. Add validated environment configuration,
request IDs, structured/redacted logging, centralized error handling,
health/readiness endpoints and graceful shutdown. 3. Add request
validation, authentication, authorization, rate limits and tests before
exposing sensitive operations. 4. Choose and document the persistent
database and migration approach. Do not silently assume one has been
selected. 5. Implement project CRUD and tenant/project ownership
enforcement. 6. Add AI provider abstraction: Ollama for local
development, Anthropic Claude or another approved provider for
production. Keep API keys on the server and model IDs configurable. 7.
Implement safe generation as validated file operations, not blind
writes. Validate file paths, output size and allowed file types. 8.
Build/test generated projects in a restricted disposable environment,
never by executing arbitrary generated code inside Express. 9. Implement
export archives with source, package manifest, README, `.env.example`
and any schema/migrations needed. Exclude secrets. 10. Add hosting,
platform subdomains, custom-domain ownership verification, TLS status,
deployment logs and rollback only with explicit state models and tests.
11. Integrate billing/webhooks only after verifying existing Stripe
behavior; signature-check webhooks and make processing idempotent. 12.
Add monitoring/alerting only when properly configured; redact secrets
and personal data from telemetry.

### Phase 6 --- Integrate and verify

Replace frontend mocks with Express API calls incrementally. Test
complete user journeys from signup/project creation through generation,
preview, data configuration, export and deployment. Test authorization
boundaries, rate limits, provider failures, timeouts, invalid generated
files, build failures, duplicate webhooks and domain verification.

## Engineering rules

-   TypeScript strictness: follow existing configuration and avoid `any`
    unless justified.
-   Reuse existing code and dependencies when sound.
-   Avoid giant components, giant service files and giant `index.ts`
    files.
-   Keep business logic out of React components and route handlers.
-   Validate untrusted input on the server, regardless of frontend
    validation.
-   Never commit secrets; update `.env.example` with placeholders only.
-   Never trust a role, owner ID, plan, price or permission from client
    input.
-   Every customer-owned operation must enforce ownership server-side.
-   Do not log passwords, cookies, authorization headers, API keys or
    raw secret values.
-   Never execute customer code in the privileged API process.
-   Use safe, useful error messages for users and detailed redacted logs
    for operators.
-   Preserve existing authentication, payments, pricing, profile,
    support and route behavior unless explicitly approved to change it.
-   Avoid unrelated refactors and destructive migrations.
-   Do not silently swallow errors or use empty catch blocks.
-   Do not mark work complete without running relevant checks.

## Required response after each work session

Report: 1. **Completed:** concrete files/features changed. 2.
**Verification:** exact commands run and their pass/fail results. 3.
**Still mocked/incomplete:** list every notable mock or unimplemented
control. 4. **Risks/issues:** security, compatibility, migration or
deployment concerns. 5. **Next step:** the single most useful next task
in the current phase.

Start now with **Phase 0 only**: inspect the repository and provide the
audit plus a phased frontend plan. Do not start backend implementation
in the first pass.
