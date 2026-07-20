# SEIS Public Install Evidence

`seis-public-install-evidence@seis-repo` is a public, app-owned SEIS Repo
card for inspecting the designated sanitized independent-runner evidence gate.

## Public boundary

- Source: `plugins/seis-core/seis-public-install-evidence`
- Marketplace: `SEIS Repo` (`seis-repo`)
- Audience: everyone
- Contract: `content/development/seis-public-install-evidence.json`
- Goal: `SEIS-GOAL-021`

The plugin reads only fixed public marketplace, public-family, evidence-contract,
and designated evidence-record paths. It does not accept arbitrary input paths,
install or enable packages, publish, deploy, push, write files, read secrets, or
access the network.

## Evidence states

- **Not recorded**: no designated record exists; public release remains blocked.
- **Invalid**: a record exists but violates the independent-runner or redaction
  contract; raw evidence is never emitted.
- **Recorded and valid**: the record passes the public-safe contract, but human
  approval remains mandatory before public preview, release, publish, external
  writes, deployment, SSH, or live-provider actions.

A valid independent-runner record is not proof of current Codex enablement and
does not grant release authority.

## Validate

```bash
npm run automation:seis-public-install-evidence
npm run check:seis-public-install-evidence
npm run check:seis-core-public-install-evidence
npm run check:seis-public-plugin-independent-runner-evidence
npm run check:seis-repo-marketplace
```

To inspect the designated evidence state directly:

```bash
node plugins/seis-core/seis-public-install-evidence/scripts/seis-public-install-evidence-mcp-server.mjs --evidence
```
