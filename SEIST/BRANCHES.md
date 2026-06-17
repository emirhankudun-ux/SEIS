# SEIS Source Branch Registry

SEIS is the canonical branch center for all source repositories.

The following `sources/<repo>/<branch>` refs exist in SEIS as centralized tracking refs. They make every source branch visible under the SEIS repository. Full source commit history preservation still requires authenticated git push into these refs.

## Source Branches In SEIS

| Source repository | Source branch | SEIS branch |
|---|---|---|
| `DeepSeek-Coder` | `dependabot/pip/pip-19adfad5d4` | `sources/DeepSeek-Coder/dependabot/pip/pip-19adfad5d4` |
| `DeepSeek-Coder` | `main` | `sources/DeepSeek-Coder/main` |
| `UIX-Apps` | `UIXAppTTR` | `sources/UIX-Apps/UIXAppTTR` |
| `UIX-Apps` | `claude/claude-md-docs-A72cU` | `sources/UIX-Apps/claude/claude-md-docs-A72cU` |
| `UIX-Apps` | `claude/ecstatic-darwin-fuoHJ` | `sources/UIX-Apps/claude/ecstatic-darwin-fuoHJ` |
| `UIX-Apps` | `claude/github-branch-repo-dev-SFUpD` | `sources/UIX-Apps/claude/github-branch-repo-dev-SFUpD` |
| `UIX-Apps` | `claude/3d-animated-portfolio-POXSm` | `sources/UIX-Apps/claude/3d-animated-portfolio-POXSm` |
| `UIX-Apps` | `codex/requested-plugin-governance-20260602` | `sources/UIX-Apps/codex/requested-plugin-governance-20260602` |
| `UIX-Apps` | `codex/seis-ux-cinematic-premium-foundation` | `sources/UIX-Apps/codex/seis-ux-cinematic-premium-foundation` |
| `UIX-Apps` | `main` | `sources/UIX-Apps/main` |
| `UIX-Apps` | `seis/server-cloud-activation-20260602-2` | `sources/UIX-Apps/seis/server-cloud-activation-20260602-2` |
| `UIX-Apps` | `seis/server-cloud-activation-20260602` | `sources/UIX-Apps/seis/server-cloud-activation-20260602` |
| `awesome-deepseek-agent` | `main` | `sources/awesome-deepseek-agent/main` |
| `claude-code` | `main` | `sources/claude-code/main` |
| `docs` | `main` | `sources/docs/main` |
| `emirhan-kudun-portfolio` | `codex/seis-ux-cinematic-premium-foundation` | `sources/emirhan-kudun-portfolio/codex/seis-ux-cinematic-premium-foundation` |
| `emirhan-kudun-portfolio` | `feature/seis-ecosystem-integration` | `sources/emirhan-kudun-portfolio/feature/seis-ecosystem-integration` |
| `emirhan-kudun-portfolio` | `seis-concept` | `sources/emirhan-kudun-portfolio/seis-concept` |
| `gemini-cli` | `dependabot/npm_and_yarn/npm_and_yarn-05b1f1d78b` | `sources/gemini-cli/dependabot/npm_and_yarn/npm_and_yarn-05b1f1d78b` |
| `gemini-cli` | `dependabot/npm_and_yarn/npm_and_yarn-da0aa30ced` | `sources/gemini-cli/dependabot/npm_and_yarn/npm_and_yarn-da0aa30ced` |
| `gemini-cli` | `dependabot/npm_and_yarn/npm_and_yarn-e5a46ec0e1` | `sources/gemini-cli/dependabot/npm_and_yarn/npm_and_yarn-e5a46ec0e1` |
| `gemini-cli` | `dependabot/npm_and_yarn/npm_and_yarn-e9ce4f7be9` | `sources/gemini-cli/dependabot/npm_and_yarn/npm_and_yarn-e9ce4f7be9` |
| `gemini-cli` | `main` | `sources/gemini-cli/main` |
| `github-unified-source` | `full-icloud-archive-20260604` | `sources/github-unified-source/full-icloud-archive-20260604` |
| `github-unified-source` | `main` | `sources/github-unified-source/main` |
| `seis-trusted-marketplace-plugin` | `main` | `sources/seis-trusted-marketplace-plugin/main` |

## Verification

Run:

```bash
git ls-remote --heads https://github.com/emirhankudun-ux/SEIS.git 'refs/heads/sources/*'
```

Expected count: 26 source tracking refs.

## Final History Migration

When GitHub push authentication is available, run:

```bash
DRY_RUN=0 scripts/migrate-github-branches-to-seis.sh
```

That command updates the `sources/<repo>/<branch>` refs with the real source branch commit history.
