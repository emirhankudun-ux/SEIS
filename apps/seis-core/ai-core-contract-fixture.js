window.seisAiCoreContractFixture = {
  version: 1,
  id: "ai-core-command-center-foundation",
  status: "fixture-backed",
  sourceFixture: "packages/shared-types/fixtures/ai-core-command-center-foundation.json",
  sourceDocuments: [
    "docs/architecture/ai-core-app-shared-contracts.md",
    "roadmap/seis-ai-core-command-center-5-year-development-program.md",
    "docs/product/seis-ai-app.md",
    "docs/ai/seis-ai-core.md"
  ],
  stateVocabulary: [
    "ready",
    "draft",
    "planned",
    "blocked",
    "approval-needed",
    "degraded",
    "unknown",
    "running",
    "failed",
    "validated"
  ],
  llmExecutionModes: [
    "local-only",
    "local-preferred",
    "external-provider-allowed",
    "external-provider-redacted",
    "metadata-only",
    "offline",
    "disabled",
    "research-only"
  ],
  moduleMaturities: [
    "planned",
    "draft",
    "fixture-backed",
    "local-alpha",
    "provider-alpha",
    "beta",
    "stable",
    "research-only",
    "blocked"
  ],
  modelRoutes: [
    {
      id: "route-local-repo-review",
      taskType: "repository-review",
      dataClass: "repository",
      privacyMode: "local-only",
      providerProfile: "local-disabled-fixture",
      modelProfile: "none-fixture",
      promptVersionId: "prompt-repository-review-v0-1",
      approvalState: "not-required",
      blockedReason: "No live provider adapter is enabled in the foundation fixture.",
      evaluationProfile: "prompt-route-fixture",
      status: "planned",
      maturity: "fixture-backed",
      evidence: "docs/ai/model-router.md"
    },
    {
      id: "route-external-redacted-docs",
      taskType: "documentation-assistance",
      dataClass: "public",
      privacyMode: "external-provider-redacted",
      providerProfile: "provider-placeholder",
      modelProfile: "quality-balanced-placeholder",
      promptVersionId: "prompt-documentation-assistant-v0-1",
      approvalState: "approval-needed",
      blockedReason: "External provider use requires explicit approval and server-side credential handling.",
      evaluationProfile: "provider-redaction-fixture",
      status: "approval-needed",
      maturity: "draft",
      evidence: "docs/security/model-provider-data-policy.md"
    }
  ],
  promptVersions: [
    {
      id: "prompt-repository-review-v0-1",
      name: "Repository Review Assistant",
      version: "0.1",
      scope: "Read-only repository review with evidence links and no write actions.",
      status: "planned",
      maturity: "draft",
      regressionSuite: "repository-review-fixture",
      evidence: "docs/product/repository-assistant.md"
    },
    {
      id: "prompt-documentation-assistant-v0-1",
      name: "Documentation Assistant",
      version: "0.1",
      scope: "Documentation planning and source-of-truth alignment.",
      status: "planned",
      maturity: "draft",
      regressionSuite: "documentation-assistant-fixture",
      evidence: "docs/ai/prompt-engine.md"
    }
  ],
  agentTasks: [
    {
      id: "task-docs-foundation-review",
      agentRole: "Documentation Agent",
      intent: "Review AI Core and Command Center foundation docs for source alignment.",
      allowedActions: [
        "read official docs",
        "summarize gaps",
        "propose reviewable PR slices"
      ],
      forbiddenActions: [
        "enable provider routing",
        "write secrets",
        "claim model training"
      ],
      approvalState: "not-required",
      status: "planned",
      maturity: "fixture-backed",
      evidence: "docs/ai/agent-runtime.md"
    }
  ],
  approvalRequests: [
    {
      id: "approval-external-provider-route",
      requestType: "external-provider-routing",
      riskClass: "high",
      decisionState: "approval-needed",
      status: "approval-needed",
      evidence: "docs/ai/provider-routing-policy.md"
    }
  ],
  evaluationResults: [
    {
      id: "eval-shared-contract-fixture",
      targetType: "app-state",
      targetId: "ai-core-command-center-foundation",
      result: "pass",
      status: "validated",
      evidence: "scripts/check-ai-core-app-contracts.mjs"
    }
  ],
  auditEvents: [
    {
      id: "audit-fixture-created",
      actor: "codex",
      action: "created shared AI Core and Command Center contract fixture",
      redactionState: "metadata-only",
      status: "validated",
      evidence: "packages/shared-types/fixtures/ai-core-command-center-foundation.json"
    }
  ],
  repositoryFindings: [
    {
      id: "finding-shared-types-placeholder",
      repository: "SEIS",
      findingType: "shared-types-placeholder-promoted-to-fixture",
      severity: "info",
      status: "validated",
      evidence: "packages/shared-types/README.md"
    }
  ],
  documentationStatuses: [
    {
      id: "doc-shared-contracts",
      document: "docs/architecture/ai-core-app-shared-contracts.md",
      freshness: "current",
      sourceClass: "official",
      status: "validated",
      evidence: "docs/architecture/ai-core-app-shared-contracts.md"
    }
  ],
  securityFindings: [
    {
      id: "security-no-provider-secrets",
      category: "provider-secret-boundary",
      riskClass: "high",
      status: "validated",
      evidence: "docs/security/model-provider-data-policy.md"
    }
  ],
  roadmapItems: [
    {
      id: "roadmap-year-1-shared-contracts",
      horizon: "year-1",
      track: "AI Core and Command Center shared contracts",
      status: "validated",
      maturity: "fixture-backed",
      evidence: "roadmap/seis-ai-core-command-center-5-year-development-program.md"
    }
  ],
  aiSurfaces: [
    {
      id: "surface-ai-core-center",
      surface: "AI Core Center",
      allowedContext: [
        "official docs",
        "fixture data",
        "validation result metadata"
      ],
      forbiddenContext: [
        "provider API keys",
        "SSH private keys",
        "raw sensitive repository data without approval"
      ],
      approvalRequired: false,
      status: "planned",
      maturity: "fixture-backed",
      evidence: "docs/product/ai-core-center.md"
    }
  ],
  repositoryIntelligence: [
    {
      id: "repo-intel-official-docs",
      sourceClass: "official",
      privacyMode: "local-only",
      freshness: "current",
      status: "validated",
      evidence: "docs/ai/context-memory-boundary.md"
    }
  ],
  goalTrackingStates: [
    {
      id: "goal-five-year-development",
      goal: "Uzun sureli olarak gelistir 5 yil",
      progressState: "in-progress",
      completionEvidence: "partial",
      status: "running",
      evidence: "roadmap/seis-ai-core-command-center-5-year-development-program.md"
    }
  ]
};
