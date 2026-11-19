# Backend — Express + TypeScript + Local MySQL

## Purpose

The `api/` service is the trusted application API. It owns business rules, authentication and authorization, persistence, AI orchestration, generated-project artifact management, deployment workflows and operational diagnostics.

It must never run arbitrary customer-generated code inside the main API process.

**Database standard:** use a local MySQL server for development, with the application database named `ai_cms` by default. Use `mysql2` or an already-installed, suitable MySQL driver and environment-based connection settings. Do not replace MySQL with SQLite, PostgreSQL or a hosted database unless the project owner explicitly approves an architectural change.

Production database credentials and hostnames must be supplied through deployment environment variables. Never hard-code them.

## Current folder structure

The tree below reflects the current API source and configuration:

```text
api/
├── lib/                              # Shared infrastructure and helpers
│   ├── audit-log.ts                  # Audit event recording
│   ├── db.ts                         # MySQL/SQLite database selection
│   ├── env.ts                        # Environment configuration and validation
│   ├── logger.ts                     # Application logging
│   └── sqlite-pool.ts                # SQLite adapter for the MySQL pool interface
├── sql/
│   ├── migrations/                   # Numbered/versioned schema changes
│   ├── schema.sql                    # MySQL initial schema
│   └── schema.sqlite.sql             # SQLite initial schema
├── src/
│   ├── middleware/
│   │   ├── authenticate.ts
│   │   ├── authorize.ts
│   │   ├── csrf.ts
│   │   ├── error-handler.ts
│   │   ├── request-id.ts
│   │   └── validate.ts
│   ├── modules/
│   │   ├── ai/providers/             # Provider interfaces and adapters
│   │   ├── documents/                # Document persistence
│   │   └── sites/                    # Public site configuration
│   ├── routes/                       # Express route modules
│   ├── app.ts                        # Express application and middleware wiring
│   └── index.ts                      # Server bootstrap
├── AGENTS.md                         # Backend-specific contributor instructions
├── package.json
├── package-lock.json
├── README.md
└── tsconfig.json
```

`desktop/app/api/` is generated when packaging the Electron app; it is not
the maintained API source. The desktop/local configuration can select the
SQLite adapter, while MySQL remains the default driver. Inspect the source
and package manifest before changing routes, modules, or dependencies.
Keep `src/index.ts` as the bootstrap and composition root; move domain
logic into modules rather than expanding it into one giant file.

## 1. Local MySQL setup

### 1.1 Install and start MySQL on macOS

If MySQL is not installed and Homebrew is available:

```bash
brew install mysql
brew services start mysql
mysql --version
```

Connect to your local server using the authentication configured on your machine:

```bash
mysql -u root -p
```

Some local installations may permit `mysql -u root` without a password. Use the authentication method configured on your machine. Never put the MySQL root password in the application environment.

### 1.2 Create the database and tables

From the repository root, run:

```bash
mysql -u root -p < api/sql/schema.sql
```

This initializes the `ai_cms` application database and creates the initial tables.

The script uses `CREATE TABLE IF NOT EXISTS` for initial setup, but it is not a migration system and will not alter existing columns. Use numbered migrations for future schema changes.

### 1.3 Create a local application user

Connect as a MySQL administrator:

```bash
mysql -u root -p
```

Run the following SQL, replacing the example password with a strong, unique local password:

```sql
CREATE USER IF NOT EXISTS 'ai_cms_app'@'127.0.0.1'
  IDENTIFIED BY 'REPLACE_WITH_A_STRONG_LOCAL_PASSWORD';

GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, REFERENCES
  ON ai_cms.* TO 'ai_cms_app'@'127.0.0.1';

FLUSH PRIVILEGES;
```

If MySQL resolves your connection as `localhost` rather than `127.0.0.1`, configure the matching account host and connection host consistently.

Do not use the MySQL root account from Express.

The application account is scoped to `ai_cms`. It does not have permission to create arbitrary customer databases.

### 1.4 Configure `api/.env`

Create `api/.env` locally, using the following as a template. Never commit this file.

