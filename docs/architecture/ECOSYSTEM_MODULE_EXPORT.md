# Ecosystem Module Export

SEIS now declares its flagship-facing platform boundary through `ecosystem-module-export-v1`.

## Files

- `content/ecosystem/public-module-export.json` — metadata-only source declaration.
- `scripts/check-public-module-export.mjs` — fail-closed local validator and CLI check.
- `test/public-module-export.test.mjs` — adversarial contract tests.
- `.github/workflows/unified-ecosystem-bridge.yml` — read-only validation.

## Declared ownership

SEIS remains canonical for the `platform-runtime` role. The intended flagship namespace is `platform/seis`.

The declaration does not copy code, merge history, grant runtime authority, authorize cross-repository writes, or promote any module. `publicExport.enabled` means the metadata declaration can be reviewed in this already-public repository; promotion remains `source-only` behind all eight gates.

## Validate

```sh
node --test test/public-module-export.test.mjs
node scripts/check-unified-ecosystem-bridge.mjs
node scripts/check-public-module-export.mjs
```
