# SEIS CLOSED CODE

SEIS is the single `main`-centered closed-code operating repository for the `emirhankudun-ux` platform ecosystem.

It coordinates Android, Web, macOS, full-stack, data, Google Workspace operations, Codex plugin development, OpenAI-curated plugin routing, source archive verification, and repository consolidation from one center.

## Start Here

- OpenAI-curated build workbench: [`docs/platform/openai-curated-build-workbench.md`](./docs/platform/openai-curated-build-workbench.md)
- OpenAI-first plugin policy: [`docs/platform/openai-first-plugin-policy.md`](./docs/platform/openai-first-plugin-policy.md)
- Closed-code operating brief: [`SEIS_CLOSED_CODE.md`](./SEIS_CLOSED_CODE.md)
- Closed-code license notice: [`LICENSE`](./LICENSE)
- Architecture: [`docs/platform/seis-closed-code-architecture.md`](./docs/platform/seis-closed-code-architecture.md)
- SEIS evolution model: [`docs/strategy/seis-evolution-model.md`](./docs/strategy/seis-evolution-model.md)
- GitHub remote configuration: [`docs/deployment/github-remote-configuration.md`](./docs/deployment/github-remote-configuration.md)
- Publish gate contract: [`docs/deployment/publish-gate-contract.md`](./docs/deployment/publish-gate-contract.md)
- Plugin stack: [`docs/platform/plugin-stack.md`](./docs/platform/plugin-stack.md)
- Google Workspace ops: [`docs/platform/google-workspace-ops.md`](./docs/platform/google-workspace-ops.md)
- Roadmap: [`roadmap/seis-closed-code-backlog.md`](./roadmap/seis-closed-code-backlog.md)
- Documentation index: [`docs/INDEX.md`](./docs/INDEX.md)
- Current status: [`docs/STATUS.md`](./docs/STATUS.md)
- Integration and GitHub development policy: [`docs/governance/seis-integration-and-github-development.md`](./docs/governance/seis-integration-and-github-development.md)
- Security policy: [`SECURITY.md`](./SECURITY.md)
- AI provider audit: [`docs/audits/AI_PROVIDER_AND_CREDENTIAL_AUDIT.md`](./docs/audits/AI_PROVIDER_AND_CREDENTIAL_AUDIT.md)
- Plugin interface suite: [`docs/product/plugin-interface-suite.md`](./docs/product/plugin-interface-suite.md)
- Mythic Gacha: [`docs/product/mythic-gacha.md`](./docs/product/mythic-gacha.md)
- Goal Tracking OS: [`docs/goals/goal-tracking-system.md`](./docs/goals/goal-tracking-system.md)
- Goal Tracking Center: [`docs/product/goal-tracking-center.md`](./docs/product/goal-tracking-center.md)
- Static Goal Tracking page: [`apps/web/goal-tracking.html`](./apps/web/goal-tracking.html)

## OpenAI-curated Build Route

SEIS uses OpenAI/Codex plugin families first for core work: `openai-curated`, `openai-bundled`, and `openai-primary-runtime`. The local `seis@personal` plugin coordinates repository context, migration safety, branch sync, and plugin routing.

| Category | First route |
|---|---|
| Design | Build Web Apps, Browser, Chrome, Figma, Canva, MagicPath |
| Developer tools | GitHub, CodeRabbit, CircleCI, Cloudflare, Vercel, Netlify, Convex, Supabase, Neon Postgres |
| Productivity | Google Drive, Google Calendar, Gmail, Slack, Teams, Notion, Documents, Spreadsheets, Presentations |
| Research | Hugging Face, Zotero, Life Science Research, Scite, Deepnote |
| Security | Codex Security, Sentry, Datadog, CodeRabbit, Jam |

## Platform Lanes

| Lane | Path | Purpose |
|---|---|---|
| Android | [`apps/android`](./apps/android) | Expo/mobile app direction and Android validation |
| Web | [`apps/web`](./apps/web) | Browser product surface and dashboards |
| macOS | [`apps/macos`](./apps/macos) | Local desktop tools and SwiftUI direction |
| Full-stack | [`apps/fullstack`](./apps/fullstack) | Convex/Supabase/Vercel backend direction |
| Core package | [`packages/core`](./packages/core) | Shared rules and platform contracts |
| UI package | [`packages/ui`](./packages/ui) | Shared operational UI primitives |
| Data package | [`packages/data`](./packages/data) | Inventory and analytics adapters |
| Data records | [`data`](./data) | Zip, repo visibility, plugin, and migration records |
| Integrations | [`integrations`](./integrations) | Google Drive, Calendar, and external IDs |

## Google Workspace

- Operating plan: https://docs.google.com/document/d/1EvyhGA4ulJHsEB2DCzZAYxDrUv1X6dGj0PFa0splrps
- Platform backlog: https://docs.google.com/spreadsheets/d/1sxnxOz9ZRzwZAz2FmHt_3YzAhQjKL2sQbYR1uWdGsaQ
- Installed plugin operating model: https://docs.google.com/document/d/10A-Ld9TBu6HSsB0W1dJ3p6Y14Hqr3VMLeMgYJ89mX64
- Weekly build review: https://www.google.com/calendar/event?eid=ZWg5djhtamRjdHZjaGY2aTljczRqMDJkZjQgZW1pcmhhbmt1ZHVuQG0

## Repository Consolidation

SEIS is the general center for these source repositories:

- `UIX-Apps`
- `emirhan-kudun-portfolio`
- `github-unified-source`
- `seis-trusted-marketplace-plugin`
- `gemini-cli`
- `DeepSeek-Coder`
- `claude-code`
- `docs`
- `awesome-deepseek-agent`

Some source repositories are no longer visible through GitHub lookup, but SEIS keeps source branch indexes under `sources/<repo>/<branch>`. See [`docs/repository-visibility-and-main-sync.md`](./docs/repository-visibility-and-main-sync.md).

## Branch Rule

`main` is the visible center branch. `UIXAppTTR` may still be the configured GitHub default branch, so both branches should mirror the same commit until repository settings are changed.

## Safety Rules

- closed code by default
- OpenAI/Codex plugin families first for core build work
- no automatic deploy
- no direct Git commit of large binary archives
- no source repository deletion before verified SEIS refs and depot snapshots
- no deletion based only on a repository being invisible or returning 404
- Drive/Calendar records must be linked back into SEIS

## Core Commands

```bash
npm run check:workspace
npm run check:data-schema-registry
npm run check:plugin-interface-roadmap
npm run check:seis-code
npm run check:video-hero-showcase
npm run check:mythic-gacha
npm run check:design-component-inventory
npm run check:seis-evolution-model
npm run check:github-remote-configuration
npm run check:publish-gate-contract
npm run check:release-sync
npm run check:ai-stack
npm run audit:ai-providers
npm run check:cloud-environment
npm run check:monthly-branch-hardening
npm run check:trusted-marketplace-intake
npm run check:seis-trusted-marketplace-plugin
npm run automation:develop
npm run automation:publish-readiness
```

## Existing SEIS Records

- Central project index: [`PROJECTS.md`](./PROJECTS.md)
- Central branch registry: [`BRANCHES.md`](./BRANCHES.md)
- Consolidation manifest: [`data/github-repository-consolidation.json`](./data/github-repository-consolidation.json)
- Migration audit: [`docs/github-branch-migration-audit.md`](./docs/github-branch-migration-audit.md)
- Zip import decision: [`docs/github-zip-import-decision.md`](./docs/github-zip-import-decision.md)
- Codex plugin guide: [`docs/seis-codex-plugin.md`](./docs/seis-codex-plugin.md)
