# Command Center

Status: Product foundation

SEIS Command Center is the operating surface for the SEIS ecosystem. It
coordinates AI Core, repositories, docs, agents, tools, approvals, evidence, and
readiness.

## Role

Command Center should answer:

- What is the current state?
- What is ready, blocked, degraded, or unknown?
- What needs human approval?
- What evidence supports each claim?
- What AI Core route, prompt, agent, or tool is involved?
- What is the next safe action?

## Current Implementation Path

The current implementation evidence is `apps/seis-core`. This product
foundation does not claim that all future modules already exist as working UI.

## Safety Rules

- Unknown status must remain visible.
- Approval-needed actions must not execute silently.
- Security-sensitive actions must show risk and rollback expectations.
- App data should use shared contracts before live integrations.
