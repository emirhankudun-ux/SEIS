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

## PR rescue checklist

1. Identify failing command and expected output.
2. Reproduce once with exact command context.
3. Apply smallest fix for scope.
4. Record blocker or verification gaps in roadmap queue if unresolved.

## Hard safety rule

- Do not add real secrets to fix demos.
- Do not commit private keys.
- Do not claim fixed checks without running them.
