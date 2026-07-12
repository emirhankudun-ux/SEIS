# SEIS Client Approval Desk

Client Approval Desk is the browser-local decision gate between agency-delivered SEIS conversation work and any future external capability.

## Client outcome

The client can create an approval request from any registered Conversation Workspace source, review the requested scope, record approval, request changes, or decline, and export the append-only decision log when moving computers.

## Decision states

- awaiting-client: the agency requested a decision.
- approved-local: the client approved the described local scope only.
- changes-requested: the client requested another agency iteration.
- declined: the client rejected the proposed scope.

## Non-execution boundary

A decision record never executes code, merges a PR, invokes an AI provider, deploys, reads files, changes cloud state, or runs SSH. Those remain separate implementation and approval workflows. The desk stores evidence of client intent; it does not grant itself permissions.

## Data model

Each request stores a stable request ID, registered source ID, conversation thread ID, title, summary, risk label, current decision state, timestamps, and append-only events. Imported logs merge by request and event IDs and do not delete local decision history.

## Client acceptance criteria

1. Conversation Workspace can create a source-linked request.
2. Hub provides direct navigation to Client Approval Desk.
3. Approval, change request, and decline add client audit events.
4. Previous events remain visible and cannot be deleted from the UI.
5. Export and import preserve requests through merge-only behavior.
6. Every decision clearly states that no external action was executed.
