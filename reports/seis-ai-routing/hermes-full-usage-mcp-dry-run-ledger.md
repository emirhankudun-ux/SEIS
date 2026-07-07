# Hermes Full Usage MCP Dry-Run Ledger

Date: 2026-07-07

## Scope

Record the Computer Use interaction with Hermes Agent for the SEIS full-usage
MCP binding and router-candidate dry run. This is repo-only evidence. It does
not claim Hermes completed model execution, external tool calls, provider
authentication, credential access, live routing, or file mutation.

## Observed Surface

| Field | Value |
| --- | --- |
| App | Hermes |
| Bundle | `com.nousresearch.hermes` |
| Project/session observed | Existing `SEIS-ssh` Hermes session |
| Model label observed | `openai-codex: gpt-5.5` |
| Prompt handling | Typed into the Hermes message field |
| Submit status | Not submitted |
| Output captured | No |

## Prompt Typed

```text
Review this public-safe SEIS full-usage MCP binding as a Hermes Agent dry run. Context: repo-owned SEIS MCP is 35 tools, 33 resources, 3 prompts; 9router is candidate-package-runner-not-installed due package-runner/postinstall risk. Return exactly three bullets: routing risk, MCP boundary risk, next repo-only verification step. Do not ask for credentials, do not claim live execution, do not call external tools, and do not mutate files.
```

## Action Log

- Computer Use observed Hermes before interaction.
- The Qwen sign-in panel was opened by Hermes and was cancelled; no terminal
  auth command was run.
- Hermes setup/provider status was observed only; no provider button, key
  entry, OAuth flow, purchase, billing action, or settings change was used.
- The prompt was placed into the visible message field.
- The apparent submit control was exposed as `Start voice conversation` in the
  accessibility tree.
- Clicking the visible right-side control triggered voice-session startup and
  failed with microphone access denied.
- Pressing newline did not submit the prompt.
- A direct coordinate click on the visible paper-plane/voice control again
  triggered the voice-session error instead of a confirmed text submit.

## Boundary Result

Hermes is usable as a prepared prompt surface, but this run did not produce a
confirmed text submission. The safe state is `typed-not-submitted` because the
submit control is ambiguous in the current UI state.

## 9router Boundary

`9router` was not installed or executed. It remains
`candidate-package-runner-not-installed` because npm metadata showed
package-runner and postinstall risk. The safe immediate route remains Hermes
Agent as a supervised prompt surface plus the repo-owned `seis` MCP binding.

## Next Safe Step

Owner may manually submit the typed prompt in Hermes, or provide a specific
owner-selected submit path once the text-send control is unambiguous. Any later
Hermes response should be recorded in a separate repo-only ledger without
secrets, credential claims, provider-quota claims, or live-execution claims.
