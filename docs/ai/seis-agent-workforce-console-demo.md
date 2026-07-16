# SEIS Agent Workforce Console Demo

## Purpose

`apps/seis-core/agent-workforce.html` adds a browser-local SEIS Agent Workforce Console for supervised agent planning. It turns the Agent Runtime contract into a visible demo surface without enabling background execution, provider calls, SSH, GitHub mutation, deployment, or credential reads.

## What exists

- A standalone static route under `apps/seis-core/agent-workforce.html`.
- Local mission intake with dry-run owner routing.
- Agent role cards for Architect, Code, Design, UI/UX, Research, Search, Security, DevOps, Documentation, QA, Cloud, Automation, Clean-Room, PR Rescue, Local AI, Plugin, Accessibility, and Product Strategy agents.
- Safety gates that keep `approval-needed`, `blocked`, `local-only`, and `dry-run-only` states visible.
- A localStorage-backed session queue using `seis.agent.workforce.console.v1`.
- Focused static tests in `apps/seis-core/test/seis-agent-workforce-static.test.js`.

## Real vs mock vs planned

| Surface | Status | Notes |
| --- | --- | --- |
| Static HTML/CSS/JS route | Real | Runs in the browser with no dependency install. |
| Mission queue | Real local state | Stored only in browser localStorage. |
| Agent execution | Mock/dry-run | No agent executes tools or writes files. |
| Provider routing | Blocked | `providerCalled: false`; no live AI route exists. |
| Credential access | Blocked | `credentialRead: false`; no secrets are read or stored. |
| GitHub/SSH/deploy actions | Blocked | `githubMutation: false` and `sshExecuted: false`. |
| Runtime enforcement | Planned | Needs executable permission tests before write-capable automation. |

## How to run

```bash
python3 -m http.server 4174 --directory apps/seis-core
```

Open `http://127.0.0.1:4174/agent-workforce.html`.

## Validation

```bash
node --test apps/seis-core/test/seis-agent-workforce-static.test.js
```

## Security notes

The route is browser-local and does not contain provider keys, private keys, tokens, SSH commands, deployment commands, network calls, or live provider adapters. It is demo evidence for supervised planning only.

## Next safe actions

- Link this route from the main Command Center after review.
- Add a handoff report template fixture.
- Add executable dry-run tests for cancellation, approval, redaction, and ledger behavior before enabling any background or write-capable runtime.
