# SEIS Public Plugin Security Provenance Review

- Generated: 2026-07-12
- Status: repo-local-security-provenance-reviewed
- Decision: not-ready-for-public-preview
- Public release allowed: no
- Secret findings: 0
- Blocking findings: 0
- Hygiene findings: 0
- Current marketplace cards: 34
- Optional bundle cards: 33 (6 application + 27 topic)
- Retained source capabilities: 380 (5 root + 75 application + 300 topic)
- Exact-once bundled sources: 375
- Historical pre-consolidation snapshot: 381 cards (not current)

## Canonical Marketplace Card Review

| plugin | install id | review | license | MCP servers | secrets | hygiene |
| --- | --- | --- | --- | --- | --- | --- |
| seis-ai-agent | seis-ai-agent@seis-repo | pass | MIT | 1 | 0 | 0 |

## Optional Bundle Marketplace Card Review

| card | install id | family | members | review | license | MCP servers | secrets |
| --- | --- | --- | --- | --- | --- | --- | --- |
| seis-application-bundle-01 | seis-application-bundle-01@seis-repo | application | 14 | pass | MIT | 1 | 0 |
| seis-application-bundle-02 | seis-application-bundle-02@seis-repo | application | 9 | pass | MIT | 1 | 0 |
| seis-application-bundle-03 | seis-application-bundle-03@seis-repo | application | 11 | pass | MIT | 1 | 0 |
| seis-application-bundle-04 | seis-application-bundle-04@seis-repo | application | 14 | pass | MIT | 1 | 0 |
| seis-application-bundle-05 | seis-application-bundle-05@seis-repo | application | 14 | pass | MIT | 1 | 0 |
| seis-application-bundle-06 | seis-application-bundle-06@seis-repo | application | 13 | pass | MIT | 1 | 0 |
| seis-topic-bundle-01 | seis-topic-bundle-01@seis-repo | topic | 12 | pass | MIT | 1 | 0 |
| seis-topic-bundle-02 | seis-topic-bundle-02@seis-repo | topic | 12 | pass | MIT | 1 | 0 |
| seis-topic-bundle-03 | seis-topic-bundle-03@seis-repo | topic | 11 | pass | MIT | 1 | 0 |
| seis-topic-bundle-04 | seis-topic-bundle-04@seis-repo | topic | 9 | pass | MIT | 1 | 0 |
| seis-topic-bundle-05 | seis-topic-bundle-05@seis-repo | topic | 8 | pass | MIT | 1 | 0 |
| seis-topic-bundle-06 | seis-topic-bundle-06@seis-repo | topic | 13 | pass | MIT | 1 | 0 |
| seis-topic-bundle-07 | seis-topic-bundle-07@seis-repo | topic | 12 | pass | MIT | 1 | 0 |
| seis-topic-bundle-08 | seis-topic-bundle-08@seis-repo | topic | 9 | pass | MIT | 1 | 0 |
| seis-topic-bundle-09 | seis-topic-bundle-09@seis-repo | topic | 8 | pass | MIT | 1 | 0 |
| seis-topic-bundle-10 | seis-topic-bundle-10@seis-repo | topic | 11 | pass | MIT | 1 | 0 |
| seis-topic-bundle-11 | seis-topic-bundle-11@seis-repo | topic | 10 | pass | MIT | 1 | 0 |
| seis-topic-bundle-12 | seis-topic-bundle-12@seis-repo | topic | 10 | pass | MIT | 1 | 0 |
| seis-topic-bundle-13 | seis-topic-bundle-13@seis-repo | topic | 10 | pass | MIT | 1 | 0 |
| seis-topic-bundle-14 | seis-topic-bundle-14@seis-repo | topic | 11 | pass | MIT | 1 | 0 |
| seis-topic-bundle-15 | seis-topic-bundle-15@seis-repo | topic | 10 | pass | MIT | 1 | 0 |
| seis-topic-bundle-16 | seis-topic-bundle-16@seis-repo | topic | 11 | pass | MIT | 1 | 0 |
| seis-topic-bundle-17 | seis-topic-bundle-17@seis-repo | topic | 15 | pass | MIT | 1 | 0 |
| seis-topic-bundle-18 | seis-topic-bundle-18@seis-repo | topic | 13 | pass | MIT | 1 | 0 |
| seis-topic-bundle-19 | seis-topic-bundle-19@seis-repo | topic | 13 | pass | MIT | 1 | 0 |
| seis-topic-bundle-20 | seis-topic-bundle-20@seis-repo | topic | 12 | pass | MIT | 1 | 0 |
| seis-topic-bundle-21 | seis-topic-bundle-21@seis-repo | topic | 6 | pass | MIT | 1 | 0 |
| seis-topic-bundle-22 | seis-topic-bundle-22@seis-repo | topic | 9 | pass | MIT | 1 | 0 |
| seis-topic-bundle-23 | seis-topic-bundle-23@seis-repo | topic | 8 | pass | MIT | 1 | 0 |
| seis-topic-bundle-24 | seis-topic-bundle-24@seis-repo | topic | 13 | pass | MIT | 1 | 0 |
| seis-topic-bundle-25 | seis-topic-bundle-25@seis-repo | topic | 15 | pass | MIT | 1 | 0 |
| seis-topic-bundle-26 | seis-topic-bundle-26@seis-repo | topic | 15 | pass | MIT | 1 | 0 |
| seis-topic-bundle-27 | seis-topic-bundle-27@seis-repo | topic | 14 | pass | MIT | 1 | 0 |

## Retained Root Source Review

| source identity | source path | marketplace card | bundle | review | license | MCP servers | secrets |
| --- | --- | --- | --- | --- | --- | --- | --- |
| seis | ./plugins/seis | no | none | pass | MIT | 1 | 0 |
| seis-cloud | ./plugins/seis-cloud | no | none | pass | MIT | 1 | 0 |
| seis-code | ./plugins/seis-code | no | none | pass | MIT | 1 | 0 |
| seis-design | ./plugins/seis-design | no | none | pass | MIT | 1 | 0 |
| seis-data | ./plugins/seis-data | no | none | pass | MIT | 1 | 0 |

## Retained Application Source Review

