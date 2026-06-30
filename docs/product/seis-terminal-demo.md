# SEIS Terminal / SSH Center Demo

`apps/web/seis-terminal.html` is a standalone browser-local SEIS Terminal and SSH Center demo.

## Purpose

SEIS Terminal is part of the required SEIS creative operating system ecosystem. This page turns Terminal / SSH Center from planned scope into a real local artifact without executing shell commands or SSH.

## Working interactions

- Run allowlisted demo commands.
- Type commands into a terminal-style input.
- Use quick command chips.
- Persist command history in `localStorage` only.
- Reset local terminal state.
- Show SSH disabled state.
- Show remote workspace planned state.
- Show repository sync planning text.
- Show safe logs.

## Allowlisted demo commands

- `help`
- `status`
- `ssh status`
- `git status`
- `sync plan`
- `clear`

## State semantics

- `real`: standalone page, local terminal UI, allowlisted mock/local commands, command history, safe logs, and local persistence.
- `disabled`: SSH execution is disabled in the browser demo.
- `planned`: remote workspace, deployment, GitHub mutation, real SSH, and live sync remain future implementation work.

## Safety boundary

- No API keys are required.
- No shell command is executed.
- No SSH is executed.
- No private key is read.
- No GitHub mutation is performed.
- No Git push is performed.
- No deployment is triggered.
- No file mutation is performed.
- No AI provider call is performed.
- No branch protection is changed.
- No private keys, tokens, passwords, cookies, service accounts, or `.env` values are read or stored.

## Validation

Run:

```bash
node scripts/check-seis-terminal-demo.mjs
```

The validator checks the page, allowlisted commands, command controls, localStorage boundary, disabled/planned state labels, and no-execution safety wording.
