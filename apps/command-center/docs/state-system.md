# State System

Status: App-facing contract

Command Center and AI Core share operational states.

## States

- ready
- draft
- planned
- blocked
- approval-needed
- degraded
- unknown
- running
- failed
- validated

Unknown must never be rendered as ready. Approval-needed must not execute
without an explicit human decision.
