# SEIS Master Backlog

Date: 2026-06-19

This backlog consolidates the next safe work needed to turn SEIS into a
coherent, reviewable, public-ready AI-native engineering ecosystem. It favors
small PRs with clear evidence over broad rewrites.

## Priority Legend

| Priority | Meaning |
| --- | --- |
| P0 | Blocks safe foundation PR or validation. |
| P1 | Blocks public/readiness confidence. |
| P2 | Important platform maturity work. |
| P3 | Useful but can wait. |

## Backlog

| ID | Priority | Lane | Work | Acceptance Evidence |
| --- | --- | --- | --- | --- |
| `SEIS-BL-001` | P0 | Repository hygiene | Review pre-existing deleted files and decide restore, replace, or intentional removal. | `git status` no longer contains unexplained deletions; decision recorded in review docs. |
| `SEIS-BL-002` | P0 | Governance | Restore or replace the AGENTS-linked constitution and governance docs if still official. | `AGENTS.md` links resolve; governance docs match current `main`/SEIS direction. |
| `SEIS-BL-003` | P0 | Validation | Restore or update deleted validation scripts without weakening checks. | `npm run check:foundation` can run to a meaningful pass/fail state. |
| `SEIS-BL-004` | P0 | Repository hygiene | Classify untracked `apps/SEIS/` nested repo copy. | Folder is excluded, archived, or selectively integrated through review; no nested `.git` is staged. |
| `SEIS-BL-005` | P1 | Documentation | Add root `ARCHITECTURE.md`, `ROADMAP.md`, and `CHANGELOG.md` or document why they are deferred. | README and docs index point to current source-of-truth docs. |
| `SEIS-BL-006` | P1 | Security | Add a deeper security baseline review that includes dependency, artifact, secret-pattern, and public-readiness checks. | `docs/security/SECURITY_BASELINE.md` exists and lists validated vs unvalidated checks. |
| `SEIS-BL-007` | P1 | GitHub governance | Inspect open/closed PRs and branch protection after approval for GitHub API/CLI access. | PR status table and closed PR rescue recommendations are recorded. |
| `SEIS-BL-008` | P1 | Public readiness | Run public-readiness dry run after worktree recovery. | Public readiness doc states blockers, evidence, and final decision. |
| `SEIS-BL-009` | P1 | Release readiness | Run release-readiness dry run without deployment. | Release readiness doc includes artifact state, rollback plan, and blocked deploy actions. |
| `SEIS-BL-010` | P1 | Command Center | Create Command Center foundation review from actual repo evidence. | Required modules, current artifacts, fake-control rules, and next UI scope are documented. |
| `SEIS-BL-011` | P1 | AI Core | Create AI Core foundation review covering model router, prompt engine, agent runtime, memory, evals, and provider privacy. | Docs distinguish current artifacts from future plans and do not claim a frontier model. |
| `SEIS-BL-012` | P1 | Agent runtime | Define human-supervised agent roles, permissions, forbidden actions, and validation gates. | Agent runtime spec exists and references approval boundaries. |
| `SEIS-BL-013` | P1 | Prompt engine | Define prompt format, versioning, provenance, and no-secret rules. | Prompt-engine docs exist with reusable templates and clean-room limits. |
| `SEIS-BL-014` | P1 | Model router | Define provider-neutral model-router contracts. | Provider interface, routing policy, model profiles, and privacy-aware logging docs exist. |
| `SEIS-BL-015` | P1 | Clean-room | Add clean-room requirements template and review checklist. | Restricted material intake path is documented. |
| `SEIS-BL-016` | P2 | SSH governance | Add SSH operation runbook and approval matrix. | SSH docs require Ed25519, host verification, audit logging, and no private key exposure. |
| `SEIS-BL-017` | P2 | Documentation consistency | Replace stale `UIXAppTTR`-only claims with current SEIS/main wording where appropriate. | Historical docs remain historical; active docs are current. |
| `SEIS-BL-018` | P2 | Architecture maturity | Add component map, data model, API design, and deployment topology docs. | Architecture docs identify current, planned, and blocked surfaces. |
| `SEIS-BL-019` | P2 | Evaluation | Define prompt, routing, agent, and model-evaluation smoke gates. | Evaluation docs avoid benchmark claims without runs. |
| `SEIS-BL-020` | P2 | Provenance | Add source-basis and archive-review docs. | Historical AI archives are classified as reference, duplicate, unsafe, or promoted intent. |
| `SEIS-BL-021` | P3 | Contributor experience | Add issue forms or templates for governance, security-adjacent reports, and architecture proposals. | Templates route sensitive items away from public issues. |
| `SEIS-BL-022` | P3 | Release notes | Add CHANGELOG discipline and release note template. | Future release PRs update changelog consistently. |

## Deferred Dangerous Work

These actions are intentionally not performed in this foundation pass:

- Push to GitHub.
- Merge any PR.
- Force-push or rewrite history.
- Delete branches or files.
- Remove release archives or local snapshot folders.
- Change repository settings or visibility.
- Deploy, create release tags, or modify production infrastructure.
- Connect to external APIs.
- Run SSH commands.
- Install dependencies.
- Run model training, benchmarks, or dataset downloads.

Each item needs explicit human approval and a rollback plan before execution.
