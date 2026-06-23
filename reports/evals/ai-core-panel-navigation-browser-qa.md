# AI Core Panel Navigation Browser QA

Status: passed

This deterministic local QA report exercises the SEIS Command Center AI Core panel in a browser-like JSDOM runtime. It verifies navigation, command palette routing, global search routing, Local Retrieval filtering, reset behavior, fixture-backed card counts, and safety non-claims. It does not use live provider routing, external retrieval, embeddings, persistent memory, GitHub writes, SSH, deployment, payment, infrastructure mutation, benchmark runs, or model training.

## Runtime

| Field | Value |
| --- | --- |
| App | apps/seis-core |
| Runner | JSDOM local browser-like DOM |
| Browser path | Browser plugin not used for this committed evidence artifact; JSDOM keeps CI/local validation deterministic. |
| Viewports | dom-default |
| Source fixture | packages/shared-types/fixtures/ai-core-command-center-foundation.json |

## Scenarios

| Scenario | Status | Observed |
| --- | --- | --- |
| dashboard-initial | passed | Dashboard is the initial active panel. |
| sidebar-ai-core-navigation | passed | Sidebar opens the AI Core panel. |
| ai-core-contract-card-counts | passed | Rendered AI Core cards match fixture counts. |
| retrieval-query-provider-keys | passed | Secret/provider-key lookup shows no local results and exposes the blocked no-content transcript. |
| retrieval-reset | passed | Reset clears retrieval filters and restores fixture card counts. |
| command-palette-ai-core | passed | Command palette opens AI Core. |
| global-search-ai-core | passed | Global search keeps AI Core active for the AI Core query. |
| goals-navigation-sanity | passed | Goals panel still opens and renders goal cards after AI Core interactions. |

## Fixture Counts

| Count | Value |
| --- | --- |
| modelRoutesExpected | 4 |
| modelRoutesRendered | 4 |
| promptVersionsExpected | 2 |
| promptVersionsRendered | 2 |
| agentTasksExpected | 6 |
| agentTasksRendered | 6 |
| approvalsExpected | 5 |
| approvalsRendered | 5 |
| retrievalResultCardsExpected | 3 |
| retrievalResultCardsRendered | 3 |
| noContentTranscriptsExpected | 2 |
| noContentTranscriptsRendered | 2 |
| evidenceExpected | 23 |
| evidenceRendered | 23 |

## Safety Non-Claims

| Flag | Value |
| --- | --- |
| providerCallsPerformed | false |
| externalProviderRouting | false |
| browserReceivesProviderKey | false |
| rawContentReturned | false |
| writesPersistentMemory | false |
| createsEmbeddingIndex | false |
| executesGitHubWrite | false |
| executesSsh | false |
| deploysInfrastructure | false |
| claimsModelTraining | false |
| claimsBenchmarkRun | false |