| source identity | source path | marketplace card | bundle | review | license | MCP servers | secrets |
| --- | --- | --- | --- | --- | --- | --- | --- |
| seis-a11y-regression | ./plugins/seis-core/seis-a11y-regression | no | seis-application-bundle-02 | pass | MIT | 1 | 0 |
| seis-action-pin-audit | ./plugins/seis-core/seis-action-pin-audit | no | seis-application-bundle-03 | pass | MIT | 1 | 0 |
| seis-agent-audit | ./plugins/seis-core/seis-agent-audit | no | seis-application-bundle-01 | pass | MIT | 1 | 0 |
| seis-agent-contract-validator | ./plugins/seis-core/seis-agent-contract-validator | no | seis-application-bundle-01 | pass | MIT | 1 | 0 |
| seis-apple-native-readiness | ./plugins/seis-core/seis-apple-native-readiness | no | seis-application-bundle-04 | pass | MIT | 1 | 0 |
| seis-approval-gate-review | ./plugins/seis-core/seis-approval-gate-review | no | seis-application-bundle-04 | pass | MIT | 1 | 0 |
| seis-architecture-drift | ./plugins/seis-core/seis-architecture-drift | no | seis-application-bundle-04 | pass | MIT | 1 | 0 |
| seis-artifact-attestation | ./plugins/seis-core/seis-artifact-attestation | no | seis-application-bundle-03 | pass | MIT | 1 | 0 |
| seis-branch-protection-audit | ./plugins/seis-core/seis-branch-protection-audit | no | seis-application-bundle-03 | pass | MIT | 1 | 0 |
| seis-canonical-registry-validator | ./plugins/seis-core/seis-canonical-registry-validator | no | seis-application-bundle-04 | pass | MIT | 1 | 0 |
| seis-changelog-validator | ./plugins/seis-core/seis-changelog-validator | no | seis-application-bundle-04 | pass | MIT | 1 | 0 |
| seis-codeowners-audit | ./plugins/seis-core/seis-codeowners-audit | no | seis-application-bundle-04 | pass | MIT | 1 | 0 |
| seis-community-health | ./plugins/seis-core/seis-community-health | no | seis-application-bundle-04 | pass | MIT | 1 | 0 |
| seis-context-efficiency | ./plugins/seis-core/seis-context-efficiency | no | seis-application-bundle-01 | pass | MIT | 1 | 0 |
| seis-contract-compatibility | ./plugins/seis-core/seis-contract-compatibility | no | seis-application-bundle-04 | pass | MIT | 1 | 0 |
| seis-contributor-map | ./plugins/seis-core/seis-contributor-map | no | seis-application-bundle-04 | pass | MIT | 1 | 0 |
| seis-cost-latency-budget | ./plugins/seis-core/seis-cost-latency-budget | no | seis-application-bundle-04 | pass | MIT | 1 | 0 |
| seis-data-retention-audit | ./plugins/seis-core/seis-data-retention-audit | no | seis-application-bundle-04 | pass | MIT | 1 | 0 |
| seis-dependency-freshness | ./plugins/seis-core/seis-dependency-freshness | no | seis-application-bundle-03 | pass | MIT | 1 | 0 |
| seis-design-token-audit | ./plugins/seis-core/seis-design-token-audit | no | seis-application-bundle-02 | pass | MIT | 1 | 0 |
| seis-doc-indexer | ./plugins/seis-core/seis-doc-indexer | no | seis-application-bundle-01 | pass | MIT | 1 | 0 |
| seis-docs-freshness | ./plugins/seis-core/seis-docs-freshness | no | seis-application-bundle-01 | pass | MIT | 1 | 0 |
| seis-dora-metrics | ./plugins/seis-core/seis-dora-metrics | no | seis-application-bundle-02 | pass | MIT | 1 | 0 |
| seis-download-anomaly | ./plugins/seis-core/seis-download-anomaly | no | seis-application-bundle-01 | pass | MIT | 1 | 0 |
| seis-evidence-index | ./plugins/seis-core/seis-evidence-index | no | seis-application-bundle-04 | pass | MIT | 1 | 0 |
| seis-focus-navigation-audit | ./plugins/seis-core/seis-focus-navigation-audit | no | seis-application-bundle-02 | pass | MIT | 1 | 0 |
| seis-github-metrics-collector | ./plugins/seis-core/seis-github-metrics-collector | no | seis-application-bundle-04 | pass | MIT | 1 | 0 |
| seis-goal-dependency-map | ./plugins/seis-core/seis-goal-dependency-map | no | seis-application-bundle-04 | pass | MIT | 1 | 0 |
| seis-goal-integrity | ./plugins/seis-core/seis-goal-integrity | no | seis-application-bundle-02 | pass | MIT | 1 | 0 |
| seis-issue-triage | ./plugins/seis-core/seis-issue-triage | no | seis-application-bundle-05 | pass | MIT | 1 | 0 |
| seis-license-compatibility | ./plugins/seis-core/seis-license-compatibility | no | seis-application-bundle-03 | pass | MIT | 1 | 0 |
| seis-localization-coverage | ./plugins/seis-core/seis-localization-coverage | no | seis-application-bundle-01 | pass | MIT | 1 | 0 |
| seis-maintainer-risk | ./plugins/seis-core/seis-maintainer-risk | no | seis-application-bundle-02 | pass | MIT | 1 | 0 |
| seis-marketplace-integrity | ./plugins/seis-core/seis-marketplace-integrity | no | seis-application-bundle-05 | pass | MIT | 1 | 0 |
| seis-mcp-inventory | ./plugins/seis-core/seis-mcp-inventory | no | seis-application-bundle-01 | pass | MIT | 1 | 0 |
| seis-mcp-permission | ./plugins/seis-core/seis-mcp-permission | no | seis-application-bundle-03 | pass | MIT | 1 | 0 |
| seis-migration-guide-check | ./plugins/seis-core/seis-migration-guide-check | no | seis-application-bundle-05 | pass | MIT | 1 | 0 |
| seis-model-fallback | ./plugins/seis-core/seis-model-fallback | no | seis-application-bundle-01 | pass | MIT | 1 | 0 |
| seis-offline-mode-check | ./plugins/seis-core/seis-offline-mode-check | no | seis-application-bundle-05 | pass | MIT | 1 | 0 |
| seis-package-adoption | ./plugins/seis-core/seis-package-adoption | no | seis-application-bundle-01 | pass | MIT | 1 | 0 |
| seis-performance-budget | ./plugins/seis-core/seis-performance-budget | no | seis-application-bundle-05 | pass | MIT | 1 | 0 |
| seis-plugin-capability-coverage | ./plugins/seis-core/seis-plugin-capability-coverage | no | seis-application-bundle-05 | pass | MIT | 1 | 0 |
| seis-plugin-discovery | ./plugins/seis-core/seis-plugin-discovery | no | seis-application-bundle-05 | pass | MIT | 1 | 0 |
| seis-plugin-migration | ./plugins/seis-core/seis-plugin-migration | no | seis-application-bundle-05 | pass | MIT | 1 | 0 |
| seis-pr-cycle-time | ./plugins/seis-core/seis-pr-cycle-time | no | seis-application-bundle-05 | pass | MIT | 1 | 0 |
| seis-project-manifest-audit | ./plugins/seis-core/seis-project-manifest-audit | no | seis-application-bundle-02 | pass | MIT | 1 | 0 |
| seis-prompt-injection-audit | ./plugins/seis-core/seis-prompt-injection-audit | no | seis-application-bundle-05 | pass | MIT | 1 | 0 |
| seis-provider-health | ./plugins/seis-core/seis-provider-health | no | seis-application-bundle-01 | pass | MIT | 1 | 0 |
| seis-public-distribution-audit | ./plugins/seis-core/seis-public-distribution-audit | no | seis-application-bundle-05 | pass | MIT | 1 | 0 |
| seis-public-install-evidence | ./plugins/seis-core/seis-public-install-evidence | no | seis-application-bundle-05 | pass | MIT | 1 | 0 |
| seis-public-install-state | ./plugins/seis-core/seis-public-install-state | no | seis-application-bundle-05 | pass | MIT | 1 | 0 |
| seis-public-runtime-status | ./plugins/seis-core/seis-public-runtime-status | no | seis-application-bundle-05 | pass | MIT | 1 | 0 |
| seis-public-safe-scan | ./plugins/seis-core/seis-public-safe-scan | no | seis-application-bundle-03 | pass | MIT | 1 | 0 |
| seis-rag-citation-coverage | ./plugins/seis-core/seis-rag-citation-coverage | no | seis-application-bundle-01 | pass | MIT | 1 | 0 |
| seis-release-cadence | ./plugins/seis-core/seis-release-cadence | no | seis-application-bundle-06 | pass | MIT | 1 | 0 |
| seis-release-readiness | ./plugins/seis-core/seis-release-readiness | no | seis-application-bundle-06 | pass | MIT | 1 | 0 |
| seis-repository-health | ./plugins/seis-core/seis-repository-health | no | seis-application-bundle-06 | pass | MIT | 1 | 0 |
| seis-repository-scorecard | ./plugins/seis-core/seis-repository-scorecard | no | seis-application-bundle-06 | pass | MIT | 1 | 0 |
| seis-rollback-readiness | ./plugins/seis-core/seis-rollback-readiness | no | seis-application-bundle-06 | pass | MIT | 1 | 0 |
| seis-route-explainer | ./plugins/seis-core/seis-route-explainer | no | seis-application-bundle-01 | pass | MIT | 1 | 0 |
| seis-sbom-generator | ./plugins/seis-core/seis-sbom-generator | no | seis-application-bundle-03 | pass | MIT | 1 | 0 |
| seis-secret-boundary-scan | ./plugins/seis-core/seis-secret-boundary-scan | no | seis-application-bundle-03 | pass | MIT | 1 | 0 |
| seis-semver-audit | ./plugins/seis-core/seis-semver-audit | no | seis-application-bundle-06 | pass | MIT | 1 | 0 |
| seis-source-provenance | ./plugins/seis-core/seis-source-provenance | no | seis-application-bundle-02 | pass | MIT | 1 | 0 |
| seis-swift-concurrency-audit | ./plugins/seis-core/seis-swift-concurrency-audit | no | seis-application-bundle-06 | pass | MIT | 1 | 0 |
| seis-swift-package-topology | ./plugins/seis-core/seis-swift-package-topology | no | seis-application-bundle-06 | pass | MIT | 1 | 0 |
| seis-technology-ontology | ./plugins/seis-core/seis-technology-ontology | no | seis-application-bundle-01 | pass | MIT | 1 | 0 |
| seis-test-flakiness | ./plugins/seis-core/seis-test-flakiness | no | seis-application-bundle-06 | pass | MIT | 1 | 0 |
| seis-tool-permission-audit | ./plugins/seis-core/seis-tool-permission-audit | no | seis-application-bundle-06 | pass | MIT | 1 | 0 |
| seis-trusted-marketplace | ./plugins/seis-core/seis-trusted-marketplace | no | seis-application-bundle-06 | pass | MIT | 1 | 0 |
| seis-ui-state-contract-audit | ./plugins/seis-core/seis-ui-state-contract-audit | no | seis-application-bundle-02 | pass | MIT | 1 | 0 |
| seis-vulnerability-triage | ./plugins/seis-core/seis-vulnerability-triage | no | seis-application-bundle-03 | pass | MIT | 1 | 0 |
| seis-workflow-linter | ./plugins/seis-core/seis-workflow-linter | no | seis-application-bundle-06 | pass | MIT | 1 | 0 |
| seis-workflow-permission-audit | ./plugins/seis-core/seis-workflow-permission-audit | no | seis-application-bundle-03 | pass | MIT | 1 | 0 |
| seis-workspace-inspector | ./plugins/seis-core/seis-workspace-inspector | no | seis-application-bundle-06 | pass | MIT | 1 | 0 |

## Embedded Source Module Review

| module | canonical install | review | license | secrets |
| --- | --- | --- | --- | --- |
| seis-ai-agent | seis-ai-agent@seis-repo | pass | MIT | 0 |
| seis | seis-ai-agent@seis-repo | pass | MIT | 0 |
| seis-cloud | seis-ai-agent@seis-repo | pass | MIT | 0 |
| seis-code | seis-ai-agent@seis-repo | pass | MIT | 0 |
| seis-design | seis-ai-agent@seis-repo | pass | MIT | 0 |
| seis-data | seis-ai-agent@seis-repo | pass | MIT | 0 |
| seis-security | seis-ai-agent@seis-repo | pass | MIT | 0 |
| seis-research | seis-ai-agent@seis-repo | pass | MIT | 0 |
| seis-automation | seis-ai-agent@seis-repo | pass | MIT | 0 |
| seis-product | seis-ai-agent@seis-repo | pass | MIT | 0 |

## Retained Objective-Derived Topic Source Review

