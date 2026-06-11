# SEIS Execution Packages

- Mode: `daily_reversible_task_packets`
- Source board: `seis-active-mission-board`
- Packages: 30
- Now packages: 10
- Next packages: 10
- Queued packages: 10
- Validation commands: 10
- Artifact roots: 9
- Runtime install policy: `do_not_install_new_runtime_for_language_percentage`
- Commit policy: `commit only after explicit user approval`
- Push policy: `push only after explicit user approval`

## Command Coverage

- `dotnet --info`
- `npm run automation:refresh-seis-surface -- --summary`
- `npm run check:seis-nonjs-kernel`
- `npm run check:workspace`
- `osacompile -o /tmp/seis-platform-automation.scpt polyglot/applescript/seis_platform_automation.applescript`
- `pwsh --version`
- `python3 --version`
- `xcode-select -p`
- `xcodebuild -version`
- `xcrun swift --version`

## Next 10 Packets

| Packet | Lane | Mission | Agent | Commands | Gates |
| ---: | --- | --- | --- | --- | --- |
| 1 | `now` | `wave-01-foundation-m01-architecture-contract` | `cs-foundation-agent` | `npm run check:seis-nonjs-kernel`<br>`npm run check:workspace`<br>`npm run automation:refresh-seis-surface -- --summary` | docs-updated, explicit-push-approval, git-diff-reviewable, maintainability, no-destructive-operation |
| 2 | `now` | `wave-01-foundation-m02-agent-policy` | `cs-foundation-agent` | `npm run check:seis-nonjs-kernel`<br>`npm run check:workspace`<br>`npm run automation:refresh-seis-surface -- --summary` | credential-safety, docs-updated, explicit-push-approval, git-diff-reviewable, human-approval |
| 3 | `now` | `wave-01-foundation-m03-platform-bridge` | `cs-foundation-agent` | `npm run check:seis-nonjs-kernel`<br>`npm run check:workspace`<br>`npm run automation:refresh-seis-surface -- --summary` | docs-updated, explicit-push-approval, git-diff-reviewable, no-destructive-operation, path-safety |
| 4 | `now` | `wave-01-foundation-m04-data-plane` | `cs-foundation-agent` | `npm run check:seis-nonjs-kernel`<br>`npm run check:workspace`<br>`npm run automation:refresh-seis-surface -- --summary` | docs-updated, explicit-push-approval, git-diff-reviewable, migration-plan, no-destructive-operation |
| 5 | `now` | `wave-01-foundation-m05-design-engineering` | `cs-foundation-agent` | `npm run check:seis-nonjs-kernel`<br>`npm run check:workspace`<br>`npm run automation:refresh-seis-surface -- --summary` | accessibility, docs-updated, explicit-push-approval, git-diff-reviewable, motion-evidence |
| 6 | `now` | `wave-01-foundation-m06-quality-gate` | `cs-foundation-agent` | `npm run check:seis-nonjs-kernel`<br>`npm run check:workspace`<br>`npm run automation:refresh-seis-surface -- --summary` | actionable-error, deterministic-check, docs-updated, explicit-push-approval, fail-fast |
| 7 | `now` | `wave-01-foundation-m07-security-governance` | `cs-foundation-agent` | `npm run check:seis-nonjs-kernel`<br>`npm run check:workspace`<br>`npm run automation:refresh-seis-surface -- --summary` | auditability, docs-updated, explicit-push-approval, git-diff-reviewable, least-privilege |
| 8 | `now` | `wave-01-foundation-m08-llm-orchestration` | `cs-foundation-agent` | `npm run check:seis-nonjs-kernel`<br>`npm run check:workspace`<br>`npm run automation:refresh-seis-surface -- --summary` | docs-updated, explicit-push-approval, git-diff-reviewable, model-fallback, no-destructive-operation |
| 9 | `now` | `wave-01-foundation-m09-runtime-surface` | `cs-foundation-agent` | `npm run check:seis-nonjs-kernel`<br>`npm run check:workspace`<br>`npm run automation:refresh-seis-surface -- --summary` | docs-updated, documented-owner, explicit-push-approval, git-diff-reviewable, no-destructive-operation |
| 10 | `now` | `wave-01-foundation-m10-release-readiness` | `cs-foundation-agent` | `npm run check:seis-nonjs-kernel`<br>`npm run check:workspace`<br>`npm run automation:refresh-seis-surface -- --summary` | cloud-readiness, docs-updated, explicit-push-approval, git-diff-reviewable, language-budget |
