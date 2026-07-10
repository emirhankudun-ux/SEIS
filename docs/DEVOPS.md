# SEIS DevOps

Status: incremental, approval-gated

## CI

CI should validate syntax, tests, schemas, governance, public readiness,
documentation, security boundaries, and Swift packages when relevant. Existing
workflows are extended narrowly and GitHub Actions remain pinned.

## Deployment

Deployment is separate from local verification. It requires explicit approval,
environment identity, dry-run or preview evidence, secrets outside the repo,
health checks, observability, and rollback.

## Observability

Track build and test state, repository health, documentation coverage,
dependency health, accessibility, performance, provider state, Apple readiness,
and public readiness without exposing secrets.

## Automation Boundary

Formatting, linting, testing, schema checks, and report drafting are safe.
Production deploys, remote mutation, secret changes, migrations, and security
policy weakening remain restricted.
