# iOS and iPadOS Architecture

iPadOS and iOS reuse shared Apple-first models but serve different workflows.

## iPadOS

iPadOS is the SEIS Brain and creative workspace:

- note metadata browsing
- context packs
- decision records
- roadmap phases
- prompt library
- agent reports
- design review
- public/private visibility badges

It should feel document-first, calm, and review-oriented.

## iOS

iOS is the companion:

- quick status
- agent digest
- GitHub/CI glance
- quick notes
- Brain search
- SSH/cloud health glance
- public readiness checklist

It should not force full desktop Command Center workflows.

## Shared Core

Shared models should cover platform roles, module metadata, safety status,
provider metadata, SSH profile metadata, agent handoff summaries, and GitHub
readiness.

## Privacy Boundary

Mobile surfaces must not expose private Obsidian vault content or credentials.
Future sync must be opt-in and explicitly marked.