| source identity | source path | marketplace card | bundle | review | license | MCP servers | secrets |
| --- | --- | --- | --- | --- | --- | --- | --- |
| seis-topic-artificial-intelligence | ./plugins/seis-topics/seis-topic-artificial-intelligence | no | seis-topic-bundle-01 | pass | MIT | 1 | 0 |
| seis-topic-artificial-intelligence-agent-runtime | ./plugins/seis-topics/seis-topic-artificial-intelligence-agent-runtime | no | seis-topic-bundle-01 | pass | MIT | 1 | 0 |
| seis-topic-artificial-intelligence-agent-swarms | ./plugins/seis-topics/seis-topic-artificial-intelligence-agent-swarms | no | seis-topic-bundle-01 | pass | MIT | 1 | 0 |
| seis-topic-artificial-intelligence-ai-agents | ./plugins/seis-topics/seis-topic-artificial-intelligence-ai-agents | no | seis-topic-bundle-01 | pass | MIT | 1 | 0 |
| seis-topic-artificial-intelligence-ai-alignment | ./plugins/seis-topics/seis-topic-artificial-intelligence-ai-alignment | no | seis-topic-bundle-01 | pass | MIT | 1 | 0 |
| seis-topic-artificial-intelligence-ai-core | ./plugins/seis-topics/seis-topic-artificial-intelligence-ai-core | no | seis-topic-bundle-01 | pass | MIT | 1 | 0 |
| seis-topic-artificial-intelligence-ai-evaluation | ./plugins/seis-topics/seis-topic-artificial-intelligence-ai-evaluation | no | seis-topic-bundle-01 | pass | MIT | 1 | 0 |
| seis-topic-artificial-intelligence-ai-safety | ./plugins/seis-topics/seis-topic-artificial-intelligence-ai-safety | no | seis-topic-bundle-01 | pass | MIT | 1 | 0 |
| seis-topic-artificial-intelligence-audio-ai | ./plugins/seis-topics/seis-topic-artificial-intelligence-audio-ai | no | seis-topic-bundle-01 | pass | MIT | 1 | 0 |
| seis-topic-artificial-intelligence-computer-vision | ./plugins/seis-topics/seis-topic-artificial-intelligence-computer-vision | no | seis-topic-bundle-01 | pass | MIT | 1 | 0 |
| seis-topic-artificial-intelligence-context-engineering | ./plugins/seis-topics/seis-topic-artificial-intelligence-context-engineering | no | seis-topic-bundle-01 | pass | MIT | 1 | 0 |
| seis-topic-artificial-intelligence-deep-learning | ./plugins/seis-topics/seis-topic-artificial-intelligence-deep-learning | no | seis-topic-bundle-01 | pass | MIT | 1 | 0 |
| seis-topic-artificial-intelligence-embeddings | ./plugins/seis-topics/seis-topic-artificial-intelligence-embeddings | no | seis-topic-bundle-02 | pass | MIT | 1 | 0 |
| seis-topic-artificial-intelligence-generative-ai | ./plugins/seis-topics/seis-topic-artificial-intelligence-generative-ai | no | seis-topic-bundle-02 | pass | MIT | 1 | 0 |
| seis-topic-artificial-intelligence-graphrag | ./plugins/seis-topics/seis-topic-artificial-intelligence-graphrag | no | seis-topic-bundle-02 | pass | MIT | 1 | 0 |
| seis-topic-artificial-intelligence-knowledge-graph | ./plugins/seis-topics/seis-topic-artificial-intelligence-knowledge-graph | no | seis-topic-bundle-02 | pass | MIT | 1 | 0 |
| seis-topic-artificial-intelligence-knowledge-systems | ./plugins/seis-topics/seis-topic-artificial-intelligence-knowledge-systems | no | seis-topic-bundle-02 | pass | MIT | 1 | 0 |
| seis-topic-artificial-intelligence-large-language-models | ./plugins/seis-topics/seis-topic-artificial-intelligence-large-language-models | no | seis-topic-bundle-02 | pass | MIT | 1 | 0 |
| seis-topic-artificial-intelligence-machine-learning | ./plugins/seis-topics/seis-topic-artificial-intelligence-machine-learning | no | seis-topic-bundle-02 | pass | MIT | 1 | 0 |
| seis-topic-artificial-intelligence-memory-systems | ./plugins/seis-topics/seis-topic-artificial-intelligence-memory-systems | no | seis-topic-bundle-02 | pass | MIT | 1 | 0 |
| seis-topic-artificial-intelligence-model-routing | ./plugins/seis-topics/seis-topic-artificial-intelligence-model-routing | no | seis-topic-bundle-02 | pass | MIT | 1 | 0 |
| seis-topic-artificial-intelligence-multimodal-ai | ./plugins/seis-topics/seis-topic-artificial-intelligence-multimodal-ai | no | seis-topic-bundle-02 | pass | MIT | 1 | 0 |
| seis-topic-artificial-intelligence-natural-language-processing | ./plugins/seis-topics/seis-topic-artificial-intelligence-natural-language-processing | no | seis-topic-bundle-02 | pass | MIT | 1 | 0 |
| seis-topic-artificial-intelligence-neural-networks | ./plugins/seis-topics/seis-topic-artificial-intelligence-neural-networks | no | seis-topic-bundle-02 | pass | MIT | 1 | 0 |
| seis-topic-artificial-intelligence-prompt-engineering | ./plugins/seis-topics/seis-topic-artificial-intelligence-prompt-engineering | no | seis-topic-bundle-03 | pass | MIT | 1 | 0 |
| seis-topic-artificial-intelligence-provider-routing | ./plugins/seis-topics/seis-topic-artificial-intelligence-provider-routing | no | seis-topic-bundle-03 | pass | MIT | 1 | 0 |
| seis-topic-artificial-intelligence-rag | ./plugins/seis-topics/seis-topic-artificial-intelligence-rag | no | seis-topic-bundle-03 | pass | MIT | 1 | 0 |
| seis-topic-artificial-intelligence-reasoning-models | ./plugins/seis-topics/seis-topic-artificial-intelligence-reasoning-models | no | seis-topic-bundle-03 | pass | MIT | 1 | 0 |
| seis-topic-artificial-intelligence-responsible-ai | ./plugins/seis-topics/seis-topic-artificial-intelligence-responsible-ai | no | seis-topic-bundle-03 | pass | MIT | 1 | 0 |
| seis-topic-artificial-intelligence-retrieval | ./plugins/seis-topics/seis-topic-artificial-intelligence-retrieval | no | seis-topic-bundle-03 | pass | MIT | 1 | 0 |
| seis-topic-artificial-intelligence-semantic-search | ./plugins/seis-topics/seis-topic-artificial-intelligence-semantic-search | no | seis-topic-bundle-03 | pass | MIT | 1 | 0 |
| seis-topic-artificial-intelligence-small-language-models | ./plugins/seis-topics/seis-topic-artificial-intelligence-small-language-models | no | seis-topic-bundle-03 | pass | MIT | 1 | 0 |
| seis-topic-artificial-intelligence-speech-ai | ./plugins/seis-topics/seis-topic-artificial-intelligence-speech-ai | no | seis-topic-bundle-03 | pass | MIT | 1 | 0 |
| seis-topic-artificial-intelligence-vector-search | ./plugins/seis-topics/seis-topic-artificial-intelligence-vector-search | no | seis-topic-bundle-03 | pass | MIT | 1 | 0 |
| seis-topic-artificial-intelligence-world-models | ./plugins/seis-topics/seis-topic-artificial-intelligence-world-models | no | seis-topic-bundle-03 | pass | MIT | 1 | 0 |
| seis-topic-automation | ./plugins/seis-topics/seis-topic-automation | no | seis-topic-bundle-04 | pass | MIT | 1 | 0 |
| seis-topic-automation-command-center | ./plugins/seis-topics/seis-topic-automation-command-center | no | seis-topic-bundle-04 | pass | MIT | 1 | 0 |
| seis-topic-automation-connectors | ./plugins/seis-topics/seis-topic-automation-connectors | no | seis-topic-bundle-04 | pass | MIT | 1 | 0 |
| seis-topic-automation-integrations | ./plugins/seis-topics/seis-topic-automation-integrations | no | seis-topic-bundle-04 | pass | MIT | 1 | 0 |
| seis-topic-automation-mcp | ./plugins/seis-topics/seis-topic-automation-mcp | no | seis-topic-bundle-04 | pass | MIT | 1 | 0 |
| seis-topic-automation-orchestration | ./plugins/seis-topics/seis-topic-automation-orchestration | no | seis-topic-bundle-04 | pass | MIT | 1 | 0 |
| seis-topic-automation-pipelines | ./plugins/seis-topics/seis-topic-automation-pipelines | no | seis-topic-bundle-04 | pass | MIT | 1 | 0 |
| seis-topic-automation-plugin-registry | ./plugins/seis-topics/seis-topic-automation-plugin-registry | no | seis-topic-bundle-04 | pass | MIT | 1 | 0 |
| seis-topic-automation-plugins | ./plugins/seis-topics/seis-topic-automation-plugins | no | seis-topic-bundle-04 | pass | MIT | 1 | 0 |
| seis-topic-automation-providers | ./plugins/seis-topics/seis-topic-automation-providers | no | seis-topic-bundle-05 | pass | MIT | 1 | 0 |
| seis-topic-automation-scheduling | ./plugins/seis-topics/seis-topic-automation-scheduling | no | seis-topic-bundle-05 | pass | MIT | 1 | 0 |
| seis-topic-automation-skills | ./plugins/seis-topics/seis-topic-automation-skills | no | seis-topic-bundle-05 | pass | MIT | 1 | 0 |
| seis-topic-automation-task-management | ./plugins/seis-topics/seis-topic-automation-task-management | no | seis-topic-bundle-05 | pass | MIT | 1 | 0 |
| seis-topic-automation-templates | ./plugins/seis-topics/seis-topic-automation-templates | no | seis-topic-bundle-05 | pass | MIT | 1 | 0 |
| seis-topic-automation-tools | ./plugins/seis-topics/seis-topic-automation-tools | no | seis-topic-bundle-05 | pass | MIT | 1 | 0 |
| seis-topic-automation-workflow | ./plugins/seis-topics/seis-topic-automation-workflow | no | seis-topic-bundle-05 | pass | MIT | 1 | 0 |
| seis-topic-automation-workspace | ./plugins/seis-topics/seis-topic-automation-workspace | no | seis-topic-bundle-05 | pass | MIT | 1 | 0 |
| seis-topic-cloud-computing | ./plugins/seis-topics/seis-topic-cloud-computing | no | seis-topic-bundle-06 | pass | MIT | 1 | 0 |
| seis-topic-cloud-computing-ci-cd | ./plugins/seis-topics/seis-topic-cloud-computing-ci-cd | no | seis-topic-bundle-06 | pass | MIT | 1 | 0 |
| seis-topic-cloud-computing-cloud-native | ./plugins/seis-topics/seis-topic-cloud-computing-cloud-native | no | seis-topic-bundle-06 | pass | MIT | 1 | 0 |
| seis-topic-cloud-computing-containers | ./plugins/seis-topics/seis-topic-cloud-computing-containers | no | seis-topic-bundle-06 | pass | MIT | 1 | 0 |
| seis-topic-cloud-computing-devops | ./plugins/seis-topics/seis-topic-cloud-computing-devops | no | seis-topic-bundle-06 | pass | MIT | 1 | 0 |
| seis-topic-cloud-computing-devsecops | ./plugins/seis-topics/seis-topic-cloud-computing-devsecops | no | seis-topic-bundle-06 | pass | MIT | 1 | 0 |
| seis-topic-cloud-computing-docker | ./plugins/seis-topics/seis-topic-cloud-computing-docker | no | seis-topic-bundle-06 | pass | MIT | 1 | 0 |
| seis-topic-cloud-computing-edge-computing | ./plugins/seis-topics/seis-topic-cloud-computing-edge-computing | no | seis-topic-bundle-06 | pass | MIT | 1 | 0 |
| seis-topic-cloud-computing-hybrid-cloud | ./plugins/seis-topics/seis-topic-cloud-computing-hybrid-cloud | no | seis-topic-bundle-06 | pass | MIT | 1 | 0 |
| seis-topic-cloud-computing-infrastructure | ./plugins/seis-topics/seis-topic-cloud-computing-infrastructure | no | seis-topic-bundle-06 | pass | MIT | 1 | 0 |
| seis-topic-cloud-computing-infrastructure-as-code | ./plugins/seis-topics/seis-topic-cloud-computing-infrastructure-as-code | no | seis-topic-bundle-06 | pass | MIT | 1 | 0 |
| seis-topic-cloud-computing-kubernetes | ./plugins/seis-topics/seis-topic-cloud-computing-kubernetes | no | seis-topic-bundle-06 | pass | MIT | 1 | 0 |
| seis-topic-cloud-computing-logging | ./plugins/seis-topics/seis-topic-cloud-computing-logging | no | seis-topic-bundle-06 | pass | MIT | 1 | 0 |
| seis-topic-cloud-computing-metrics | ./plugins/seis-topics/seis-topic-cloud-computing-metrics | no | seis-topic-bundle-07 | pass | MIT | 1 | 0 |
| seis-topic-cloud-computing-monitoring | ./plugins/seis-topics/seis-topic-cloud-computing-monitoring | no | seis-topic-bundle-07 | pass | MIT | 1 | 0 |
| seis-topic-cloud-computing-networking | ./plugins/seis-topics/seis-topic-cloud-computing-networking | no | seis-topic-bundle-07 | pass | MIT | 1 | 0 |
| seis-topic-cloud-computing-observability | ./plugins/seis-topics/seis-topic-cloud-computing-observability | no | seis-topic-bundle-07 | pass | MIT | 1 | 0 |
| seis-topic-cloud-computing-platform-engineering | ./plugins/seis-topics/seis-topic-cloud-computing-platform-engineering | no | seis-topic-bundle-07 | pass | MIT | 1 | 0 |
| seis-topic-cloud-computing-private-cloud | ./plugins/seis-topics/seis-topic-cloud-computing-private-cloud | no | seis-topic-bundle-07 | pass | MIT | 1 | 0 |
| seis-topic-cloud-computing-public-cloud | ./plugins/seis-topics/seis-topic-cloud-computing-public-cloud | no | seis-topic-bundle-07 | pass | MIT | 1 | 0 |
| seis-topic-cloud-computing-serverless | ./plugins/seis-topics/seis-topic-cloud-computing-serverless | no | seis-topic-bundle-07 | pass | MIT | 1 | 0 |
| seis-topic-cloud-computing-site-reliability-engineering | ./plugins/seis-topics/seis-topic-cloud-computing-site-reliability-engineering | no | seis-topic-bundle-07 | pass | MIT | 1 | 0 |
| seis-topic-cloud-computing-telemetry | ./plugins/seis-topics/seis-topic-cloud-computing-telemetry | no | seis-topic-bundle-07 | pass | MIT | 1 | 0 |
| seis-topic-cloud-computing-tracing | ./plugins/seis-topics/seis-topic-cloud-computing-tracing | no | seis-topic-bundle-07 | pass | MIT | 1 | 0 |
| seis-topic-cloud-computing-virtualization | ./plugins/seis-topics/seis-topic-cloud-computing-virtualization | no | seis-topic-bundle-07 | pass | MIT | 1 | 0 |
| seis-topic-creative-production | ./plugins/seis-topics/seis-topic-creative-production | no | seis-topic-bundle-08 | pass | MIT | 1 | 0 |
| seis-topic-creative-production-animation | ./plugins/seis-topics/seis-topic-creative-production-animation | no | seis-topic-bundle-08 | pass | MIT | 1 | 0 |
| seis-topic-creative-production-asset-management | ./plugins/seis-topics/seis-topic-creative-production-asset-management | no | seis-topic-bundle-08 | pass | MIT | 1 | 0 |
| seis-topic-creative-production-audio | ./plugins/seis-topics/seis-topic-creative-production-audio | no | seis-topic-bundle-08 | pass | MIT | 1 | 0 |
| seis-topic-creative-production-cgi | ./plugins/seis-topics/seis-topic-creative-production-cgi | no | seis-topic-bundle-08 | pass | MIT | 1 | 0 |
| seis-topic-creative-production-content-creation | ./plugins/seis-topics/seis-topic-creative-production-content-creation | no | seis-topic-bundle-08 | pass | MIT | 1 | 0 |
| seis-topic-creative-production-creative-engineering | ./plugins/seis-topics/seis-topic-creative-production-creative-engineering | no | seis-topic-bundle-08 | pass | MIT | 1 | 0 |
| seis-topic-creative-production-digital-art | ./plugins/seis-topics/seis-topic-creative-production-digital-art | no | seis-topic-bundle-08 | pass | MIT | 1 | 0 |
| seis-topic-creative-production-media-production | ./plugins/seis-topics/seis-topic-creative-production-media-production | no | seis-topic-bundle-08 | pass | MIT | 1 | 0 |
| seis-topic-creative-production-moodboards | ./plugins/seis-topics/seis-topic-creative-production-moodboards | no | seis-topic-bundle-09 | pass | MIT | 1 | 0 |
| seis-topic-creative-production-music | ./plugins/seis-topics/seis-topic-creative-production-music | no | seis-topic-bundle-09 | pass | MIT | 1 | 0 |
| seis-topic-creative-production-publishing | ./plugins/seis-topics/seis-topic-creative-production-publishing | no | seis-topic-bundle-09 | pass | MIT | 1 | 0 |
| seis-topic-creative-production-story-world | ./plugins/seis-topics/seis-topic-creative-production-story-world | no | seis-topic-bundle-09 | pass | MIT | 1 | 0 |
| seis-topic-creative-production-storytelling | ./plugins/seis-topics/seis-topic-creative-production-storytelling | no | seis-topic-bundle-09 | pass | MIT | 1 | 0 |
| seis-topic-creative-production-video | ./plugins/seis-topics/seis-topic-creative-production-video | no | seis-topic-bundle-09 | pass | MIT | 1 | 0 |
| seis-topic-creative-production-virtual-production | ./plugins/seis-topics/seis-topic-creative-production-virtual-production | no | seis-topic-bundle-09 | pass | MIT | 1 | 0 |
| seis-topic-creative-production-visual-effects | ./plugins/seis-topics/seis-topic-creative-production-visual-effects | no | seis-topic-bundle-09 | pass | MIT | 1 | 0 |
| seis-topic-cybersecurity | ./plugins/seis-topics/seis-topic-cybersecurity | no | seis-topic-bundle-10 | pass | MIT | 1 | 0 |
| seis-topic-cybersecurity-abac | ./plugins/seis-topics/seis-topic-cybersecurity-abac | no | seis-topic-bundle-10 | pass | MIT | 1 | 0 |
| seis-topic-cybersecurity-ai-security | ./plugins/seis-topics/seis-topic-cybersecurity-ai-security | no | seis-topic-bundle-10 | pass | MIT | 1 | 0 |
| seis-topic-cybersecurity-application-security | ./plugins/seis-topics/seis-topic-cybersecurity-application-security | no | seis-topic-bundle-10 | pass | MIT | 1 | 0 |
| seis-topic-cybersecurity-authentication | ./plugins/seis-topics/seis-topic-cybersecurity-authentication | no | seis-topic-bundle-10 | pass | MIT | 1 | 0 |
| seis-topic-cybersecurity-authorization | ./plugins/seis-topics/seis-topic-cybersecurity-authorization | no | seis-topic-bundle-10 | pass | MIT | 1 | 0 |
| seis-topic-cybersecurity-compliance | ./plugins/seis-topics/seis-topic-cybersecurity-compliance | no | seis-topic-bundle-10 | pass | MIT | 1 | 0 |
| seis-topic-cybersecurity-encryption | ./plugins/seis-topics/seis-topic-cybersecurity-encryption | no | seis-topic-bundle-10 | pass | MIT | 1 | 0 |
| seis-topic-cybersecurity-identity-management | ./plugins/seis-topics/seis-topic-cybersecurity-identity-management | no | seis-topic-bundle-10 | pass | MIT | 1 | 0 |
| seis-topic-cybersecurity-incident-response | ./plugins/seis-topics/seis-topic-cybersecurity-incident-response | no | seis-topic-bundle-10 | pass | MIT | 1 | 0 |
| seis-topic-cybersecurity-information-security | ./plugins/seis-topics/seis-topic-cybersecurity-information-security | no | seis-topic-bundle-10 | pass | MIT | 1 | 0 |
| seis-topic-cybersecurity-network-security | ./plugins/seis-topics/seis-topic-cybersecurity-network-security | no | seis-topic-bundle-11 | pass | MIT | 1 | 0 |
| seis-topic-cybersecurity-privacy | ./plugins/seis-topics/seis-topic-cybersecurity-privacy | no | seis-topic-bundle-11 | pass | MIT | 1 | 0 |
| seis-topic-cybersecurity-rbac | ./plugins/seis-topics/seis-topic-cybersecurity-rbac | no | seis-topic-bundle-11 | pass | MIT | 1 | 0 |
| seis-topic-cybersecurity-risk-management | ./plugins/seis-topics/seis-topic-cybersecurity-risk-management | no | seis-topic-bundle-11 | pass | MIT | 1 | 0 |
| seis-topic-cybersecurity-secrets-management | ./plugins/seis-topics/seis-topic-cybersecurity-secrets-management | no | seis-topic-bundle-11 | pass | MIT | 1 | 0 |
| seis-topic-cybersecurity-security-auditing | ./plugins/seis-topics/seis-topic-cybersecurity-security-auditing | no | seis-topic-bundle-11 | pass | MIT | 1 | 0 |
| seis-topic-cybersecurity-supply-chain-security | ./plugins/seis-topics/seis-topic-cybersecurity-supply-chain-security | no | seis-topic-bundle-11 | pass | MIT | 1 | 0 |
| seis-topic-cybersecurity-threat-intelligence | ./plugins/seis-topics/seis-topic-cybersecurity-threat-intelligence | no | seis-topic-bundle-11 | pass | MIT | 1 | 0 |
| seis-topic-cybersecurity-threat-modeling | ./plugins/seis-topics/seis-topic-cybersecurity-threat-modeling | no | seis-topic-bundle-11 | pass | MIT | 1 | 0 |
| seis-topic-cybersecurity-zero-trust | ./plugins/seis-topics/seis-topic-cybersecurity-zero-trust | no | seis-topic-bundle-11 | pass | MIT | 1 | 0 |
| seis-topic-data | ./plugins/seis-topics/seis-topic-data | no | seis-topic-bundle-12 | pass | MIT | 1 | 0 |
| seis-topic-data-analytics | ./plugins/seis-topics/seis-topic-data-analytics | no | seis-topic-bundle-12 | pass | MIT | 1 | 0 |
| seis-topic-data-business-intelligence | ./plugins/seis-topics/seis-topic-data-business-intelligence | no | seis-topic-bundle-12 | pass | MIT | 1 | 0 |
| seis-topic-data-data-architecture | ./plugins/seis-topics/seis-topic-data-data-architecture | no | seis-topic-bundle-12 | pass | MIT | 1 | 0 |
| seis-topic-data-data-engineering | ./plugins/seis-topics/seis-topic-data-data-engineering | no | seis-topic-bundle-12 | pass | MIT | 1 | 0 |
| seis-topic-data-data-governance | ./plugins/seis-topics/seis-topic-data-data-governance | no | seis-topic-bundle-12 | pass | MIT | 1 | 0 |
| seis-topic-data-data-lineage | ./plugins/seis-topics/seis-topic-data-data-lineage | no | seis-topic-bundle-12 | pass | MIT | 1 | 0 |
| seis-topic-data-data-pipelines | ./plugins/seis-topics/seis-topic-data-data-pipelines | no | seis-topic-bundle-12 | pass | MIT | 1 | 0 |
| seis-topic-data-data-quality | ./plugins/seis-topics/seis-topic-data-data-quality | no | seis-topic-bundle-12 | pass | MIT | 1 | 0 |
| seis-topic-data-data-science | ./plugins/seis-topics/seis-topic-data-data-science | no | seis-topic-bundle-12 | pass | MIT | 1 | 0 |
| seis-topic-data-databases | ./plugins/seis-topics/seis-topic-data-databases | no | seis-topic-bundle-13 | pass | MIT | 1 | 0 |
| seis-topic-data-elt | ./plugins/seis-topics/seis-topic-data-elt | no | seis-topic-bundle-13 | pass | MIT | 1 | 0 |
| seis-topic-data-etl | ./plugins/seis-topics/seis-topic-data-etl | no | seis-topic-bundle-13 | pass | MIT | 1 | 0 |
| seis-topic-data-graph-databases | ./plugins/seis-topics/seis-topic-data-graph-databases | no | seis-topic-bundle-13 | pass | MIT | 1 | 0 |
| seis-topic-data-metadata | ./plugins/seis-topics/seis-topic-data-metadata | no | seis-topic-bundle-13 | pass | MIT | 1 | 0 |
| seis-topic-data-nosql | ./plugins/seis-topics/seis-topic-data-nosql | no | seis-topic-bundle-13 | pass | MIT | 1 | 0 |
| seis-topic-data-search-engine | ./plugins/seis-topics/seis-topic-data-search-engine | no | seis-topic-bundle-13 | pass | MIT | 1 | 0 |
| seis-topic-data-sql | ./plugins/seis-topics/seis-topic-data-sql | no | seis-topic-bundle-13 | pass | MIT | 1 | 0 |
| seis-topic-data-storage | ./plugins/seis-topics/seis-topic-data-storage | no | seis-topic-bundle-13 | pass | MIT | 1 | 0 |
| seis-topic-data-vector-databases | ./plugins/seis-topics/seis-topic-data-vector-databases | no | seis-topic-bundle-13 | pass | MIT | 1 | 0 |
| seis-topic-design | ./plugins/seis-topics/seis-topic-design | no | seis-topic-bundle-14 | pass | MIT | 1 | 0 |
| seis-topic-design-3d-design | ./plugins/seis-topics/seis-topic-design-3d-design | no | seis-topic-bundle-14 | pass | MIT | 1 | 0 |
| seis-topic-design-accessibility | ./plugins/seis-topics/seis-topic-design-accessibility | no | seis-topic-bundle-14 | pass | MIT | 1 | 0 |
| seis-topic-design-branding | ./plugins/seis-topics/seis-topic-design-branding | no | seis-topic-bundle-14 | pass | MIT | 1 | 0 |
| seis-topic-design-creative-coding | ./plugins/seis-topics/seis-topic-design-creative-coding | no | seis-topic-bundle-14 | pass | MIT | 1 | 0 |
| seis-topic-design-design-systems | ./plugins/seis-topics/seis-topic-design-design-systems | no | seis-topic-bundle-14 | pass | MIT | 1 | 0 |
| seis-topic-design-design-tokens | ./plugins/seis-topics/seis-topic-design-design-tokens | no | seis-topic-bundle-14 | pass | MIT | 1 | 0 |
| seis-topic-design-editorial-design | ./plugins/seis-topics/seis-topic-design-editorial-design | no | seis-topic-bundle-14 | pass | MIT | 1 | 0 |
| seis-topic-design-graphic-design | ./plugins/seis-topics/seis-topic-design-graphic-design | no | seis-topic-bundle-14 | pass | MIT | 1 | 0 |
| seis-topic-design-illustration | ./plugins/seis-topics/seis-topic-design-illustration | no | seis-topic-bundle-14 | pass | MIT | 1 | 0 |
| seis-topic-design-interaction-design | ./plugins/seis-topics/seis-topic-design-interaction-design | no | seis-topic-bundle-14 | pass | MIT | 1 | 0 |
| seis-topic-design-localization | ./plugins/seis-topics/seis-topic-design-localization | no | seis-topic-bundle-15 | pass | MIT | 1 | 0 |
| seis-topic-design-motion-design | ./plugins/seis-topics/seis-topic-design-motion-design | no | seis-topic-bundle-15 | pass | MIT | 1 | 0 |
| seis-topic-design-photography | ./plugins/seis-topics/seis-topic-design-photography | no | seis-topic-bundle-15 | pass | MIT | 1 | 0 |
| seis-topic-design-product-design | ./plugins/seis-topics/seis-topic-design-product-design | no | seis-topic-bundle-15 | pass | MIT | 1 | 0 |
| seis-topic-design-responsive-design | ./plugins/seis-topics/seis-topic-design-responsive-design | no | seis-topic-bundle-15 | pass | MIT | 1 | 0 |
| seis-topic-design-typography | ./plugins/seis-topics/seis-topic-design-typography | no | seis-topic-bundle-15 | pass | MIT | 1 | 0 |
| seis-topic-design-ui-design | ./plugins/seis-topics/seis-topic-design-ui-design | no | seis-topic-bundle-15 | pass | MIT | 1 | 0 |
| seis-topic-design-ux-design | ./plugins/seis-topics/seis-topic-design-ux-design | no | seis-topic-bundle-15 | pass | MIT | 1 | 0 |
| seis-topic-design-visual-design | ./plugins/seis-topics/seis-topic-design-visual-design | no | seis-topic-bundle-15 | pass | MIT | 1 | 0 |
| seis-topic-design-visual-identity | ./plugins/seis-topics/seis-topic-design-visual-identity | no | seis-topic-bundle-15 | pass | MIT | 1 | 0 |
| seis-topic-desktop | ./plugins/seis-topics/seis-topic-desktop | no | seis-topic-bundle-16 | pass | MIT | 1 | 0 |
| seis-topic-desktop-android | ./plugins/seis-topics/seis-topic-desktop-android | no | seis-topic-bundle-16 | pass | MIT | 1 | 0 |
| seis-topic-desktop-cross-platform | ./plugins/seis-topics/seis-topic-desktop-cross-platform | no | seis-topic-bundle-16 | pass | MIT | 1 | 0 |
| seis-topic-desktop-ios | ./plugins/seis-topics/seis-topic-desktop-ios | no | seis-topic-bundle-16 | pass | MIT | 1 | 0 |
| seis-topic-desktop-ipados | ./plugins/seis-topics/seis-topic-desktop-ipados | no | seis-topic-bundle-16 | pass | MIT | 1 | 0 |
| seis-topic-desktop-linux | ./plugins/seis-topics/seis-topic-desktop-linux | no | seis-topic-bundle-16 | pass | MIT | 1 | 0 |
| seis-topic-desktop-macos | ./plugins/seis-topics/seis-topic-desktop-macos | no | seis-topic-bundle-16 | pass | MIT | 1 | 0 |
| seis-topic-desktop-visionos | ./plugins/seis-topics/seis-topic-desktop-visionos | no | seis-topic-bundle-16 | pass | MIT | 1 | 0 |
| seis-topic-desktop-watchos | ./plugins/seis-topics/seis-topic-desktop-watchos | no | seis-topic-bundle-16 | pass | MIT | 1 | 0 |
| seis-topic-desktop-web | ./plugins/seis-topics/seis-topic-desktop-web | no | seis-topic-bundle-16 | pass | MIT | 1 | 0 |
| seis-topic-desktop-windows | ./plugins/seis-topics/seis-topic-desktop-windows | no | seis-topic-bundle-16 | pass | MIT | 1 | 0 |
| seis-topic-eleni-neferi | ./plugins/seis-topics/seis-topic-eleni-neferi | no | seis-topic-bundle-17 | pass | MIT | 1 | 0 |
| seis-topic-eleni-neferi-architecture | ./plugins/seis-topics/seis-topic-eleni-neferi-architecture | no | seis-topic-bundle-17 | pass | MIT | 1 | 0 |
| seis-topic-eleni-neferi-asset-universe | ./plugins/seis-topics/seis-topic-eleni-neferi-asset-universe | no | seis-topic-bundle-17 | pass | MIT | 1 | 0 |
| seis-topic-eleni-neferi-cinematic-experience | ./plugins/seis-topics/seis-topic-eleni-neferi-cinematic-experience | no | seis-topic-bundle-17 | pass | MIT | 1 | 0 |
| seis-topic-eleni-neferi-creative-studio | ./plugins/seis-topics/seis-topic-eleni-neferi-creative-studio | no | seis-topic-bundle-17 | pass | MIT | 1 | 0 |
| seis-topic-eleni-neferi-editorial | ./plugins/seis-topics/seis-topic-eleni-neferi-editorial | no | seis-topic-bundle-17 | pass | MIT | 1 | 0 |
| seis-topic-eleni-neferi-fashion | ./plugins/seis-topics/seis-topic-eleni-neferi-fashion | no | seis-topic-bundle-17 | pass | MIT | 1 | 0 |
| seis-topic-eleni-neferi-identity-bible | ./plugins/seis-topics/seis-topic-eleni-neferi-identity-bible | no | seis-topic-bundle-17 | pass | MIT | 1 | 0 |
| seis-topic-eleni-neferi-lifestyle | ./plugins/seis-topics/seis-topic-eleni-neferi-lifestyle | no | seis-topic-bundle-17 | pass | MIT | 1 | 0 |
| seis-topic-eleni-neferi-media-pipeline | ./plugins/seis-topics/seis-topic-eleni-neferi-media-pipeline | no | seis-topic-bundle-17 | pass | MIT | 1 | 0 |
| seis-topic-eleni-neferi-moodboard-system | ./plugins/seis-topics/seis-topic-eleni-neferi-moodboard-system | no | seis-topic-bundle-17 | pass | MIT | 1 | 0 |
| seis-topic-eleni-neferi-prompt-registry | ./plugins/seis-topics/seis-topic-eleni-neferi-prompt-registry | no | seis-topic-bundle-17 | pass | MIT | 1 | 0 |
| seis-topic-eleni-neferi-story-universe | ./plugins/seis-topics/seis-topic-eleni-neferi-story-universe | no | seis-topic-bundle-17 | pass | MIT | 1 | 0 |
| seis-topic-eleni-neferi-travel | ./plugins/seis-topics/seis-topic-eleni-neferi-travel | no | seis-topic-bundle-17 | pass | MIT | 1 | 0 |
| seis-topic-eleni-neferi-visual-identity | ./plugins/seis-topics/seis-topic-eleni-neferi-visual-identity | no | seis-topic-bundle-17 | pass | MIT | 1 | 0 |
| seis-topic-graphics | ./plugins/seis-topics/seis-topic-graphics | no | seis-topic-bundle-18 | pass | MIT | 1 | 0 |
| seis-topic-graphics-color-theory | ./plugins/seis-topics/seis-topic-graphics-color-theory | no | seis-topic-bundle-18 | pass | MIT | 1 | 0 |
| seis-topic-graphics-composition | ./plugins/seis-topics/seis-topic-graphics-composition | no | seis-topic-bundle-18 | pass | MIT | 1 | 0 |
| seis-topic-graphics-game-engine | ./plugins/seis-topics/seis-topic-graphics-game-engine | no | seis-topic-bundle-18 | pass | MIT | 1 | 0 |
| seis-topic-graphics-graphics-engine | ./plugins/seis-topics/seis-topic-graphics-graphics-engine | no | seis-topic-bundle-18 | pass | MIT | 1 | 0 |
| seis-topic-graphics-iconography | ./plugins/seis-topics/seis-topic-graphics-iconography | no | seis-topic-bundle-18 | pass | MIT | 1 | 0 |
| seis-topic-graphics-layout | ./plugins/seis-topics/seis-topic-graphics-layout | no | seis-topic-bundle-18 | pass | MIT | 1 | 0 |
| seis-topic-graphics-lighting | ./plugins/seis-topics/seis-topic-graphics-lighting | no | seis-topic-bundle-18 | pass | MIT | 1 | 0 |
| seis-topic-graphics-materials | ./plugins/seis-topics/seis-topic-graphics-materials | no | seis-topic-bundle-18 | pass | MIT | 1 | 0 |
| seis-topic-graphics-path-tracing | ./plugins/seis-topics/seis-topic-graphics-path-tracing | no | seis-topic-bundle-18 | pass | MIT | 1 | 0 |
| seis-topic-graphics-ray-tracing | ./plugins/seis-topics/seis-topic-graphics-ray-tracing | no | seis-topic-bundle-18 | pass | MIT | 1 | 0 |
| seis-topic-graphics-rendering | ./plugins/seis-topics/seis-topic-graphics-rendering | no | seis-topic-bundle-18 | pass | MIT | 1 | 0 |
| seis-topic-graphics-shaders | ./plugins/seis-topics/seis-topic-graphics-shaders | no | seis-topic-bundle-18 | pass | MIT | 1 | 0 |
| seis-topic-knowledge | ./plugins/seis-topics/seis-topic-knowledge | no | seis-topic-bundle-19 | pass | MIT | 1 | 0 |
| seis-topic-knowledge-ar | ./plugins/seis-topics/seis-topic-knowledge-ar | no | seis-topic-bundle-19 | pass | MIT | 1 | 0 |
| seis-topic-knowledge-automation | ./plugins/seis-topics/seis-topic-knowledge-automation | no | seis-topic-bundle-19 | pass | MIT | 1 | 0 |
| seis-topic-knowledge-biology | ./plugins/seis-topics/seis-topic-knowledge-biology | no | seis-topic-bundle-19 | pass | MIT | 1 | 0 |
| seis-topic-knowledge-blockchain | ./plugins/seis-topics/seis-topic-knowledge-blockchain | no | seis-topic-bundle-19 | pass | MIT | 1 | 0 |
| seis-topic-knowledge-chemistry | ./plugins/seis-topics/seis-topic-knowledge-chemistry | no | seis-topic-bundle-19 | pass | MIT | 1 | 0 |
| seis-topic-knowledge-digital-twin | ./plugins/seis-topics/seis-topic-knowledge-digital-twin | no | seis-topic-bundle-19 | pass | MIT | 1 | 0 |
| seis-topic-knowledge-documentation | ./plugins/seis-topics/seis-topic-knowledge-documentation | no | seis-topic-bundle-19 | pass | MIT | 1 | 0 |
| seis-topic-knowledge-future-technologies | ./plugins/seis-topics/seis-topic-knowledge-future-technologies | no | seis-topic-bundle-19 | pass | MIT | 1 | 0 |
| seis-topic-knowledge-genetics | ./plugins/seis-topics/seis-topic-knowledge-genetics | no | seis-topic-bundle-19 | pass | MIT | 1 | 0 |
| seis-topic-knowledge-human-ai-collaboration | ./plugins/seis-topics/seis-topic-knowledge-human-ai-collaboration | no | seis-topic-bundle-19 | pass | MIT | 1 | 0 |
| seis-topic-knowledge-innovation | ./plugins/seis-topics/seis-topic-knowledge-innovation | no | seis-topic-bundle-19 | pass | MIT | 1 | 0 |
| seis-topic-knowledge-iot | ./plugins/seis-topics/seis-topic-knowledge-iot | no | seis-topic-bundle-19 | pass | MIT | 1 | 0 |
| seis-topic-knowledge-mathematics | ./plugins/seis-topics/seis-topic-knowledge-mathematics | no | seis-topic-bundle-20 | pass | MIT | 1 | 0 |
| seis-topic-knowledge-neuroscience | ./plugins/seis-topics/seis-topic-knowledge-neuroscience | no | seis-topic-bundle-20 | pass | MIT | 1 | 0 |
| seis-topic-knowledge-physics | ./plugins/seis-topics/seis-topic-knowledge-physics | no | seis-topic-bundle-20 | pass | MIT | 1 | 0 |
| seis-topic-knowledge-quantum-computing | ./plugins/seis-topics/seis-topic-knowledge-quantum-computing | no | seis-topic-bundle-20 | pass | MIT | 1 | 0 |
| seis-topic-knowledge-research | ./plugins/seis-topics/seis-topic-knowledge-research | no | seis-topic-bundle-20 | pass | MIT | 1 | 0 |
| seis-topic-knowledge-robotics | ./plugins/seis-topics/seis-topic-knowledge-robotics | no | seis-topic-bundle-20 | pass | MIT | 1 | 0 |
| seis-topic-knowledge-science | ./plugins/seis-topics/seis-topic-knowledge-science | no | seis-topic-bundle-20 | pass | MIT | 1 | 0 |
| seis-topic-knowledge-simulation | ./plugins/seis-topics/seis-topic-knowledge-simulation | no | seis-topic-bundle-20 | pass | MIT | 1 | 0 |
| seis-topic-knowledge-spatial-computing | ./plugins/seis-topics/seis-topic-knowledge-spatial-computing | no | seis-topic-bundle-20 | pass | MIT | 1 | 0 |
| seis-topic-knowledge-sustainability | ./plugins/seis-topics/seis-topic-knowledge-sustainability | no | seis-topic-bundle-20 | pass | MIT | 1 | 0 |
| seis-topic-knowledge-vr | ./plugins/seis-topics/seis-topic-knowledge-vr | no | seis-topic-bundle-20 | pass | MIT | 1 | 0 |
| seis-topic-knowledge-xr | ./plugins/seis-topics/seis-topic-knowledge-xr | no | seis-topic-bundle-20 | pass | MIT | 1 | 0 |
| seis-topic-pantechnoepistemonoesis | ./plugins/seis-topics/seis-topic-pantechnoepistemonoesis | no | seis-topic-bundle-21 | pass | MIT | 1 | 0 |
| seis-topic-pantechnoepistemonoesis-engineering-civilization | ./plugins/seis-topics/seis-topic-pantechnoepistemonoesis-engineering-civilization | no | seis-topic-bundle-21 | pass | MIT | 1 | 0 |
| seis-topic-pantechnoepistemonoesis-knowledge-civilization | ./plugins/seis-topics/seis-topic-pantechnoepistemonoesis-knowledge-civilization | no | seis-topic-bundle-21 | pass | MIT | 1 | 0 |
| seis-topic-pantechnoepistemonoesis-research-lab | ./plugins/seis-topics/seis-topic-pantechnoepistemonoesis-research-lab | no | seis-topic-bundle-21 | pass | MIT | 1 | 0 |
| seis-topic-pantechnoepistemonoesis-scientific-computing | ./plugins/seis-topics/seis-topic-pantechnoepistemonoesis-scientific-computing | no | seis-topic-bundle-21 | pass | MIT | 1 | 0 |
| seis-topic-pantechnoepistemonoesis-technology-atlas | ./plugins/seis-topics/seis-topic-pantechnoepistemonoesis-technology-atlas | no | seis-topic-bundle-21 | pass | MIT | 1 | 0 |
| seis-topic-project-management | ./plugins/seis-topics/seis-topic-project-management | no | seis-topic-bundle-22 | pass | MIT | 1 | 0 |
| seis-topic-project-management-architecture-governance | ./plugins/seis-topics/seis-topic-project-management-architecture-governance | no | seis-topic-bundle-22 | pass | MIT | 1 | 0 |
| seis-topic-project-management-audit | ./plugins/seis-topics/seis-topic-project-management-audit | no | seis-topic-bundle-22 | pass | MIT | 1 | 0 |
| seis-topic-project-management-evidence | ./plugins/seis-topics/seis-topic-project-management-evidence | no | seis-topic-bundle-22 | pass | MIT | 1 | 0 |
| seis-topic-project-management-goal-tracking | ./plugins/seis-topics/seis-topic-project-management-goal-tracking | no | seis-topic-bundle-22 | pass | MIT | 1 | 0 |
| seis-topic-project-management-milestones | ./plugins/seis-topics/seis-topic-project-management-milestones | no | seis-topic-bundle-22 | pass | MIT | 1 | 0 |
| seis-topic-project-management-ontology | ./plugins/seis-topics/seis-topic-project-management-ontology | no | seis-topic-bundle-22 | pass | MIT | 1 | 0 |
| seis-topic-project-management-permissions | ./plugins/seis-topics/seis-topic-project-management-permissions | no | seis-topic-bundle-22 | pass | MIT | 1 | 0 |
| seis-topic-project-management-policies | ./plugins/seis-topics/seis-topic-project-management-policies | no | seis-topic-bundle-22 | pass | MIT | 1 | 0 |
| seis-topic-project-management-product-management | ./plugins/seis-topics/seis-topic-project-management-product-management | no | seis-topic-bundle-23 | pass | MIT | 1 | 0 |
| seis-topic-project-management-registries | ./plugins/seis-topics/seis-topic-project-management-registries | no | seis-topic-bundle-23 | pass | MIT | 1 | 0 |
| seis-topic-project-management-repository-intelligence | ./plugins/seis-topics/seis-topic-project-management-repository-intelligence | no | seis-topic-bundle-23 | pass | MIT | 1 | 0 |
| seis-topic-project-management-repository-management | ./plugins/seis-topics/seis-topic-project-management-repository-management | no | seis-topic-bundle-23 | pass | MIT | 1 | 0 |
| seis-topic-project-management-risk | ./plugins/seis-topics/seis-topic-project-management-risk | no | seis-topic-bundle-23 | pass | MIT | 1 | 0 |
| seis-topic-project-management-roadmaps | ./plugins/seis-topics/seis-topic-project-management-roadmaps | no | seis-topic-bundle-23 | pass | MIT | 1 | 0 |
| seis-topic-project-management-taxonomy | ./plugins/seis-topics/seis-topic-project-management-taxonomy | no | seis-topic-bundle-23 | pass | MIT | 1 | 0 |
| seis-topic-project-management-validation | ./plugins/seis-topics/seis-topic-project-management-validation | no | seis-topic-bundle-23 | pass | MIT | 1 | 0 |
| seis-topic-seis | ./plugins/seis-topics/seis-topic-seis | no | seis-topic-bundle-24 | pass | MIT | 1 | 0 |
| seis-topic-seis-seis-9router | ./plugins/seis-topics/seis-topic-seis-seis-9router | no | seis-topic-bundle-24 | pass | MIT | 1 | 0 |
| seis-topic-seis-seis-agent-runtime | ./plugins/seis-topics/seis-topic-seis-seis-agent-runtime | no | seis-topic-bundle-24 | pass | MIT | 1 | 0 |
| seis-topic-seis-seis-ai-core | ./plugins/seis-topics/seis-topic-seis-seis-ai-core | no | seis-topic-bundle-24 | pass | MIT | 1 | 0 |
| seis-topic-seis-seis-ai-desktop | ./plugins/seis-topics/seis-topic-seis-seis-ai-desktop | no | seis-topic-bundle-24 | pass | MIT | 1 | 0 |
| seis-topic-seis-seis-brain | ./plugins/seis-topics/seis-topic-seis-seis-brain | no | seis-topic-bundle-24 | pass | MIT | 1 | 0 |
| seis-topic-seis-seis-command-center | ./plugins/seis-topics/seis-topic-seis-seis-command-center | no | seis-topic-bundle-24 | pass | MIT | 1 | 0 |
| seis-topic-seis-seis-goal-tracking | ./plugins/seis-topics/seis-topic-seis-seis-goal-tracking | no | seis-topic-bundle-24 | pass | MIT | 1 | 0 |
| seis-topic-seis-seis-intelligence-cube | ./plugins/seis-topics/seis-topic-seis-seis-intelligence-cube | no | seis-topic-bundle-24 | pass | MIT | 1 | 0 |
| seis-topic-seis-seis-knowledge-engine | ./plugins/seis-topics/seis-topic-seis-seis-knowledge-engine | no | seis-topic-bundle-24 | pass | MIT | 1 | 0 |
| seis-topic-seis-seis-repository-intelligence | ./plugins/seis-topics/seis-topic-seis-seis-repository-intelligence | no | seis-topic-bundle-24 | pass | MIT | 1 | 0 |
| seis-topic-seis-seis-technology-ontology | ./plugins/seis-topics/seis-topic-seis-seis-technology-ontology | no | seis-topic-bundle-24 | pass | MIT | 1 | 0 |
| seis-topic-seis-seis-workflow-engine | ./plugins/seis-topics/seis-topic-seis-seis-workflow-engine | no | seis-topic-bundle-24 | pass | MIT | 1 | 0 |
| seis-topic-software-engineering | ./plugins/seis-topics/seis-topic-software-engineering | no | seis-topic-bundle-25 | pass | MIT | 1 | 0 |
| seis-topic-software-engineering-algorithms | ./plugins/seis-topics/seis-topic-software-engineering-algorithms | no | seis-topic-bundle-25 | pass | MIT | 1 | 0 |
| seis-topic-software-engineering-api | ./plugins/seis-topics/seis-topic-software-engineering-api | no | seis-topic-bundle-25 | pass | MIT | 1 | 0 |
| seis-topic-software-engineering-backend | ./plugins/seis-topics/seis-topic-software-engineering-backend | no | seis-topic-bundle-25 | pass | MIT | 1 | 0 |
| seis-topic-software-engineering-build-systems | ./plugins/seis-topics/seis-topic-software-engineering-build-systems | no | seis-topic-bundle-25 | pass | MIT | 1 | 0 |
| seis-topic-software-engineering-clean-architecture | ./plugins/seis-topics/seis-topic-software-engineering-clean-architecture | no | seis-topic-bundle-25 | pass | MIT | 1 | 0 |
| seis-topic-software-engineering-cli | ./plugins/seis-topics/seis-topic-software-engineering-cli | no | seis-topic-bundle-25 | pass | MIT | 1 | 0 |
| seis-topic-software-engineering-compilers | ./plugins/seis-topics/seis-topic-software-engineering-compilers | no | seis-topic-bundle-25 | pass | MIT | 1 | 0 |
| seis-topic-software-engineering-data-structures | ./plugins/seis-topics/seis-topic-software-engineering-data-structures | no | seis-topic-bundle-25 | pass | MIT | 1 | 0 |
| seis-topic-software-engineering-debugging | ./plugins/seis-topics/seis-topic-software-engineering-debugging | no | seis-topic-bundle-25 | pass | MIT | 1 | 0 |
| seis-topic-software-engineering-desktop-development | ./plugins/seis-topics/seis-topic-software-engineering-desktop-development | no | seis-topic-bundle-25 | pass | MIT | 1 | 0 |
| seis-topic-software-engineering-distributed-systems | ./plugins/seis-topics/seis-topic-software-engineering-distributed-systems | no | seis-topic-bundle-25 | pass | MIT | 1 | 0 |
| seis-topic-software-engineering-domain-driven-design | ./plugins/seis-topics/seis-topic-software-engineering-domain-driven-design | no | seis-topic-bundle-25 | pass | MIT | 1 | 0 |
| seis-topic-software-engineering-embedded-systems | ./plugins/seis-topics/seis-topic-software-engineering-embedded-systems | no | seis-topic-bundle-25 | pass | MIT | 1 | 0 |
| seis-topic-software-engineering-frameworks | ./plugins/seis-topics/seis-topic-software-engineering-frameworks | no | seis-topic-bundle-25 | pass | MIT | 1 | 0 |
| seis-topic-software-engineering-frontend | ./plugins/seis-topics/seis-topic-software-engineering-frontend | no | seis-topic-bundle-26 | pass | MIT | 1 | 0 |
| seis-topic-software-engineering-full-stack | ./plugins/seis-topics/seis-topic-software-engineering-full-stack | no | seis-topic-bundle-26 | pass | MIT | 1 | 0 |
| seis-topic-software-engineering-game-development | ./plugins/seis-topics/seis-topic-software-engineering-game-development | no | seis-topic-bundle-26 | pass | MIT | 1 | 0 |
| seis-topic-software-engineering-git | ./plugins/seis-topics/seis-topic-software-engineering-git | no | seis-topic-bundle-26 | pass | MIT | 1 | 0 |
| seis-topic-software-engineering-github | ./plugins/seis-topics/seis-topic-software-engineering-github | no | seis-topic-bundle-26 | pass | MIT | 1 | 0 |
| seis-topic-software-engineering-gui | ./plugins/seis-topics/seis-topic-software-engineering-gui | no | seis-topic-bundle-26 | pass | MIT | 1 | 0 |
| seis-topic-software-engineering-hexagonal-architecture | ./plugins/seis-topics/seis-topic-software-engineering-hexagonal-architecture | no | seis-topic-bundle-26 | pass | MIT | 1 | 0 |
| seis-topic-software-engineering-interpreters | ./plugins/seis-topics/seis-topic-software-engineering-interpreters | no | seis-topic-bundle-26 | pass | MIT | 1 | 0 |
| seis-topic-software-engineering-libraries | ./plugins/seis-topics/seis-topic-software-engineering-libraries | no | seis-topic-bundle-26 | pass | MIT | 1 | 0 |
| seis-topic-software-engineering-microservices | ./plugins/seis-topics/seis-topic-software-engineering-microservices | no | seis-topic-bundle-26 | pass | MIT | 1 | 0 |
| seis-topic-software-engineering-migration | ./plugins/seis-topics/seis-topic-software-engineering-migration | no | seis-topic-bundle-26 | pass | MIT | 1 | 0 |
| seis-topic-software-engineering-mobile-development | ./plugins/seis-topics/seis-topic-software-engineering-mobile-development | no | seis-topic-bundle-26 | pass | MIT | 1 | 0 |
| seis-topic-software-engineering-modular-monolith | ./plugins/seis-topics/seis-topic-software-engineering-modular-monolith | no | seis-topic-bundle-26 | pass | MIT | 1 | 0 |
| seis-topic-software-engineering-operating-systems | ./plugins/seis-topics/seis-topic-software-engineering-operating-systems | no | seis-topic-bundle-26 | pass | MIT | 1 | 0 |
| seis-topic-software-engineering-optimization | ./plugins/seis-topics/seis-topic-software-engineering-optimization | no | seis-topic-bundle-26 | pass | MIT | 1 | 0 |
| seis-topic-software-engineering-package-managers | ./plugins/seis-topics/seis-topic-software-engineering-package-managers | no | seis-topic-bundle-27 | pass | MIT | 1 | 0 |
| seis-topic-software-engineering-profiling | ./plugins/seis-topics/seis-topic-software-engineering-profiling | no | seis-topic-bundle-27 | pass | MIT | 1 | 0 |
| seis-topic-software-engineering-programming | ./plugins/seis-topics/seis-topic-software-engineering-programming | no | seis-topic-bundle-27 | pass | MIT | 1 | 0 |
| seis-topic-software-engineering-programming-languages | ./plugins/seis-topics/seis-topic-software-engineering-programming-languages | no | seis-topic-bundle-27 | pass | MIT | 1 | 0 |
| seis-topic-software-engineering-quality-assurance | ./plugins/seis-topics/seis-topic-software-engineering-quality-assurance | no | seis-topic-bundle-27 | pass | MIT | 1 | 0 |
| seis-topic-software-engineering-release-engineering | ./plugins/seis-topics/seis-topic-software-engineering-release-engineering | no | seis-topic-bundle-27 | pass | MIT | 1 | 0 |
| seis-topic-software-engineering-repository | ./plugins/seis-topics/seis-topic-software-engineering-repository | no | seis-topic-bundle-27 | pass | MIT | 1 | 0 |
| seis-topic-software-engineering-rollback | ./plugins/seis-topics/seis-topic-software-engineering-rollback | no | seis-topic-bundle-27 | pass | MIT | 1 | 0 |
| seis-topic-software-engineering-sdk | ./plugins/seis-topics/seis-topic-software-engineering-sdk | no | seis-topic-bundle-27 | pass | MIT | 1 | 0 |
| seis-topic-software-engineering-software-architecture | ./plugins/seis-topics/seis-topic-software-engineering-software-architecture | no | seis-topic-bundle-27 | pass | MIT | 1 | 0 |
| seis-topic-software-engineering-testing | ./plugins/seis-topics/seis-topic-software-engineering-testing | no | seis-topic-bundle-27 | pass | MIT | 1 | 0 |
| seis-topic-software-engineering-tui | ./plugins/seis-topics/seis-topic-software-engineering-tui | no | seis-topic-bundle-27 | pass | MIT | 1 | 0 |
| seis-topic-software-engineering-version-control | ./plugins/seis-topics/seis-topic-software-engineering-version-control | no | seis-topic-bundle-27 | pass | MIT | 1 | 0 |
| seis-topic-software-engineering-web-development | ./plugins/seis-topics/seis-topic-software-engineering-web-development | no | seis-topic-bundle-27 | pass | MIT | 1 | 0 |

## Blocking Findings

| plugin | id | path | detail |
| --- | --- | --- | --- |
| none | none | none | none |

## Hygiene Findings

| plugin | id | path | detail |
| --- | --- | --- | --- |
| none | none | none | none |

## Release Boundary

- Raw secret values stored: no
- External network access used: no
- Live provider access used: no
- Live SSH used: no

## Remaining Release Blockers

- Human approval for public preview, release, publish, push, merge, tag, deploy, live SSH, or provider credentials has not been recorded.
- External clean-runner or public package installation proof has not been recorded.

## Quality Gates

```bash
npm run check:seis-public-plugin-security-provenance-review
npm run check:seis-public-plugin-fresh-task-proof
npm run check:seis-public-plugin-fresh-task-reload-evidence
npm run check:seis-public-plugin-external-install-proof
npm run check:seis-topic-plugin-matrix
npm run check:seis-unified-plugin-suite
npm run check:seis-public-plugin-install-smoke:local:mcp
npm run check:seis-agent-plugin-integration
```

## Decision

NO-GO for public preview until human approval and external clean-runner or
public package installation proof are recorded.
