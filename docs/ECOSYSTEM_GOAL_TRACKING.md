# Ecosystem Goal Tracking

Status: active bootstrap specification; not yet complete across repositories

Goals: `ECO-GOAL-0001`, `ECO-GOAL-0003`, `ECO-GOAL-0007`

Root [`AGENTS.md`](../AGENTS.md) remains the highest repository authority. This
document is the operational entrypoint for the ecosystem Goal schema and does
not replace the SEIS-specific rules in
[`SEIS_GOAL_TRACKING.md`](SEIS_GOAL_TRACKING.md).

## Read order

Before meaningful ecosystem work, read:

1. root `AGENTS.md`;
2. the current repository's `project.ecosystem.yaml`;
3. the active Goal YAML and its dependencies;
4. [`REPOSITORY_OWNERSHIP.md`](REPOSITORY_OWNERSHIP.md) and the machine-readable
   ownership registry;
5. linked ADRs, architecture documents, and current Git state.

If a canonical repository lacks a valid worktree or manifest, keep the affected
work blocked rather than writing through incomplete Git metadata or borrowing
another project's identity.

## Canonical bootstrap artifacts

| Artifact                                                                                                                                                        | Role                                     | Current boundary                                                            |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | --------------------------------------------------------------------------- |
| [`project.ecosystem.yaml`](../project.ecosystem.yaml)                                                                                                           | SEIS machine-readable identity           | Present and locally validated in this worktree only.                        |
| [`data/repository-ownership.yaml`](../data/repository-ownership.yaml)                                                                                           | Repository and module ownership registry | Product-family baseline; shared-module inventory remains incomplete.        |
| [`schemas/project-ecosystem.schema.json`](../schemas/project-ecosystem.schema.json)                                                                             | Project manifest contract                | Bootstrap schema.                                                           |
| [`schemas/repository-ownership.schema.json`](../schemas/repository-ownership.schema.json)                                                                       | Ownership contract                       | Bootstrap schema with semantic checks in the validator.                     |
| [`schemas/ecosystem-goal.schema.json`](../schemas/ecosystem-goal.schema.json)                                                                                   | Goal YAML contract                       | Schema version 2 bootstrap.                                                 |
| [`goals/blocked/ECO-GOAL-0001--project-manifests-and-canonical-ownership.yaml`](../goals/blocked/ECO-GOAL-0001--project-manifests-and-canonical-ownership.yaml) | Blocked ownership record                 | Blocked on private-repository manifests, authorization, and full inventory. |
| [`goals/active/ECO-GOAL-0003--goal-schema-validation-and-ci.yaml`](../goals/active/ECO-GOAL-0003--goal-schema-validation-and-ci.yaml)                           | Active validation and CI record          | In review; dated workflow evidence is recorded below.                       |
| [`goals/active/ECO-GOAL-0007--five-million-character-goal-tracking-prompt.yaml`](../goals/active/ECO-GOAL-0007--five-million-character-goal-tracking-prompt.yaml) | Goal Tracking prompt compiler record      | In progress; generated corpus remains local and ignored.                    |
| [`adr/0002-ecosystem-governance-bootstrap-ownership.md`](adr/0002-ecosystem-governance-bootstrap-ownership.md)                                                  | Coordination and ownership decision      | Proposed; requires review before promotion.                                 |

Existing SEIS JSON goal records remain valid SEIS operational history. They are
not silently rewritten, renumbered, or presented as Goal schema v2 records.

## Goal Tracking update prompt package

`ECO-GOAL-0007` owns a compact, reviewed prompt pack and deterministic compiler
for Goal Tracking updates. It produces exactly 5,000,000 Unicode code points
after NFC and LF normalization, plus payload and contextual chunks, a manifest,
and SHA-256 evidence. The generated corpus lives only below ignored `build/`;
Git tracks the modular sources, compiler, tests, and golden hashes instead of a
review-hostile five-megacharacter diff.

The corpus does not replace root `AGENTS.md`, the selected Goal, ownership, or
current Git evidence. It routes the operator back to those current authorities
and keeps schema-v2 YAML, legacy SEIS JSON Goals, operational trackers, Omega
records, roadmap queues, and generated views distinct. Five million characters
are not a claim about tokens or any provider's single-request context window.

## Repository truth

Observation date: 2026-07-13. Each repository's verification method and exact
`observed_at` value are recorded in
[`data/repository-ownership.yaml`](../data/repository-ownership.yaml); the
statements below are that dated snapshot, not timeless or continuously refreshed
claims.

- `emirhankudun-ux/SEIS` was observed locally and through the authenticated
  GitHub connector as the canonical public SEIS repository and current bootstrap
  coordinator.
