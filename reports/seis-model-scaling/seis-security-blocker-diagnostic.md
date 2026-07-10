# SEIS Security Blocker Diagnostic Report

Generated: 2026-07-01T03:29:10.898Z

Status: security-blocker-diagnostic-ready-approval-gated

## Summary

| Field | Value |
| --- | --- |
| PR | #100 |
| Failing checks | 2 |
| Failed diagnostic checks | 0 |
| Secret values printed or stored | false |
| Blocker fixed | false |
| GitHub ready for everyone | false |
| Gitleaks allowlist changed | false |
| History rewrite approved | false |
| Secret rotation approved | false |

## Safe Next Commands

- `npm run report:seis-security-blocker-diagnostic`
- `npm run check:seis-security-blocker-diagnostic`
- `npm run check:seis-ai-public-readiness`

## Human Approval Needed Before Remediation

- choose narrow gitleaks allowlist vs history cleanup vs rotation plan
- confirm whether the older generated aggregate bundle path may be allowlisted
- confirm whether any exposed secret requires rotation
- approve any history rewrite before execution
- approve any security allowlist push before execution
- approve PR #100 merge only after security checks are green
