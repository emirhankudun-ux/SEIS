---
name: seis-ai-agent
description: Use SEIS-Agent to select one of ten general public SEIS plugins for a scoped task, with thirty bounded internal packages kept off the marketplace.
---

# SEIS-Agent

Use this skill as the default SEIS entry point. The public `seis-repo`
marketplace has exactly ten concise general plugins. `SEIS-Agent` is canonical;
the other nine cover automation, cloud/DevOps, security, data, design, Eleni
visual work, research, and engineering.

## Selection boundary

- Choose one general plugin for one scoped task.
- Each general plugin references exactly three internal packages.
- There are 30 internal packages, each with one through 15 retained source
  capabilities.
- Internal packages and source members are never separate marketplace cards,
  automatic installs, or direct installation targets.
- Keep live providers, deployment, credentials, publication, and external
  writes behind explicit approval.

## Workflow

1. Inspect repository safety and the active Goal before editing.
2. Use `seis_general_plugin_find` with a short task statement when the correct
   general plugin is unclear. It returns at most three local deterministic
   candidates and does not install anything.
3. Use `seis_general_plugin_recommend` for one selected ID, then review its
   plan. The terminal equivalent is:

   ```bash
   npm run install:seis-ai-agent -- --general-plugin <general-plugin-id>
   ```

4. Plan and build in the current foreground task. Do not claim background
   persistence or silently run a sub-agent after the task ends.
5. Validate the package contract, release policy, unified suite, MCP smoke, and
   relevant focused tests before handoff.

## General-plugin map

- `ai-intelligence` → SEIS-Agent
- `automation-delivery` → workflows and delivery
- `cloud-devsecops` → cloud, DevOps, and reliability
- `security-governance` → security and governance
- `data-knowledge` → data and knowledge
- `design-creative` → design, frontend, and accessibility
- `eleni-visual` → Eleni-Neferi and visual production
- `research-ecosystem` → research and ecosystem work
- `engineering-foundations` → architecture, frontend, and systems
- `engineering-delivery` → backend, testing, tooling, and release delivery

## Required checks

```bash
npm run check:seis-public-plugin-family
npm run check:seis-unified-plugin-suite
npm run check:seis-public-plugin-release-policy
npm run check:seis-ai-agent
```
