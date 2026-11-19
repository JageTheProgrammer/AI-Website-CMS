# Repository Structure

This repository is an npm-workspaces monorepo coordinated with Turborepo.

```text
.
├── app/
│   ├── api/                   # Express API, persistence, and business logic
│   ├── desktop/               # Electron desktop application
│   └── web/                   # Next.js web application
├── packages/
│   ├── component-library/     # Shared component schema, renderer, and editor bridge
│   └── image-library/         # Shared image assets
├── images/                    # Repository and README branding
├── CHANGELOG.md               # Release history
├── CODE_OF_CONDUCT.md         # Community expectations
├── CONTRIBUTING.md            # Contribution workflow
├── GOVERNANCE.md              # Project decision-making
├── LICENSE                    # Apache License 2.0
├── SECURITY.md                # Vulnerability reporting
├── package.json              # Workspace definitions and root scripts
├── turbo.json                # Turborepo task configuration
└── README.md                 # Product overview and getting started
```

The maintained applications are under `app/`; shared reusable packages are
under `packages/`. Generated files and build output are not source-of-truth
files unless a workspace explicitly documents otherwise. Additional root
documents cover licensing (`LICENSES.md`, `NOTICE`, and
`THIRD_PARTY_NOTICES.md`) and project structure. See the relevant workspace
README for local setup and implementation details.
