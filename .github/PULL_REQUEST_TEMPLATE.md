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

## Evidence

List the repository evidence used for this change. Distinguish observed current
behavior from planned or future behavior.

## Validation

List the checks you ran:

```bash
npm run check:open-source-governance
npm run seis:check
```

## Risk

- Security or privacy impact:
- Dependency or runtime impact:
- GitHub, deployment, SSH, release, or external API impact:
- Rollback plan:

## Excluded / Deferred

List any dangerous or out-of-scope actions intentionally not performed, such as
push to protected branches, merge, deployment, branch deletion, secret rotation,
dependency installation, external API calls, SSH, model training, or dataset
downloads.

## Checklist

- [ ] Targets `main` through a short-lived branch or fork PR.
- [ ] Keeps the change small, reversible, and reviewable.
- [ ] Updates docs when behavior, policy, or user workflow changes.
- [ ] Does not commit secrets, private data, `.env` files, or credentials.
- [ ] Does not install unused SDKs, runtimes, or dependencies.
- [ ] Discloses material AI assistance when relevant.
- [ ] Does not claim validation, deployment, GitHub status, model training, or external integration without evidence.