```dotenv
NODE_ENV=development
PORT=4000
HOST=127.0.0.1
SESSION_SECRET=REPLACE_WITH_AT_LEAST_32_RANDOM_CHARACTERS
CORS_ORIGIN=http://localhost:3000

DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=ai_cms
DB_USER=ai_cms_app
DB_PASSWORD=REPLACE_WITH_A_STRONG_LOCAL_PASSWORD
DB_CONNECTION_LIMIT=10

# Local development AI
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=REPLACE_WITH_A_MODEL_INSTALLED_IN_OLLAMA

# Production AI provider credentials belong in deployment secrets.
# ANTHROPIC_API_KEY=
# ANTHROPIC_MODEL=

# Ollama is primary when AI_PROVIDER=ollama. Groq is used only if Ollama is
# unavailable; this must be a Groq API key, not an Anthropic/Claude API key.
GROQ_API_KEY=REPLACE_WITH_A_GROQ_API_KEY
GROQ_MODEL=openai/gpt-oss-120b
# GROQ_MAX_TOKENS=8192

# Configure this only when implementing application-level encryption.
# Use the exact format and length required by the encryption implementation.
APP_ENCRYPTION_KEY=REPLACE_WITH_A_SECURE_LOCAL_SECRET
```

`SESSION_SECRET` must contain at least 32 non-whitespace characters. Set
`CORS_ORIGIN` to the exact comma-separated frontend origins; wildcard
origins and `null` are rejected. General JSON requests are limited to
1 MB, while document routes allow up to 12 MB for embedded project images.
The API also applies global, authentication, generation, and admin rate
limits. Unsafe browser requests are checked against the configured
origins; server-to-server requests without browser origin headers remain
supported.

`GROQ_API_KEY` is optional when Ollama is the primary provider, but required to
use its fallback. Keep it in the API server's environment or deployment
secrets; never expose it through a `NEXT_PUBLIC_` variable or commit it.

Add `api/.env.example` containing placeholder values only. Ensure `.env` is ignored by Git.

Never expose MySQL credentials or AI provider keys through client-side environment variables.

### 1.5 Verify database connectivity

```bash
mysql \
  --host=127.0.0.1 \
  --port=3306 \
  --user=ai_cms_app \
  --password \
  ai_cms \
  -e "SELECT DATABASE(), VERSION();"
```

Use the actual scripts declared in `api/package.json` to start the API.

Implement a readiness endpoint that verifies database connectivity with a bounded timeout. The liveness endpoint should report whether the application process is alive.

## 2. SQL schema

## Publishing projects on `maatix.fi`

Generated component-library sites are served directly from their validated
document records by the API; generated code is not executed on the VPS. Set
`PUBLIC_SITE_DOMAIN=maatix.fi` in the API environment. A project reserves an
available hostname such as `portfolio.maatix.fi` at creation. If its preferred
name is taken, the API assigns the next available suffix. After generation
succeeds, the API publishes the project and records a successful platform
deployment. Published editor changes update the live project document.

For the VPS:

1. Apply `api/sql/migrations/20261029_public_project_subdomains.sql` once to
   the existing database. It assigns hostnames to active projects and publishes
   existing validated generated documents.
2. Point both the `maatix.fi` A record and wildcard `*.maatix.fi` A record at
   the VPS public IPv4 address. Add corresponding AAAA records only if the VPS
   is reachable over IPv6.
3. Obtain a TLS certificate covering both `maatix.fi` and `*.maatix.fi`.
   Wildcard certificates require DNS-01 validation with your DNS provider.
4. Install and enable `deploy/nginx/maatix.fi.conf`. It routes the apex site to
   Next.js on `127.0.0.1:3000` and project hostnames to the API on
   `127.0.0.1:4000`.
5. Ensure the Next.js app and API are supervised services listening on those
   loopback ports; keep the API, database, and Next.js ports closed to public
   ingress. Expose only ports 80 and 443 through the firewall.
6. Run `nginx -t` and reload Nginx. Verify the apex, wildcard TLS certificate,
   and a published project hostname from outside the VPS.

The wildcard DNS and Nginx/TLS steps require access to the domain's DNS control
panel and the VPS. The application cannot complete those infrastructure steps
from the CMS itself.

The initial schema is stored in:

```text
api/sql/schema.sql
```

It includes the following platform tables:

- `users`
- `sessions`
- `password_reset_tokens`
- `email_verification_tokens`
- `projects`
- `project_versions`
- `project_files`
- `generation_jobs`
- `project_databases`
- `deployments`
- `domains`
- `usage_events`
- `subscriptions`
- `payments`
- `support_tickets`
- `audit_logs`

The schema is a starting point and must be aligned with the actual API contracts before frontend flows are connected.

Creating a table does not implement the associated integration. Email delivery, Stripe, domain verification, generation workers, encryption and hosting still require application code and suitable credentials.

