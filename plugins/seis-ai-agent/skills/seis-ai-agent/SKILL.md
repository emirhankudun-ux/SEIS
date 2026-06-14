---
name: seis-ai-agent
description: Use SEIS-AI Agent as the combined SEIS orchestration layer across SEIS, SEIS Cloud, SEIS-Code, SEIS-Design, and SEIS-DATA.
---

# SEIS-AI Agent

Use this skill when the user wants the combined SEIS agent system rather than one isolated lane. Keep development directly inside the SEIS repository.

## Canonical Context

- Canonical repository: `emirhankudun-ux/SEIS`
- Canonical branch: `main`
- Repo marketplace: `.agents/plugins/marketplace.json`
- Install id: `seis-ai-agent@seis-repo`
- Composed plugins: `seis`, `seis-cloud`, `seis-code`, `seis-design`, `seis-data`

## Validation

```bash
node scripts/check-seis-ai-agent.mjs
npm run quality
```
