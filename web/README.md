# Frontend --- Next.js

## Purpose

The `web/` app is the customer-facing CMS dashboard and marketing
website. It owns the visual experience and calls the Express API through
a typed client. It should not own trusted business logic or connect
directly to production databases.

## Current folder structure

The tree below reflects the current `web/src` source. Route groups in
parentheses organize layouts but do not appear in the URL. Dynamic
segments such as `[projectId]` and `[slug]` are shown literally.

```text
web/
├── public/                            # Static assets
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx         # /login
│   │   │   ├── signup/page.tsx        # /signup
│   │   │   └── layout.tsx
│   │   ├── (base)/
│   │   │   ├── page.tsx              # /
│   │   │   ├── about/page.tsx        # /about
│   │   │   ├── contact/page.tsx      # /contact
│   │   │   ├── cookies/page.tsx      # /cookies
│   │   │   ├── faq/page.tsx          # /faq
│   │   │   ├── features/page.tsx     # /features
│   │   │   ├── pricing/page.tsx      # /pricing
│   │   │   ├── privacy/page.tsx      # /privacy
│   │   │   └── terms/page.tsx        # /terms
│   │   ├── (dashboard)/
│   │   │   ├── actions.ts
│   │   │   ├── admin/users/page.tsx  # /admin/users
│   │   │   ├── billing/page.tsx      # /billing
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx          # /dashboard
│   │   │   │   ├── admin/page.tsx    # /dashboard/admin
│   │   │   │   └── customer/page.tsx # /dashboard/customer
│   │   │   ├── deployments/page.tsx  # /deployments
│   │   │   ├── domains/page.tsx      # /domains
│   │   │   ├── editor/[projectId]/page.tsx
│   │   │   ├── layout.tsx
│   │   │   ├── profile/
│   │   │   │   ├── admin/            # Profile, history, payments, settings
│   │   │   │   └── customer/         # Profile, history, payments, settings
│   │   │   └── projects/
│   │   │       ├── page.tsx          # /projects
│   │   │       └── new/page.tsx      # /projects/new
│   │   ├── api/                      # Next.js API route handlers (BFF)
│   │   │   ├── admin/                # Activity, stats, users
│   │   │   ├── auth/                 # Login, logout, session, signup, verification
│   │   │   ├── billing/              # Billing
│   │   │   ├── customer/             # Activity, deployments, domains, projects, settings
│   │   │   ├── deployments/          # Deployment operations
│   │   │   ├── documents/            # Documents, export, restore, components
│   │   │   ├── domains/              # Domain operations
│   │   │   ├── generate/             # Generation
│   │   │   ├── github/               # OAuth, repositories, export
│   │   │   ├── pricing/              # Pricing
│   │   │   ├── profile/              # Profile, update, upload, removal
│   │   │   ├── projects/             # Projects, preview, versions, subdomains
│   │   │   ├── stripe/               # Payments, cancellation, webhook
│   │   │   └── support/              # Support
│   │   ├── error.tsx
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── loading.tsx
│   │   └── not-found.tsx
│   ├── components/
│   │   ├── dashboard/
│   │   ├── editor/
│   │   ├── feedback/
│   │   ├── forms/
│   │   ├── layout/
│   │   ├── marketing/
│   │   ├── navigation/
│   │   │   └── universal/
│   │   ├── profile/
│   │   ├── projects/
│   │   ├── shared/
│   │   │   └── universal/
│   │   └── ui/
│   ├── lib/
│   │   ├── api/                      # API client, proxies and mock adapter
│   │   ├── github.ts                 # GitHub integration helpers
│   │   └── utils/                     # Shared utilities
│   └── types/
├── AGENTS.md
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── package-lock.json
└── tsconfig.json
```

The `api/` directory contains Next.js route handlers and is distinct from
the repository-level Express service in `../api/`. Keep these handlers
working unless a specific route is deliberately migrated. Some component
directories are currently empty; add files where they fit existing
conventions rather than treating every directory as implemented
functionality. Update this tree when routes or source folders change.

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

Image uploads from the visual editor are embedded in the versioned project
document, so they persist with the site and are included in static/GitHub
exports. Individual source images are limited to 1 MB; the API accepts up
to 12 MB on document routes to support projects with several uploaded images.
Other API JSON requests use a 1 MB limit.

## GitHub export

The editor's Review tab can validate the exported static pages and push
them to a repository owned by the connected GitHub account. Configure a
GitHub OAuth App with the callback URL
`http://localhost:3000/api/github/callback` for local development (use the
deployed app URL in production), then set these server-only variables for
the Next.js app:

- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `GITHUB_OAUTH_REDIRECT_URI` (optional locally; set it explicitly in
  production to the registered callback URL)

The OAuth flow requests GitHub's `repo` scope so private repositories can
be selected; this is a broad permission granted by GitHub OAuth Apps. The
access token is stored in an HTTP-only cookie and is not returned to browser
JavaScript or saved in the CMS database. Export creates one commit containing
the generated HTML pages and `robots.txt` on the repository's default branch.

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
