# @seis/shared-types

Status: Foundation contract package

This package holds the first shared AI Core and Command Center contract
artifacts. The current implementation is schema-backed fixture evidence, not a
runtime SDK and not a live provider integration.

## Contract Artifacts

- `schemas/ai-core-app-contract.schema.json` defines the shared object envelope,
  state vocabulary, execution modes, maturity values, evidence paths, and core
  object definitions.
- `fixtures/ai-core-command-center-foundation.json` provides the first
  fixture-backed contract bundle for Command Center AI Core views.
- `packages/model-router/fixtures/model-router-route-contracts.json` supplies the
  current route evidence projected into the shared fixture.
- `packages/agent-runtime/fixtures/agent-runtime-task-lifecycle.json` supplies
  the current task lifecycle and approval-state evidence projected into the
  shared fixture.
- `packages/tool-registry/fixtures/tool-registry-permissions.json` supplies the
  current tool/plugin permission and risk-class evidence projected into the
  shared fixture.
- `npm run check:ai-core-app-contracts` validates the schema and fixture without
  installing another runtime or provider SDK.

## Shared Objects

- `ModelRoute`
- `PromptVersion`
- `AgentTask`
- `ToolRegistryEntry`
- `ApprovalRequest`
- `EvaluationResult`
- `AuditEvent`
- `RepositoryFinding`
- `DocumentationStatus`
- `SecurityFinding`
- `RoadmapItem`
- `ModuleMaturity`
- `LlmExecutionMode`
- `AiSurface`
- `RepositoryIntelligence`
- `GoalTrackingState`

See `docs/architecture/ai-core-app-shared-contracts.md`.
