# SEIS-SSH Setup

SEIS-SSH is the public-safe remote/cloud development lane for SEIS. This guide
describes the safe setup boundary without exposing credentials or claiming live
remote access.

## Current Status

SEIS-SSH is documentation, metadata, and readiness-check driven unless a live
connection has been explicitly configured and verified outside the public
repository.

The public repo may contain:

- sample commands with placeholders
- dry-run readiness checks
- demo-only profile metadata
- cloud and rollback readiness docs
- dangerous-command warnings
- validator-backed claims about what is blocked

The public repo must not contain real SSH private keys, real host credentials,
private IP notes, provider tokens, `.env` values, or production deployment
secrets.

## Safe First Checks

Inspect the credential-free model:

```bash
npm run check:seis-ssh-access-model
npm run check:seis-ssh-picker-compatibility
npm run check:seis-ssh-cloud-roadmap
```

These checks can describe readiness and blockers. They must not be treated as a
live connection claim unless a strict online check passes in the current
environment.

## Live Claim Gate

Only claim live SEIS-SSH access after current evidence from an approved strict
check, for example:

```bash
npm run cloud:ssh:online:strict
```

If the strict check is not run or fails, report SEIS-SSH as planned, offline,
blocked, auth-gated, or metadata-only.

## Placeholder-Only Examples

Use placeholders in public docs:

```text
<public-host>
<ssh-user>
<public-key-path>
<provider-project>
```

Do not replace placeholders with real private host details in committed files.

## Dangerous Actions Require Review

Require explicit human approval before:

- changing firewall rules
- mutating remote users or authorized keys
- replacing SSH daemon config
- running destructive cleanup
- printing credentials
- printing private keys
- switching live transports
- pushing, merging, releasing, or publishing from a remote session

## Related Docs

- [`docs/operations/seis-cloud-foundation.md`](./operations/seis-cloud-foundation.md)
- [`server/cloud/ssh-ai-shell/README.md`](../server/cloud/ssh-ai-shell/README.md)
- [`docs/security/security-baseline.md`](./security/security-baseline.md)
- [`seis-brain/vault/12_Context_Packs/SEIS SSH Context.md`](../seis-brain/vault/12_Context_Packs/SEIS%20SSH%20Context.md)

## Validation

```bash
npm run check:seis-ssh-access-model
npm run check:seis-ssh-picker-compatibility
npm run check:seis-ssh-cloud-roadmap
npm run check:seis-public-readiness-docs
git diff --check
```

Do not use passing docs checks as proof of a live SSH session.
