## Summary

What does this PR change, and why does it matter for SEIS?

## Scope

- [ ] AI / agents / MCP / skills / plugins / LLM workflows
- [ ] Engineering / platform / full stack / mobile / desktop
- [ ] Data / ML / governance / observability
- [ ] Design systems / UX / accessibility / calm technology
- [ ] Documentation / open source governance
- [ ] Security / dependency / infrastructure

## Architecture Fit

Explain how this change fits the SEIS platform model. For new features,
describe why the long-term maintenance cost is justified.

## Validation

List the checks you ran:

```bash
npm run check:open-source-governance
npm run seis:check
```

## Risk

- Security or privacy impact:
- Dependency or runtime impact:
- Rollback plan:

## Checklist

- [ ] Targets `main` through a short-lived branch or fork PR.
- [ ] Keeps the change small, reversible, and reviewable.
- [ ] Updates docs when behavior, policy, or user workflow changes.
- [ ] Does not commit secrets, private data, `.env` files, or credentials.
- [ ] Does not install unused SDKs, runtimes, or dependencies.
- [ ] Discloses material AI assistance when relevant.
