# SEIS Obsidian Second Brain

## Purpose

This document defines how SEIS keeps product memory in Obsidian-compatible
Markdown and how agents can use it safely.

## Folder structure

- `seis-brain/README.md`
- `seis-brain/vault/00_Index/`
- `seis-brain/vault/*/` domain folders (product, architecture, agents, SSH, prompts)

## Note naming rules

- Stable, descriptive names.
- Domain prefix by folder for searchable grouping.

## Frontmatter rules

Use frontmatter in decision-heavy or high-value notes:

- `type`
- `module`
- `status`
- `visibility`
- `updated`

## Backlink rules

Use internal links for dependencies, especially architecture, agents, security, and
governance notes.

## Public-safe notes

Public-safe notes may be committed and should not include credentials, private
data, or real infrastructure secrets.

## Local-only notes

Private continuation notes, personal context, and credentials should remain outside
Git history.

## Context packs

Context packs in `seis-brain/vault/12_Context_Packs` should be compact and
agent-ready.

## ADR notes

Decisions, alternatives, and consequences are stored in `seis-brain/vault/09_Decisions/`.

## Logs and lessons

Operational memory and failures are kept in `seis-brain/vault/10_Logs/`.

## How to open in Obsidian

Open `seis-brain/` directly. No plugins are required.

## Maintenance rules

- Update `00_Index` links for each new major concept.
- Keep link quality checkable.
- Avoid dumping private material into vault notes.
