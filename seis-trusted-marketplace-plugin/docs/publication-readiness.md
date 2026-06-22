# Publication Readiness

This repository is private/personal by default and public/publish-ready in
structure.

## Private Personal Mode

Use this mode while the plugin is only for Emirhan and the SEIS workflow.

- Keep absolute local paths in private connection assets.
- Install through the personal Codex marketplace.
- Validate with `npm run validate`.
- Push to the private GitHub repo for backup and version history.

## Public Publish-Ready Mode

Before making the repository public, complete this checklist:

- Replace local absolute paths with placeholder examples or documented setup
  variables.
- Add real screenshots to `screenshots/`.
- Confirm license, support, and security policy.
- Review `assets/seis-repo-connection.json` for private paths.
- Tag a release and write release notes in `CHANGELOG.md`.
- Re-run local validation and GitHub Actions validation.

This keeps the repo professional without accidentally publishing private
machine paths or workflow assumptions.
