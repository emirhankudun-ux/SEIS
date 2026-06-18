---
name: seis-focus-mode
description: Use SEIS Focus Mode for concentrated SEIS work across app, website, AI/AGI planning, governance, and plugin workflows. Trigger when work should reduce noise, avoid tool inflation, preserve security evidence, keep architecture quality high, and keep human-AI collaboration focused on long-term SEIS value.
---

# SEIS Focus Mode

Use this skill when SEIS work needs calm, concentrated execution without losing
governance, evidence, security, or rollback awareness.

## Canonical Surfaces

- Vision: `docs/governance/seis-supreme-vision.md`
- App and website feature: `apps/seis-demo-web/index.html`
- Web behavior: `apps/seis-demo-web/script.js`
- Web styling: `apps/seis-demo-web/styles.css`
- Shared web contract: `apps/seis-demo-web/contracts/seis-demo-contract.json`
- Apple-native parity contract: `packages/seis_platform_swift/Sources/SeisAppleNativeShell/Resources/seis-demo-contract.json`
- AI/AGI learning contract: `content/development/seis-focus-mode-learning-contract.json`
- Dedicated check: `scripts/check-seis-focus-mode.mjs`

## Behavior

1. Prefer fewer active surfaces, fewer tool calls, and narrower context windows.
2. Keep security, privacy, architecture, rollback, and validation evidence active.
3. Avoid dependency bloat, broad indexing, noisy validation loops, and unrelated
   refactors.
4. Emit or preserve Focus Mode telemetry when changing app or website behavior.
5. Keep app, website, plugin, and AI/AGI learning contracts aligned.

## Expected Checks

```bash
npm run check:seis-focus-mode
npm run check:seis-plugin-bundle
npm run check:seis-master-prompt
npm run quality:governance
```

Use the dedicated Focus Mode check first. Run the broader governance chain when
Focus Mode touches app, website, plugin, generated report, or AI/AGI contract
surfaces.

## Safety Rules

- Focus Mode is not permission to skip security, evidence, or validation.
- Never expose secrets, tokens, private keys, credentials, or `.env` contents.
- Do not claim GitHub, cloud, deploy, push, or plugin readiness without a real
  check.
- Keep the user in control when a change is risky, destructive, external, or
  hard to roll back.
