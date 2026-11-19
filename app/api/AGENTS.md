# Backend Agent Instructions

These instructions apply to all work inside the `api/` directory.

Before making architectural changes, read:

- `/README.md`
- `/PROMPT_LOCAL_AI.md`
- `/web/README.md`
- `/web/AGENTS.md`
- `/api/README.md`
- `/api/sql/schema.sql`

The root README defines the overall product architecture. The backend README defines the backend implementation plan. This file defines the engineering rules for agents working on the Express API.

---

## 1. Project Overview

This project is an AI-powered website CMS inspired by Lovable and Base44.

Users should eventually be able to:

- Generate business websites from natural-language prompts.
- Iteratively modify generated websites using AI.
- Preview their projects before publishing.
- Configure database and backend features for generated projects.
- Deploy projects to platform-provided subdomains.
- Connect and verify custom domains.
- Review build, generation, and deployment logs.
- Manage project versions and history.
- Download complete generated projects and run them locally.
- Manage accounts, usage, subscriptions, and billing.

The backend uses Express and TypeScript.

Development uses a local MySQL server and Ollama. Production AI providers include Anthropic Claude through a provider abstraction.

Do not assume a feature is implemented just because a corresponding frontend page or route exists.

Inspect the code, database schema, configuration, and tests before making changes.

---

## 2. Mandatory Development Order

**The frontend must be completed and audited before backend feature implementation begins.**

The overall project order is:

1. Audit the existing repository.
2. Plan the frontend architecture and design system.
3. Build the reusable frontend components.
4. Implement all agreed frontend pages.
5. Connect and verify frontend interactions.
6. Audit the frontend and document its required API contracts.
7. Build the Express backend foundations.
8. Implement backend features against the documented contracts.
9. Integrate the frontend with the real API.
10. Test the complete application and review production readiness.

If the frontend completion gate has not been met, do not start implementing backend business features.

You may inspect the current backend scaffold during the repository audit, identify problems, document existing behavior, and prepare an implementation plan. Do not use this as an excuse to skip the frontend-first workflow.

Once backend implementation is authorized, work incrementally and verify each feature.

---

## 3. Inspect Before Editing

Before modifying backend code:

1. Read the existing backend source files.
2. Inspect `package.json` and `package-lock.json`.
3. Inspect `tsconfig.json` and the existing environment configuration.
4. Read `src/index.ts` and `lib/env.ts`.
5. Inspect existing routes, middleware, services, database access, and error handling.
6. Check which dependencies are actually installed.
7. Identify the available scripts and tests.
8. Read the existing SQL schema and any migrations.
9. Check how the frontend currently communicates with authentication, generation, profile, Stripe, pricing, and support handlers.
10. Record existing behavior that must be preserved.

The existing scaffold currently includes files similar to:

```text
api/
├── lib/
│   └── env.ts
├── src/
│   └── index.ts
├── package.json
├── package-lock.json
├── tsconfig.json
├── README.md
└── AGENTS.md
```

The actual directory may evolve. Inspect it before assuming that a module, service, or dependency exists.

Do not replace the backend wholesale without a clear reason and a migration plan.

---

## 4. Local MySQL Is the Required Development Database

**Use the local MySQL server by default. Do not substitute SQLite or PostgreSQL.**

The default application database is:

```text
ai_cms
```

The default local MySQL connection is:

```text
Host:     127.0.0.1
Port:     3306
Database: ai_cms
User:     ai_cms_app
```

The application password must be set locally and must never be committed to source control.

### Initial setup

On macOS, if MySQL is not installed and Homebrew is available:

```bash
brew install mysql
brew services start mysql
mysql --version
```

Initialize the schema from the repository root:

```bash
mysql -u root -p < api/sql/schema.sql
```

Create a local application account using the instructions in `api/README.md`. Do not use the MySQL root account from Express.

Create `api/.env` using `api/.env.example` as the template.

Recommended development configuration:

```dotenv
NODE_ENV=development
PORT=4000
HOST=127.0.0.1

DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=ai_cms
DB_USER=ai_cms_app
DB_PASSWORD=REPLACE_WITH_A_STRONG_LOCAL_PASSWORD
DB_CONNECTION_LIMIT=10

AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=REPLACE_WITH_A_MODEL_INSTALLED_IN_OLLAMA
```

