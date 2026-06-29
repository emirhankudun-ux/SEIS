# SEIS-SSH

## Purpose
SEIS-SSH is the safe remote-development concept layer of SEIS.

## What SEIS-SSH is
A documented model for local + remote cloud workflows, codespaces concepts, and governance-safe checks.

## What SEIS-SSH is not
- Not a live deployment system by default.
- Not a credential distribution layer.
- Not a magic remote command runner.

## Local development
Use local workspaces first. Keep remote steps as documented intent.

## Remote workspace concept
GitHub Codespaces and future cloud shells are documented paths; they require explicit human approval.

## GitHub Codespaces concept
Codespaces can be used as an optional standardized environment concept.

## OpenSSH / Ed25519 safety
Never include private keys or real credentials in public docs.

## Environment variables
Reference only sanitized examples (no real values).

## Credential policy
- No secrets in commit history.
- No credential dumps in docs.

## Demo SSH profiles
Profiles are demo/sample-only metadata.

## Safe commands
- status checks
- dry-run probes
- local log review

## Dangerous commands
Do not include destructive command examples that can erase or leak data.

## Deployment readiness
Document required approvals, checklist items, and rollout gates.

## Rollback readiness
Keep rollback steps documented with clear owner and expected impact.

## Future plans
Optional Tailscale/VPN and one-command bootstrap remain planned and off by default.

## Security checklist
- no real keys
- no real host credentials
- no claims of live SSH without proof
