# SEIS Master Backlog

Date: 2026-06-20

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
| `SEIS-BL-001` | P0 | Repository hygiene | Review pre-existing deleted files and decide restore, replace, or intentional removal. | `docs/reviews/REPOSITORY_HYGIENE_DELETION_REVIEW.md` records current classification; final acceptance requires `git status` no longer contain unexplained deletions. |
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
| `SEIS-BL-023` | P1 | Non-LLM platform | Build Command Center and Platform OS foundations that work without an LLM. | Product mission, Platform OS architecture, and module contracts are documented. |
| `SEIS-BL-024` | P1 | Repository intelligence | Define deterministic repository scanners for docs, links, risky files, generated folders, stale docs, validation gaps, and readiness blockers. | Repository intelligence plan exists with output records and safe scan rules. |
| `SEIS-BL-025` | P1 | Workflow platform | Define task queues, review queues, approval queues, validation queues, and emergency stop behavior. | Approval/workflow platform doc exists and dangerous actions are gated. |
| `SEIS-BL-026` | P1 | Design system | Define Command Center design tokens, component states, accessibility rules, and localization readiness. | Design-system foundation exists and supports non-LLM Command Center UI. |
| `SEIS-BL-027` | P1 | Readiness system | Define public-readiness and release-readiness dry-runs with evidence records. | Readiness system doc exists with states, evidence fields, and dry-run principles. |
| `SEIS-BL-028` | P1 | Goal Tracking OS | Define SEIS vision, long-term goals, schema, milestone map, review cadence, and product view. | `docs/goals/` docs, Goal Tracking Center product docs, and review report exist. |
| `SEIS-BL-029` | P1 | Goal evidence | Connect each active/planned goal to evidence, validation method, blockers, and next safe action. | Long-term goal registry uses relative evidence links or marks `evidence unavailable`. |
| `SEIS-BL-030` | P2 | Goal data model | Convert Markdown goal registry into static JSON fixture data for Command Center. | Fixture data validates against goal schema and renders without LLM. |
| `SEIS-BL-031` | P2 | Goal review cadence | Continue real daily, weekly, and monthly reviews using templates; current daily, weekly, and monthly foundation reviews are recorded. | Review records include date, scope, evidence, blockers, and validation output. |
| `SEIS-BL-032` | P1 | Goal validator | Keep structured goal records machine-checkable without LLM. | `npm run check:goal-tracking` validates required docs, fields, statuses, blockers, and evidence links. |
| `SEIS-BL-033` | P1 | Public readiness | Remove or parameterize hardcoded local machine paths in plugin bundle scripts. | Package/scripts use documented environment variables or repo-relative defaults and public-readiness scan has no machine-specific path hits. |
| `SEIS-BL-034` | P1 | Goal evidence | Maintain structured evidence records for validation, blockers, repository state, commits, reviews, and scoped security scans. | Evidence ledger validates, uses relative paths, records limitations, and links records to goal ids. |
| `SEIS-BL-035` | P1 | Goal execution | Maintain structured tasks, subtasks, blockers, decisions, and next safe actions without LLM dependency. | Execution registry validates, links tasks to goal ids/evidence ids/blocker ids/decision ids, and keeps dangerous actions approval-gated. |
| `SEIS-BL-036` | P1 | Command Center goal view | Generate a non-LLM Command Center Goal Tracking view model from structured records. | `npm run check:goal-command-center-view` passes and generated view exposes progress cards, blockers, next actions, evidence, decisions, and UX guardrails. |
| `SEIS-BL-037` | P1 | Static Goal Tracking UI | Generate a static Goal Tracking Center page from the Command Center view model. | `npm run check:goal-command-center-static` passes and the page exposes progress cards, blockers, next actions, validation, decisions, readiness, and UX guardrails. |
| `SEIS-BL-038` | P1 | Goal review cadence records | Maintain structured daily, weekly, and monthly review cadence without fake performed reviews. | `npm run check:goal-tracking` validates planned cadence records and the static page exposes review cadence. |
| `SEIS-BL-039` | P1 | Goal planning horizons | Maintain structured yearly, quarterly, monthly, weekly, and active-project planning horizons. | `npm run check:goal-tracking` validates horizon/project records and the static page exposes planning horizons plus active projects. |
| `SEIS-BL-040` | P1 | Goal progress ledger | Maintain structured completed, deferred, and follow-up records with evidence and limitations. | `npm run check:goal-tracking` validates progress ledger records and the static page exposes completed, deferred, and follow-up sections. |
| `SEIS-BL-041` | P1 | Goal objective coverage | Maintain structured coverage records mapping the Goal Tracking OS mission to evidence, limitations, and next safe actions. | `npm run check:goal-tracking` validates objective coverage records and the static page exposes objective coverage. |
| `SEIS-BL-042` | P1 | Goal review log | Maintain performed daily, weekly, and monthly review logs only when current-period evidence exists. | `npm run check:goal-tracking` validates review log records and the static page exposes performed reviews separately from cadence. |
| `SEIS-BL-043` | P1 | Goal completion gate | Maintain a strict completion gate that prevents full Goal Tracking OS completion claims until every requirement is proved. | `npm run check:goal-tracking` validates completion gate records and the static page exposes the final completion decision. |
| `SEIS-BL-044` | P1 | Command Center shell | Maintain a static non-LLM Command Center shell that links Goal Tracking, roadmap, evidence, approval, readiness, AI Core, and docs surfaces. | `npm run check:command-center-shell` validates shell source, generated HTML, blocked-state visibility, and absence of fake progress controls. |
| `SEIS-BL-045` | P1 | Goal requirement matrix | Maintain requirement-level Goal Tracking OS coverage with proof, gaps, evidence ids, and next safe actions. | `npm run check:goal-tracking` validates requirement matrix records and the static page exposes the Requirement Matrix panel. |
| `SEIS-BL-046` | P1 | Goal milestone timeline | Maintain a generated milestone timeline derived from goal, planning horizon, and active project records. | `npm run check:goal-tracking` validates milestone records and the static page exposes the Milestone Timeline panel without fake progress percentages. |

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