These variables are the intended configuration contract. Inspect `lib/env.ts` and implement the contract consistently rather than assuming every variable is already supported.

### Database requirements

- Use MySQL for CMS platform data.
- Use a shared connection pool rather than opening a new connection for each request.
- Use parameterized SQL for all values.
- Keep SQL access in repositories or data-access modules.
- Use transactions for related operations that must succeed or fail together.
- Close database connections during graceful shutdown.
- Validate connection configuration at startup.
- Use a bounded connection timeout.
- Implement migrations for subsequent schema changes.
- Store timestamps consistently in UTC.
- Use appropriate indexes and foreign keys.
- Test transaction rollback and concurrent updates where relevant.

Never concatenate raw user input into SQL statements.

Never trust a project ID or user ID submitted by the browser as proof of ownership.

### CMS database versus generated-project databases

The `ai_cms` database is the CMS platform's own database. It stores users, sessions, projects, versions, jobs, deployment metadata, domains, and other platform information.

A generated customer's website may need its own data store. That is a separate provisioning concern.

Do not give the API account unrestricted permission to create databases for every customer. Do not share the CMS database credentials with generated applications.

Customer-project databases require a deliberate isolation model, generated-name validation, least-privilege credentials, quotas, backups, lifecycle management, and secure credential storage.

The `project_databases` table records database metadata; it does not automatically provision a working database or configure the generated website.

---

## 5. Database Schema and Migrations

The initial schema lives in:

```text
api/sql/schema.sql
```

Review this file before adding or changing tables.

The initial schema includes:

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

### Rules for schema changes

1. Do not casually rename or remove existing columns.
2. Inspect foreign keys and existing queries before changing a table.
3. Use numbered migrations for subsequent changes.
4. Make migrations reproducible and document their execution order.
5. Consider data preservation and rollback before applying destructive changes.
6. Add indexes for frequently queried fields and relationships.
7. Use foreign keys where appropriate.
8. Add uniqueness constraints for identifiers that must be unique.
9. Avoid storing the same source of truth in multiple places without a reason.
10. Never store plaintext passwords, session tokens, API keys, or database passwords.

`CREATE TABLE IF NOT EXISTS` is useful for initial setup, but it does not migrate an existing table to a newer schema. Do not use it as a substitute for a proper migration process.

Do not run destructive migrations against a user's existing data without an explicit, documented reason.

---

## 6. Recommended Backend Architecture

Keep `src/index.ts` focused on application startup and shutdown. Do not place all business logic in one file.

A possible structure is:

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
│   ├── config/
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

This is a proposed organization, not an instruction to create empty directories or move all files immediately.

Adapt it to the existing scaffold. Reuse suitable modules and maintain clear boundaries between HTTP handling, business logic, persistence, AI integrations, and background jobs.

---

## 7. Express Application and API Conventions

Use a consistent, versioned API structure, such as:

```text
/api/v1
```

Keep request handling separate from business logic and persistence.

### Route handlers

Route handlers should:

- Validate input.
- Authenticate and authorize the request.
- Call the relevant service.
- Return an intentional HTTP status code.
- Use a consistent response format.
- Pass errors to centralized error handling.

Avoid placing large SQL statements, AI orchestration workflows, domain provisioning, or deployment logic directly in route handlers.

### Response formats

Use consistent success and error formats.

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

Do not return stack traces, database queries, private filesystem paths, credentials, internal provider responses, or secrets to clients.

Use meaningful status codes. A failed operation must not return `200 OK` merely because the HTTP request reached the server.

Validate request parameters, query strings, headers and bodies at the API boundary.

Use the project's existing validation library if suitable. If introducing a library is necessary, inspect compatibility and document the reason.

---

## 8. Authentication and Authorization

Authentication establishes identity. Authorization establishes what that identity is allowed to do. Both are required.

