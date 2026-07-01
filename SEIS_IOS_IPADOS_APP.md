# SEIS iOS and iPadOS App

iPadOS and iOS are different SEIS surfaces, not compressed versions of the Mac
Command Center.

## iPadOS Role

iPadOS is the SEIS Brain and creative review surface:

- browse public-safe Obsidian-compatible notes
- review context packs
- inspect decision records
- read roadmap phases
- browse prompt libraries
- review agent reports
- inspect design system and moodboard material
- copy public-safe context into Codex, Cursor, Ollama, Claude, or other tools

iPadOS should feel like a calm creative planning studio with strong typography,
clear sidebars, document-first panels, and accessible review flows.

## iPhone Role

iPhone is the companion:

- quick status
- GitHub/CI glance
- agent report digest
- quick notes
- SEIS Brain search
- public readiness checklist
- SSH/cloud health glance without credentials

The iPhone app should not become a full desktop replacement.

## Shared Features

Both mobile surfaces should reuse the shared Apple-first models from
`SeisPlatformKit`:

- platform roles
- module metadata
- public/private visibility
- provider demo status
- SSH safety metadata
- agent handoff summaries
- GitHub readiness states

## Safety Rules

- Do not expose private vault notes.
- Do not publish secrets.
- Do not claim automatic Obsidian sync until it exists.
- Do not store credentials.
- Treat AI-generated notes as review drafts until human-approved.
