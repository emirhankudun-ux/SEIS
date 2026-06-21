# ECC for Codex CLI

This supplements the root `AGENTS.md` with a repo-local ECC baseline.

## Repo Skill

- Repo-generated Codex skill: `.agents/skills/UIX-Apps/SKILL.md`
- Claude-facing companion skill: `.claude/skills/UIX-Apps/SKILL.md`
- Keep user-specific credentials and private MCPs in `~/.codex/config.toml`, not in this repo.

## MCP Baseline

Treat `.codex/config.toml` as the default ECC-safe baseline for work in this repository.
The generated baseline enables GitHub, Context7, Exa, Memory, Playwright, and Sequential Thinking.

## Multi-Agent Support

- Explorer: read-only evidence gathering
- Reviewer: correctness, security, and regression review
- Docs researcher: API and release-note verification
- SEIS Codex sub-agents are installed through `.codex/config.toml` and
  `.codex/agents/*.toml`.
- The installed SEIS sub-agents are bounded, human-supervised lanes for
  architecture, AI systems, backend, frontend, UI/UX, website building,
  security, documentation, goals, memory, task planning, code review,
  deployment, repository governance, plugin registry, plugin feeding, SSH,
  local/remote model connectors, self-analysis, self-improvement, knowledge
  expansion, agent evolution, and plugin evolution.
- Default sub-agent posture is read-only. They may analyze, plan, review, and
  prepare handoff guidance, but they must not push, merge, deploy, mutate SSH
  hosts, read secrets, install plugins, or expand permissions.

## Workflow Files

- `.claude/commands/feature-development.md`
- `.claude/commands/add-or-enhance-animated-ui-section.md`
- `.claude/commands/refine-or-optimize-animation-performance.md`

Use these workflow files as reusable task scaffolds when the detected repository workflows recur.
