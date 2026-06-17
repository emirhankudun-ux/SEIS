# SEIS GitHub Branch Migration Audit

Date: 2026-06-05

Target repository:

- `emirhankudun-ux/SEIS`
- Default branch: `UIXAppTTR`
- Visibility: public

Accessible repositories found through the GitHub connector:

- `emirhankudun-ux/SEIS`
- `emirhankudun-ux/UIX-Apps`
- `emirhankudun-ux/emirhan-kudun-portfolio`
- `emirhankudun-ux/github-unified-source`
- `emirhankudun-ux/seis-trusted-marketplace-plugin`
- `emirhankudun-ux/gemini-cli`
- `emirhankudun-ux/DeepSeek-Coder`
- `emirhankudun-ux/claude-code`
- `emirhankudun-ux/docs`
- `emirhankudun-ux/awesome-deepseek-agent`

Current SEIS branches:

- `UIXAppTTR`
- `claude/3d-animated-portfolio-POXSm`
- `claude/claude-md-docs-A72cU`
- `claude/ecstatic-darwin-fuoHJ`
- `claude/github-branch-repo-dev-SFUpD`
- `codex/requested-plugin-governance-20260602`
- `codex/seis-ux-cinematic-premium-foundation`
- `main`
- `seis/server-cloud-activation-20260602`
- `seis/server-cloud-activation-20260602-2`

Findings:

- `SEIS` already has the same branch names as `UIX-Apps`.
- For `UIX-Apps`, 9 branch trees match `SEIS`; `UIXAppTTR` differs because `SEIS` has an extra README update.
- Other repos have branches that are not present as real SEIS refs, especially:
  - `emirhan-kudun-portfolio`: `feature/seis-ecosystem-integration`, `seis-concept`
  - `github-unified-source`: `full-icloud-archive-20260604`
  - `gemini-cli`: 4 dependabot branches plus `main`
  - `DeepSeek-Coder`: 1 dependabot branch plus `main`
  - `claude-code`, `docs`, `awesome-deepseek-agent`, `seis-trusted-marketplace-plugin`: `main`
- Branch names like `main` collide across repos, so full consolidation should use a namespace such as `sources/<repo>/<branch>`.

Blockers observed:

- `gh` is not installed locally.
- SSH auth to GitHub failed with `Permission denied (publickey)`.
- No global Git credential helper is configured.
- Existing local repo folders in iCloud are mostly 0B placeholders and have incomplete `.git` metadata (`HEAD` and `config` are missing), so they cannot be used as working repos.
- The GitHub connector can create refs only to objects that already exist inside the target repo; trying to create `sources/github-unified-source/full-icloud-archive-20260604` in `SEIS` failed with `Object does not exist`.
- No connector tool for deleting or archiving whole repositories is available in this session.

Recommended migration shape:

- Push every source branch into `SEIS` as `sources/<repo>/<branch>`.
- Verify each pushed branch with `git ls-remote --heads`.
- Delete or archive old repositories only after verifying all expected source refs exist in `SEIS`.

Local artifacts:

- `_SEIS_WORKSPACE/migrate-github-branches-to-seis.sh` prepares and pushes the namespaced branch refs.
- It defaults to dry-run mode (`DRY_RUN=1`) and does not delete repositories.
- Deletion requires both `DELETE_SOURCE_REPOS=1` and GitHub CLI authentication.

Dry-run verification:

- Ran `SKIP_FETCH_ERRORS=1 DRY_RUN=1 WORKDIR=/tmp/seis-github-migration-dry-run _SEIS_WORKSPACE/migrate-github-branches-to-seis.sh`.
- Public repo branches mapped correctly to `refs/heads/sources/<repo>/<branch>`.
- Private repos (`emirhan-kudun-portfolio`, `github-unified-source`, `seis-trusted-marketplace-plugin`) could not be fetched without GitHub credentials.
