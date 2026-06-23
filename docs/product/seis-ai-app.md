# SEIS AI App

Status: Product foundation

SEIS AI App is the user-facing operating interface for SEIS AI Core. It turns
LLM capability into controlled, visible, auditable product behavior.

## Operating Architecture

```text
SEIS AI App / Command Center
  -> AI App API Boundary
  -> Model Router
  -> Prompt Engine
  -> Agent Runtime
  -> Knowledge / Retrieval System
  -> Tool and Plugin Registry
  -> Evaluation / Audit / Approval Layer
```

## Core Principle

The LLM layer must not exist as a disconnected experiment. It should operate
inside app boundaries with explicit data mode, privacy mode, route state,
prompt version, allowed context, allowed tools, approval state, evidence, audit
events, and validation status.

## Required Systems

- application interface
- LLM intelligence
- model router
- prompt engine
- agent runtime
- retrieval and knowledge system
- tool registry
- evaluation layer
- approval system
- evidence system
- goal tracking system
- security boundaries

## API Boundary Rules

- Browser clients never receive provider credentials.
- Browser clients never receive SSH private keys.
- Dangerous actions require approval requests.
- Provider routing respects privacy mode and data class.
- AI output must identify evidence, assumptions, tool use, approvals, and
  validation where possible.
- Offline and disabled modes must not fake AI output.

## Current Evidence

- `apps/seis-core` is the current local-first Command Center implementation.
- `apps/command-center` is a documentation placeholder for future app-specific
  organization.
- `docs/architecture/ai-core-app-shared-contracts.md` defines shared state
  objects between AI Core and the app.

## Non-Claims

This document does not claim live provider integration, autonomous repository
control, deployed backend APIs, trained SEIS model weights, or completed app
modules.
