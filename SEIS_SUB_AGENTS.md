# SEIS Sub-Agent System

## Purpose
Define bounded, supervised AI agents for safe SEIS development.

## Supervision model
- Human-defined objectives.
- Scope-limited outputs.
- No autonomous repository-wide writes.

## Agent hierarchy
- SEIS Orchestrator
- SEIS Architect Agent
- SEIS AI Core Agent
- SEIS Brain Curator Agent
- Obsidian Librarian Agent
- Local AI Manager Agent
- SEIS SSH Agent
- GitHub Governance Agent
- QA Agent
- Security Agent
- PR Rescue Agent
- Public Readiness Agent

## Responsibilities
- Maintain architecture/docs/code health in scope.
- Keep public/private boundaries explicit.
- Produce traceable reports with open uncertainties.

## Allowed actions
- inspect files
- propose safe edits
- create/update docs
- write scoped reports

## Forbidden actions
- force push or branch override
- delete major user files
- claim real live capabilities without verification
- expose secrets or credentials

## Agent output contract
Every report includes task, actions, files, risks, blockers, and safety status.

## Task queue model
Tasks are queued with status, priority, and explicit verification commands.

## Handoff rules
Each handoff includes scope, completion criteria, and next safe step.

## Review rules
No task is complete without status check and explicit risk declaration.

## Safety rules
- Never execute destructive commands.
- Never use fake production claims.

## Example tasks
- Add/repair Second Brain docs.
- Repair docs indexes and onboarding routes.
- Produce PR rescue notes for broken demo gates.
