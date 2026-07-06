# SEIS Troubleshooting

Use this guide when a contributor, maintainer, or AI agent gets stuck while
running the public SEIS workflow. Prefer the smallest fix that preserves the web
demo, Apple-first direction, Second Brain public safety, and SEIS-SSH
credential boundary.

## npm Is Not Available

Symptom:

```text
command not found: npm
```

Use Node.js directly when the script does not require package-manager features:

```bash
node scripts/check-open-source-governance.mjs
node scripts/check-foundation.mjs
node scripts/check-seis-public-readiness-docs.mjs
node scripts/check-seis-env-example.mjs
```

Do not install a new package manager inside the repository just to run a
single-file validation script.

## Node.js Is Missing

Install or activate a maintained Node.js runtime only if your lane needs the
JavaScript checks. If your change is Apple-only and does not touch shared docs
or generated JavaScript records, run the Swift lane first and report that Node
checks were not available.

## Swift Or Xcode Checks Are Missing

Apple-native checks require Swift tooling. If Swift is unavailable, do not add
fake Swift evidence. Report the missing toolchain and keep the change limited to
docs or metadata that can be reviewed without compilation.

When Swift is available, use:

```bash
swift test --package-path packages/seis_platform_swift
```

## Demo Seems To Require A Key

Demo mode should not require API keys, paid providers, SSH credentials, private
cloud accounts, a database, or authentication. If a screen suggests otherwise,
classify it as a public-readiness bug.

Expected language:

- demo
- planned
- manual
- blocked
- auth-gated
- metadata-only

Forbidden language without evidence:

- live provider call
- verified SSH connection
- production deployment
- real model route
- public release ready

## SEIS-SSH Looks Offline

SEIS-SSH public docs and metadata are allowed without live SSH. Do not claim
remote access unless the relevant strict online check has passed in the current
environment.

Safe actions:

- inspect docs and metadata
- run dry-run readiness checks
- update demo-only profile descriptions
- document blockers

Unsafe actions without approval:

- print credentials
- print private keys
- mutate remote hosts
- change firewalls
- run destructive cleanup
- force push

## Secret Scan Finds A Pattern

Do not print the matching value. Report only the path and category, then stop
and ask for human review if the value may be real.

Dangerous categories include provider keys, GitHub tokens, SSH private keys,
cloud secret keys, private credentials, and personal sensitive data.

## Worktree Is Dirty

SEIS often has parallel work in progress. Before editing, run:

```bash
git status --short
```

Do not revert files you did not change. If unrelated edits are present, leave
them alone and keep your scope narrow.

## Public Readiness Check Fails

Run:

```bash
npm run check:seis-public-readiness-docs
```

If `npm` is unavailable:

```bash
node scripts/check-seis-public-readiness-docs.mjs
```

Then update only the missing public-readiness docs or links named by the
failure. Do not satisfy the checker with empty placeholder text.

## Env Example Check Fails

Run:

```bash
npm run check:seis-env-example
```

If `npm` is unavailable:

```bash
node scripts/check-seis-env-example.mjs
```

Keep `.env.example` placeholder-only. Provider key slots and token slots must
stay blank, `VITE_` variables must not expose secrets, and model alias defaults
must stay empty until a live adapter document verifies them.

## Hermes Reports Missing Authentication

If Hermes reports missing authentication, treat that as an auth-gated local
assistant condition, not a SEIS repository failure. Do not paste provider keys,
Nous Portal credentials, GitHub tokens, SSH private keys, or `.env` contents
into docs, prompts, commits, issues, or generated reports.

Safe fallback:

```bash
git status --short
npm run check:seis-public-readiness
npm run check:foundation
```

Continue with no-key repository validation and record the Hermes authentication
state as local-only. Live assistant/provider recovery belongs outside the public
repo unless a credential-free smoke check is explicitly documented.

## Where To Ask

- Use `SUPPORT.md` for questions, ideas, bugs, and feature routing.
- Use `SECURITY.md` for private vulnerability reports.
- Use `.github/ISSUE_TEMPLATE/` for actionable public issues.
- Use `.github/DISCUSSION_TEMPLATE/` for broad ideas, Q&A, and show-and-tell.