- Do not trust a client-provided user ID.
- Do not trust a client-provided role.
- Do not trust a client-provided subscription plan or entitlement.
- Do not assume hiding a button protects an endpoint.
- Do not permit access merely because the request includes a project ID.
- Every project operation must verify ownership or an explicitly authorized role.
- Every admin operation must verify admin permissions on the server.
- Sessions must expire and support revocation.
- Tokens must be generated securely and stored in a suitable hashed form where applicable.
- Passwords must be stored using a suitable password-hashing algorithm.
- Use established authentication libraries or well-reviewed patterns rather than custom cryptography.
- Protect state-changing requests against CSRF where required by the selected cookie/session design.
- Apply rate limits to login, signup, password reset, email verification and other sensitive endpoints.

Write tests proving that one user cannot access or modify another user's projects, versions, files, domains, generation jobs or billing details.

Preserve the existing authentication behavior unless a deliberate, tested migration is planned.

---

## 9. AI Provider Architecture

AI integration must be provider-independent.

The rest of the application must not depend directly on a specific model vendor or model ID.

Define a typed provider interface, for example:

```typescript
export interface AIProvider {
  generate(
    input: GenerateInput,
    options?: GenerateOptions
  ): Promise<GenerateResult>;
}
```

Adapt the types to actual product requirements. Do not add a placeholder interface and claim that generation has been implemented.

### Local development: Ollama

Development defaults to Ollama.

Recommended configuration:

```dotenv
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=REPLACE_WITH_A_MODEL_INSTALLED_IN_OLLAMA
```

Requirements:

- Keep the endpoint configurable.
- Keep the model name configurable.
- Do not assume Ollama is running.
- Handle connection refusal and model-not-found errors.
- Bound generation timeouts and output sizes.
- Handle incomplete or malformed model output.
- Support cancellation where practical.
- Keep provider errors out of public error responses unless safely normalized.
- Avoid unlimited automatic retries.

### Production: Anthropic Claude

Production AI providers may include Anthropic Claude.

Requirements:

- Keep API keys on the server.
- Read the model ID from validated configuration.
- Do not hard-code a model ID throughout the codebase.
- Handle rate limits, quota exhaustion, timeouts and provider failures.
- Normalize provider responses into internal application types.
- Track usage and cost metadata where available and appropriate.
- Do not silently fall back to another provider if doing so could violate the project's cost, privacy, or configuration requirements.
- Do not expose the production provider key in frontend bundles, logs, generated projects, or exports.

Switching providers must not require rewriting the projects, generation, or editor business logic.

### Generated output is untrusted

Treat all AI output as untrusted, even when using a trusted provider.

- Validate structured output before applying it.
- Validate generated file paths and sizes.
- Reject path traversal and forbidden files.
- Never let model-generated instructions bypass normal authorization.
- Do not blindly execute commands produced by a model.
- Do not execute generated website code in the Express process.
- Record generation errors and diagnostics without leaking private prompt content or secrets into logs.

Text generation alone does not guarantee a working website. Generated projects must be validated, built and tested through a controlled process.

---

## 10. Project Generation and File Management

Generated websites are separate artifacts from the CMS application.

Store project files with clear ownership and version boundaries.

Each generated project should support a reproducible source export where practical.

### File safety

- Normalize paths before reading or writing files.
- Reject absolute paths.
- Reject `..` traversal and paths escaping the project root.
- Prevent unsafe symlink traversal.
- Restrict file extensions where appropriate.
- Limit file counts and total project size.
- Limit individual file sizes and generated output.
- Do not allow user-supplied paths to determine unrestricted filesystem locations.
- Do not allow generated code to read environment secrets or arbitrary host files.

### Build isolation

Never execute arbitrary customer-generated code in the main API process.

Use disposable, restricted build workers, containers or an equivalent sandbox.

Build environments must have:

- Resource and execution-time limits.
- Restricted filesystem access.
- No privileged host mounts.
- No access to production secrets.
- Restricted network access where practical.
- Clear cleanup after completion.
- Captured build logs with secrets redacted.

A build failure must produce useful, actionable diagnostics. It must not be reported as a successful deployment.

### Versions

Maintain version history so customers can review previous generations and recover from bad changes.

Do not overwrite the only copy of a working project when applying a new generation.

Use explicit job and version states to represent draft, running, successful, failed and cancelled operations.

---

## 11. Project Export and Local Development

Customers must be able to download generated projects and run them locally.

An export should contain the appropriate files for the chosen generated-project framework, including:

