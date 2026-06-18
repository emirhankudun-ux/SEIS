# Kurumsal Kalite Kapıları (Quality + Security + AI)

SEIS quality gates keep repository changes reviewable, secure, documented, and aligned with the long-term operating contract.

## Kalite Kapısı

Required checks include:

```bash
npm run check:workspace
npm run seis:check
npm run check:seis-enterprise-gates:quality
```

## Kurumsal 4 Kapı (Her Değişiklik)

Every meaningful change must pass validation, security, documentation, and rollback review before it is described as complete.

### Doğrulama Metrikleri Kapısı

Validation evidence must list the command that was run, the result, and any remaining blocker.

## Güvenlik Kapısı

Security review must protect secrets, keys, SSH access, cloud permissions, and least-privilege boundaries.

```bash
npm run check:seis-enterprise-gates:security
```

### Güvenlik Kapısı

Institutional security gate: do not weaken security for convenience and do not claim protection without current evidence.

## AI Kapısı

AI systems must be observable, policy-bound, and aligned with the SEIS Master Prompt.

```bash
npm run check:seis-enterprise-gates:ai
```

## Uzun Vadeli Kapı Rejimi

Long-horizon governance uses D1, D2, and D3 throttle levels and is tracked in roadmap/seis-18-60-month-long-horizon-ops-blueprint.md.
