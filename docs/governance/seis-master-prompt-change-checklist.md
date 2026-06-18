# SEIS Master Prompt Change Checklist

Use this checklist for changes that touch the SEIS operating contract, GitHub controls, SSH/cloud readiness, plugin skills, generated reports, or governance data.

## User Work Protection

- Confirm current branch, remote, and worktree state.
- Do not overwrite unrelated user work.
- Keep changes small and reversible.

## Security and Privacy

- Do not commit secrets, API keys, SSH private keys, certificates, or inline credential assignments.
- Keep SSH hardening aligned with data/ssh-hardening-operation-contract.json.
- Require explicit maintainer approval before risky live host changes.

## Architecture and Maintainability

- Update data/seis-master-prompt-implementation-map.json when adding or moving governance surfaces.
- Keep generated reports reproducible from source data.
- Avoid duplicated governance sources.

## Validation

Run or explicitly document a maintainer waiver for:

```bash
npm run check:seis-master-prompt-report
npm run check:seis-master-prompt
npm run check:seis-master-objective-coverage-report
npm run check:seis-master-objective-coverage
npm run check:seis-operational-goal-tracker
npm run check:ssh-hardening-contract
```
