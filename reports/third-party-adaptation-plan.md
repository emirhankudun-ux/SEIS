# Third-Party Adaptation Plan

Generated: 2026-06-11T08:24:29.889Z

## Policy

- Source use: reference_only_or_interface_contracts
- Code import: blocked_without_license_review_and_explicit_user_confirmation
- Delete policy: blocked_until_owned_reimplementation_validated_and_user_confirms
- GitHub publish policy: publish_seis_owned_code_manifests_and_reports_only

## Candidates

| ID | Detected | Risk | Allowed use | Delete | Publish |
| --- | --- | --- | --- | --- | --- |
| claude-code | yes | high | ideas_interfaces_and_cli_boundaries_only | blocked | seis_owned_outputs_only |
| gemini-cli | yes | high | ideas_interfaces_and_cli_boundaries_only | blocked | seis_owned_outputs_only |
| deepseek-coder | yes | high | ideas_interfaces_and_cli_boundaries_only | blocked | seis_owned_outputs_only |
| awesome-deepseek-agent | yes | high | ideas_interfaces_and_cli_boundaries_only | blocked | seis_owned_outputs_only |
| antigravity-desktop | yes | high | reference_only_no_import | blocked | seis_owned_outputs_only |
| desktop-bundle-root | yes | high | reference_only_no_import | blocked | seis_owned_outputs_only |

## Required Before Delete Or Push

- Run npm run automation:ecosystem-intake.
- Run npm run automation:refresh-seis-surface.
- Review generated reports for proprietary or unknown-license sources.
- Commit only SEIS-owned outputs.
- Keep third-party source folders out of the pushed repo unless license review says otherwise.
