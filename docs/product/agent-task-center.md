# Agent Task Center

Status: Product foundation

Agent Task Center shows supervised AI agent work as explicit tasks.

## Task Fields

- task id
- agent role
- objective
- inputs
- allowed actions
- forbidden actions
- approval state
- status
- validation
- audit events
- output summary

## Statuses

- planned
- queued
- running
- blocked
- approval-needed
- failed
- completed
- validated

## Safety Rule

Privileged actions such as push, merge, deploy, SSH, secret rotation, database
migration, or destructive cleanup must never run from this center without
explicit approval and audit logging.