- Source code.
- `package.json` and relevant lockfile, when applicable.
- Configuration files.
- README with setup and run instructions.
- `.env.example` with placeholder values.
- Database schema or migrations when applicable.
- Required static assets.
- Any additional files needed for a reproducible setup.

Never include:

- Real `.env` files.
- Platform credentials.
- AI provider keys.
- CMS database passwords.
- Session secrets.
- Private data belonging to another customer.

An export is not complete merely because a ZIP file downloads. Verify that the archive contains the expected files and document any services the customer must configure separately.

Avoid locking generated projects unnecessarily to the CMS platform. Explain any platform-dependent features honestly.

---

## 12. Database Features for Generated Projects

The platform database and customer-project databases must be treated as separate concerns.

The CMS uses local MySQL during development.

Generated projects may require their own data models and database connections.

Before provisioning customer-project databases, design:

- A database naming strategy.
- Tenant isolation.
- Credential creation and encryption.
- Least-privilege database users.
- Resource quotas.
- Connection limits.
- Migration management.
- Backups and restoration.
- Provisioning and deletion lifecycle.
- Failure recovery.
- Export and import behavior.

Never give generated applications the CMS database credentials.

Never return full database connection strings or plaintext database passwords to the browser.

If database credentials need to be stored, encrypt them using an application-level encryption mechanism with a securely managed key. Never store encryption keys in the database alongside encrypted values.

Do not enable unrestricted database creation simply to make the feature appear complete.

---

## 13. Deployment and Custom Domains

Deployment must be represented as a real, observable process.

Use explicit deployment states, such as:

```text
queued
building
deploying
succeeded
failed
cancelled
```

Do not return success before the deployment provider confirms that the operation succeeded.

### Deployment requirements

- Associate every deployment with an authorized project and version.
- Capture build and deployment diagnostics.
- Redact secrets in logs.
- Store deployment metadata and status.
- Handle retries without creating uncontrolled duplicate deployments.
- Maintain a clear distinction between preview and production deployment.
- Preserve the version that was deployed.

### Platform subdomains

- Validate subdomain format.
- Enforce uniqueness.
- Prevent conflicting or reserved names.
- Verify that the subdomain routes to the correct project.
- Do not claim that DNS or TLS is ready without confirmation.

### Custom domains

- Validate domain syntax.
- Verify domain ownership.
- Prevent domain takeover.
- Check that a domain is not assigned to another customer.
- Provide clear DNS setup instructions.
- Track verification and TLS status.
- Handle removed, expired or invalid domain configurations.

Protect domain verification endpoints against SSRF and unsafe network access. Do not make unrestricted HTTP requests to arbitrary user-provided URLs.

---

## 14. Error Handling and Monitoring

Error handling and observability are required backend foundations, not optional cleanup work.

### Request IDs

Assign a request ID to every incoming request. Validate upstream request IDs before accepting them.

Include the request ID in:

- Logs.
- Error responses.
- Generation jobs.
- Build jobs.
- Deployment jobs.
- Monitoring events where appropriate.

This allows errors across different services and asynchronous operations to be correlated.

### Structured logs

Use structured logs with fields such as:

- Timestamp.
- Severity.
- Request ID.
- Environment.
- HTTP method and route.
- HTTP status.
- Request duration.
- Safe user/project identifiers where appropriate.
- Error code.
- Provider or job status where relevant.

Never log:

- Passwords.
- Session tokens.
- Cookies.
- Authorization headers.
- API keys.
- Database passwords.
- Full connection strings.
- Encryption keys.
- Raw payment credentials.
- Unredacted sensitive customer data.

Do not automatically log entire request and response bodies.

### Centralized error middleware

Use one centralized Express error-handling strategy.

It must distinguish:

- Validation errors.
- Authentication errors.
- Authorization errors.
- Resource-not-found errors.
- Conflicts.
- Rate limits.
- Database connectivity failures.
- AI provider failures.
- Generation/build failures.
- Unexpected programming errors.

Return normalized errors to clients and detailed, redacted diagnostics to server logs.

Do not use empty `catch` blocks or silently discard exceptions.

Avoid exposing internal implementation details in production responses.

### Health endpoints

Implement separate health endpoints:

```text
GET /health/live
GET /health/ready
```

`/health/live` should indicate that the process is alive.

`/health/ready` should verify required dependencies, including MySQL, using a bounded timeout.

