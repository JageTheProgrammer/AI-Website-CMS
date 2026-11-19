# Frontend Agent Instructions

These instructions apply to all work inside the `web/` directory.

Before making architectural changes, read:

- `/README.md`
- `/web/README.md`
- `/api/README.md`
- `/PROMPT_LOCAL_AI.md`

The root README defines the product vision and global architecture. This file defines the rules that agents must follow while developing the frontend.

---

## 1. Project Overview

This project is an AI-powered website CMS inspired by Lovable and Base44.

The platform should allow customers to:

- Generate business websites using natural-language prompts.
- Iteratively modify generated websites with AI.
- Preview websites before publishing.
- Configure database and backend capabilities for their projects.
- Publish projects to a platform-provided subdomain.
- Connect and verify their own custom domains.
- View generation, build and deployment errors.
- Manage project versions and history.
- Download the complete generated project to run locally.
- Manage their account, usage, subscriptions and billing.

The frontend uses Next.js, React and TypeScript.

The backend will use Express and TypeScript, with a local MySQL server during development. Local AI development uses Ollama, while production AI providers will include Anthropic Claude.

Do not assume any of these features are fully implemented just because a corresponding page or route exists.

Inspect the actual implementation before modifying it.

---

## 2. Mandatory Development Order

**The frontend must be completed and audited before backend feature implementation begins.**

Follow these phases in order.

### Phase 0 — Repository Audit

Before changing code:

1. Inspect the existing frontend directory structure.
2. Read the current source files relevant to the task.
3. Read `package.json`, the lockfile, `tsconfig.json`, `next.config.ts`, ESLint configuration and global styles.
4. Inspect existing components, layouts, navigation and route handlers.
5. Identify installed libraries and the actual commands available for development, linting, testing and building.
6. Identify existing functionality, placeholders, duplicated components and errors.
7. Create a route inventory and an implementation checklist.
8. Identify behavior that must be preserved.

Do not blindly replace the existing frontend structure.

Do not delete or rename pages, API handlers or components before checking their imports, routes and callers.

The initial task for a new agent session should be an audit and plan, not an extensive code rewrite.

### Phase 1 — Plan the Frontend Architecture

Plan the folder structure and shared design system before building pages independently.

Define:

- Design tokens.
- Typography and spacing scales.
- Colors and surface hierarchy.
- Buttons and form controls.
- Cards, tables and dialogs.
- Dropdown menus and tabs.
- Navigation and application layouts.
- Loading, error, empty and success states.
- Responsive behavior.
- Accessibility and keyboard interaction patterns.
- Typed frontend API/service interfaces.

Inspect existing dependencies before adding new ones.

Use shadcn/ui-style components where appropriate, preferring accessible, free and open-source components. Do not add packages without checking compatibility and explaining why they are needed.

### Phase 2 — Build Reusable Components

Build shared UI components before implementing every page separately.

Examples include:

- Button
- Input
- Textarea
- Select
- Checkbox
- Switch
- Form field
- Card
- Badge
- Dialog
- Dropdown menu
- Tabs
- Table
- Tooltip
- Breadcrumb
- Page header
- Sidebar
- Navbar
- Toast notifications
- Skeleton loaders
- Empty states
- Error states
- Confirmation dialogs
- Loading indicators

Each component must support the states relevant to its purpose.

Examples:

- Buttons need disabled and loading states.
- Forms need validation and submission feedback.
- Dialogs need correct keyboard and focus behavior.
- Tables need sensible empty and loading states.
- Destructive actions need confirmation.
- Inputs need associated labels and useful validation messages.

Avoid creating slightly different versions of the same component across multiple pages.

### Phase 3 — Implement Frontend Pages

Build all existing pages and the agreed core product pages using the shared components.

Use consistent layouts and design patterns across the application.

Every page must have:

- Responsive layouts.
- Correct navigation.
- Functional controls.
- Appropriate loading states.
- Appropriate empty states.
- Validation and error states.
- Success feedback when an action actually succeeds.
- Accessible labels and focus states.
- No misleading placeholder interactions.

Do not start backend feature implementation during this phase.

If a backend endpoint is not ready, use a typed frontend service interface and a clearly identified mock adapter.

Mock behavior must be easy to replace with real API calls later.

**Never show fake success for an operation that has not actually happened.**

### Phase 4 — Frontend Audit

Before implementing backend features:

