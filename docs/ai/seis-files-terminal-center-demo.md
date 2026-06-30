# SEIS Files + Terminal Center Demo

This document describes the browser-local Files + Terminal Center added for the
SEIS Core demo surface.

## Demo route

Open the static route from the SEIS Core app folder:

```text
apps/seis-core/files-terminal-center.html
```

The route is intentionally zero-key and browser-local. It does not require a
backend service, cloud provider, model provider key, host shell, private key, or
remote machine.

## What works now

- Virtual folder and file browsing.
- Grid and list view switching.
- Search over browser-local demo files.
- File preview and recent-file memory.
- Browser-local note and folder creation stored in `localStorage`.
- Browser-local rename for selected virtual items.
- Simulated terminal commands: `help`, `status`, `ls`, `pwd`, `readiness`, and
  `clear`.
- Explicit safety state for command execution, remote execution, filesystem
  mutation, and credential access.

## Mock vs real status

| Surface | Status | Notes |
| --- | --- | --- |
| File browsing | Real browser-local | Uses seeded demo data plus localStorage state. |
| Recent files | Real browser-local | Persists in the browser only. |
| Local note/folder creation | Real browser-local | Creates virtual demo entries, not host files. |
| Terminal output | Mock | Deterministic text responses only. |
| Remote workspace access | Blocked | No remote connection attempt is made. |
| Host filesystem mutation | Blocked | No host file write/delete behavior is present. |
| Credential access | Blocked | No key, token, environment variable, or private config is read. |

## Safety contract

The demo keeps these flags false by design:

```text
commandExecuted: false
sshExecuted: false
filesystemMutated: false
credentialRead: false
```

Any future live Files, Terminal, or remote workspace implementation must move
through a separate review-gated backend/runtime PR. It must preserve the same
server and port constraints already tracked by SEIS cloud/SSH documentation
unless the maintainer explicitly approves a change.

## Validation

Focused static validation lives at:

```text
apps/seis-core/test/seis-files-terminal-center-static.test.js
```

Run it with:

```bash
node --test apps/seis-core/test/seis-files-terminal-center-static.test.js
```
