# SEIS Troubleshooting

## Install problems

- Missing Node dependencies or script failures usually indicate environment mismatch.
- Keep command output and reproduce with explicit path and command.

## Build problems

- Confirm current directory for each script.
- Check required files listed in `docs/INDEX.md` and the command output.
- Fix root causes only; do not paper over failures.

## Missing scripts

- If a script is absent, use equivalent checks or document why it is unavailable.
- Do not claim script success without command evidence.

## Broken routes

- Re-run demo from `apps/web` static server.
- Verify file existence for the path in browser dev tools/network logs.
- Use provided review routes in `docs/reviews/` where available.

## Broken assets

- Confirm asset path and case sensitivity.
- If using reference modules, validate reference path lists.

## Demo mode confusion

- Label states as `mock`, `planned`, `real`, or `disabled`.
- Never describe planned behavior as active.

## API key confusion

- No-key demo must still run.
- Real-provider features need explicit backend approval and environment setup.
- Do not paste keys into logs, reports, or prompts.

## Ollama / local AI issues

- Confirm local service health and endpoint.
- Keep local AI usage in non-authoritative draft mode unless reviewed.

## Obsidian vault issues

- Ensure frontmatter and link validity.
- Keep vault content public-safe.
- If private notes are needed, keep them outside committed paths.

## SSH safety issues

- Never generate destructive commands.
- Never commit credentials.
- Use `docs/SEIS_SSH_SETUP.md` for approval-safe workflows.

## CI / check failures

- Read the failing workflow output fully.
- Add evidence in the next PR queue if a blocker is confirmed.

## `SEIS_SECOND_BRAIN.md` issues

- If references are broken, verify file exists at repo root and check links in
  `docs/INDEX.md`.
- If vault notes are missing, verify `seis-brain/README.md` and `seis-brain/vault`.
- If state labels are inconsistent, run local checks and update the "Known blockers"
  section in readiness docs.

## `SEIS_LOCAL_AI_OLLAMA.md` issues

- If the local AI profile is not clear, confirm `docs/LOCAL_AI_SETUP.md` and this
  document are aligned.
- If output is inconsistent, treat local AI output as draft and rerun with explicit
  safety boundaries.
- If Ollama is not installed, continue with Local Demo mode; do not block onboarding
  on local AI availability.

## `SEIS_SSH_SETUP.md` / `SEIS_SSH.md` issues

- If commands fail, rerun only safe probe commands:
  - `ssh -V`
  - `git remote -v`
  - `ssh -F /dev/null -G SEIS-SSH`
- If any command requests credentials, stop and review the docs path before retrying.
- If real host/port is needed for local work, stop and request explicit approval.

## PR rescue checklist

1. Identify failing command and expected output.
2. Reproduce once with exact command context.
3. Apply smallest fix for scope.
4. Record blocker or verification gaps in roadmap queue if unresolved.

## Hard safety rule

- Do not add real secrets to fix demos.
- Do not commit private keys.
- Do not claim fixed checks without running them.
