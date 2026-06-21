# AI Command Palette

Status: Product foundation

The AI command palette is a fast, keyboard-first entry point for SEIS AI App
actions. It should route intent into safe AI Core workflows rather than execute
privileged operations directly.

## Purpose

Provide compact access to repository analysis, documentation lookup, roadmap
questions, goal tracking, review tasks, prompt generation, and next-action
recommendations.

## Inputs

- user command text
- selected workspace or repository
- selected data mode
- selected privacy mode
- optional current page context

## Allowed Context

- public or approved repository metadata
- current app state
- selected documentation evidence
- approved goal and roadmap records

## Forbidden Context

- secrets
- SSH private keys
- provider credentials
- raw `.env` values
- private data without approval
- restricted archive material

## Tool Rules

Allowed tools are read-only by default. Write, GitHub, deployment, SSH, secret,
or destructive actions must create approval requests.

## Output Format

The palette should return a concise command result with route state, evidence,
approval requirement, and next safe action.

## Current Status

Planned. No runtime command palette implementation is added by this foundation.