1. Visit every existing route.
2. Verify all navigation links.
3. Test every visible button and interactive control.
4. Test forms, validation and submission behavior.
5. Test menus, dialogs and tabs.
6. Check loading, empty, success and failure states.
7. Test desktop, tablet and mobile layouts.
8. Check horizontal overflow.
9. Check keyboard navigation and visible focus indicators.
10. Run available lint, typecheck, test and production build commands.
11. Fix errors caused by the changes.
12. Document the API contracts needed by the frontend.
13. List any remaining mock data or incomplete integrations.

Do not claim the frontend is complete if important routes or interactions are missing.

### Phase 5 — Backend Handoff

Only after the frontend audit is complete should backend feature implementation begin.

At handoff, document:

- Required Express endpoints.
- HTTP methods and route paths.
- Request and response types.
- Authentication requirements.
- Authorization expectations.
- Error codes and error response structure.
- Loading and job-progress behavior.
- Whether a feature requires polling or streaming.
- Which components currently use mocked data.

The backend must use local MySQL during development, as specified in `api/README.md`.

Do not connect the frontend directly to MySQL.

### Phase 6 — Frontend/API Integration

After the backend contracts and endpoints are implemented:

1. Replace mocks with real API calls incrementally.
2. Keep typed request and response definitions.
3. Handle authentication errors and permission failures.
4. Handle timeouts, rate limits and server failures.
5. Test the entire user journey.
6. Verify that failed operations do not produce misleading success messages.
7. Preserve existing working functionality during integration.

---

## 3. Existing Frontend Routes

The current repository includes the following route structure. Recheck the actual tree before making changes.

### Authentication

- `/login`
- `/signup`

### Marketing and public pages

- `/`
- `/about`
- `/contact`
- `/cookies`
- `/faq`
- `/legal`
- `/pricing`
- `/privacy`

### Dashboards

- `/dashboard/admin`
- `/dashboard/customer`

### Admin profile

- `/profile/admin`
- `/profile/admin/history`
- `/profile/admin/payments`
- `/profile/admin/settings`

### Customer profile

- `/profile/customer`
- `/profile/customer/history`
- `/profile/customer/payements`
- `/profile/customer/settings`

Next.js route groups such as `(auth)` and `(base)` do not appear in the public URL.

The repository also contains Next.js route handlers under `src/app/api/` for:

- Authentication
- AI generation
- Pricing
- Profile management
- Stripe payments
- Support

Inventory these handlers before deciding whether they should remain in Next.js or migrate to Express.

There are existing naming inconsistencies, including `payements` and `sucess`. Search for all imports, callers and links before renaming anything. Preserve compatibility or introduce redirects where appropriate.

Do not remove an existing page simply because the planned product structure looks different.

---

## 4. Core Product Pages to Plan

In addition to existing routes, plan the following product experiences.

### Project dashboard

- Project list.
- Project cards or table.
- Search and filtering.
- Project creation.
- Project status.
- Recent activity where real data is available.
- Empty state for new users.

### Project creation

- Prompt input.
- Project name.
- Business or website type.
- Optional design preferences.
- Feature selection where supported.
- Generation progress.
- Cancellation where supported.
- Clear errors and retry behavior.

### Website editor

- Website preview.
- Responsive viewport selection.
- Prompt-based modifications.
- Version history.
- Save and preview controls.
- File or settings navigation if supported.
- Generation and build diagnostics.
- Clear separation between unsaved changes and saved versions.

### Database and data configuration

- Database configuration.
- Connection status.
- Data model or schema information.
- Migration status where applicable.
- Environment variable configuration.
- Masked secret fields.
- Clear database connection errors.

Never expose real database passwords or provider credentials in the frontend.

### Deployment management

- Deployment list.
- Deployment status.
- Build and deployment logs.
- Deployment history.
- Failed deployment diagnostics.
- Rollback UI when rollback is actually supported.
- Platform-provided subdomain setup.
- Custom-domain configuration.
- Domain ownership verification status.
- TLS status.

Do not report a deployment or domain as active unless the backend confirms it.

### Project export

- Download project source.
- Explain what the export includes.
- Include setup instructions in the exported project.
- Include an `.env.example` with placeholders.
- Include relevant dependency manifests and schema/migrations.
- Never include real credentials in an exported archive.

### Account and administration

