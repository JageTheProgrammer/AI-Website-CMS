<div align="center">

<p align="center">
  <img src="./images/polityra-cms-banner.png" alt="Polityra CMS: Open content. Full control. Better websites." width="100%">
</p>

<br />

**An open-source, AI-powered website builder: describe an idea, get an editable website, refine it with AI, and export the source code.**

[Open Polityra](https://github.com/Polityra) · [Report an issue](../../issues) · [License](./LICENSE)

</div>



---

## About

**Polityra CMS** turns natural-language prompts into real, editable websites. You describe what you need, the AI helps create a complete website project, and you keep refining it through live preview, follow-up prompts and direct editing. The result is a project you own: the source code can be exported and kept running outside the platform.

Polityra CMS combines a Next.js web app, an Express API, a shared component library and an Electron desktop app. MySQL is the default API database; desktop and local mode can use SQLite. AI providers are configured on the server, so no model or provider is hard-coded into the application.

> **Status:** under active development. Some planned capabilities, such as production hosting, custom-domain workflows and data integrations, may not be fully implemented yet. See the READMEs in each app for current setup details.

## Part of Polityra

Polityra CMS is owned and maintained by the **[Polityra](https://github.com/Polityra) organization**, the same organization that owns **Open Polityra**, our open-source AI platform for data-driven geopolitical and strategic analysis.

| Project | What it is |
| --- | --- |
| **Open Polityra** | Open-source platform for strategic analysis, forecasting and research across economics, geopolitics, security and resilience. |
| **Polityra CMS** (this repository) | Open-source AI website builder and CMS for creating, editing, previewing and publishing websites. |

Both projects share the same visual identity and the same principles: open knowledge, transparent methods and tools people can own and inspect.

## Features

- **Prompt to website:** describe your business or idea in natural language and generate a first version with progress and recoverable errors.
- **Live preview:** see changes immediately and refine the site with follow-up prompts.
- **Export your code:** download the project's source code as a reproducible archive with a README, dependency manifest, setup instructions and `.env.example` (never real secrets).
- **GitHub export:** connect GitHub and export a project to a repository.
- **Deployment and domains:** publish to a platform subdomain and prepare custom domains, with ownership verification.
- **Database configuration:** a clear path to data and backend features, without claiming a database is configured before credentials, schema and connectivity actually work.
- **Version history:** keep previous versions and restore an earlier iteration.
- **Shared component library:** reusable website components, schemas, renderer and editor bridge in `@cms/component-library`.
- **Dashboard:** projects, deployments, domains, billing, profile, support, and an admin area for users and activity.
- **Desktop app:** Electron packaging of the API and web app for local use.

## Product principles

1. **Prompt to working website:** users describe what they need and the AI helps create and iteratively modify a complete project.
2. **Ownable output:** generated projects are exportable as source code with setup instructions and an honest list of required services and environment variables.
3. **Hosting choice:** publish to a platform-managed subdomain, and support custom domains when configured.
4. **Honest data features:** do not imply a database is configured until it actually works.
5. **One consistent product UI:** shared design tokens, reusable components, clear loading, empty, error and success states, responsive layouts and keyboard accessibility.
6. **Provider-independent AI:** local Ollama for development and production providers behind a provider interface.
7. **Secure by default:** isolate customer projects and generated code, validate authorization server-side, keep secrets server-side, and treat model output and prompts as untrusted input.

## Technology stack

| Area | Technology |
| --- | --- |
| Web | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Radix UI, Lucide icons, React Hook Form, Zod |
| API | Node.js, TypeScript, Express 5, Zod validation, `mysql2` |
| Database | MySQL by default; SQLite for desktop/local mode through `node:sqlite` (Node.js 22.5 or later) |
| AI providers | Ollama, Anthropic, Groq and an OpenAI-compatible adapter, all behind a provider interface |
| Shared package | `@cms/component-library`: component definitions, document validation, rendering and editor integration |
| Desktop | Electron with `electron-builder` |
| Monorepo | npm workspaces and Turborepo |

These reflect the project manifests and source today. Check the package manifests before changing dependencies or relying on a particular script.

## Project structure

```text
.
├── LICENSE
├── README.md
├── PROMPT_LOCAL_AI.md                 # Prompt and notes for local AI development
├── turbo.json
├── package.json
├── images/                            # Brand assets (logos, app icon, banner)
├── app/
│   ├── api/                           # Express API and persistence
│   │   ├── lib/                       # Environment, database, logging, audit log, SQLite pool
│   │   ├── sql/                       # MySQL/SQLite schemas and migrations
│   │   └── src/
│   │       ├── middleware/            # Authentication, authorization, CSRF, validation, errors, request IDs
│   │       ├── modules/               # AI providers, document store, public site config
│   │       ├── routes/                # auth, projects, generation, documents, domains,
│   │       │                          # deployments, billing, customer, admin, support,
│   │       │                          # public-sites, health
│   │       ├── app.ts
│   │       └── index.ts
│   ├── web/                           # Next.js App Router application
│   │   ├── public/                    # Static assets, fonts, icons, images
│   │   └── src/
│   │       ├── app/                   # Route groups and API route handlers
│   │       │   ├── (base)/            # Marketing pages: home, features, pricing, about, FAQ,
│   │       │   │                      # contact, privacy, terms, cookies
│   │       │   ├── (auth)/            # Login and signup
│   │       │   ├── (dashboard)/       # Dashboard, projects, editor, deployments, domains,
│   │       │   │                      # billing, profile and admin pages
│   │       │   └── api/               # BFF route handlers (auth, projects, generate, github,
│   │       │                          # stripe, documents, domains, and more)
│   │       ├── components/            # ui, layout, navigation, editor, dashboard, forms, ...
│   │       ├── lib/                   # API client, auth, GitHub, validation, utilities
│   │       └── types/
│   └── desktop/                       # Electron desktop shell and packaging
│       ├── scripts/prepare.mjs        # Builds and copies the API, web app and shared library
│       └── src/                       # Electron main and preload processes
└── packages/
    ├── component-library/             # @cms/component-library
    │   └── src/                       # components, catalog, document, editor bridge, renderer, theme
    └── image-library/                 # Shared image assets
```

`app/desktop/app/` is generated by `app/desktop/scripts/prepare.mjs` for packaging. The maintained source lives in `app/api/`, `app/web/` and `packages/`. Build output such as `dist/` and `.next/` is not source code.

## Architecture boundaries

### Web app (`app/web/`)

Owns the user experience: marketing pages, authentication screens, dashboard, project creation, prompt editor, live preview, project settings, deployment and domain UI, billing and profile pages, and the admin UI. It talks to the Express API through a single typed API client.

Next.js route handlers under `app/web/src/app/api/` act as a backend-for-frontend layer. Business and domain logic belongs in the Express API. Existing handlers are being inventoried and migrated carefully, and nothing is removed until its callers are confirmed.

### API (`app/api/`)

Owns business rules and trusted operations: identity and session verification, authorization, project CRUD, AI orchestration, generated-file operations, database configuration, preview and build jobs, deployment, domain verification, usage limits, billing, audit events and support. The API is the authority for permissions and state changes. A hidden button in the UI is not authorization.

### Generated customer projects

A generated site is a separate artifact from the CMS dashboard. Source files, dependency metadata, settings, version history and deployment metadata are stored per project. Builds must run in a restricted, isolated environment, never in the main API process, and platform secrets must never be exposed to generated apps.

## Getting started

**Requirements:** Node.js 22.5 or later, npm, and MySQL (or SQLite for local mode).

Install dependencies and run everything from the repository root:

```bash
npm install
npm run dev
```

Turborepo starts the API at <http://localhost:4000> and the web app at <http://localhost:3000>. Configure environment variables first, as described in the READMEs of `app/api` and `app/web`.

You can also run each app separately:

```bash
# API
cd app/api
cp .env.example .env          # then edit your database settings
npm install
npm run dev                   # http://localhost:4000

# Web
cd app/web
cp .env.example .env.local    # NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
npm install
npm run dev                   # http://localhost:3000
```

A typed mock adapter (`app/web/src/lib/api/mock.ts`) lets you work on the frontend without a running backend. Mock data is always clearly labeled as demo content.

For local AI development with Ollama, see [`PROMPT_LOCAL_AI.md`](./PROMPT_LOCAL_AI.md).

## Security

- Passwords hashed with bcrypt.
- Secure, HttpOnly session cookies, with CSRF protection for state-changing requests.
- Project ownership and role permissions enforced server-side on every operation.
- Input validation at every API boundary with Zod.
- Helmet security headers, a CORS origin allowlist, and rate limiting on authentication and globally.
- AI model output and user prompts treated as untrusted and validated before use.
- Secrets never returned to clients, committed to the repository, or written to logs.
- Payment webhooks verified cryptographically and handled idempotently.
- Custom domains verified before activation to prevent domain takeover.
- Export archives exclude secrets, credentials, private uploads and other customers' data.

Never commit `.env` files, API keys, cookies, tokens or private keys. Commit `.env.example` files with placeholders only. To report a vulnerability, follow the private reporting instructions in [SECURITY.md](./SECURITY.md) rather than opening a public issue.

## Contributing

Contributions are welcome. Please follow the [contribution guide](./CONTRIBUTING.md) and [Code of Conduct](./CODE_OF_CONDUCT.md). Keep changes focused, run the available lint, typecheck, tests and production build before opening a pull request, and update documentation when architecture, scripts, environment variables or contracts change. A feature is done only when its UI and API behavior, loading and error states, authorization and validation, and tests or documented manual verification are in place.

For project decision-making, see [governance](./GOVERNANCE.md); for reporting
security issues, see the [security policy](./SECURITY.md). The repository
layout is described in [STRUCTURE.md](./STRUCTURE.md).

## License

Original code and documentation in this repository are licensed under the
[Apache License, Version 2.0](./LICENSE). Third-party dependencies, assets and
other included materials may have separate terms; see
[LICENSES.md](./LICENSES.md) and [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md).

---

<p align="center">
  <sub>Polityra CMS is part of the <a href="https://github.com/Polityra">Polityra</a> organization, the home of Open Polityra.</sub>
</p>