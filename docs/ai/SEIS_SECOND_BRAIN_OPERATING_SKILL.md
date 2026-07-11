# SEIS Second Brain Operating Skill

`seis-second-brain` is the SEIS-Agent plugin skill for coordinating the
browser-local Second Brain across installed AI profiles, managed sub-agent
lanes, the five personal SEIS plugin lanes, VFS handoff artifacts, and the
approval-gated Obsidian bridge.

## What It Connects

- The browser-local Desktop Second Brain.
- Six installed AI profiles as review context only.
- Nine managed context lanes and the 13-agent roster.
- `@seis`, `@seis-cloud`, `@seis-code`, `@seis-design`, and `@seis-data`.
- The all-lane review bundle at
  `/home/seis/SecondBrain/07-learning/plugin-review-bundle-latest.md`.
- The repo-local agent registry and browser-smoke evidence artifacts.

## Safety Model

The skill is not a provider runtime or autonomous executor. It does not install
plugins, call providers, validate credentials, read a private Obsidian vault,
execute SSH, deploy, mutate GitHub, or publish anything without explicit
approval for the target action.

The Obsidian flow remains metadata-only and explicit-selection-first. The
browser VFS can hold local review artifacts, but private note bodies, source
paths, attachments, secrets, and `.obsidian` configuration must not become
repository content by default.

## Local Validation

```bash
python3 /Users/emirhankudun/.codex/skills/.system/plugin-creator/scripts/validate_plugin.py plugins/seis-ai-agent
npm run check:seis-second-brain-browser-smoke
npm run check:seis-second-brain-readiness-contracts
git diff --check
```
