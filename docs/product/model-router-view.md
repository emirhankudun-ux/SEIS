# Model Router View

Status: Product foundation

The model router view explains how a task is routed to local or provider-backed
AI.

## Required Fields

- task type
- data class
- privacy mode
- selected provider profile
- selected model profile
- prompt version
- approval state
- blocked reason, if any
- evaluation profile
- audit event link

## UI States

- ready
- local-only
- provider-ready
- approval-needed
- blocked
- degraded
- unknown

## Safety Rule

The view must never display raw provider secrets or private prompt payloads.