### CMS database versus generated-site databases

The `ai_cms` database stores the CMS platform's own accounts, projects, versions, generation jobs, deployments and metadata.

The `project_databases` table records metadata for a customer's database connection. It does not automatically provision a database, create a schema, issue credentials or configure the generated site.

For local development, keep the CMS platform on the local MySQL server.

If generated customer websites need separate databases, implement a dedicated provisioning layer with:

- Isolated schemas or databases.
- Quotas and resource limits.
- Safe database naming.
- Least-privilege credentials.
- Encrypted credential storage.
- Migration management.
- Backup and recovery.
- Provisioning and deletion lifecycle management.

Do not grant the API account global database-creation privileges merely to make database provisioning easier. Never expose CMS database credentials to generated applications.

## 3. Suggested backend module layout

Build incrementally after frontend pages and API contracts have been audited. Avoid creating large numbers of empty placeholder modules.

```text
api/
├── lib/
│   ├── env.ts
│   ├── db.ts
│   └── logger.ts
├── sql/
│   └── schema.sql
├── migrations/
├── src/
│   ├── app.ts
│   ├── index.ts
│   ├── routes/
│   │   ├── health.routes.ts
│   │   ├── auth.routes.ts
│   │   ├── projects.routes.ts
│   │   ├── generation.routes.ts
│   │   ├── data.routes.ts
│   │   ├── deployments.routes.ts
│   │   ├── domains.routes.ts
│   │   ├── exports.routes.ts
│   │   ├── billing.routes.ts
│   │   └── admin.routes.ts
│   ├── middleware/
│   │   ├── request-id.ts
│   │   ├── authenticate.ts
│   │   ├── authorize.ts
│   │   ├── validate.ts
│   │   ├── rate-limit.ts
│   │   └── error-handler.ts
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── projects/
│   │   ├── ai/
│   │   │   ├── providers/
│   │   │   │   ├── ollama.provider.ts
│   │   │   │   └── anthropic.provider.ts
│   │   │   ├── ai.service.ts
│   │   │   └── prompt-builder.ts
│   │   ├── generation/
│   │   ├── data/
│   │   ├── deployments/
│   │   ├── domains/
│   │   ├── exports/
│   │   ├── billing/
│   │   └── audit/
│   ├── repositories/
│   ├── jobs/
│   ├── observability/
│   └── tests/
├── .env.example
├── README.md
└── AGENTS.md
```

This is a proposed organization, not a requirement to create empty folders or move every existing file immediately.

Keep the existing `lib/env.ts` if suitable. Avoid duplicate configuration parsing, circular imports and giant route handlers.

## 4. Database access conventions

- Use one shared MySQL connection pool, not a new pool per request.
- Use parameterized SQL for every value.
- Never concatenate user input into SQL statements.
- Keep SQL queries in repositories or data-access modules.
- Use transactions for related operations that must succeed or fail together.
- Close the connection pool during graceful shutdown.
- Set connection, query and request timeouts deliberately.
- Handle connection pool exhaustion without crashing the process.
- Store timestamps consistently in UTC.
- Normalize email addresses before insert and lookup.
- Use `utf8mb4` and InnoDB for transactional tables.
- Add numbered migrations after the initial schema.
- Test foreign keys, uniqueness, concurrency and transaction rollback.

Every operation involving customer-owned resources must enforce user and project ownership. A valid foreign key does not replace an authorization check.

Add tests proving that one user cannot access another user's projects, files, domains, jobs or billing records.

## 5. API and error conventions

Use versioned routes, for example:

```text
/api/v1
```

Use a consistent success and error response structure.

