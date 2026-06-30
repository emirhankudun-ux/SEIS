# SEIS AI Fresh-Clone Readiness

`content/development/seis-ai-fresh-clone-readiness.json` defines what must be
true before SEIS AI can be called ready for everyone on GitHub.

MCP resource:

`seis://ai/fresh-clone-readiness.json`

Status: `contract-defined-not-release-evidence`.

This is a readiness contract, not release evidence. It does not perform a
network clone, install models, download checkpoints, train models, run
inference, call providers, provision cloud/GPU capacity, execute SSH, push,
merge, deploy, release, grant runtime authority, or prove AGI.

## Current Decision

| Decision | Status |
| --- | --- |
| Fresh clone verified | False |
| GitHub ready for everyone | False |
| Public ready for Local Demo | True |
| Public ready as AGI | False |
| Runtime authority | False |

## Required Commands

```bash
npm run check:seis-ai-fresh-clone-readiness
npm run check:seis-ai-public-readiness
```

The first command validates this fresh-clone contract. The second command runs
the full SEIS AI public readiness gate.

## Fresh-Clone Acceptance Gates

- Install and no-key startup evidence.
- AI readiness validator evidence.
- Security and secret-boundary evidence.
- Public claim review evidence.
- Release notes, rollback plan, and maintainer approval.

## Required Before Fresh Clone Verified

- Fresh clone created from the target commit.
- Dependencies installed without secrets.
- `npm run check:seis-ai-public-readiness` passes in the clone.
- README Local Demo instructions reviewed.
- `SECURITY.md` reviewed.
- Secret scan completed.
- Human reviewer records the target commit and environment.

## Required Before GitHub Ready For Everyone

- `freshCloneVerified` is true.
- All fresh-clone acceptance gates are satisfied or explicitly approved.
- All required CI checks are green on the target commit.
- Human release approval is recorded.
- Release notes and rollback plan are accepted.
- AGI and 512B claim boundaries are preserved.

## Forbidden Claims

- Fresh clone success proves AGI.
- Fresh clone success proves 512B inference.
- Local Demo is a trained 512B model.
- A passing readiness validator grants runtime authority.
- A public README can replace model cards, dataset cards, benchmark reports, or
  training logs.

## Related

- `content/development/seis-ai-public-readiness-program.json`
- `content/development/seis-agi-github-user-readiness-gates.json`
- `content/development/seis-agi-public-readiness-evidence.json`
- `README.md`
- `SECURITY.md`