Do not return credentials, internal IP details, connection strings or raw driver errors in the health response.

### Error-monitoring integration

Use a production error-monitoring service if approved and configured, such as Sentry.

Configure:

- Environment.
- Release/version identifier.
- Request correlation.
- Sensitive-data scrubbing.
- Safe exception reporting.
- Appropriate sampling.
- Alerting for critical failures.

Do not claim the service is configured merely because a package is installed. Verify the DSN, deployment configuration, data scrubbing and actual event delivery.

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
- Resource usage.

Set appropriate alerts for sustained failures and exhausted provider quotas.

---

## 15. Rate Limits, Timeouts and Background Jobs

AI generation, building and deployment are long-running and potentially expensive operations.

Do not treat all of them as simple synchronous HTTP requests.

Where appropriate:

1. Accept and validate a request.
2. Create a job record.
3. Queue the operation.
4. Return a job identifier.
5. Allow status and progress retrieval.
6. Store completion results or normalized failure information.
7. Support cancellation where safe and practical.

Use an explicit state model for jobs.

Apply rate limits and quotas based on user, project and operation type.

Bound:

- Prompt length.
- Request size.
- Generated output size.
- AI execution time.
- Build execution time.
- File count and total file size.
- Concurrent jobs.
- Retry count.
- Network timeouts.
- Deployment frequency where appropriate.

Use bounded retries with backoff only when the operation is safe to retry. Make operations idempotent where duplicate execution could create side effects.

Do not start unlimited background tasks inside an HTTP handler.

---

## 16. Security Requirements

Security controls must be implemented on the server, even if the frontend already performs validation.

### Environment and secrets

- Validate required environment variables at startup.
- Fail fast with a clear, non-secret configuration error if required settings are missing.
- Keep `.env` out of version control.
- Commit `.env.example` using placeholder values only.
- Never return secret values after storage.
- Use least-privilege service accounts.
- Do not print secrets in startup logs or error messages.
- Use TLS in deployed environments.

### Input validation

Validate every untrusted input, including:

- Request bodies.
- Query parameters.
- Route parameters.
- Uploaded files.
- AI output.
- Domain names.
- Import URLs.
- Generated file paths.
- Webhook payloads.

Set size limits and reject unexpected input formats.

### Database security

- Use parameterized queries.
- Use a least-privilege MySQL account.
- Do not connect as `root`.
- Enforce tenant ownership in queries and services.
- Use transactions for sensitive multi-table changes.
- Do not return raw SQL errors to clients.

### Network security

- Configure CORS using an explicit allowlist.
- Apply secure HTTP headers.
- Protect URL-fetching features against SSRF.
- Block unsafe access to private, loopback and internal network addresses where appropriate.
- Validate redirects and resolved IPs in network-facing features.
- Do not permit generated code to reach internal services by default.

### Payments

If Stripe or another payment provider is integrated:

- Verify webhook signatures.
- Make webhook processing idempotent.
- Validate server-side prices and entitlements.
- Do not trust amounts or plan identifiers from the browser.
- Do not mark a subscription paid based only on a frontend redirect.
- Redact sensitive payment-related data from logs.

### Generated code

Never run arbitrary customer-generated code inside the privileged API process.

Do not expose CMS secrets, host filesystem access, privileged credentials or internal network access to generated applications.

---

## 17. API Testing Requirements

Tests should cover both normal behavior and failure cases.

Prioritize:

- Environment validation.
- MySQL connection and readiness.
- Parameterized queries.
- Transaction rollback.
- Authentication and session expiration.
- Authorization and cross-user access denial.
- Validation errors.
- Rate limits.
- AI provider connection failures.
- Provider timeouts and rate limits.
- Malformed AI output.
- Unsafe generated file paths.
- Job state transitions.
- Build and deployment failures.
- Duplicate webhook deliveries.
- Domain verification failures.
- Export contents and secret exclusion.
- Graceful shutdown.

Use isolated test data and a deliberate test database strategy. Do not run destructive tests against a developer's real database.

Do not claim tests passed unless they were executed and the results were observed.

---

## 18. Recommended Backend Implementation Sequence

After the frontend completion gate is met, implement the backend in this order.

### Step 1 — Foundations

