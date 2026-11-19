# Contributing

Thanks for your interest in improving Polityra CMS. Contributions of code,
documentation, testing, bug reports, and thoughtful product feedback are
welcome.

## Before you start

- Read the [Code of Conduct](./CODE_OF_CONDUCT.md).
- Search existing issues and pull requests before opening a new one.
- For substantial changes, open an issue or discussion first so the approach
  can be agreed on before significant work begins.
- Do not include credentials, real customer data, or other sensitive material
  in issues, tests, fixtures, logs, or pull requests.

## Development setup

The root [README](./README.md) describes the product and getting started. See
the app-level README files for service-specific configuration.

```bash
npm install
npm run dev
```

The root `dev` script starts the API and web app. Configure local environment
variables as described in `app/api/README.md` and `app/web/README.md`; use
placeholder values only in committed `.env.example` files.

## Make and verify a change

- Keep changes focused and consistent with existing patterns.
- Add or update tests for behavior changes when a relevant test suite exists.
- Run the checks applicable to the changed workspace. Common commands are:

  ```bash
  (cd app/api && npm run build)
  (cd app/web && npm run lint && npm run build)
  (cd packages/component-library && npm test)
  ```

- Update documentation when changing setup, scripts, architecture, environment
  variables, API contracts, or user-visible behavior.
- Do not claim a check passed unless you ran it; include any outstanding
  verification steps in the pull request.

## Pull requests

Describe the problem and solution, note any behavior or configuration changes,
and list the checks you ran. Include screenshots for relevant UI changes and
call out migrations, compatibility concerns, or follow-up work. Keep each pull
request reviewable and do not bundle unrelated cleanup.

## Licensing contributions

By intentionally submitting a contribution for inclusion in this project, you
submit it under the [Apache License 2.0](./LICENSE), unless you clearly state
otherwise or a separate written agreement applies. You retain copyright in
your contribution. Do not submit material you do not have the right to
contribute, and preserve third-party notices and license terms.
