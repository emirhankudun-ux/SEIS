# SEIS Public Readiness

## Purpose

Define the minimum criteria for presenting SEIS as a public, contributor-safe
reference product in GitHub.

## Definition of public readiness

- No secrets or private credentials in committed files.
- No-API-key local demo remains runnable.
- Documentation state is explicit (`real`, `mock`, `planned`, `disabled`).
- Readiness blockers are tracked and visible, not hidden.
- Every claim has a check path or manual approval path.

## Clone and run expectations

1. Clone repository.
2. Start local web route from `apps/web`.
3. Open documented demo entry routes and landing surfaces.
4. Confirm at least one healthy session path and no hard blocker in route checks.

Suggested default command:

```bash
cd apps/web
python3 -m http.server 50951 --bind 127.0.0.1
```

Open:

- `http://127.0.0.1:50951/desktop.html`
- `http://127.0.0.1:50951/seis-linux-replica.html?demo=live`

## No-key demo requirement

- Core SEIS demo mode must work without API keys.
- AI surfaces that need external providers must show explicit fallback labels.
- Local-only outputs are treated as draft until reviewed.

## Public documentation checklist

- `README.md`
- `AGENTS.md`
- `SEIS_SECOND_BRAIN.md`
- `SEIS_OBSIDIAN_VAULT.md`
- `SEIS_INSTALLED_AI_TOOLS.md`
- `SEIS_SUB_AGENTS.md`
- `SEIS_SSH.md`
- `docs/GETTING_STARTED.md`
- `docs/PUBLIC_READINESS.md`
- `docs/TROUBLESHOOTING.md`
- `docs/SEIS_SSH_SETUP.md`
- `docs/LOCAL_AI_SETUP.md`
- `docs/OBSIDIAN_SECOND_BRAIN.md`

## Public readiness gates

1. `npm run foundation:check`
2. `npm run brain:check`
3. `npm run public:readiness`
4. `npm run check:seis-second-brain`
5. `npm run check:seis-obsidian-safe-import-dry-run`
6. `npm run check:seis-second-brain-readiness-contracts`
7. `npm run check:seis-public-demo-go-no-go`
8. `npm run check:seis-ssh-public-access` (if SSH docs are claimed)
9. `npm run check:seis-ssh-public-onboarding`
10. `npm run check:seis-ssh-public-contributor-doctor`
11. `npm run check:seis-ssh-live-readiness-evidence`
12. `npm run check:seis-ssh-access-model`
13. `npm run check:seis-ai-fresh-clone-readiness`
14. `npm run check:seis-ai-public-readiness-program`
15. `npm run check:seis-ai-public-readiness`
16. `npm run check:seis-ai-public-readiness-report`
17. `npm run check:seis-retrieval-source-provenance`
18. `npm run check:seis-retrieval-evaluation-fixtures`
19. `npm run check:seis-knowledge-retrieval-training`
20. `npm run secrets:check`

## Demo checklist

- Desktop and launcher surfaces open.
- Search / Code / Design / Cloud / Store surfaces open where documented.
- States are labelled with `demo`, `mock`, `planned`, `real`, or `disabled`.
- Broken routes/entry points are documented in `docs/roadmap/NEXT_PR_QUEUE.md`.

## Security checklist

- Secret scan for obvious patterns before release.
- `git diff` or check scripts do not expose token-like strings.
- Never commit private keys, real tokens, host credentials, or `.env` files.
- Verify `seis-brain/private/` and `seis-brain/local-only/` are ignored.

## Obsidian brain checklist

- `seis-brain/README.md` exists.
- `seis-brain/vault/00_Index/SEIS Home.md` and `SEIS Map.md` exist.
- Public/private boundary rules present in vault.
- Context pack notes exist and are discoverable.
- No private vault bodies committed in public paths.

## Local AI checklist

- Local AI is documented as optional in onboarding and setup docs.
- No production routing claims without backend evidence.
- Prompts avoid secrets and private repository payloads.
- Continuation protocol (`CONTINUE_FROM` + `DEVAM`) documented and used.

## SSH checklist

- `SEIS-SSH` docs describe approvals, rollout gates, and rollback.
- No real credentials in public docs or demo profiles.
- Live SSH claims require explicit evidence and approval path.

## GitHub contribution checklist

- AGENTS/PR/Issue flow documented.
- Worktree safety rules are visible.
- Branch and merge expectations match repo governance.
- Contributors can onboard from documented evidence and checks.

## Known blockers

- Missing or failing checks in the gate list above are blockers.
- Any unresolved CI or evidence gap must be in `docs/roadmap/NEXT_PR_QUEUE.md` and referenced by `docs/STATUS.md`.

## Next actions

- Resolve the highest-severity blockers first.
- Re-run relevant checks and update evidence artifacts in `docs/roadmap/NEXT_PR_QUEUE.md`.
- Keep `docs/STATUS.md`, `docs/INDEX.md`, and `SEIS_MASTER_INDEX.md` synchronized.
