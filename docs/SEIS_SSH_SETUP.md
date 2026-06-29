# SEIS-SSH Setup (Safe)

## Purpose

Provide public-safe onboarding for remote-development concepts and readiness checks.

## Scope

- Local-first docs and planning
- Approval-ready checklists
- Rollback and evidence discipline

## Safe profile model

Use sample metadata only in docs:

- profile label
- reviewed owner
- required approvals
- readiness status

## Minimal onboarding checklist

- confirm repository safety and branch hygiene
- verify local tool versions for your environment
- verify no secret placeholders are committed
- document open questions and ownership

## Deployment readiness

Only after explicit approval and evidence should deployment claims be made. Live
SSH execution remains out-of-scope for docs-only PRs.

## Do not include

- private keys
- real hostnames with credentials
- raw private environment values

## Rollback-first principle

For every planned rollout item, define rollback owner, impact, and recovery step.