- `emirhankudun-ux/Eleni-Neferi-` was observed through the authenticated GitHub
  connector as the canonical private Eleni-Neferi repository; its default branch
  is `main`, its remote manifest is missing, and the current top-level local
  candidate is not a valid worktree.
- `emirhankudun-ux/Pantechnoepistemonoesis` was observed through the
  authenticated GitHub connector as the canonical private Pantechnoesis
  repository; its default branch is `main`, its remote manifest is missing, and
  the current top-level local candidates are not valid worktrees.

These are dated session observations, not CI-reverified repository metadata.

SEIS owns SEIS product modules and provisionally owns only the governance
bootstrap artifacts in this repository. Eleni-Neferi owns its identity and
media domain. Pantechnoesis owns its AI and knowledge domain. Coordination does
not imply product ownership or permission to publish private repository data.

## Goal execution contract

Use project-aware immutable IDs such as `ECO-GOAL-*`, `SEIS-GOAL-*`,
`ELENI-GOAL-*`, `PANTECH-GOAL-*`, and `WEB-GOAL-*`. Store schema-v2 records
under `goals/backlog`, `goals/active`, `goals/blocked`, `goals/completed`, or
`goals/archived`. Empty lifecycle directories are retained explicitly.

Every schema-v2 Goal records the canonical architecture, product, brand and
creative direction, design-system, UI/UX, engineering, AI integrity,
model/provider routing, agent permission, MCP/plugin/tool, security, privacy,
accessibility, performance, data, documentation, DevOps, testing, release, and
public-readiness gates. Each gate is explicitly passed, failed, blocked,
required, optional, or not applicable; omission is not treated as approval.

For each meaningful task:

1. confirm the canonical owner, scope, non-goals, dependencies, security class,
   validation, risks, and rollback;
2. select the highest-priority unblocked Goal in the smallest reviewable scope;
3. work on a non-default branch and avoid destructive repository repair;
4. produce a concrete artifact and exact reproducible evidence;
5. keep required failed or blocked gates visible;
6. update status only through an allowed lifecycle transition;
7. prepare a focused issue, commit, and pull request when required.

A Goal is not complete because files exist or a branch was pushed. Acceptance
criteria, Definition of Done, required gates, evidence, rollback, and repository
state must agree.

`github.commit_sha` records the latest substantive implementation commit whose
evidence belongs to that Goal. A metadata-only follow-up commit may be newer so
that the Goal can record the immutable implementation SHA without attempting an
impossible self-reference.

## Validation

Run from the SEIS repository root:

```bash
npm run check:ecosystem-foundation
npm run test:ecosystem-foundation
npm run test:goal-tracking-mega-prompt
npm run check:goal-tracking-mega-prompt
git diff --check
```

These commands validate the local bootstrap contracts and negative fixtures.
On 2026-07-13, pull request 177 at substantive implementation commit
`cf972f6f9275fec305019fdc33b0bf5cda2d5cbe` supplied successful
[Foundation Check](https://github.com/emirhankudun-ux/SEIS/actions/runs/29212360711),
[CI](https://github.com/emirhankudun-ux/SEIS/actions/runs/29212360734),
[CodeQL](https://github.com/emirhankudun-ux/SEIS/actions/runs/29212360739),
[Guardian Security Scan](https://github.com/emirhankudun-ux/SEIS/actions/runs/29212360709),
[System Gates](https://github.com/emirhankudun-ux/SEIS/actions/runs/29212360727),
[Open Source Governance](https://github.com/emirhankudun-ux/SEIS/actions/runs/29212360716),
and [Master Prompt Governance](https://github.com/emirhankudun-ux/SEIS/actions/runs/29212360706)
evidence. These dated runs prove the named commit passed those workflows; they
do not prove private-repository contents, deployments, provider connections,
or ecosystem-wide publication readiness.

## Current blockers

1. Eleni-Neferi needs a valid owner-authorized worktree and a private-accurate
   manifest committed through a non-default branch.
2. Pantechnoesis needs the same, including its repository-required publication
   authorization.
3. Shared modules and consumers must be inventoried from all three valid
   repositories before ownership coverage can be called complete.
4. The proposed ADR and focused pull request require human review.

## Public/private and rollback boundaries

Do not copy private content, credentials, logs, model data, personal memory, or
unreviewed assets into this public SEIS repository. Record only public-safe
repository identity and governance metadata.

Rollback is a focused revert of the governance changes. This bootstrap performs
no repository move, data migration, secret change, bidirectional sync, remote
write, deployment, or destructive repair.
