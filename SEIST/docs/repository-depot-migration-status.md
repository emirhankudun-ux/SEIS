# Repository Depot Migration Status

Date: 2026-06-05

SEIS is the canonical GitHub hub and general repository for the `emirhankudun-ux` ecosystem. Source repositories must remain online until both checks pass:

- source branch history is preserved under `sources/<repo>/<branch>` refs in SEIS
- default-branch files are imported under `repositories/<repo>` in SEIS

## Dry Run Result

Command used locally:

```bash
SKIP_FETCH_ERRORS=1 DRY_RUN=1 WORKDIR=/tmp/seis-depot-dry-run _SEIS_WORKSPACE/migrate-repositories-to-seis-depot.sh
```

Result:

- staged `3712` repository snapshot files locally under `repositories/<repo>`
- did not commit or push to GitHub
- did not delete any source repository

## Public Repositories Reached

These repositories cloned and staged in dry-run mode:

- `UIX-Apps`
- `gemini-cli`
- `DeepSeek-Coder`
- `claude-code`
- `docs`
- `awesome-deepseek-agent`

## Private Repositories Waiting For Git Auth

These repositories could not be cloned by local shell because GitHub HTTPS/SSH credentials were unavailable:

- `emirhan-kudun-portfolio`
- `github-unified-source`
- `seis-trusted-marketplace-plugin`

Do not delete these repositories until authenticated import succeeds.

## Required Auth Before Real Migration

The local environment needs GitHub git push/fetch authentication. For deletion, GitHub CLI must also be installed and authenticated with repository deletion permission.

Suggested sequence after authentication:

```bash
DRY_RUN=0 scripts/migrate-repositories-to-seis-depot.sh
```

After verifying `sources/<repo>/<branch>` refs and `repositories/<repo>` snapshots in SEIS:

```bash
DRY_RUN=0 DELETE_SOURCE_REPOS=1 scripts/migrate-repositories-to-seis-depot.sh
```

Deletion is irreversible and must stay separate from import.
