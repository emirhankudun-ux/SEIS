# SEIS Public Plugin External Install Proof

- Generated: 2026-07-12
- Status: repo-local-clean-artifact-staged-external-proof-pending
- Decision: not-ready-for-public-preview
- Public release allowed: no

## Repo-Local Clean Artifact Staging

- Mode: temporary-local-clean-artifact-staging
  - Expected public marketplace cards: 34
  - Canonical card: 1
  - Optional bundle cards: 33 (6 application + 27 topic)
  - Retained source capabilities: 380 (5 root + 75 application + 300 topic)
  - Exact-once bundled source capabilities: 375
- Staged marketplace cards: 34
- Staged retained source capabilities: 380
- Staged artifacts total: 414
- Embedded source modules: 10
- Staged manifests: 414
- Staged MCP entry scripts: 414
- Staged files: 2781
- Excluded source metadata files: 0
- Disallowed source artifacts: 0
- Forbidden files in stage: 0
- Temporary stage removed: yes
- External network used: no
- Existing Codex cache used: no

The historical pre-consolidation 381-card projection is retained only as a
non-current snapshot. The current install surface is 34 cards; retained source
capabilities are validated separately and are not direct cards.

| artifact | distribution | bundle | source files | staged files | excluded metadata | MCP entry scripts | stage |
| --- | --- | --- | --- | --- | --- | --- | --- |
| seis-ai-agent | marketplace-card | n/a | 34 | 34 | 0 | 1 | pass |
| seis-application-bundle-01 | marketplace-card | n/a | 6 | 6 | 0 | 1 | pass |
| seis-application-bundle-02 | marketplace-card | n/a | 6 | 6 | 0 | 1 | pass |
| seis-application-bundle-03 | marketplace-card | n/a | 6 | 6 | 0 | 1 | pass |
| seis-application-bundle-04 | marketplace-card | n/a | 6 | 6 | 0 | 1 | pass |
| seis-application-bundle-05 | marketplace-card | n/a | 6 | 6 | 0 | 1 | pass |
| seis-application-bundle-06 | marketplace-card | n/a | 6 | 6 | 0 | 1 | pass |
| seis-topic-bundle-01 | marketplace-card | n/a | 6 | 6 | 0 | 1 | pass |
| seis-topic-bundle-02 | marketplace-card | n/a | 6 | 6 | 0 | 1 | pass |
| seis-topic-bundle-03 | marketplace-card | n/a | 6 | 6 | 0 | 1 | pass |
| seis-topic-bundle-04 | marketplace-card | n/a | 6 | 6 | 0 | 1 | pass |
| seis-topic-bundle-05 | marketplace-card | n/a | 6 | 6 | 0 | 1 | pass |
| seis-topic-bundle-06 | marketplace-card | n/a | 6 | 6 | 0 | 1 | pass |
| seis-topic-bundle-07 | marketplace-card | n/a | 6 | 6 | 0 | 1 | pass |
| seis-topic-bundle-08 | marketplace-card | n/a | 6 | 6 | 0 | 1 | pass |
| seis-topic-bundle-09 | marketplace-card | n/a | 6 | 6 | 0 | 1 | pass |
| seis-topic-bundle-10 | marketplace-card | n/a | 6 | 6 | 0 | 1 | pass |
| seis-topic-bundle-11 | marketplace-card | n/a | 6 | 6 | 0 | 1 | pass |
| seis-topic-bundle-12 | marketplace-card | n/a | 6 | 6 | 0 | 1 | pass |
| seis-topic-bundle-13 | marketplace-card | n/a | 6 | 6 | 0 | 1 | pass |
| seis-topic-bundle-14 | marketplace-card | n/a | 6 | 6 | 0 | 1 | pass |
| seis-topic-bundle-15 | marketplace-card | n/a | 6 | 6 | 0 | 1 | pass |
| seis-topic-bundle-16 | marketplace-card | n/a | 6 | 6 | 0 | 1 | pass |
| seis-topic-bundle-17 | marketplace-card | n/a | 6 | 6 | 0 | 1 | pass |
| seis-topic-bundle-18 | marketplace-card | n/a | 6 | 6 | 0 | 1 | pass |
| seis-topic-bundle-19 | marketplace-card | n/a | 6 | 6 | 0 | 1 | pass |
| seis-topic-bundle-20 | marketplace-card | n/a | 6 | 6 | 0 | 1 | pass |
| seis-topic-bundle-21 | marketplace-card | n/a | 6 | 6 | 0 | 1 | pass |
| seis-topic-bundle-22 | marketplace-card | n/a | 6 | 6 | 0 | 1 | pass |
| seis-topic-bundle-23 | marketplace-card | n/a | 6 | 6 | 0 | 1 | pass |
| seis-topic-bundle-24 | marketplace-card | n/a | 6 | 6 | 0 | 1 | pass |
| seis-topic-bundle-25 | marketplace-card | n/a | 6 | 6 | 0 | 1 | pass |
| seis-topic-bundle-26 | marketplace-card | n/a | 6 | 6 | 0 | 1 | pass |
| seis-topic-bundle-27 | marketplace-card | n/a | 6 | 6 | 0 | 1 | pass |
| seis | retained-source-capability | n/a | 33 | 33 | 0 | 1 | pass |
| seis-cloud | retained-source-capability | n/a | 8 | 8 | 0 | 1 | pass |
| seis-code | retained-source-capability | n/a | 8 | 8 | 0 | 1 | pass |
| seis-design | retained-source-capability | n/a | 8 | 8 | 0 | 1 | pass |
| seis-data | retained-source-capability | n/a | 8 | 8 | 0 | 1 | pass |
| seis-a11y-regression | retained-source-capability | seis-application-bundle-02 | 5 | 5 | 0 | 1 | pass |
| seis-action-pin-audit | retained-source-capability | seis-application-bundle-03 | 5 | 5 | 0 | 1 | pass |
| seis-agent-audit | retained-source-capability | seis-application-bundle-01 | 5 | 5 | 0 | 1 | pass |
| seis-agent-contract-validator | retained-source-capability | seis-application-bundle-01 | 5 | 5 | 0 | 1 | pass |
| seis-apple-native-readiness | retained-source-capability | seis-application-bundle-04 | 6 | 6 | 0 | 1 | pass |
| seis-approval-gate-review | retained-source-capability | seis-application-bundle-04 | 5 | 5 | 0 | 1 | pass |
| seis-architecture-drift | retained-source-capability | seis-application-bundle-04 | 5 | 5 | 0 | 1 | pass |
| seis-artifact-attestation | retained-source-capability | seis-application-bundle-03 | 5 | 5 | 0 | 1 | pass |
| seis-branch-protection-audit | retained-source-capability | seis-application-bundle-03 | 5 | 5 | 0 | 1 | pass |
| seis-canonical-registry-validator | retained-source-capability | seis-application-bundle-04 | 5 | 5 | 0 | 1 | pass |
| seis-changelog-validator | retained-source-capability | seis-application-bundle-04 | 5 | 5 | 0 | 1 | pass |
| seis-codeowners-audit | retained-source-capability | seis-application-bundle-04 | 5 | 5 | 0 | 1 | pass |
| seis-community-health | retained-source-capability | seis-application-bundle-04 | 5 | 5 | 0 | 1 | pass |
| seis-context-efficiency | retained-source-capability | seis-application-bundle-01 | 5 | 5 | 0 | 1 | pass |
| seis-contract-compatibility | retained-source-capability | seis-application-bundle-04 | 5 | 5 | 0 | 1 | pass |
| seis-contributor-map | retained-source-capability | seis-application-bundle-04 | 5 | 5 | 0 | 1 | pass |
| seis-cost-latency-budget | retained-source-capability | seis-application-bundle-04 | 5 | 5 | 0 | 1 | pass |
| seis-data-retention-audit | retained-source-capability | seis-application-bundle-04 | 5 | 5 | 0 | 1 | pass |
| seis-dependency-freshness | retained-source-capability | seis-application-bundle-03 | 5 | 5 | 0 | 1 | pass |
| seis-design-token-audit | retained-source-capability | seis-application-bundle-02 | 5 | 5 | 0 | 1 | pass |
| seis-doc-indexer | retained-source-capability | seis-application-bundle-01 | 5 | 5 | 0 | 1 | pass |
| seis-docs-freshness | retained-source-capability | seis-application-bundle-01 | 5 | 5 | 0 | 1 | pass |
| seis-dora-metrics | retained-source-capability | seis-application-bundle-02 | 5 | 5 | 0 | 1 | pass |
| seis-download-anomaly | retained-source-capability | seis-application-bundle-01 | 5 | 5 | 0 | 1 | pass |
| seis-evidence-index | retained-source-capability | seis-application-bundle-04 | 6 | 6 | 0 | 1 | pass |
| seis-focus-navigation-audit | retained-source-capability | seis-application-bundle-02 | 6 | 6 | 0 | 1 | pass |
| seis-github-metrics-collector | retained-source-capability | seis-application-bundle-04 | 5 | 5 | 0 | 1 | pass |
| seis-goal-dependency-map | retained-source-capability | seis-application-bundle-04 | 5 | 5 | 0 | 1 | pass |
| seis-goal-integrity | retained-source-capability | seis-application-bundle-02 | 5 | 5 | 0 | 1 | pass |
| seis-issue-triage | retained-source-capability | seis-application-bundle-05 | 5 | 5 | 0 | 1 | pass |
| seis-license-compatibility | retained-source-capability | seis-application-bundle-03 | 5 | 5 | 0 | 1 | pass |
| seis-localization-coverage | retained-source-capability | seis-application-bundle-01 | 5 | 5 | 0 | 1 | pass |
| seis-maintainer-risk | retained-source-capability | seis-application-bundle-02 | 5 | 5 | 0 | 1 | pass |
| seis-marketplace-integrity | retained-source-capability | seis-application-bundle-05 | 5 | 5 | 0 | 1 | pass |
| seis-mcp-inventory | retained-source-capability | seis-application-bundle-01 | 5 | 5 | 0 | 1 | pass |
| seis-mcp-permission | retained-source-capability | seis-application-bundle-03 | 5 | 5 | 0 | 1 | pass |
| seis-migration-guide-check | retained-source-capability | seis-application-bundle-05 | 5 | 5 | 0 | 1 | pass |
| seis-model-fallback | retained-source-capability | seis-application-bundle-01 | 5 | 5 | 0 | 1 | pass |
| seis-offline-mode-check | retained-source-capability | seis-application-bundle-05 | 5 | 5 | 0 | 1 | pass |
| seis-package-adoption | retained-source-capability | seis-application-bundle-01 | 5 | 5 | 0 | 1 | pass |
| seis-performance-budget | retained-source-capability | seis-application-bundle-05 | 5 | 5 | 0 | 1 | pass |
| seis-plugin-capability-coverage | retained-source-capability | seis-application-bundle-05 | 6 | 6 | 0 | 1 | pass |
| seis-plugin-discovery | retained-source-capability | seis-application-bundle-05 | 5 | 5 | 0 | 1 | pass |
| seis-plugin-migration | retained-source-capability | seis-application-bundle-05 | 5 | 5 | 0 | 1 | pass |
| seis-pr-cycle-time | retained-source-capability | seis-application-bundle-05 | 5 | 5 | 0 | 1 | pass |
| seis-project-manifest-audit | retained-source-capability | seis-application-bundle-02 | 6 | 6 | 0 | 1 | pass |
| seis-prompt-injection-audit | retained-source-capability | seis-application-bundle-05 | 5 | 5 | 0 | 1 | pass |
| seis-provider-health | retained-source-capability | seis-application-bundle-01 | 5 | 5 | 0 | 1 | pass |
| seis-public-distribution-audit | retained-source-capability | seis-application-bundle-05 | 5 | 5 | 0 | 1 | pass |
| seis-public-install-evidence | retained-source-capability | seis-application-bundle-05 | 5 | 5 | 0 | 1 | pass |
| seis-public-install-state | retained-source-capability | seis-application-bundle-05 | 5 | 5 | 0 | 1 | pass |
| seis-public-runtime-status | retained-source-capability | seis-application-bundle-05 | 5 | 5 | 0 | 1 | pass |
| seis-public-safe-scan | retained-source-capability | seis-application-bundle-03 | 5 | 5 | 0 | 1 | pass |
| seis-rag-citation-coverage | retained-source-capability | seis-application-bundle-01 | 5 | 5 | 0 | 1 | pass |
| seis-release-cadence | retained-source-capability | seis-application-bundle-06 | 5 | 5 | 0 | 1 | pass |
| seis-release-readiness | retained-source-capability | seis-application-bundle-06 | 5 | 5 | 0 | 1 | pass |
| seis-repository-health | retained-source-capability | seis-application-bundle-06 | 5 | 5 | 0 | 1 | pass |
| seis-repository-scorecard | retained-source-capability | seis-application-bundle-06 | 5 | 5 | 0 | 1 | pass |
| seis-rollback-readiness | retained-source-capability | seis-application-bundle-06 | 5 | 5 | 0 | 1 | pass |
| seis-route-explainer | retained-source-capability | seis-application-bundle-01 | 5 | 5 | 0 | 1 | pass |
| seis-sbom-generator | retained-source-capability | seis-application-bundle-03 | 5 | 5 | 0 | 1 | pass |
| seis-secret-boundary-scan | retained-source-capability | seis-application-bundle-03 | 5 | 5 | 0 | 1 | pass |
| seis-semver-audit | retained-source-capability | seis-application-bundle-06 | 5 | 5 | 0 | 1 | pass |
| seis-source-provenance | retained-source-capability | seis-application-bundle-02 | 5 | 5 | 0 | 1 | pass |
| seis-swift-concurrency-audit | retained-source-capability | seis-application-bundle-06 | 6 | 6 | 0 | 1 | pass |
| seis-swift-package-topology | retained-source-capability | seis-application-bundle-06 | 6 | 6 | 0 | 1 | pass |
| seis-technology-ontology | retained-source-capability | seis-application-bundle-01 | 5 | 5 | 0 | 1 | pass |
| seis-test-flakiness | retained-source-capability | seis-application-bundle-06 | 5 | 5 | 0 | 1 | pass |
| seis-tool-permission-audit | retained-source-capability | seis-application-bundle-06 | 5 | 5 | 0 | 1 | pass |
| seis-trusted-marketplace | retained-source-capability | seis-application-bundle-06 | 5 | 5 | 0 | 1 | pass |
| seis-ui-state-contract-audit | retained-source-capability | seis-application-bundle-02 | 6 | 6 | 0 | 1 | pass |
| seis-vulnerability-triage | retained-source-capability | seis-application-bundle-03 | 5 | 5 | 0 | 1 | pass |
| seis-workflow-linter | retained-source-capability | seis-application-bundle-06 | 5 | 5 | 0 | 1 | pass |
| seis-workflow-permission-audit | retained-source-capability | seis-application-bundle-03 | 5 | 5 | 0 | 1 | pass |
| seis-workspace-inspector | retained-source-capability | seis-application-bundle-06 | 5 | 5 | 0 | 1 | pass |
| seis-topic-artificial-intelligence | retained-source-capability | seis-topic-bundle-01 | 7 | 7 | 0 | 1 | pass |
| seis-topic-artificial-intelligence-agent-runtime | retained-source-capability | seis-topic-bundle-01 | 7 | 7 | 0 | 1 | pass |
| seis-topic-artificial-intelligence-agent-swarms | retained-source-capability | seis-topic-bundle-01 | 7 | 7 | 0 | 1 | pass |
| seis-topic-artificial-intelligence-ai-agents | retained-source-capability | seis-topic-bundle-01 | 7 | 7 | 0 | 1 | pass |
| seis-topic-artificial-intelligence-ai-alignment | retained-source-capability | seis-topic-bundle-01 | 7 | 7 | 0 | 1 | pass |
| seis-topic-artificial-intelligence-ai-core | retained-source-capability | seis-topic-bundle-01 | 7 | 7 | 0 | 1 | pass |
| seis-topic-artificial-intelligence-ai-evaluation | retained-source-capability | seis-topic-bundle-01 | 7 | 7 | 0 | 1 | pass |
| seis-topic-artificial-intelligence-ai-safety | retained-source-capability | seis-topic-bundle-01 | 7 | 7 | 0 | 1 | pass |
| seis-topic-artificial-intelligence-audio-ai | retained-source-capability | seis-topic-bundle-01 | 7 | 7 | 0 | 1 | pass |
| seis-topic-artificial-intelligence-computer-vision | retained-source-capability | seis-topic-bundle-01 | 7 | 7 | 0 | 1 | pass |
| seis-topic-artificial-intelligence-context-engineering | retained-source-capability | seis-topic-bundle-01 | 7 | 7 | 0 | 1 | pass |
| seis-topic-artificial-intelligence-deep-learning | retained-source-capability | seis-topic-bundle-01 | 7 | 7 | 0 | 1 | pass |
| seis-topic-artificial-intelligence-embeddings | retained-source-capability | seis-topic-bundle-02 | 7 | 7 | 0 | 1 | pass |
| seis-topic-artificial-intelligence-generative-ai | retained-source-capability | seis-topic-bundle-02 | 7 | 7 | 0 | 1 | pass |
| seis-topic-artificial-intelligence-graphrag | retained-source-capability | seis-topic-bundle-02 | 7 | 7 | 0 | 1 | pass |
| seis-topic-artificial-intelligence-knowledge-graph | retained-source-capability | seis-topic-bundle-02 | 7 | 7 | 0 | 1 | pass |
| seis-topic-artificial-intelligence-knowledge-systems | retained-source-capability | seis-topic-bundle-02 | 7 | 7 | 0 | 1 | pass |
| seis-topic-artificial-intelligence-large-language-models | retained-source-capability | seis-topic-bundle-02 | 7 | 7 | 0 | 1 | pass |
| seis-topic-artificial-intelligence-machine-learning | retained-source-capability | seis-topic-bundle-02 | 7 | 7 | 0 | 1 | pass |
| seis-topic-artificial-intelligence-memory-systems | retained-source-capability | seis-topic-bundle-02 | 7 | 7 | 0 | 1 | pass |
| seis-topic-artificial-intelligence-model-routing | retained-source-capability | seis-topic-bundle-02 | 7 | 7 | 0 | 1 | pass |
| seis-topic-artificial-intelligence-multimodal-ai | retained-source-capability | seis-topic-bundle-02 | 7 | 7 | 0 | 1 | pass |
| seis-topic-artificial-intelligence-natural-language-processing | retained-source-capability | seis-topic-bundle-02 | 7 | 7 | 0 | 1 | pass |
| seis-topic-artificial-intelligence-neural-networks | retained-source-capability | seis-topic-bundle-02 | 7 | 7 | 0 | 1 | pass |
| seis-topic-artificial-intelligence-prompt-engineering | retained-source-capability | seis-topic-bundle-03 | 7 | 7 | 0 | 1 | pass |
| seis-topic-artificial-intelligence-provider-routing | retained-source-capability | seis-topic-bundle-03 | 7 | 7 | 0 | 1 | pass |
| seis-topic-artificial-intelligence-rag | retained-source-capability | seis-topic-bundle-03 | 7 | 7 | 0 | 1 | pass |
| seis-topic-artificial-intelligence-reasoning-models | retained-source-capability | seis-topic-bundle-03 | 7 | 7 | 0 | 1 | pass |
| seis-topic-artificial-intelligence-responsible-ai | retained-source-capability | seis-topic-bundle-03 | 7 | 7 | 0 | 1 | pass |
| seis-topic-artificial-intelligence-retrieval | retained-source-capability | seis-topic-bundle-03 | 7 | 7 | 0 | 1 | pass |
| seis-topic-artificial-intelligence-semantic-search | retained-source-capability | seis-topic-bundle-03 | 7 | 7 | 0 | 1 | pass |
| seis-topic-artificial-intelligence-small-language-models | retained-source-capability | seis-topic-bundle-03 | 7 | 7 | 0 | 1 | pass |
| seis-topic-artificial-intelligence-speech-ai | retained-source-capability | seis-topic-bundle-03 | 7 | 7 | 0 | 1 | pass |
| seis-topic-artificial-intelligence-vector-search | retained-source-capability | seis-topic-bundle-03 | 7 | 7 | 0 | 1 | pass |
| seis-topic-artificial-intelligence-world-models | retained-source-capability | seis-topic-bundle-03 | 7 | 7 | 0 | 1 | pass |
| seis-topic-automation | retained-source-capability | seis-topic-bundle-04 | 7 | 7 | 0 | 1 | pass |
| seis-topic-automation-command-center | retained-source-capability | seis-topic-bundle-04 | 7 | 7 | 0 | 1 | pass |
| seis-topic-automation-connectors | retained-source-capability | seis-topic-bundle-04 | 7 | 7 | 0 | 1 | pass |
| seis-topic-automation-integrations | retained-source-capability | seis-topic-bundle-04 | 7 | 7 | 0 | 1 | pass |
| seis-topic-automation-mcp | retained-source-capability | seis-topic-bundle-04 | 7 | 7 | 0 | 1 | pass |
| seis-topic-automation-orchestration | retained-source-capability | seis-topic-bundle-04 | 7 | 7 | 0 | 1 | pass |
| seis-topic-automation-pipelines | retained-source-capability | seis-topic-bundle-04 | 7 | 7 | 0 | 1 | pass |
| seis-topic-automation-plugin-registry | retained-source-capability | seis-topic-bundle-04 | 7 | 7 | 0 | 1 | pass |
| seis-topic-automation-plugins | retained-source-capability | seis-topic-bundle-04 | 7 | 7 | 0 | 1 | pass |
| seis-topic-automation-providers | retained-source-capability | seis-topic-bundle-05 | 7 | 7 | 0 | 1 | pass |
| seis-topic-automation-scheduling | retained-source-capability | seis-topic-bundle-05 | 7 | 7 | 0 | 1 | pass |
| seis-topic-automation-skills | retained-source-capability | seis-topic-bundle-05 | 7 | 7 | 0 | 1 | pass |
| seis-topic-automation-task-management | retained-source-capability | seis-topic-bundle-05 | 7 | 7 | 0 | 1 | pass |
| seis-topic-automation-templates | retained-source-capability | seis-topic-bundle-05 | 7 | 7 | 0 | 1 | pass |
| seis-topic-automation-tools | retained-source-capability | seis-topic-bundle-05 | 7 | 7 | 0 | 1 | pass |
| seis-topic-automation-workflow | retained-source-capability | seis-topic-bundle-05 | 7 | 7 | 0 | 1 | pass |
| seis-topic-automation-workspace | retained-source-capability | seis-topic-bundle-05 | 7 | 7 | 0 | 1 | pass |
| seis-topic-cloud-computing | retained-source-capability | seis-topic-bundle-06 | 7 | 7 | 0 | 1 | pass |
| seis-topic-cloud-computing-ci-cd | retained-source-capability | seis-topic-bundle-06 | 7 | 7 | 0 | 1 | pass |
| seis-topic-cloud-computing-cloud-native | retained-source-capability | seis-topic-bundle-06 | 7 | 7 | 0 | 1 | pass |
| seis-topic-cloud-computing-containers | retained-source-capability | seis-topic-bundle-06 | 7 | 7 | 0 | 1 | pass |
| seis-topic-cloud-computing-devops | retained-source-capability | seis-topic-bundle-06 | 7 | 7 | 0 | 1 | pass |
| seis-topic-cloud-computing-devsecops | retained-source-capability | seis-topic-bundle-06 | 7 | 7 | 0 | 1 | pass |
| seis-topic-cloud-computing-docker | retained-source-capability | seis-topic-bundle-06 | 7 | 7 | 0 | 1 | pass |
| seis-topic-cloud-computing-edge-computing | retained-source-capability | seis-topic-bundle-06 | 7 | 7 | 0 | 1 | pass |
| seis-topic-cloud-computing-hybrid-cloud | retained-source-capability | seis-topic-bundle-06 | 7 | 7 | 0 | 1 | pass |
| seis-topic-cloud-computing-infrastructure | retained-source-capability | seis-topic-bundle-06 | 7 | 7 | 0 | 1 | pass |
| seis-topic-cloud-computing-infrastructure-as-code | retained-source-capability | seis-topic-bundle-06 | 7 | 7 | 0 | 1 | pass |
| seis-topic-cloud-computing-kubernetes | retained-source-capability | seis-topic-bundle-06 | 7 | 7 | 0 | 1 | pass |
| seis-topic-cloud-computing-logging | retained-source-capability | seis-topic-bundle-06 | 7 | 7 | 0 | 1 | pass |
| seis-topic-cloud-computing-metrics | retained-source-capability | seis-topic-bundle-07 | 7 | 7 | 0 | 1 | pass |
| seis-topic-cloud-computing-monitoring | retained-source-capability | seis-topic-bundle-07 | 7 | 7 | 0 | 1 | pass |
| seis-topic-cloud-computing-networking | retained-source-capability | seis-topic-bundle-07 | 7 | 7 | 0 | 1 | pass |
| seis-topic-cloud-computing-observability | retained-source-capability | seis-topic-bundle-07 | 7 | 7 | 0 | 1 | pass |
| seis-topic-cloud-computing-platform-engineering | retained-source-capability | seis-topic-bundle-07 | 7 | 7 | 0 | 1 | pass |
| seis-topic-cloud-computing-private-cloud | retained-source-capability | seis-topic-bundle-07 | 7 | 7 | 0 | 1 | pass |
| seis-topic-cloud-computing-public-cloud | retained-source-capability | seis-topic-bundle-07 | 7 | 7 | 0 | 1 | pass |
| seis-topic-cloud-computing-serverless | retained-source-capability | seis-topic-bundle-07 | 7 | 7 | 0 | 1 | pass |
| seis-topic-cloud-computing-site-reliability-engineering | retained-source-capability | seis-topic-bundle-07 | 7 | 7 | 0 | 1 | pass |
| seis-topic-cloud-computing-telemetry | retained-source-capability | seis-topic-bundle-07 | 7 | 7 | 0 | 1 | pass |
| seis-topic-cloud-computing-tracing | retained-source-capability | seis-topic-bundle-07 | 7 | 7 | 0 | 1 | pass |
| seis-topic-cloud-computing-virtualization | retained-source-capability | seis-topic-bundle-07 | 7 | 7 | 0 | 1 | pass |
| seis-topic-creative-production | retained-source-capability | seis-topic-bundle-08 | 7 | 7 | 0 | 1 | pass |
| seis-topic-creative-production-animation | retained-source-capability | seis-topic-bundle-08 | 7 | 7 | 0 | 1 | pass |
| seis-topic-creative-production-asset-management | retained-source-capability | seis-topic-bundle-08 | 7 | 7 | 0 | 1 | pass |
| seis-topic-creative-production-audio | retained-source-capability | seis-topic-bundle-08 | 7 | 7 | 0 | 1 | pass |
| seis-topic-creative-production-cgi | retained-source-capability | seis-topic-bundle-08 | 7 | 7 | 0 | 1 | pass |
| seis-topic-creative-production-content-creation | retained-source-capability | seis-topic-bundle-08 | 7 | 7 | 0 | 1 | pass |
| seis-topic-creative-production-creative-engineering | retained-source-capability | seis-topic-bundle-08 | 7 | 7 | 0 | 1 | pass |
| seis-topic-creative-production-digital-art | retained-source-capability | seis-topic-bundle-08 | 7 | 7 | 0 | 1 | pass |
| seis-topic-creative-production-media-production | retained-source-capability | seis-topic-bundle-08 | 7 | 7 | 0 | 1 | pass |
| seis-topic-creative-production-moodboards | retained-source-capability | seis-topic-bundle-09 | 7 | 7 | 0 | 1 | pass |
| seis-topic-creative-production-music | retained-source-capability | seis-topic-bundle-09 | 7 | 7 | 0 | 1 | pass |
| seis-topic-creative-production-publishing | retained-source-capability | seis-topic-bundle-09 | 7 | 7 | 0 | 1 | pass |
| seis-topic-creative-production-story-world | retained-source-capability | seis-topic-bundle-09 | 7 | 7 | 0 | 1 | pass |
| seis-topic-creative-production-storytelling | retained-source-capability | seis-topic-bundle-09 | 7 | 7 | 0 | 1 | pass |
| seis-topic-creative-production-video | retained-source-capability | seis-topic-bundle-09 | 7 | 7 | 0 | 1 | pass |
| seis-topic-creative-production-virtual-production | retained-source-capability | seis-topic-bundle-09 | 7 | 7 | 0 | 1 | pass |
| seis-topic-creative-production-visual-effects | retained-source-capability | seis-topic-bundle-09 | 7 | 7 | 0 | 1 | pass |
| seis-topic-cybersecurity | retained-source-capability | seis-topic-bundle-10 | 7 | 7 | 0 | 1 | pass |
| seis-topic-cybersecurity-abac | retained-source-capability | seis-topic-bundle-10 | 7 | 7 | 0 | 1 | pass |
| seis-topic-cybersecurity-ai-security | retained-source-capability | seis-topic-bundle-10 | 7 | 7 | 0 | 1 | pass |
| seis-topic-cybersecurity-application-security | retained-source-capability | seis-topic-bundle-10 | 7 | 7 | 0 | 1 | pass |
| seis-topic-cybersecurity-authentication | retained-source-capability | seis-topic-bundle-10 | 7 | 7 | 0 | 1 | pass |
| seis-topic-cybersecurity-authorization | retained-source-capability | seis-topic-bundle-10 | 7 | 7 | 0 | 1 | pass |
| seis-topic-cybersecurity-compliance | retained-source-capability | seis-topic-bundle-10 | 7 | 7 | 0 | 1 | pass |
| seis-topic-cybersecurity-encryption | retained-source-capability | seis-topic-bundle-10 | 7 | 7 | 0 | 1 | pass |
| seis-topic-cybersecurity-identity-management | retained-source-capability | seis-topic-bundle-10 | 7 | 7 | 0 | 1 | pass |
| seis-topic-cybersecurity-incident-response | retained-source-capability | seis-topic-bundle-10 | 7 | 7 | 0 | 1 | pass |
| seis-topic-cybersecurity-information-security | retained-source-capability | seis-topic-bundle-10 | 7 | 7 | 0 | 1 | pass |
| seis-topic-cybersecurity-network-security | retained-source-capability | seis-topic-bundle-11 | 7 | 7 | 0 | 1 | pass |
| seis-topic-cybersecurity-privacy | retained-source-capability | seis-topic-bundle-11 | 7 | 7 | 0 | 1 | pass |
| seis-topic-cybersecurity-rbac | retained-source-capability | seis-topic-bundle-11 | 7 | 7 | 0 | 1 | pass |
| seis-topic-cybersecurity-risk-management | retained-source-capability | seis-topic-bundle-11 | 7 | 7 | 0 | 1 | pass |
| seis-topic-cybersecurity-secrets-management | retained-source-capability | seis-topic-bundle-11 | 7 | 7 | 0 | 1 | pass |
| seis-topic-cybersecurity-security-auditing | retained-source-capability | seis-topic-bundle-11 | 7 | 7 | 0 | 1 | pass |
| seis-topic-cybersecurity-supply-chain-security | retained-source-capability | seis-topic-bundle-11 | 7 | 7 | 0 | 1 | pass |
| seis-topic-cybersecurity-threat-intelligence | retained-source-capability | seis-topic-bundle-11 | 7 | 7 | 0 | 1 | pass |
| seis-topic-cybersecurity-threat-modeling | retained-source-capability | seis-topic-bundle-11 | 7 | 7 | 0 | 1 | pass |
| seis-topic-cybersecurity-zero-trust | retained-source-capability | seis-topic-bundle-11 | 7 | 7 | 0 | 1 | pass |
| seis-topic-data | retained-source-capability | seis-topic-bundle-12 | 7 | 7 | 0 | 1 | pass |
| seis-topic-data-analytics | retained-source-capability | seis-topic-bundle-12 | 7 | 7 | 0 | 1 | pass |
| seis-topic-data-business-intelligence | retained-source-capability | seis-topic-bundle-12 | 7 | 7 | 0 | 1 | pass |
| seis-topic-data-data-architecture | retained-source-capability | seis-topic-bundle-12 | 7 | 7 | 0 | 1 | pass |
| seis-topic-data-data-engineering | retained-source-capability | seis-topic-bundle-12 | 7 | 7 | 0 | 1 | pass |
| seis-topic-data-data-governance | retained-source-capability | seis-topic-bundle-12 | 7 | 7 | 0 | 1 | pass |
| seis-topic-data-data-lineage | retained-source-capability | seis-topic-bundle-12 | 7 | 7 | 0 | 1 | pass |
| seis-topic-data-data-pipelines | retained-source-capability | seis-topic-bundle-12 | 7 | 7 | 0 | 1 | pass |
| seis-topic-data-data-quality | retained-source-capability | seis-topic-bundle-12 | 7 | 7 | 0 | 1 | pass |
| seis-topic-data-data-science | retained-source-capability | seis-topic-bundle-12 | 7 | 7 | 0 | 1 | pass |
| seis-topic-data-databases | retained-source-capability | seis-topic-bundle-13 | 7 | 7 | 0 | 1 | pass |
| seis-topic-data-elt | retained-source-capability | seis-topic-bundle-13 | 7 | 7 | 0 | 1 | pass |
| seis-topic-data-etl | retained-source-capability | seis-topic-bundle-13 | 7 | 7 | 0 | 1 | pass |
| seis-topic-data-graph-databases | retained-source-capability | seis-topic-bundle-13 | 7 | 7 | 0 | 1 | pass |
| seis-topic-data-metadata | retained-source-capability | seis-topic-bundle-13 | 7 | 7 | 0 | 1 | pass |
| seis-topic-data-nosql | retained-source-capability | seis-topic-bundle-13 | 7 | 7 | 0 | 1 | pass |
| seis-topic-data-search-engine | retained-source-capability | seis-topic-bundle-13 | 7 | 7 | 0 | 1 | pass |
| seis-topic-data-sql | retained-source-capability | seis-topic-bundle-13 | 7 | 7 | 0 | 1 | pass |
| seis-topic-data-storage | retained-source-capability | seis-topic-bundle-13 | 7 | 7 | 0 | 1 | pass |
| seis-topic-data-vector-databases | retained-source-capability | seis-topic-bundle-13 | 7 | 7 | 0 | 1 | pass |
| seis-topic-design | retained-source-capability | seis-topic-bundle-14 | 7 | 7 | 0 | 1 | pass |
| seis-topic-design-3d-design | retained-source-capability | seis-topic-bundle-14 | 7 | 7 | 0 | 1 | pass |
| seis-topic-design-accessibility | retained-source-capability | seis-topic-bundle-14 | 7 | 7 | 0 | 1 | pass |
| seis-topic-design-branding | retained-source-capability | seis-topic-bundle-14 | 7 | 7 | 0 | 1 | pass |
| seis-topic-design-creative-coding | retained-source-capability | seis-topic-bundle-14 | 7 | 7 | 0 | 1 | pass |
| seis-topic-design-design-systems | retained-source-capability | seis-topic-bundle-14 | 7 | 7 | 0 | 1 | pass |
| seis-topic-design-design-tokens | retained-source-capability | seis-topic-bundle-14 | 7 | 7 | 0 | 1 | pass |
| seis-topic-design-editorial-design | retained-source-capability | seis-topic-bundle-14 | 7 | 7 | 0 | 1 | pass |
| seis-topic-design-graphic-design | retained-source-capability | seis-topic-bundle-14 | 7 | 7 | 0 | 1 | pass |
| seis-topic-design-illustration | retained-source-capability | seis-topic-bundle-14 | 7 | 7 | 0 | 1 | pass |
| seis-topic-design-interaction-design | retained-source-capability | seis-topic-bundle-14 | 7 | 7 | 0 | 1 | pass |
| seis-topic-design-localization | retained-source-capability | seis-topic-bundle-15 | 7 | 7 | 0 | 1 | pass |
| seis-topic-design-motion-design | retained-source-capability | seis-topic-bundle-15 | 7 | 7 | 0 | 1 | pass |
| seis-topic-design-photography | retained-source-capability | seis-topic-bundle-15 | 7 | 7 | 0 | 1 | pass |
| seis-topic-design-product-design | retained-source-capability | seis-topic-bundle-15 | 7 | 7 | 0 | 1 | pass |
| seis-topic-design-responsive-design | retained-source-capability | seis-topic-bundle-15 | 7 | 7 | 0 | 1 | pass |
| seis-topic-design-typography | retained-source-capability | seis-topic-bundle-15 | 7 | 7 | 0 | 1 | pass |
| seis-topic-design-ui-design | retained-source-capability | seis-topic-bundle-15 | 7 | 7 | 0 | 1 | pass |
| seis-topic-design-ux-design | retained-source-capability | seis-topic-bundle-15 | 7 | 7 | 0 | 1 | pass |
| seis-topic-design-visual-design | retained-source-capability | seis-topic-bundle-15 | 7 | 7 | 0 | 1 | pass |
| seis-topic-design-visual-identity | retained-source-capability | seis-topic-bundle-15 | 7 | 7 | 0 | 1 | pass |
| seis-topic-desktop | retained-source-capability | seis-topic-bundle-16 | 7 | 7 | 0 | 1 | pass |
| seis-topic-desktop-android | retained-source-capability | seis-topic-bundle-16 | 7 | 7 | 0 | 1 | pass |
| seis-topic-desktop-cross-platform | retained-source-capability | seis-topic-bundle-16 | 7 | 7 | 0 | 1 | pass |
| seis-topic-desktop-ios | retained-source-capability | seis-topic-bundle-16 | 7 | 7 | 0 | 1 | pass |
| seis-topic-desktop-ipados | retained-source-capability | seis-topic-bundle-16 | 7 | 7 | 0 | 1 | pass |
| seis-topic-desktop-linux | retained-source-capability | seis-topic-bundle-16 | 7 | 7 | 0 | 1 | pass |
| seis-topic-desktop-macos | retained-source-capability | seis-topic-bundle-16 | 7 | 7 | 0 | 1 | pass |
| seis-topic-desktop-visionos | retained-source-capability | seis-topic-bundle-16 | 7 | 7 | 0 | 1 | pass |
| seis-topic-desktop-watchos | retained-source-capability | seis-topic-bundle-16 | 7 | 7 | 0 | 1 | pass |
| seis-topic-desktop-web | retained-source-capability | seis-topic-bundle-16 | 7 | 7 | 0 | 1 | pass |
| seis-topic-desktop-windows | retained-source-capability | seis-topic-bundle-16 | 7 | 7 | 0 | 1 | pass |
| seis-topic-eleni-neferi | retained-source-capability | seis-topic-bundle-17 | 7 | 7 | 0 | 1 | pass |
| seis-topic-eleni-neferi-architecture | retained-source-capability | seis-topic-bundle-17 | 7 | 7 | 0 | 1 | pass |
| seis-topic-eleni-neferi-asset-universe | retained-source-capability | seis-topic-bundle-17 | 7 | 7 | 0 | 1 | pass |
| seis-topic-eleni-neferi-cinematic-experience | retained-source-capability | seis-topic-bundle-17 | 7 | 7 | 0 | 1 | pass |
| seis-topic-eleni-neferi-creative-studio | retained-source-capability | seis-topic-bundle-17 | 7 | 7 | 0 | 1 | pass |
| seis-topic-eleni-neferi-editorial | retained-source-capability | seis-topic-bundle-17 | 7 | 7 | 0 | 1 | pass |
| seis-topic-eleni-neferi-fashion | retained-source-capability | seis-topic-bundle-17 | 7 | 7 | 0 | 1 | pass |
| seis-topic-eleni-neferi-identity-bible | retained-source-capability | seis-topic-bundle-17 | 7 | 7 | 0 | 1 | pass |
| seis-topic-eleni-neferi-lifestyle | retained-source-capability | seis-topic-bundle-17 | 7 | 7 | 0 | 1 | pass |
| seis-topic-eleni-neferi-media-pipeline | retained-source-capability | seis-topic-bundle-17 | 7 | 7 | 0 | 1 | pass |
| seis-topic-eleni-neferi-moodboard-system | retained-source-capability | seis-topic-bundle-17 | 7 | 7 | 0 | 1 | pass |
| seis-topic-eleni-neferi-prompt-registry | retained-source-capability | seis-topic-bundle-17 | 7 | 7 | 0 | 1 | pass |
| seis-topic-eleni-neferi-story-universe | retained-source-capability | seis-topic-bundle-17 | 7 | 7 | 0 | 1 | pass |
| seis-topic-eleni-neferi-travel | retained-source-capability | seis-topic-bundle-17 | 7 | 7 | 0 | 1 | pass |
| seis-topic-eleni-neferi-visual-identity | retained-source-capability | seis-topic-bundle-17 | 7 | 7 | 0 | 1 | pass |
| seis-topic-graphics | retained-source-capability | seis-topic-bundle-18 | 7 | 7 | 0 | 1 | pass |
| seis-topic-graphics-color-theory | retained-source-capability | seis-topic-bundle-18 | 7 | 7 | 0 | 1 | pass |
| seis-topic-graphics-composition | retained-source-capability | seis-topic-bundle-18 | 7 | 7 | 0 | 1 | pass |
| seis-topic-graphics-game-engine | retained-source-capability | seis-topic-bundle-18 | 7 | 7 | 0 | 1 | pass |
| seis-topic-graphics-graphics-engine | retained-source-capability | seis-topic-bundle-18 | 7 | 7 | 0 | 1 | pass |
| seis-topic-graphics-iconography | retained-source-capability | seis-topic-bundle-18 | 7 | 7 | 0 | 1 | pass |
| seis-topic-graphics-layout | retained-source-capability | seis-topic-bundle-18 | 7 | 7 | 0 | 1 | pass |
| seis-topic-graphics-lighting | retained-source-capability | seis-topic-bundle-18 | 7 | 7 | 0 | 1 | pass |
| seis-topic-graphics-materials | retained-source-capability | seis-topic-bundle-18 | 7 | 7 | 0 | 1 | pass |
| seis-topic-graphics-path-tracing | retained-source-capability | seis-topic-bundle-18 | 7 | 7 | 0 | 1 | pass |
| seis-topic-graphics-ray-tracing | retained-source-capability | seis-topic-bundle-18 | 7 | 7 | 0 | 1 | pass |
| seis-topic-graphics-rendering | retained-source-capability | seis-topic-bundle-18 | 7 | 7 | 0 | 1 | pass |
| seis-topic-graphics-shaders | retained-source-capability | seis-topic-bundle-18 | 7 | 7 | 0 | 1 | pass |
| seis-topic-knowledge | retained-source-capability | seis-topic-bundle-19 | 7 | 7 | 0 | 1 | pass |
| seis-topic-knowledge-ar | retained-source-capability | seis-topic-bundle-19 | 7 | 7 | 0 | 1 | pass |
| seis-topic-knowledge-automation | retained-source-capability | seis-topic-bundle-19 | 7 | 7 | 0 | 1 | pass |
| seis-topic-knowledge-biology | retained-source-capability | seis-topic-bundle-19 | 7 | 7 | 0 | 1 | pass |
| seis-topic-knowledge-blockchain | retained-source-capability | seis-topic-bundle-19 | 7 | 7 | 0 | 1 | pass |
| seis-topic-knowledge-chemistry | retained-source-capability | seis-topic-bundle-19 | 7 | 7 | 0 | 1 | pass |
| seis-topic-knowledge-digital-twin | retained-source-capability | seis-topic-bundle-19 | 7 | 7 | 0 | 1 | pass |
| seis-topic-knowledge-documentation | retained-source-capability | seis-topic-bundle-19 | 7 | 7 | 0 | 1 | pass |
| seis-topic-knowledge-future-technologies | retained-source-capability | seis-topic-bundle-19 | 7 | 7 | 0 | 1 | pass |
| seis-topic-knowledge-genetics | retained-source-capability | seis-topic-bundle-19 | 7 | 7 | 0 | 1 | pass |
| seis-topic-knowledge-human-ai-collaboration | retained-source-capability | seis-topic-bundle-19 | 7 | 7 | 0 | 1 | pass |
| seis-topic-knowledge-innovation | retained-source-capability | seis-topic-bundle-19 | 7 | 7 | 0 | 1 | pass |
| seis-topic-knowledge-iot | retained-source-capability | seis-topic-bundle-19 | 7 | 7 | 0 | 1 | pass |
| seis-topic-knowledge-mathematics | retained-source-capability | seis-topic-bundle-20 | 7 | 7 | 0 | 1 | pass |
| seis-topic-knowledge-neuroscience | retained-source-capability | seis-topic-bundle-20 | 7 | 7 | 0 | 1 | pass |
| seis-topic-knowledge-physics | retained-source-capability | seis-topic-bundle-20 | 7 | 7 | 0 | 1 | pass |
| seis-topic-knowledge-quantum-computing | retained-source-capability | seis-topic-bundle-20 | 7 | 7 | 0 | 1 | pass |
| seis-topic-knowledge-research | retained-source-capability | seis-topic-bundle-20 | 7 | 7 | 0 | 1 | pass |
| seis-topic-knowledge-robotics | retained-source-capability | seis-topic-bundle-20 | 7 | 7 | 0 | 1 | pass |
| seis-topic-knowledge-science | retained-source-capability | seis-topic-bundle-20 | 7 | 7 | 0 | 1 | pass |
| seis-topic-knowledge-simulation | retained-source-capability | seis-topic-bundle-20 | 7 | 7 | 0 | 1 | pass |
| seis-topic-knowledge-spatial-computing | retained-source-capability | seis-topic-bundle-20 | 7 | 7 | 0 | 1 | pass |
| seis-topic-knowledge-sustainability | retained-source-capability | seis-topic-bundle-20 | 7 | 7 | 0 | 1 | pass |
| seis-topic-knowledge-vr | retained-source-capability | seis-topic-bundle-20 | 7 | 7 | 0 | 1 | pass |
| seis-topic-knowledge-xr | retained-source-capability | seis-topic-bundle-20 | 7 | 7 | 0 | 1 | pass |
| seis-topic-pantechnoepistemonoesis | retained-source-capability | seis-topic-bundle-21 | 7 | 7 | 0 | 1 | pass |
| seis-topic-pantechnoepistemonoesis-engineering-civilization | retained-source-capability | seis-topic-bundle-21 | 7 | 7 | 0 | 1 | pass |
| seis-topic-pantechnoepistemonoesis-knowledge-civilization | retained-source-capability | seis-topic-bundle-21 | 7 | 7 | 0 | 1 | pass |
| seis-topic-pantechnoepistemonoesis-research-lab | retained-source-capability | seis-topic-bundle-21 | 7 | 7 | 0 | 1 | pass |
| seis-topic-pantechnoepistemonoesis-scientific-computing | retained-source-capability | seis-topic-bundle-21 | 7 | 7 | 0 | 1 | pass |
| seis-topic-pantechnoepistemonoesis-technology-atlas | retained-source-capability | seis-topic-bundle-21 | 7 | 7 | 0 | 1 | pass |
| seis-topic-project-management | retained-source-capability | seis-topic-bundle-22 | 7 | 7 | 0 | 1 | pass |
| seis-topic-project-management-architecture-governance | retained-source-capability | seis-topic-bundle-22 | 7 | 7 | 0 | 1 | pass |
| seis-topic-project-management-audit | retained-source-capability | seis-topic-bundle-22 | 7 | 7 | 0 | 1 | pass |
| seis-topic-project-management-evidence | retained-source-capability | seis-topic-bundle-22 | 7 | 7 | 0 | 1 | pass |
| seis-topic-project-management-goal-tracking | retained-source-capability | seis-topic-bundle-22 | 7 | 7 | 0 | 1 | pass |
| seis-topic-project-management-milestones | retained-source-capability | seis-topic-bundle-22 | 7 | 7 | 0 | 1 | pass |
| seis-topic-project-management-ontology | retained-source-capability | seis-topic-bundle-22 | 7 | 7 | 0 | 1 | pass |
| seis-topic-project-management-permissions | retained-source-capability | seis-topic-bundle-22 | 7 | 7 | 0 | 1 | pass |
| seis-topic-project-management-policies | retained-source-capability | seis-topic-bundle-22 | 7 | 7 | 0 | 1 | pass |
| seis-topic-project-management-product-management | retained-source-capability | seis-topic-bundle-23 | 7 | 7 | 0 | 1 | pass |
| seis-topic-project-management-registries | retained-source-capability | seis-topic-bundle-23 | 7 | 7 | 0 | 1 | pass |
| seis-topic-project-management-repository-intelligence | retained-source-capability | seis-topic-bundle-23 | 7 | 7 | 0 | 1 | pass |
| seis-topic-project-management-repository-management | retained-source-capability | seis-topic-bundle-23 | 7 | 7 | 0 | 1 | pass |
| seis-topic-project-management-risk | retained-source-capability | seis-topic-bundle-23 | 7 | 7 | 0 | 1 | pass |
| seis-topic-project-management-roadmaps | retained-source-capability | seis-topic-bundle-23 | 7 | 7 | 0 | 1 | pass |
| seis-topic-project-management-taxonomy | retained-source-capability | seis-topic-bundle-23 | 7 | 7 | 0 | 1 | pass |
| seis-topic-project-management-validation | retained-source-capability | seis-topic-bundle-23 | 7 | 7 | 0 | 1 | pass |
| seis-topic-seis | retained-source-capability | seis-topic-bundle-24 | 7 | 7 | 0 | 1 | pass |
| seis-topic-seis-seis-9router | retained-source-capability | seis-topic-bundle-24 | 7 | 7 | 0 | 1 | pass |
| seis-topic-seis-seis-agent-runtime | retained-source-capability | seis-topic-bundle-24 | 7 | 7 | 0 | 1 | pass |
| seis-topic-seis-seis-ai-core | retained-source-capability | seis-topic-bundle-24 | 7 | 7 | 0 | 1 | pass |
| seis-topic-seis-seis-ai-desktop | retained-source-capability | seis-topic-bundle-24 | 7 | 7 | 0 | 1 | pass |
| seis-topic-seis-seis-brain | retained-source-capability | seis-topic-bundle-24 | 7 | 7 | 0 | 1 | pass |
| seis-topic-seis-seis-command-center | retained-source-capability | seis-topic-bundle-24 | 7 | 7 | 0 | 1 | pass |
| seis-topic-seis-seis-goal-tracking | retained-source-capability | seis-topic-bundle-24 | 7 | 7 | 0 | 1 | pass |
| seis-topic-seis-seis-intelligence-cube | retained-source-capability | seis-topic-bundle-24 | 7 | 7 | 0 | 1 | pass |
| seis-topic-seis-seis-knowledge-engine | retained-source-capability | seis-topic-bundle-24 | 7 | 7 | 0 | 1 | pass |
| seis-topic-seis-seis-repository-intelligence | retained-source-capability | seis-topic-bundle-24 | 7 | 7 | 0 | 1 | pass |
| seis-topic-seis-seis-technology-ontology | retained-source-capability | seis-topic-bundle-24 | 7 | 7 | 0 | 1 | pass |
| seis-topic-seis-seis-workflow-engine | retained-source-capability | seis-topic-bundle-24 | 7 | 7 | 0 | 1 | pass |
| seis-topic-software-engineering | retained-source-capability | seis-topic-bundle-25 | 7 | 7 | 0 | 1 | pass |
| seis-topic-software-engineering-algorithms | retained-source-capability | seis-topic-bundle-25 | 7 | 7 | 0 | 1 | pass |
| seis-topic-software-engineering-api | retained-source-capability | seis-topic-bundle-25 | 7 | 7 | 0 | 1 | pass |
| seis-topic-software-engineering-backend | retained-source-capability | seis-topic-bundle-25 | 7 | 7 | 0 | 1 | pass |
| seis-topic-software-engineering-build-systems | retained-source-capability | seis-topic-bundle-25 | 7 | 7 | 0 | 1 | pass |
| seis-topic-software-engineering-clean-architecture | retained-source-capability | seis-topic-bundle-25 | 7 | 7 | 0 | 1 | pass |
| seis-topic-software-engineering-cli | retained-source-capability | seis-topic-bundle-25 | 7 | 7 | 0 | 1 | pass |
| seis-topic-software-engineering-compilers | retained-source-capability | seis-topic-bundle-25 | 7 | 7 | 0 | 1 | pass |
| seis-topic-software-engineering-data-structures | retained-source-capability | seis-topic-bundle-25 | 7 | 7 | 0 | 1 | pass |
| seis-topic-software-engineering-debugging | retained-source-capability | seis-topic-bundle-25 | 7 | 7 | 0 | 1 | pass |
| seis-topic-software-engineering-desktop-development | retained-source-capability | seis-topic-bundle-25 | 7 | 7 | 0 | 1 | pass |
| seis-topic-software-engineering-distributed-systems | retained-source-capability | seis-topic-bundle-25 | 7 | 7 | 0 | 1 | pass |
| seis-topic-software-engineering-domain-driven-design | retained-source-capability | seis-topic-bundle-25 | 7 | 7 | 0 | 1 | pass |
| seis-topic-software-engineering-embedded-systems | retained-source-capability | seis-topic-bundle-25 | 7 | 7 | 0 | 1 | pass |
| seis-topic-software-engineering-frameworks | retained-source-capability | seis-topic-bundle-25 | 7 | 7 | 0 | 1 | pass |
| seis-topic-software-engineering-frontend | retained-source-capability | seis-topic-bundle-26 | 7 | 7 | 0 | 1 | pass |
| seis-topic-software-engineering-full-stack | retained-source-capability | seis-topic-bundle-26 | 7 | 7 | 0 | 1 | pass |
| seis-topic-software-engineering-game-development | retained-source-capability | seis-topic-bundle-26 | 7 | 7 | 0 | 1 | pass |
| seis-topic-software-engineering-git | retained-source-capability | seis-topic-bundle-26 | 7 | 7 | 0 | 1 | pass |
| seis-topic-software-engineering-github | retained-source-capability | seis-topic-bundle-26 | 7 | 7 | 0 | 1 | pass |
| seis-topic-software-engineering-gui | retained-source-capability | seis-topic-bundle-26 | 7 | 7 | 0 | 1 | pass |
| seis-topic-software-engineering-hexagonal-architecture | retained-source-capability | seis-topic-bundle-26 | 7 | 7 | 0 | 1 | pass |
| seis-topic-software-engineering-interpreters | retained-source-capability | seis-topic-bundle-26 | 7 | 7 | 0 | 1 | pass |
| seis-topic-software-engineering-libraries | retained-source-capability | seis-topic-bundle-26 | 7 | 7 | 0 | 1 | pass |
| seis-topic-software-engineering-microservices | retained-source-capability | seis-topic-bundle-26 | 7 | 7 | 0 | 1 | pass |
| seis-topic-software-engineering-migration | retained-source-capability | seis-topic-bundle-26 | 7 | 7 | 0 | 1 | pass |
| seis-topic-software-engineering-mobile-development | retained-source-capability | seis-topic-bundle-26 | 7 | 7 | 0 | 1 | pass |
| seis-topic-software-engineering-modular-monolith | retained-source-capability | seis-topic-bundle-26 | 7 | 7 | 0 | 1 | pass |
| seis-topic-software-engineering-operating-systems | retained-source-capability | seis-topic-bundle-26 | 7 | 7 | 0 | 1 | pass |
| seis-topic-software-engineering-optimization | retained-source-capability | seis-topic-bundle-26 | 7 | 7 | 0 | 1 | pass |
| seis-topic-software-engineering-package-managers | retained-source-capability | seis-topic-bundle-27 | 7 | 7 | 0 | 1 | pass |
| seis-topic-software-engineering-profiling | retained-source-capability | seis-topic-bundle-27 | 7 | 7 | 0 | 1 | pass |
| seis-topic-software-engineering-programming | retained-source-capability | seis-topic-bundle-27 | 7 | 7 | 0 | 1 | pass |
| seis-topic-software-engineering-programming-languages | retained-source-capability | seis-topic-bundle-27 | 7 | 7 | 0 | 1 | pass |
| seis-topic-software-engineering-quality-assurance | retained-source-capability | seis-topic-bundle-27 | 7 | 7 | 0 | 1 | pass |
| seis-topic-software-engineering-release-engineering | retained-source-capability | seis-topic-bundle-27 | 7 | 7 | 0 | 1 | pass |
| seis-topic-software-engineering-repository | retained-source-capability | seis-topic-bundle-27 | 7 | 7 | 0 | 1 | pass |
| seis-topic-software-engineering-rollback | retained-source-capability | seis-topic-bundle-27 | 7 | 7 | 0 | 1 | pass |
| seis-topic-software-engineering-sdk | retained-source-capability | seis-topic-bundle-27 | 7 | 7 | 0 | 1 | pass |
| seis-topic-software-engineering-software-architecture | retained-source-capability | seis-topic-bundle-27 | 7 | 7 | 0 | 1 | pass |
| seis-topic-software-engineering-testing | retained-source-capability | seis-topic-bundle-27 | 7 | 7 | 0 | 1 | pass |
| seis-topic-software-engineering-tui | retained-source-capability | seis-topic-bundle-27 | 7 | 7 | 0 | 1 | pass |
| seis-topic-software-engineering-version-control | retained-source-capability | seis-topic-bundle-27 | 7 | 7 | 0 | 1 | pass |
| seis-topic-software-engineering-web-development | retained-source-capability | seis-topic-bundle-27 | 7 | 7 | 0 | 1 | pass |

