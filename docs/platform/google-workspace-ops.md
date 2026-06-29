# Google Workspace Operations

SEIS uses Google Workspace as a lightweight operating surface around the
repository. GitHub and the SEIS repository remain the durable source of truth;
Google artifacts are planning, review, communication, and handoff surfaces.

## Current MCP And Skill Coverage

Audited on 2026-06-29 with read-only MCP discovery and profile verification.
The Google profile identity was verified in-session but is not persisted in
repository files.

The companion major-platform inventory is
`docs/platform/big-tech-mcp-skill-inventory.md`. The 2026-06-29 curated skill
install pass found no standalone Google Cloud, Firebase, Vertex AI, Gemini,
YouTube, Google Ads, Google Chat, Tasks, Keep, or Forms skill in the curated
skill list; those surfaces remain planned or approval-gated until a specific
callable connector is installed and verified. BigQuery appeared as an
installable connector candidate, but the connector install/auth flow was not
user-confirmed in this pass.

| Google surface | MCP status | Codex MCP namespace | Skill coverage | SEIS use |
| --- | --- | --- | --- | --- |
| Gmail | Active | `mcp__codex_apps__gmail` | `gmail:gmail` | Mail search, thread summaries, triage, draft preparation, and explicitly requested send/label/archive/trash actions. |
| Google Calendar | Active | `mcp__codex_apps__google_calendar` | `google-calendar:google-calendar` | Weekly build review, scheduling, availability checks, reminders, holds, and explicitly requested event changes. |
| Google Drive | Active | `mcp__codex_apps__google_drive` | `google-drive:google-drive` | File discovery, metadata, folders, sharing, copy/move, revisions, exports, and artifact handoff. |
| Google Docs | Covered through Drive MCP | `mcp__codex_apps__google_drive` | `google-drive:google-docs` | Operating plans, review docs, meeting notes, and connector-verified document edits. |
| Google Sheets | Covered through Drive MCP | `mcp__codex_apps__google_drive` | `google-drive:google-sheets` | Platform backlog, structured planning sheets, ranges, formulas, charts, and connector-verified sheet edits. |
| Google Slides | Covered through Drive MCP | `mcp__codex_apps__google_drive` | `google-drive:google-slides` | Deck reads, summaries, imports, template copies, and connector-verified slide edits. |
| Google Meet | Indirect | `mcp__codex_apps__google_calendar` | `google-calendar:google-calendar` | Calendar event creation can request a Meet link; there is no standalone Meet MCP surface configured. |
| Google Chat | Not configured | None verified | None verified | Planned only. |
| Google Tasks | Not configured | None verified | None verified | Planned only; SEIS task surfaces remain repo/browser-local. |
| Google Keep | Not configured | None verified | None verified | Planned only. |
| Google Forms | Not configured | None verified | None verified | Planned only. |
| BigQuery | Install candidate, not confirmed | Connector candidate only | None verified | Install/auth was requested but not user-confirmed; treat as unavailable until the connector flow completes. |
| Google Cloud / Firebase | Planned and approval-gated | None verified | None verified | No live Google Cloud or Firebase MCP access was verified; cloud actions require explicit approval, target selection, credentials boundary, and rollback owner. |

## Write Gates

- Gmail writes require explicit user intent for send, draft-send, archive,
  trash, label, forward, or bulk actions.
- Calendar writes require explicit user intent for event create/update/delete,
  invitation response, reminder edits, holds, or recurring-event changes.
- Drive, Docs, Sheets, and Slides writes require an exact target artifact,
  audience or folder when relevant, and user intent before create, edit, import,
  share, move, copy, upload, or delete actions.
- No Google OAuth token, cookie, service account, profile image, profile email,
  or private workspace data should be stored in this repository.

## Drive

| Artifact | Link |
|---|---|
| Operating plan | https://docs.google.com/document/d/1EvyhGA4ulJHsEB2DCzZAYxDrUv1X6dGj0PFa0splrps |
| Platform backlog | https://docs.google.com/spreadsheets/d/1sxnxOz9ZRzwZAz2FmHt_3YzAhQjKL2sQbYR1uWdGsaQ |

Drive is for planning, backlog review, and human-readable status. GitHub
remains the source of truth for code and durable repo records.

## Calendar

| Event | Link |
|---|---|
| SEIS Open Source - Weekly Build Review | https://www.google.com/calendar/event?eid=ZWg5djhtamRjdHZjaGY2aTljczRqMDJkZjQgZW1pcmhhbmt1ZHVuQG0 |

Calendar is for cadence, not source truth. Important decisions should be copied
back into SEIS docs or issues.

## Gmail

Gmail is available for bounded mailbox analysis, thread summaries, action
extraction, and draft preparation. Sending, forwarding, archiving, trashing,
labeling, or bulk modification requires explicit user intent in the active
conversation.

## Sync Rule

When Gmail, Calendar, Drive, Docs, Sheets, Slides, or related Google Workspace
artifacts or MCP availability change, update this file and
`integrations/google-workspace.json`.
