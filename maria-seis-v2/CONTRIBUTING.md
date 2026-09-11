# Contributing to MARIA × SEIS

Keep contributions modular, truthful, permission-bounded and provider-agnostic.

## Rules
- Do not claim an integration works unless it is exercised by a test or reproducible manual verification.
- Keep provider-specific logic inside adapters.
- Add capabilities through registries or plugins instead of hard-wiring UI behavior.
- High-impact actions must pass the permission engine.
- New integrations must document data access, permissions, failure behavior and verification evidence.
- Prefer small pull requests with a clear acceptance criterion.

## Local verification
```bash
npm test
python3 -m http.server 4173
```