- Audit and document the scaffold.
- Validate environment configuration.
- Set up the MySQL connection pool.
- Implement request IDs.
- Add structured and redacted logging.
- Add centralized error handling.
- Add health and readiness endpoints.
- Add graceful shutdown.

### Step 2 — Validation and authentication

- Add request validation.
- Implement session handling.
- Implement authentication and authorization.
- Add appropriate security middleware and rate limits.
- Test cross-user access restrictions.

Preserve existing authentication behavior and migrate existing Next.js authentication handlers deliberately.

### Step 3 — Persistence and projects

- Use the supplied MySQL schema.
- Create a migration strategy.
- Add repository/data-access modules.
- Implement project creation, reading, updating and deletion.
- Enforce ownership.
- Add project versioning.
- Test data integrity.

### Step 4 — AI generation

- Define the provider interface.
- Implement Ollama for local development.
- Add the approved production provider adapter.
- Normalize provider responses.
- Add timeouts, cancellation where supported and bounded retries.
- Implement safe generation jobs and file operations.
- Validate generated output before accepting it.

### Step 5 — Project preview and builds

- Implement job status and diagnostics.
- Build in an isolated environment.
- Capture redacted errors.
- Preserve project versions.
- Verify that a generated project can actually build.

### Step 6 — Export and deployment

- Implement complete source archives.
- Include setup documentation and `.env.example`.
- Exclude secrets.
- Implement deployment states and build logs.
- Implement platform subdomain management.
- Implement custom-domain verification.
- Track TLS status and failures.

### Step 7 — Data and billing features

- Implement customer-project data provisioning only after designing the isolation model.
- Implement usage limits and accounting.
- Integrate payments and subscriptions.
- Verify webhooks and idempotency.
- Implement support and audit functionality.
- Enforce authorization for administration.

### Step 8 — Production readiness

- Integrate frontend mocks with the real Express API.
- Test complete user journeys.
- Audit tenant isolation and data security.
- Configure production secrets and monitoring.
- Test failure recovery and graceful shutdown.
- Document deployment and recovery procedures.

Do not implement every backend module at once. Build and verify a coherent feature at a time.

---

## 19. Coding Standards

- Use TypeScript and follow the project's compiler configuration.
- Avoid `any` unless there is a specific, documented reason.
- Reuse existing suitable dependencies.
- Avoid giant route handlers and service files.
- Keep business logic out of `src/index.ts`.
- Avoid circular imports.
- Do not introduce unnecessary abstractions or empty modules.
- Prefer explicit types and clear naming.
- Keep error handling consistent.
- Never silently swallow errors.
- Never bypass authorization to make a test pass.
- Avoid destructive schema or route changes.
- Update documentation when configuration, API behavior or schema changes.
- Inspect the diff before considering work finished.

Do not make unrelated changes merely because you noticed something that could be refactored.

---

## 20. Definition of Done

A backend feature is complete only when:

- Its API contract is documented.
- Input validation is implemented.
- Authentication and authorization are enforced where required.
- Data ownership is verified server-side.
- Relevant database changes use the migration strategy.
- Error handling and logging are appropriate.
- Sensitive values are redacted.
- Failure and retry behavior has been considered.
- Relevant tests have been executed.
- Existing behavior has been preserved or migrated intentionally.
- Documentation has been updated.
- Actual command results and known limitations are reported.

Do not mark a feature complete merely because its route exists or its TypeScript compiles.

---

## 21. Required End-of-Session Report

At the end of every coding session, report:

### Completed
Describe the files and backend behaviors implemented.

### Verification
List the exact lint, typecheck, test, build, and database commands run, with actual results.

### Mocked or incomplete
Identify any incomplete integrations, fake adapters, unimplemented endpoints or missing production configuration.

### Security and operational concerns
List relevant authorization, database, secret-handling, monitoring, migration or deployment risks.

### Next step
Identify the single most useful next task in the current development phase.

---

## Final Instruction

Read the existing code before changing it.

Respect the frontend-first development order.

Once backend work is authorized, build a modular Express API using the local MySQL server, parameterized queries, typed validation, clear authorization boundaries, provider-independent AI integration, safe project generation, and reliable error monitoring.

Preserve existing functionality, implement changes incrementally, verify your work, and report actual results honestly.