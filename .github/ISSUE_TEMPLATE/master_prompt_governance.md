---
name: SEIS Master Prompt governance
description: Track a governance, repository, SSH, cloud, or plugin change against the SEIS Master Prompt.
title: "SEIS Master Prompt governance: "
labels: [governance, seis]
---

## Scope

Link the affected surfaces:

- docs/governance/seis-master-prompt.md
- docs/governance/seis-master-prompt-change-checklist.md
- data/seis-master-prompt-implementation-map.json
- data/seis-master-prompt-acceptance-criteria.json
- scripts/check-seis-master-prompt.mjs

## Required validation

```bash
npm run check:seis-master-prompt-report
npm run check:seis-master-prompt
npm run check:seis-public-readiness
```

## Waiver

If validation cannot run, explain why it is explicitly waived by the maintainer.

## Safety rule

No deploy, merge, push, delete, or history rewrite is allowed without explicit maintainer approval and current evidence.
Do not include secrets, private vault material, real host credentials, or browser-visible provider keys. Label live AI, SSH, deployment, GitHub, Pages, or release claims as demo, planned, blocked, or auth-gated unless current evidence proves them.