Example error:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Check the submitted fields.",
    "requestId": "request-id"
  }
}
```

- Validate route parameters, query strings, headers and request bodies at the boundary.
- Use meaningful HTTP status codes.
- Do not return `200` for failed operations.
- Do not expose stack traces, SQL text, filesystem paths, provider responses or credentials to clients.
- Use request IDs and structured logs.
- Propagate request IDs to asynchronous jobs and provider calls.
- Use bounded retries and backoff where safe.
- Make retries and webhooks idempotent where duplicate operations could have side effects.
- Gracefully shut down the HTTP server and database pool.

Keep business logic separate from Express route handlers.

## 6. Error monitoring and diagnostics

Implement reliable error handling from the beginning.

### Request IDs

Assign a request ID to every incoming request. Validate an upstream request ID before accepting it.

Include request IDs in logs, error responses and asynchronous job diagnostics.

### Structured logging

Use structured logs with fields such as:

- Timestamp.
- Severity.
- Request ID.
- Environment.
- HTTP method and route.
- HTTP status.
- Request duration.
- Safe user or project identifiers where appropriate.
- Error code.
- Provider and job status where relevant.

Never log passwords, cookies, authorization headers, API keys, database passwords, encryption keys, full connection strings or unredacted personal data.

Avoid logging complete request and response bodies by default.

### Centralized error handler

Implement centralized Express error middleware that distinguishes:

- Validation errors.
- Authentication failures.
- Authorization failures.
- Missing resources.
- Conflicting operations.
- Rate limits.
- Database failures.
- AI provider errors.
- Generation and build failures.
- Unexpected programming errors.

Return normalized errors to the client and detailed, redacted diagnostics to server logs.

Never silently swallow exceptions or expose internal stack traces in production responses.

### Health endpoints

Implement:

```text
GET /health/live
GET /health/ready
```

`/health/live` reports whether the application process is alive.

`/health/ready` checks required dependencies, including MySQL, using a bounded timeout.

Health endpoints must not expose credentials, connection strings or raw database errors.

### Error-monitoring integration

Consider a production error-monitoring service, such as Sentry, if approved.

Configure:

- Environment and release identifiers.
- Request correlation.
- Sensitive-data scrubbing.
- Appropriate sampling.
- Error reporting.
- Alerts for critical failures.

Do not claim monitoring is configured merely because a package is installed. Verify the DSN, deployment configuration, scrubbing behavior and actual event delivery.

### Operational metrics

Where the deployment environment supports it, monitor:

- API request latency.
- HTTP error rates.
- Database connection failures.
- MySQL pool exhaustion.
- AI provider errors and rate limits.
- Generation duration.
- Build failures.
- Deployment failures.
- Background job queue depth.

Set alerts for sustained failures and exhausted provider quotas.

## 7. AI provider architecture

The application must not be tightly coupled to one AI vendor or model.

Define a typed provider interface, such as:

```typescript
export interface AIProvider {
  generate(
    input: GenerateInput,
    options?: GenerateOptions
  ): Promise<GenerateResult>;
}
```

Adapt the interface to the actual generation requirements.

### Local development: Ollama

Development uses Ollama through configurable settings:

```dotenv
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=REPLACE_WITH_A_MODEL_INSTALLED_IN_OLLAMA
```

Requirements:

- Keep the endpoint and model configurable.
- Handle connection refusal and missing models.
- Bound generation timeouts and output sizes.
- Handle malformed or incomplete model output.
- Support cancellation where practical.
- Normalize errors before returning them to the frontend.
- Avoid unlimited automatic retries.
- Treat all model output as untrusted.

When `AI_PROVIDER=ollama`, a connection failure, timeout, missing Ollama model,
rate limit, or server error triggers the configured Groq fallback. Configure
`GROQ_API_KEY` and optionally `GROQ_MODEL` / `GROQ_MAX_TOKENS` in the API
environment. Job records are updated to identify Groq when it handles a
generation. The Claude/Anthropic API key is not valid for Groq.

### Production: Anthropic Claude

Production can use Anthropic Claude through a server-side API key.

Requirements:

- Keep `ANTHROPIC_API_KEY` server-side.
- Configure the model ID through validated environment settings.
- Do not hard-code a model ID throughout the codebase.
- Handle timeouts, rate limits and quota exhaustion.
- Normalize provider responses to internal application types.
- Track usage and cost metadata where available.
- Anthropic mode does not silently fail over to another provider.
- Never expose provider credentials in logs, generated projects, exports or client bundles.

Switching providers must not require rewriting the project-generation business logic.

### Treat model output as untrusted

- Validate structured output before applying it.
- Validate file paths, file types and output sizes.
- Reject path traversal and forbidden files.
- Never let model-generated tool calls bypass normal authorization.
- Do not blindly execute commands generated by a model.
- Never execute customer-generated code inside Express.
- Store safe, actionable diagnostics without leaking secrets or sensitive prompt content into logs.

Text generation alone does not guarantee a working website. Generated projects must be validated, built and tested in a controlled environment.

## 8. Project and file safety

Store project files with clear project, version and owner boundaries.

- Normalize paths.
- Reject absolute paths and `..` traversal.
- Prevent unsafe symlink traversal.
- Restrict forbidden files.
- Limit file counts and total project size.
- Limit individual file sizes and generated output.
- Limit build duration.
- Prevent generated code from reading API secrets or arbitrary host files.
- Restrict outbound network access from build environments where possible.
- Preserve versioned snapshots for recovery and rollback.

Never run arbitrary customer-generated code in the privileged API process.

Use restricted, disposable build workers, containers or an equivalent sandbox with resource limits, restricted filesystem access, no privileged host mounts, no production secrets and controlled network access.

Capture useful build diagnostics and redact any sensitive values.

## 9. Project exports

Users must be able to download generated projects and run them locally.

Exports should include the appropriate:

- Source code.
- Dependency manifests and relevant lockfiles.
- Project configuration.
- README with setup and execution instructions.
- `.env.example` with placeholders.
- Required database schemas and migrations.
- Static assets and other required project files.

Never include real `.env` files, provider keys, CMS database passwords, session secrets or another customer's private data.

An export is not complete merely because a ZIP file downloads. Verify that the archive contains the expected files and documents any services the customer must configure.

Clearly document features that depend on the CMS platform.

## 10. Database features for generated websites

The platform database and generated-project databases are separate concerns.

The CMS uses the local MySQL server during development.

Generated customer websites may need their own data stores. Before implementing provisioning, define:

- Database isolation and naming.
- Credential creation and encryption.
- Least-privilege access.
- Quotas and connection limits.
- Migration management.
- Backups and restoration.
- Provisioning and deletion lifecycle.
- Export and import behavior.

Never give generated applications CMS database credentials. Do not grant unrestricted database-creation privileges merely to simplify provisioning.

If database credentials must be persisted, encrypt them using an application-level encryption mechanism with a securely managed key. Never store the encryption key beside the encrypted values in the database.

## 11. Security baseline

### Environment and secrets

- Validate environment variables at startup.
- Fail clearly when required configuration is missing.
- Keep `.env` out of Git.
- Use `.env.example` with placeholder values only.
- Never return stored secret values.
- Use least-privilege service accounts.
- Never log secrets.
- Use TLS in deployed environments.

### Input validation

Validate all untrusted request inputs, uploaded files, AI output, domain names, import URLs, generated paths and webhook payloads.

Enforce request and file size limits.

### Authentication and authorization

- Verify user identity server-side.
- Verify permissions for every sensitive operation.
- Enforce ownership of projects, versions, files, domains and jobs.
- Use secure session handling.
- Apply CSRF protection appropriate to the selected authentication design.
- Rate-limit authentication and expensive operations.
- Test cross-user access restrictions.

### Network security

- Configure CORS with an explicit allowlist.
- Apply appropriate HTTP security headers.
- Protect URL-fetching and import functionality against SSRF.
- Block unsafe access to private and internal network addresses where appropriate.
- Validate redirects and resolved IPs in network-facing features.
- Do not permit generated code to access internal services by default.

### Payments

For Stripe or another payment provider:

- Verify webhook signatures.
- Make webhook processing idempotent.
- Validate prices and entitlements server-side.
- Do not trust amounts or plan identifiers from the browser.
- Do not mark a subscription paid based only on a frontend redirect.
- Redact sensitive payment-related information from logs.

## 12. Rate limits, timeouts and background jobs

AI generation, builds and deployments are potentially expensive and long-running operations.

Do not implement every operation as a synchronous HTTP request.

Where appropriate:

1. Validate the request.
2. Create a job record.
3. Queue the operation.
4. Return a job identifier.
5. Allow the client to retrieve status and progress.
6. Persist completion results or normalized failure information.
7. Support cancellation where safe and practical.

Use explicit job states, such as `queued`, `running`, `succeeded`, `failed` and `cancelled`.

Bound prompt length, output size, execution time, file count, concurrent jobs, retry count, network timeouts and deployment frequency.

Use retries only when safe. Make operations idempotent where duplicate execution could have side effects.

Do not start unlimited background tasks inside an HTTP handler.

## 13. API testing requirements

Tests should cover normal behavior and failure conditions.

Prioritize:

- Environment validation.
- MySQL connectivity and readiness.
- Parameterized SQL queries.
- Transaction rollback.
- Authentication and session expiration.
- Authorization and cross-user denial.
- Invalid request bodies.
- Rate limits.
- AI provider connection failures and timeouts.
- Malformed AI output.
- Unsafe file paths.
- Generation job state transitions.
- Build and deployment failures.
- Duplicate webhook delivery.
- Domain verification failures.
- Export contents and secret exclusion.
- Graceful shutdown.

Use isolated test data and a deliberate test-database strategy. Do not run destructive tests against a developer's real database.

Never claim tests passed unless they have actually been executed.

## 14. Backend implementation order

Implement backend features only after the frontend completion gate has been met.

### Step 1 — Foundations

- Audit the existing scaffold.
- Validate environment configuration.
- Set up the MySQL connection pool.
- Implement request IDs.
- Add structured, redacted logging.
- Add centralized error handling.
- Add health and readiness endpoints.
- Implement graceful shutdown.

### Step 2 — Validation and authentication

- Add request validation.
- Implement session handling.
- Implement authentication and authorization.
- Add security middleware and rate limits.
- Test cross-user access restrictions.

Preserve existing authentication behavior and migrate existing Next.js handlers deliberately.

### Step 3 — Persistence and projects

- Use the supplied MySQL schema.
- Establish numbered migrations.
- Add repositories.
- Implement project CRUD and ownership enforcement.
- Add project versioning.
- Test data integrity.

### Step 4 — AI generation

- Define the provider interface.
- Implement Ollama for local development.
- Add the approved production provider adapter.
- Normalize provider responses.
- Add bounded timeouts and retries.
- Implement safe generation jobs and file operations.
- Validate generated output.

### Step 5 — Preview and builds

- Implement job status and diagnostics.
- Build projects in an isolated environment.
- Capture redacted errors.
- Preserve project versions.
- Verify that generated projects can actually build.

### Step 6 — Export and deployment

- Implement complete source archives.
- Include setup documentation and `.env.example`.
- Exclude secrets.
- Implement deployment states and logs.
- Implement platform subdomains.
- Implement custom-domain verification.
- Track TLS status and failures.

### Step 7 — Data and billing features

- Implement customer-project data provisioning only after designing isolation.
- Implement usage limits and accounting.
- Integrate payments and subscriptions.
- Verify webhooks and idempotency.
- Implement support and audit workflows.
- Enforce authorization for administration.

### Step 8 — Production readiness

- Integrate frontend mocks with the real Express API.
- Test complete user journeys.
- Audit tenant isolation and data security.
- Configure production secrets and monitoring.
- Test failure recovery and graceful shutdown.
- Document deployment and recovery procedures.

Do not implement every backend module at once. Build and verify one coherent feature at a time.

## 15. Coding standards

- Use TypeScript and follow the existing compiler configuration.
- Avoid `any` unless there is a specific, documented reason.
- Reuse existing dependencies where appropriate.
- Avoid giant route handlers, giant service files and an oversized `index.ts`.
- Keep business logic outside the startup file.
- Avoid circular imports.
- Do not create unnecessary abstractions or empty modules.
- Prefer explicit types and clear naming.
- Keep error handling consistent.
- Never silently swallow exceptions.
- Avoid destructive schema and route changes.
- Update documentation when configuration, API behavior or schema changes.
- Review the diff before considering work finished.

Do not make unrelated changes merely because another part of the application could be refactored.

## 16. Definition of done

A backend feature is complete only when:

- Its API contract is documented.
- Input validation is implemented.
- Authentication and authorization are enforced where required.
- Resource ownership is verified server-side.
- Database changes follow the migration strategy.
- Error handling and logging are appropriate.
- Sensitive values are redacted.
- Failure and retry behavior has been considered.
- Relevant tests have been executed.
- Existing behavior has been preserved or migrated intentionally.
- Documentation has been updated.
- Actual command results and remaining limitations are reported.

Do not mark a feature complete merely because its route exists or its TypeScript compiles.

## 17. End-of-session report

At the end of every coding session, report:

### Completed
Describe the files and backend behavior implemented.

### Verification
List the exact lint, typecheck, test, build and database commands run, with actual results.

### Mocked or incomplete
Identify incomplete integrations, mock adapters, unimplemented endpoints and missing production configuration.

### Security and operational concerns
List relevant authorization, database, secret-handling, monitoring, migration and deployment risks.

### Next step
Identify the single most useful next task in the current development phase.

---

## Final instruction

Read the existing code before changing it.

Respect the frontend-first development order.

Once backend work is authorized, build a modular Express API using local MySQL, parameterized queries, typed validation, clear authorization boundaries, provider-independent AI integration, safe project generation and reliable error monitoring.

Preserve existing functionality, implement changes incrementally, verify your work and report actual results honestly.
