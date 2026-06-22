# SEIS Code Automation Plan

- Generated: 2026-06-01T21:56:16.219Z
- Branch target: UIXAppTTR
- Remote target: origin
- Cloud mode: provider-neutral-preflight
- Connector mode: explicit-auth-only

## Publish Readiness Snapshot

- Branch status: ## HEAD (no branch)
- Worktree clean: no
- Upstream: missing
- Upstream sync: unknown
- GitHub auth: ready
- Publish state: blocked
- Next publish action: switch to UIXAppTTR before publish preflight

## Next Coding Loop

1. Inspect current dirty files and keep unrelated changes untouched.
2. Pick one reversible product, cloud, governance, or quality slice.
3. Run local static checks before remote actions.
4. Refresh release artifacts only after source changes.
5. Push only when publish readiness is clean.

## Validation Commands

- `npm run check:branch`
- `npm run check:software-languages`
- `npm run check:seis-cloud-environment`
- `npm run check:server-target`
- `npm run quality`
- `npm run publish:preflight`

## Connector Candidates

- github: repository (bounded-preflight-before-push); blockedWithout=clean_worktree, publish_readiness_pass, github_auth
- vercel: cloud-deploy (requires_provider_token_and_site_selection); blockedWithout=provider_token, site_selection, SEIS_SITE_URL
- cloudflare: edge-deploy (requires_provider_token_and_route_selection); blockedWithout=provider_token, route_selection, SEIS_SITE_URL
- netlify: static-deploy (requires_provider_token_and_site_selection); blockedWithout=provider_token, site_selection, SEIS_SITE_URL
- sentry: observability (quiet_error_signal_only_after_project_selection); blockedWithout=project_selection, auth_scope
- slack: release-notifications (notify_only_after_user_approval); blockedWithout=user_approval, channel_scope
- google-drive: handoff-archive (archive_only_after_user_approval); blockedWithout=user_approval, destination_selection
- output-ai: durable-workflow (use_for_new_outputai_workflows_only); blockedWithout=workflow_scope, outputai_task_fit
- figma: design-handoff (read_design_context_only_after_file_or_node_is_explicit); blockedWithout=figma_file_or_node, user_approval, design_scope
- browser: local-ui-validation (use_for_known_local_or_file_url_smoke_checks_only); blockedWithout=known_local_url_or_file, ui_change_scope, low_power_browser_budget
- playwright: e2e-render-validation (run_only_for_ui_or_canvas_behavior_changes); blockedWithout=ui_or_canvas_change, test_target_url, browser_budget
- semgrep: static-security-review (run_for_security_sensitive_code_paths_without_autofix); blockedWithout=security_sensitive_change, scan_scope, no_autofix_confirmation
- linear: issue-planning (create_or_update_issues_only_after_user_confirms_destination); blockedWithout=workspace_auth, project_destination, user_approval
- notion: knowledge-base-handoff (write_docs_only_after_workspace_and_page_are_confirmed); blockedWithout=workspace_auth, page_destination, user_approval
- google-drive-artifact-archive: artifact-archive (archive_release_artifacts_only_after_user_approval); blockedWithout=drive_auth, folder_destination, user_approval

## Cloud Provider Candidates

- github-pages: github-actions-pages-artifact; rollback=revert_pages_publish_commit
- cloudflare-pages: pages_project_artifact_upload; rollback=promote_previous_pages_deployment
- vercel-static: vercel_prebuilt_static_output; rollback=promote_previous_vercel_deployment
- netlify-static: netlify_site_deploy_artifact; rollback=restore_previous_netlify_deploy
- docker-node-static: container_build_from_static_package; rollback=redeploy_previous_container_image
- azure-static-web-apps: azure_static_web_apps_artifact_upload; rollback=promote_previous_static_web_apps_deployment
- aws-amplify-static: amplify_hosting_static_artifact; rollback=redeploy_previous_amplify_job
- firebase-hosting: firebase_hosting_release_channel; rollback=rollback_to_previous_firebase_release

## Guardrails

- Do not commit secrets.
- Do not deploy without a selected provider, site URL, rollback owner, and clean publish readiness.
- Do not invoke external connectors unless authentication and scope are explicit.
- Keep observability quiet, actionable, and privacy-conscious.

