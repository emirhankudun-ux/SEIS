import assert from "node:assert/strict";
import { describe, it } from "node:test";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  buildReadOnlyRouteDecision,
  runReadOnlyRouterSmokeChecks,
  validateReadOnlyRouteDecision,
} from "../src/model/read-only-router.mjs";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

describe("SEIS provider-neutral read-only router", () => {
  it("selects the zero-key Local Demo without runtime authority", () => {
    const decision = buildReadOnlyRouteDecision({}, { root: packageRoot });

    assert.equal(decision.selectedProvider, "seis-local-demo");
    assert.equal(decision.providerState, "Local Demo");
    assert.equal(decision.routeEligible, false);
    assert.equal(decision.executionPerformed, false);
    assert.equal(decision.agentLane.permissionLevel, "plan-only");
    assert.deepEqual(validateReadOnlyRouteDecision(decision), { ok: true, failures: [] });
  });

  it("routes repo-local implementation metadata to the supervised Codex lane", () => {
    const decision = buildReadOnlyRouteDecision(
      { taskType: "repository-validation", capability: "validation", privacyMode: "local-only", localOnly: true },
      { root: packageRoot },
    );

    assert.equal(decision.selectedProvider, "codex-operator");
    assert.equal(decision.agentLane.id, "seis-code");
    assert.equal(decision.providerCallsPerformed, false);
  });

  it("keeps Missing Key distinct from Error and never silently selects it", () => {
    const decision = buildReadOnlyRouteDecision(
      { taskType: "architecture-review", capability: "architecture-review", privacyMode: "standard" },
      { root: packageRoot },
    );
    const missingKey = decision.providerCandidates.filter((candidate) => candidate.publicStatus === "Missing Key");
    const errors = decision.providerCandidates.filter((candidate) => candidate.publicStatus === "Error");

    assert.ok(missingKey.length > 0);
    assert.equal(errors.length, 0);
    assert.ok(missingKey.every((candidate) => candidate.available === false && candidate.compatible === false));
    assert.notEqual(decision.selectedProvider, missingKey[0].id);
  });

  it("blocks private Obsidian metadata from every provider route", () => {
    const decision = buildReadOnlyRouteDecision(
      { taskType: "private-obsidian-vault-review", capability: "personal notes", privacyMode: "review-gated" },
      { root: packageRoot },
    );

    assert.equal(decision.selectedProvider, "none");
    assert.equal(decision.providerState, "Disabled");
    assert.ok(decision.blockedReasons.some((reason) => reason.includes("private Obsidian")));
    assert.equal(decision.safetyBoundary.privateContentRead, false);
  });

  it("blocks 512B/frontier route requests without making an AGI claim", () => {
    const decision = buildReadOnlyRouteDecision(
      { taskType: "512B apex model route", capability: "frontier inference", privacyMode: "review-gated" },
      { root: packageRoot },
    );

    assert.equal(decision.selectedProvider, "none");
    assert.equal(decision.modelClaimBoundary.isAgi, false);
    assert.equal(decision.modelClaimBoundary.parameterCountBillion, null);
    assert.ok(decision.blockedReasons.some((reason) => reason.includes("512B")));
  });

  it("rejects prompt and credential-shaped input instead of logging it", () => {
    assert.throws(
      () => buildReadOnlyRouteDecision({ prompt: "private text" }, { root: packageRoot }),
      /forbidden/,
    );
    assert.throws(
      () => buildReadOnlyRouteDecision({ apiKey: "sk-example" }, { root: packageRoot }),
      /forbidden/,
    );
    assert.throws(
      () => buildReadOnlyRouteDecision({ capability: "ghp_123456789012345" }, { root: packageRoot }),
      /credential-like material/,
    );
    assert.throws(
      () => buildReadOnlyRouteDecision({ metadata: { note: "bearer abcdefghijklmnopqrstuvwxyz" } }, { root: packageRoot }),
      /credential-like material/,
    );
  });

  it("produces deterministic, secret-free decisions across all five SEIS lanes", () => {
    const inputs = [
      ["seis", "governance release review"],
      ["seis-cloud", "cloud preflight"],
      ["seis-code", "MCP test runtime"],
      ["seis-design", "accessible UI motion"],
      ["seis-data", "dataset provenance"],
    ];

    for (const [lane, capability] of inputs) {
      const first = buildReadOnlyRouteDecision({ taskType: lane, capability }, { root: packageRoot });
      const second = buildReadOnlyRouteDecision({ taskType: lane, capability }, { root: packageRoot });
      assert.equal(first.decisionHash, second.decisionHash);
      assert.equal(first.agentLane.id, lane);
      assert.equal(first.agentLane.executionPerformed, false);
      assert.equal(first.decisionIntegrity.noCredentialMaterialInDecision, true);
    }
  });

  it("passes the executable no-key smoke matrix", () => {
    const result = runReadOnlyRouterSmokeChecks(packageRoot);
    assert.equal(result.ok, true, JSON.stringify(result, null, 2));
    assert.equal(result.passed, result.total);
  });
});
