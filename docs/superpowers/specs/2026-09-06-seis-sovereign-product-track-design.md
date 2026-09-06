# SEIS Sovereign Product Track Design

## Goal

Make SEIS product ownership explicit and machine-verifiable after the decision to develop each system independently.

## Architecture

A canonical JSON contract describes SEIS-owned domains, sibling non-ownership, delivery tracks, evidence paths, interoperability constraints, and truth boundaries. A dependency-free validator, read-only CLI, unit tests, and CI enforce the contract. The existing ecosystem manifest is narrowed from umbrella coordination to sovereign runtime ownership.

## Success criteria

- SEIS remains the canonical public Apple-first creative engineering OS;
- sibling identities and source histories cannot be absorbed silently;
- all delivery tracks point to tracked evidence;
- cross-repository writes, source imports, authority transfer, live providers, and automatic deployment fail closed;
- focused tests and existing ecosystem validation remain green.
