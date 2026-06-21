# Approval Center MVP

Status: Product foundation

Approval Center is the human control surface for privileged SEIS actions.

## Approval Items

An approval request should include:

- request id
- requested action
- reason
- risk class
- affected paths or systems
- rollback plan
- validation plan
- requester
- timestamp
- decision

## Actions Requiring Approval

- push or PR creation when policy requires it
- merge
- deploy
- dependency installation
- provider credential setup
- SSH/firewall/sudo changes
- secrets access or rotation
- destructive commands
- database migrations
- model training, fine-tuning, dataset upload, or checkpoint publication

## MVP Boundary

The first version may be read-only or local-state only. It should not execute
privileged operations.
