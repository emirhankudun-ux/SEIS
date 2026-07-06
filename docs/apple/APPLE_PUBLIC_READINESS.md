# Apple Public Readiness

Apple-first work is public-ready only when the repo makes status and safety
clear.

## Required Evidence

- Apple-first direction is documented.
- macOS, iPadOS, iOS, and web roles are clear.
- SwiftUI architecture is documented.
- `apps/apple/README.md` exists if `apps/apple` exists.
- Existing web demo remains present.
- Swift Package verification is run when Swift code changes.
- Demo/no-key mode is clear.
- Native status is honest: planned, scaffolded, demo, or implemented.
- Xcode handoff is treated as local native tooling, not proof that the native
  shell builds or runs.
- Secondary AI desktops must be marked ready only when local auth/config and a
  sanitized smoke output exist; otherwise they remain auth-gated/manual.

## Security

Public-ready Apple work must not contain:

- provider API keys
- SSH private keys
- tokens
- real host credentials
- private Obsidian vault contents
- fake live AI claims
- fake live SSH claims
- screenshots, logs, or handoff notes containing provider credentials

## Current Local Tool Snapshot

- Xcode 26.6 is available with `packages/seis_platform_swift` visible as the
  recent native package. It may be used for Apple-first SwiftPM work after
  terminal checks establish the exact diff and validation scope.
- Cursor and LM Studio are available local desktop surfaces, but they are only
  SEIS AI Tools Bridge routes. Cursor is a secondary review surface, and LM
  Studio installation is not evidence that any local model is downloaded or
  loaded.
- Claude Code CLI is available through local Claude Code auth and a sanitized
  `CLAUDE_OK` smoke. It remains a public-safe, non-writer review candidate.
- Hermes is available through local desktop/provider configuration after a
  sanitized `HERMES_OK` smoke, but it remains a non-writer helper route for
  public-safe handoff context unless explicitly reviewed.
- Secondary assistant handoffs remain planned/manual unless explicitly
  configured, sanitized, and re-verified outside the public repository.
- Gemini CLI and Kimi Code CLI are installed but still provider-blocked:
  Gemini Code Assist for individuals no longer supports the current CLI OAuth
  client, and Kimi login reports membership benefits cannot be verified.

## Review Notes

If Swift tooling is unavailable, report that directly and keep the change
limited to docs or syntactically reasonable model code. Do not claim a Swift
build passed without evidence.