- Profile.
- Account security.
- Usage limits.
- Subscription and billing management.
- Payment history.
- Support.
- Admin user and project management.
- Audit history.
- Platform usage monitoring.

Administrative UI controls must not be treated as security boundaries. The Express API must enforce permissions.

---

## 5. Design System and Visual Quality

The frontend should look like a carefully designed modern SaaS product.

Avoid the generic appearance often associated with automatically generated websites.

### Visual rules

- Use a consistent spacing scale.
- Establish a clear typography hierarchy.
- Use a restrained, coherent color palette.
- Reuse design tokens.
- Use consistent borders, shadows and corner radii.
- Maintain readable content widths.
- Use meaningful visual hierarchy.
- Avoid unnecessary decoration.
- Avoid excessive gradients and glass effects.
- Avoid making every element a separate rounded card.
- Avoid oversized headings that push useful information below the fold.
- Use icons rather than emoji as interface symbols.
- Use animations only when they improve feedback or usability.

### Component consistency

- Use shared buttons, inputs, cards, tables and dialogs.
- Avoid page-specific styling when a shared component or token is appropriate.
- Reuse typography and spacing rules.
- Maintain consistent page headers and content containers.
- Use a consistent navigation model.
- Ensure light/dark themes are consistent if both are supported.

### Demo data

Use realistic sample content for development where useful, but label it clearly when it is not real.

Do not invent:

- Customer testimonials.
- Customer counts.
- Revenue figures.
- Usage statistics.
- Deployment counts.
- AI performance claims.
- Payment history.

Never make a demo account appear to contain real customer data without an explicit demo indicator.

---

## 6. Functional Interaction Rules

Every visible control must have a meaningful behavior.

### Buttons

- Use specific labels.
- Use loading states for asynchronous operations.
- Prevent duplicate submissions where necessary.
- Disable controls when unavailable.
- Provide useful feedback after an actual action.
- Require confirmation before destructive actions.

### Links

- Point to a valid route or external destination.
- Avoid `href="#"`.
- Avoid links that appear interactive but do nothing.
- Preserve existing routes unless migration is intentional.

### Forms

- Validate inputs.
- Display field-level errors where appropriate.
- Prevent duplicate submissions.
- Preserve entered values when a request fails, unless there is a good reason not to.
- Display success only when the operation succeeds.
- Ensure controls are labelled accessibly.

### Menus and dialogs

- Support keyboard interaction.
- Show a clear focus state.
- Handle opening and closing correctly.
- Ensure dialogs manage focus appropriately.
- Support expected dismissal behavior.
- Avoid leaving invisible overlays blocking the application.

### Asynchronous UI

- Show meaningful loading feedback.
- Handle timeouts and failed requests.
- Prevent stale responses from corrupting the current view.
- Provide retry behavior where appropriate.
- Do not silently ignore exceptions.
- Do not display a successful status before the operation succeeds.

Do not use empty event handlers, inert controls or dummy navigation to make a page appear finished.

---

## 7. Frontend Architecture

Follow the existing project structure where appropriate. Reorganize incrementally and only when there is a clear benefit.

A possible target structure is:

```text
src/
├── app/
│   ├── (auth)/
│   ├── (marketing)/
│   ├── (dashboard)/
│   ├── api/
│   ├── layout.tsx
│   ├── globals.css
│   ├── loading.tsx
│   ├── error.tsx
│   └── not-found.tsx
├── components/
│   ├── ui/
│   ├── layout/
│   ├── marketing/
│   ├── dashboard/
│   ├── projects/
│   ├── editor/
│   ├── forms/
│   └── feedback/
├── features/
├── lib/
│   ├── api/
│   ├── auth/
│   ├── validation/
│   └── utils/
└── types/
```

This is a proposed structure, not a requirement to create empty directories or move all files immediately.

Keep related code together where it improves maintainability. Avoid giant components and duplicated business logic.

---

## 8. API Integration Rules

The frontend communicates with the Express backend through a centralized typed API client.

### API client

Use a consistent API client rather than scattering raw `fetch()` calls throughout the application.

The client should centralize:

- API base URL.
- JSON parsing.
- Error normalization.
- Credentials behavior.
- Request cancellation and timeouts where appropriate.
- Request/response types.
- Authentication error handling.

Use a public environment variable such as:

`NEXT_PUBLIC_API_BASE_URL`

