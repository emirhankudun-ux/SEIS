# SEIS Connector Activation Report

- Generated: 2026-06-02T08:08:37.647Z
- Mode: explicit-auth-only
- Connectors: 21
- Activatable: 0
- Blocked: 21
- Capability families: 7
- Plugin catalog families: 9
- Plugin catalog plugins: 231

## Ecosystem Activation

Expose every available plugin, MCP server, connector, and skill through a governed activation hub without blanket live calls.

## Capability Families

| family | default action | live write gate |
| --- | --- | --- |
| repo-governance | read_status_then_plan | user_approval |
| design-ui-ux | inspect_or_validate_known_target | explicit_design_target |
| cloud-deploy-observability | preflight_only | provider_token_and_rollback_owner |
| knowledge-handoff | draft_local_artifact | destination_and_audience |
| security-quality | scoped_static_review | scan_scope |
| market-research-and-seo | official_or_primary_source_lookup | research_question |
| agent-skill-development | local_spec_or_registry_update | target_runtime |

## Plugin Catalog

Listed does not mean live-active; use the smallest task-matched, authenticated, rollback-safe set.

| family | default mode | live gate | plugins |
| --- | --- | --- | --- |
| builder-and-hosting | preflight-and-plan | provider_target_and_rollback_owner | 22 |
| design-media-creative | inspect-or-draft | explicit_asset_or_design_target | 19 |
| product-analytics-observability | read-or-plan | workspace_auth_and_metric_scope | 20 |
| repo-devops-quality-security | local-preflight | clean_worktree_and_user_approval | 25 |
| data-db-ai-infra | spec-or-readiness | database_or_runtime_target | 23 |
| gtm-sales-market-intelligence | research-or-enrichment-plan | account_scope_and_data_permission | 31 |
| collaboration-knowledge-docs | draft-local-first | destination_and_audience | 32 |
| app-platform-commerce-mobile | architecture-or-sdk-plan | product_scope_and_test_environment | 24 |
| specialized-research-and-utilities | bounded-specialist-use | specialist_question_or_target | 35 |

## Connector Status

| connector | surface | status | missing gates |
| --- | --- | --- | --- |
| github | repository | blocked | clean_worktree, publish_readiness_pass |
| vercel | cloud-deploy | blocked | provider_token, site_selection, SEIS_SITE_URL |
| cloudflare | edge-deploy | blocked | provider_token, route_selection, SEIS_SITE_URL |
| netlify | static-deploy | blocked | provider_token, site_selection, SEIS_SITE_URL |
| sentry | observability | blocked | project_selection, auth_scope |
| slack | release-notifications | blocked | user_approval, channel_scope |
| google-drive | handoff-archive | blocked | user_approval, destination_selection |
| output-ai | durable-workflow | blocked | workflow_scope, outputai_task_fit |
| public-equity-investing | public-equity-research | blocked | public_equity_plugin_available, financial_data_auth, target_company_scope, user_approval |
| product-design | product-design-strategy | blocked | product_design_plugin_available, product_design_auth, product_design_scope, user_approval |
| investment-banking | investment-banking-analysis | blocked | investment_banking_plugin_available, investment_banking_auth, deal_scope, user_approval |
| figma | design-handoff | blocked | figma_file_or_node, user_approval, design_scope |
| browser | local-ui-validation | blocked | known_local_url_or_file, ui_change_scope, low_power_browser_budget |
| playwright | e2e-render-validation | blocked | ui_or_canvas_change, test_target_url, browser_budget |
| semgrep | static-security-review | blocked | security_sensitive_change, scan_scope, no_autofix_confirmation |
| linear | issue-planning | blocked | workspace_auth, project_destination, user_approval |
| notion | knowledge-base-handoff | blocked | workspace_auth, page_destination, user_approval |
| google-drive-artifact-archive | artifact-archive | blocked | drive_auth, folder_destination, user_approval |
| plugin-capability-router | plugin-orchestration | blocked | task_scope, plugin_target, user_approval |
| mcp-tool-router | mcp-orchestration | blocked | task_scope, mcp_target, write_scope |
| skill-router | skill-orchestration | blocked | task_scope, skill_target |

## Next Actions

- Keep connector actions local until a task-specific target and approval exist.
- Set only the environment gates required by the connector you intend to use.
- Rerun npm run automation:connector-activation-report.

