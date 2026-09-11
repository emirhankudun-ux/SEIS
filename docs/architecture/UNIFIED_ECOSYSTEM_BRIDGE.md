# Unified Ecosystem Bridge

SEIS participates in a curated multi-repository ecosystem with Eleni-Neferi, Pantechnoepistemonoesis, and the portfolio presentation surface.

This bridge is intentionally narrower than a monorepo merge. Each source repository remains canonical for its own domain until a reviewed public flagship integration explicitly promotes a stable contract or module.

## SEIS role

SEIS owns the platform and runtime layer: AI Core, agents, MCP/tool governance, workspace/runtime surfaces, native platform direction, search, files, execution evidence, and shared engineering infrastructure.

## Shared contract lanes

The first interoperability lanes are:

- agent runtime
- intelligence routing
- MCP and tool boundaries
- knowledge exchange
- design-system tokens
- evidence and verification

No lane grants cross-repository write authority. A peer repository may consume a published contract or public-safe artifact, but it does not become an owner of SEIS runtime state.

## Public flagship direction

A future public flagship repository may compose reviewed slices from the source projects. That repository should be curated rather than a blind history merge: duplicate runtimes are consolidated, private material is excluded, licenses are verified, and capability claims remain evidence-backed.

The machine-readable contract is `content/ecosystem/unified-bridge.json` and can be checked with:

```sh
node scripts/check-unified-ecosystem-bridge.mjs
```

## Non-claims

This foundation does not claim that the repositories are already merged, that cross-repository execution is live, that credentials are shared, or that the future flagship repository is release-ready.