Only the API base URL may be public. Never expose API keys, MySQL credentials, session secrets or AI provider credentials through `NEXT_PUBLIC_` environment variables.

### Error responses

The frontend should be prepared to handle errors such as:

- `400` — Invalid request.
- `401` — Unauthenticated.
- `403` — Not authorized.
- `404` — Resource not found.
- `409` — Conflicting state.
- `422` — Validation failure.
- `429` — Rate limit reached.
- `500` — Unexpected server error.
- `502` or `503` — Upstream or service unavailable.

Map errors into clear messages that help the user recover.

Do not display raw database queries, server stack traces, filesystem paths or provider secrets to the user.

### Security

- Never trust client-supplied user IDs or role information.
- Never treat hiding an admin button as authorization.
- Never connect the browser directly to the private MySQL database.
- Never put production AI provider keys in client-side code.
- Do not return sensitive server-side information to client components.
- Treat frontend validation as a usability feature, not a security mechanism.

The backend must independently validate and authorize every sensitive operation.

---

## 9. Mock Services

Mocks are allowed while backend endpoints are incomplete.

They must follow these rules:

1. Define typed service interfaces.
2. Keep mock implementations separate from components where practical.
3. Clearly mark demo data and mock behavior.
4. Return realistic success and failure states.
5. Do not pretend that data persists after a page reload if it does not.
6. Do not show a deployment as live without a real deployment.
7. Do not claim a payment has succeeded without confirmation from the payment integration.
8. Keep it easy to replace the mock with the Express API client.
9. Document all remaining mocks in the completion report.

Do not build a large temporary backend inside React components just to avoid defining the correct API boundary.

---

## 10. Accessibility and Responsive Design

Every page must be usable on desktop, tablet and mobile.

Verify:

- Navigation fits smaller screens.
- Forms remain readable and usable.
- Buttons are large enough for practical touch interaction.
- Dialogs fit within the viewport.
- Tables have a usable mobile presentation.
- The page does not have unintended horizontal overflow.
- Text has sufficient contrast.
- Focus indicators are visible.
- Form errors are associated with their corresponding fields.
- Icon-only buttons have accessible labels.
- Headings follow a sensible hierarchy.
- Images have meaningful alt text where appropriate.
- Keyboard users can reach and operate all essential controls.

Do not rely on color alone to communicate errors or statuses.

---

## 11. Testing and Verification

Before finishing a task:

1. Inspect the changes and review the diff.
2. Run the relevant scripts available in `package.json`.
3. Run lint, typecheck, tests and build where supported.
4. Test every affected route.
5. Test the interactions that were changed.
6. Verify responsive behavior.
7. Check loading and error states.
8. Confirm that no secrets were added to source control.
9. Confirm that existing functionality has not been unintentionally removed.
10. Update relevant documentation.

Do not assume script names. Read `package.json` and run the actual commands defined by the project.

Do not state that tests passed unless you ran them.

If a command fails, report the actual failure and distinguish existing issues from regressions caused by your changes.

---

## 12. Frontend Completion Gate

Backend feature work must not begin until all the following conditions have been addressed:

- Existing routes have been inventoried.
- Existing functionality has been preserved or migrated intentionally.
- The reusable component system is established.
- Agreed frontend pages have been implemented.
- Navigation and interactive controls work.
- Forms have validation and useful feedback.
- Loading, empty, success and error states are covered.
- Responsive layouts have been checked.
- Accessibility has been reviewed.
- Available lint, typecheck, tests and build checks have been run.
- Remaining frontend mocks are documented.
- Required Express API contracts have been documented.

If a condition cannot be met, explain why and document the remaining work. Do not claim completion falsely.

---

## 13. End-of-Session Report

At the end of every coding session, report:

### Completed
List the files, pages, components and interactions implemented.

### Verification
List the exact commands executed and their actual results.

### Mocked or incomplete
Identify every important unfinished integration, mock service or nonfunctional control.

### Risks and issues
Describe known bugs, compatibility concerns, security risks or migration requirements.

### Next step
Recommend the single most useful task for the current development phase.

---

## 14. Final Instruction

Start by understanding the existing codebase.

Plan the architecture before making broad changes.

Build shared frontend components first, implement all required pages next, connect and audit interactions, run verification, and document API contracts.

**Do not begin backend feature implementation until the frontend completion gate has been met.**

Preserve existing working functionality. Prefer incremental, testable changes over large destructive rewrites.