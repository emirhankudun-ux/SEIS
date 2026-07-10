---
type: architecture
module: seis-provider-registry
status: draft
visibility: public
updated: 2026-06-29
---

# Provider Registry

Tracks which AI providers/tools are available, missing-key, or blocked.

- explicit state model (`available`, `missing key`, `disabled`, `rate limited`,
  `error`)
- no silent fallback across unknown states
