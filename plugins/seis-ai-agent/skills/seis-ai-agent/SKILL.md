---
name: seis-ai-agent
description: Use SEIS-Agent as the combined SEIS orchestration layer across SEIS, SEIS-Cloud, SEIS-Code, SEIS-Design, and SEIS-Data.
---

# SEIS-Agent

Use this skill when the user wants the combined SEIS agent system rather than one
isolated lane. Keep development directly inside the SEIS repository.

## Canonical Context

- Canonical repository: `emirhankudun-ux/SEIS`
- Canonical branch: `main`
- Repo marketplace: `.agents/plugins/marketplace.json`
- Install id: `seis-ai-agent@seis-repo`
- Composed plugins: `seis`, `seis-cloud`, `seis-code`, `seis-design`, `seis-data`
- Operating identity: `SEIS-Agent`

## Validation

```bash
npm run check:seis-ai-agent
npm run check:seis-operating-identities
npm run quality
```
