# Frontend --- Next.js

## Purpose

The `web/` app is the customer-facing CMS dashboard and marketing
website. It owns the visual experience and calls the Express API through
a typed client. It should not own trusted business logic or connect
directly to production databases.

## Current structure

The repository currently uses the Next.js App Router and has these route
groups and pages:

-   `(auth)`: `/login`, `/signup`
-   `(base)`: `/`, `/about`, `/contact`, `/cookies`, `/dashboard/admin`,
    `/dashboard/customer`, `/faq`, `/legal`, `/pricing`, `/privacy`,
    `/profile/admin/*`, `/profile/customer/*`
-   `app/api/*`: existing Next.js route handlers for auth, generation,
    pricing, profile, Stripe and support
-   `components/navigation/*`: admin/customer dashboard navigation and
    universal navbar/footer
-   `components/shared/*`: button, input and loading components

Important: route groups do not appear in URLs. Preserve route behavior
while auditing. There are apparent naming inconsistencies such as
`payements` and `sucess`; verify usage before renaming and provide
redirects/compatibility if necessary.

## Recommended frontend organization

Adapt this to existing files rather than replacing everything
mechanically:

``` text
src/
├── app/
│   ├── (marketing)/
│   ├── (auth)/
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   ├── projects/
│   │   ├── editor/[projectId]/
│   │   ├── domains/
│   │   ├── deployments/
│   │   ├── settings/
│   │   └── billing/
│   ├── api/                 # Keep only intentional BFF/Next handlers
│   ├── error.tsx
│   ├── loading.tsx
│   ├── not-found.tsx
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                  # Reusable accessible primitives
│   ├── layout/              # App shell, sidebar, header, page container
│   ├── marketing/
│   ├── dashboard/
│   ├── projects/
│   ├── editor/
│   ├── forms/
│   └── feedback/             # Toasts, errors, skeletons, empty states
├── features/                 # Feature-level UI/hooks where useful
├── lib/
│   ├── api/                  # Typed Express API client and endpoint functions
│   ├── auth/
│   ├── validation/
│   └── utils/
├── types/
└── styles/
```

Do not create empty folders just to match this tree. Use a clear,
consistent convention and keep components colocated when that improves
maintainability.

## UI-first implementation rules

1.  Audit the current code and package versions first.
2.  Define visual tokens and a component inventory before building
    pages.
3.  Finish shared layout/navigation and common UI components before
    implementing page details.
4.  Build every existing page and planned core product page with
    consistent patterns.
5.  Connect buttons, links, forms, menus, tabs and dialogs to real
    frontend behavior. If a backend endpoint is not ready, use an
    explicit typed mock adapter; never show fake success for an
    operation that was not performed.
6.  Complete a route-by-route UX audit before implementing backend
    business logic.

## Design direction

-   Modern, carefully crafted React SaaS UI with a clear hierarchy and
    restrained visual effects.
-   Use shadcn/ui-style patterns and accessible primitives. Check
    installed dependencies first; use free/open-source packages only
    unless explicitly approved.
-   Use Lucide-style icons where available, not emoji.
-   Prefer consistent design tokens over per-page one-off colors and
    spacing.
-   Avoid excessive gradients, glass effects, oversized headings, random
    rounded cards and generic "AI startup" styling.
-   Use semantic HTML, visible focus indicators, proper labels, keyboard
    navigation and accessible dialogs.
-   Build responsive states for desktop, tablet and mobile.
-   Add useful skeleton, empty, validation, error, disabled, success and
    confirmation states.
-   Keep real data distinct from demo data. Never invent testimonials,
    user counts, revenue, deployments or usage statistics.

## Core pages and user flows to plan

Preserve existing pages and include missing product pages in the route
inventory before implementation.

-   Marketing: home, product/features, pricing, FAQ, about, contact,
    privacy, cookies and legal.
-   Auth: sign up, login, verification and recovery if supported by the
    existing product.
-   Dashboard: overview, project list, create project, recent activity
    and account status.
-   Project creation: prompt input, business/site type, optional
    preferences, generation progress and cancellation where supported.
-   Editor: preview, prompt-based edits, version/history, file or
    settings view, responsive preview, build diagnostics.
-   Data: database connection/status, schema/migrations or data models,
    environment variables (secrets masked), API/data features.
-   Deployments: deploy status, logs, version selection, rollback if
    supported, platform subdomain.
-   Domains: add custom domain, DNS instructions, ownership
    verification, TLS status.
-   Export: download source archive, setup guide, dependency manifest
    and `.env.example`.
-   Account: profile, security, usage/limits, billing/payments and
    settings.
-   Admin: user/project/support/usage oversight, audit history and
    configuration; enforce admin permissions in the API too.

Do not remove an existing page simply because it is not listed above.
Map all current routes and decide deliberately whether each is retained,
consolidated or redirected.

## API integration

-   Use one typed API client rather than scattering raw `fetch()` calls.
-   Configure the API base URL from a public frontend environment
    variable such as `NEXT_PUBLIC_API_BASE_URL`; only public, non-secret
    values may use the `NEXT_PUBLIC_` prefix.
-   Centralize JSON parsing, error normalization, credentials behavior,
    timeout/abort handling and request correlation where practical.
-   Define shared request/response types. Keep server-only secrets out
    of client bundles.
-   Never trust a client-supplied role, user ID, project owner ID or
    plan entitlement.
-   Handle `401`, `403`, `404`, `409`, `422`, `429` and `5xx` states
    intentionally.
-   Do not put production database credentials or AI provider keys in
    Next.js client code.
-   Inventory existing `web/src/app/api/*` routes. Migrate business
    logic to Express only after identifying callers and maintaining
    behavior. Do not remove working auth or Stripe handlers blindly.

## Accessibility and quality

-   Every input has a label and useful validation.
-   Every button has a clear accessible name.
-   Icon-only controls have an accessible label.
-   Focus is visible; dialogs manage focus and Escape behavior.
-   No horizontal overflow at common viewport widths.
-   Forms prevent duplicate submissions and show actionable errors.
-   Use `next/image` appropriately for local/remote assets and
    meaningful alt text.
-   Run the scripts actually defined in `package.json` (inspect before
    assuming names), plus typecheck/build and tests where available.
-   Verify all links and buttons manually or through tests. A visual
    control with no behavior is not complete.

## Frontend completion report

When finishing a phase, report: - routes completed and routes
intentionally deferred; - shared components added or changed; -
interactions verified; - commands run and results; - known issues and
API contracts needed next.

See root `README.md` and `../PROMPT_LOCAL_AI.md` for product constraints
and phase order.
