# Prompt Engine

Status: Foundation contract

The prompt engine manages reusable, versioned prompt assets for SEIS AI Core.
It exists to make AI behavior reviewable, testable, and safe across provider
models and local models.

## Responsibilities

- define prompt file format and metadata
- version system, task, review, safety, repository, and app-operation prompts
- bind prompts to agent roles, model routes, and evaluation profiles
- track provenance and review status
- prevent secrets, copied proprietary prompts, and restricted source material
- support prompt regression tests

## Prompt Metadata

Each prompt should define:

- `id`
- `version`
- `owner`
- `status`
- `purpose`
- `allowedInputs`
- `forbiddenInputs`
- `expectedOutput`
- `safetyRules`
- `evaluationProfile`
- `changeReason`

## Prompt Families

| Family | Purpose |
| --- | --- |
| Assistant behavior | SEIS voice, reasoning style, security posture, and documentation style. |
| Repository scan | Inspect files, branch state, docs, risks, and validation options. |
| PR review | Review diffs for bugs, security, tests, and architecture fit. |
| Security review | Secret safety, permission boundaries, and threat-model prompts. |
| Documentation update | Update docs without overclaiming implementation. |
| Command Center operation | Explain UI states, approval requests, evidence links, and degraded mode. |
| Clean-room review | Convert restricted references into sanitized requirements only. |

## Versioning Rules

- Prompt versions must be stable and reviewable.
- Changes that alter behavior require a change note.
- Prompts must not include provider API keys, private data, or copied private
  system prompts.
- Prompt packs are application-layer assets, not trained model weights.

## Regression Fixture Boundary

This recovery branch includes the local prompt regression fixture pack under
`packages/prompt-engine/`:

- `schemas/prompt-regression-suite.schema.json`
- `fixtures/assistant-surface-regression-suite.json`
- `npm run check:prompt-regression-fixtures`

The fixture pack covers
repository, documentation, architecture, security, PR, roadmap, and research
assistant surfaces. It should verify expected output fields, approval triggers,
forbidden context boundaries, evidence requirements, and non-claims for
fixture-only prompt behavior.

This recovery document does not imply live provider execution, provider routing,
benchmark performance, model safety certification, fine-tuning, or SEIS-owned
model training.

## First Implementation Shape

Start with Markdown prompt templates plus metadata headers. Add a loader only
after prompt regression tests exist. Do not add a hidden prompt store.
