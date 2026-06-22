# SEIS Master Index

Date: 2026-06-22

## Purpose

This index is the current navigation surface for the SEIS foundation pass. It
does not claim every listed system is implemented. It links current evidence,
planned foundations, blockers, and next safe actions for `@seis`,
`@seis-cloud`, `@seis-code`, `@seis-design`, and `@seis-data`.

## Source Of Truth

| Area | Document |
| --- | --- |
| Repository operating rules | [../AGENTS.md](../AGENTS.md) |
| Product overview | [../README.md](../README.md) |
| Root architecture pointer | [../ARCHITECTURE.md](../ARCHITECTURE.md) |
| Root roadmap pointer | [../ROADMAP.md](../ROADMAP.md) |
| Current status | [STATUS.md](STATUS.md) |
| Documentation index | [INDEX.md](INDEX.md) |
| Integration and GitHub development policy | [governance/seis-integration-and-github-development.md](governance/seis-integration-and-github-development.md) |
| Master backlog | [roadmap/MASTER_BACKLOG.md](roadmap/MASTER_BACKLOG.md) |
| Next PR queue | [roadmap/NEXT_PR_QUEUE.md](roadmap/NEXT_PR_QUEUE.md) |
| Ultimate foundation review | [reviews/SEIS_ULTIMATE_FOUNDATION_REVIEW.md](reviews/SEIS_ULTIMATE_FOUNDATION_REVIEW.md) |
| Video Hero showcase QA | [reviews/VIDEO_HERO_SHOWCASE_QA.md](reviews/VIDEO_HERO_SHOWCASE_QA.md) |

## Platform Lanes

| Lane | Current foundation |
| --- | --- |
| `@seis` | [architecture/seis-platform-lanes.md](architecture/seis-platform-lanes.md) |
| `@seis-cloud` | [operations/seis-cloud-foundation.md](operations/seis-cloud-foundation.md) |
| `@seis-code` | [product/seis-code-foundation.md](product/seis-code-foundation.md) |
| `@seis-design` | [design-system/seis-design-foundation.md](design-system/seis-design-foundation.md), [design-system/component-inventory.md](design-system/component-inventory.md) |
| `@seis-data` | [data/seis-data-foundation.md](data/seis-data-foundation.md), [data/schema-registry.md](data/schema-registry.md) |

## Command Center And AI

| Area | Document |
| --- | --- |
| Command Center foundation | [product/command-center-foundation.md](product/command-center-foundation.md) |
| Goal Tracking Center | [product/goal-tracking-center.md](product/goal-tracking-center.md) |
| SEIS Code browser foundation | [product/seis-code-foundation.md](product/seis-code-foundation.md) |
| Video Hero showcase | [product/video-hero-showcase.md](product/video-hero-showcase.md) |
| Mythic Gacha | [product/mythic-gacha.md](product/mythic-gacha.md) |
| SEIS AI Core | [ai/seis-ai-core.md](ai/seis-ai-core.md) |
| Model Router contract | [ai/model-router.md](ai/model-router.md) |
| Prompt Engine contract | [ai/prompt-engine.md](ai/prompt-engine.md) |
| Agent Runtime contract | [ai/agent-runtime.md](ai/agent-runtime.md) |
| Security baseline | [security/security-baseline.md](security/security-baseline.md) |
| AI provider audit | [audits/AI_PROVIDER_AND_CREDENTIAL_AUDIT.md](audits/AI_PROVIDER_AND_CREDENTIAL_AUDIT.md) |

## Current Evidence Records

| Evidence | Path |
| --- | --- |
| Goal records | [../content/development/seis-goal-tracking.json](../content/development/seis-goal-tracking.json) |
| Goal evidence | [../content/development/seis-goal-evidence.json](../content/development/seis-goal-evidence.json) |
| Goal execution | [../content/development/seis-goal-execution.json](../content/development/seis-goal-execution.json) |
| Generated Goal Tracking view model | [../content/development/seis-goal-command-center-view.json](../content/development/seis-goal-command-center-view.json) |
| SEIS integration map | [../content/development/seis-integration-map.json](../content/development/seis-integration-map.json) |
| Static Goal Tracking page | [../apps/web/goal-tracking.html](../apps/web/goal-tracking.html) |
| Static plugin interface roadmap | [../content/development/seis-plugin-interface-roadmap.json](../content/development/seis-plugin-interface-roadmap.json) |
| Static plugin interface surface | [../apps/web/index.html](../apps/web/index.html#plugin-interfaces) |
| SEIS Code route | [../apps/web/seis-code.html](../apps/web/seis-code.html) |
| SEIS Code runtime | [../apps/web/seis-code.js](../apps/web/seis-code.js) |
| Video hero manifest | [../apps/web/showcase/video-heroes.json](../apps/web/showcase/video-heroes.json) |
| Mythic Gacha route | [../apps/web/mythic-gacha.html](../apps/web/mythic-gacha.html) |
| Mythic atlas asset | [../apps/web/public/media/mythic/shan-hai-creature-atlas.png](../apps/web/public/media/mythic/shan-hai-creature-atlas.png) |
| Video Hero showcase QA | [reviews/VIDEO_HERO_SHOWCASE_QA.md](reviews/VIDEO_HERO_SHOWCASE_QA.md) |
| Design component inventory | [../content/development/seis-design-component-inventory.json](../content/development/seis-design-component-inventory.json) |
| Data schema registry | [../content/development/seis-data-schema-registry.json](../content/development/seis-data-schema-registry.json) |
| Cloud environment record | [../deploy/cloud-environment.json](../deploy/cloud-environment.json) |
| Code automation plan | [../content/development/code-automation-plan.json](../content/development/code-automation-plan.json) |
| Design tokens | [../packages/design-tokens/seis.tokens.css](../packages/design-tokens/seis.tokens.css) |
| Data package | [../packages/data/README.md](../packages/data/README.md) |

## Next Safe Action

Keep the current pass documentation-first until repository hygiene blockers are
resolved. Do not stage unrelated tracked deletions, do not restore deleted files
without review, and do not run live deployment, SSH, model-provider, benchmark,
or dataset actions without explicit approval.
