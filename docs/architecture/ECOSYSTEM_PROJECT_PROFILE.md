# SEIS Ecosystem Project Profile

`content/ecosystem/public-project-profile.json` is the public-safe SEIS identity consumed by the future curated flagship.

It declares SEIS as the canonical `platform-runtime` source and groups current source-backed capabilities across platform foundations, AI orchestration, evidence/security, and the developer ecosystem.

## What the profile proves

- the exact source repository and project role
- the current repository visibility
- the declared public-export state
- bounded capability groups using reviewed status vocabulary
- an explicit no-credential, no-private-data, no-runtime-authority boundary

## What the profile does not prove

- that SEIS source code has been imported into the flagship
- that providers, agents, MCP servers, SSH, deployment, or background execution are live
- that a module has passed the flagship promotion ledger
- that repository history may be merged automatically

## Validation

```sh
node --test test/public-project-profile.test.mjs
node scripts/check-public-project-profile.mjs
node scripts/check-unified-ecosystem-bridge.mjs
```

The validator binds the profile to `content/ecosystem/unified-bridge.json`, rejects identity drift, duplicate capability declarations, unsafe command declarations, sensitive fields, private-data widening, runtime authority, and cross-repository writes.