## Excluded Source Metadata

| path | reason |
| --- | --- |
| none | none |

## Disallowed Source Artifacts

| path | reason |
| --- | --- |
| none | none |

## Single Public Install

- Suite file: plugins/seis-ai-agent/assets/unified-suite.json
- Suite status: active-single-public-plugin
- Release version: 0.3.0+codex.20260712
- Canonical install: seis-ai-agent@seis-repo
- Default install mode: single-public-plugin
- Components: 10
- Public plugin count: 1
- Embedded module count: 10

## Independent Clean-Runner Evidence Still Required

Repo-local staging validates artifact structure only. It is not an independent
installation or public release proof.

- Evidence intake contract: `content/development/seis-public-plugin-independent-runner-evidence-contract.json`
- Evidence record: `content/development/seis-public-plugin-independent-runner-evidence.json`
- Evidence status: pending-independent-clean-runner-or-public-install
- Evidence recorded: no
- Evidence valid: no



- A clean runner or machine that cannot read the original working tree or existing Codex plugin cache.
- The public SEIS marketplace source or published package revision used for the install, including its immutable revision identifier.
- Installation evidence for seis-ai-agent@seis-repo plus any explicitly selected optional bundle cards from the seis-repo marketplace, including the embedded module inventory.
- MCP initialization, tools/list, and representative tool-call evidence from the independent runner.
- A newly opened Codex task after the independent installation, with the SEIS AI public-plugin-family bridge visible.
- Sanitized runner metadata: operating system, Node major version, Codex version, and command exit summaries only.

## Current Blockers

- Independent clean-runner or public package installation proof has not been recorded.
- Human approval for public preview, release, publish, push, merge, tag, deploy, live SSH, or provider credentials has not been recorded.

## Quality Gates

```bash
npm run check:seis-public-plugin-external-install-proof
npm run check:seis-public-plugin-independent-runner-evidence-contract
npm run check:seis-public-plugin-independent-runner-evidence
npm run check:seis-public-plugin-independent-runner-evidence:recorded
npm run check:seis-unified-plugin-suite
npm run check:seis-public-plugin-security-provenance-review
npm run check:seis-public-plugin-install-smoke:local:mcp
npm run check:seis-agent-plugin-integration
```

## Decision

NO-GO for public preview. The artifact stage is local evidence only; an
independent clean runner or public installation and human approval remain
required.
