import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const pkgRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const serverBin = path.join(pkgRoot, "bin", "seis-mcp.mjs");

/**
 * Drive the MCP server over its real stdio transport: spawn the bin, perform
 * the initialize handshake, then list tools/resources. Catches wiring
 * regressions (bad imports, schema errors) that unit tests cannot see.
 */
function rpcSession(requests, { timeoutMs = 15000 } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [serverBin], {
      cwd: pkgRoot,
      stdio: ["pipe", "pipe", "pipe"],
      env: { ...process.env, SEIS_REPO_ROOT: path.resolve(pkgRoot, "..", "..") },
    });

    const responses = new Map();
    const expectedIds = requests.filter((r) => r.id !== undefined).map((r) => r.id);
    let buffer = "";
    let stderr = "";

    const timer = setTimeout(() => {
      child.kill();
      reject(new Error(`MCP smoke timed out. stderr: ${stderr.slice(0, 500)}`));
    }, timeoutMs);

    child.stderr.on("data", (d) => { stderr += d; });
    child.stdout.on("data", (chunk) => {
      buffer += chunk;
      let nl;
      while ((nl = buffer.indexOf("\n")) !== -1) {
        const line = buffer.slice(0, nl).trim();
        buffer = buffer.slice(nl + 1);
        if (!line) continue;
        try {
          const msg = JSON.parse(line);
          if (msg.id !== undefined) responses.set(msg.id, msg);
        } catch {
          // Non-JSON output on stdout would corrupt the protocol — fail loudly.
          clearTimeout(timer);
          child.kill();
          reject(new Error(`Non-JSON line on MCP stdout: ${line.slice(0, 200)}`));
          return;
        }
        if (expectedIds.every((id) => responses.has(id))) {
          clearTimeout(timer);
          child.kill();
          resolve(responses);
          return;
        }
      }
    });

    child.on("error", (err) => { clearTimeout(timer); reject(err); });

    for (const req of requests) {
      child.stdin.write(JSON.stringify(req) + "\n");
    }
  });
}

describe("seis-mcp stdio smoke", () => {
  it("initializes and lists 35 tools, 3 prompts, 33 resources", async () => {
    const responses = await rpcSession([
      {
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: "2024-11-05",
          capabilities: {},
          clientInfo: { name: "seis-smoke", version: "0.0.0" },
        },
      },
      { jsonrpc: "2.0", method: "notifications/initialized" },
      { jsonrpc: "2.0", id: 2, method: "tools/list" },
      { jsonrpc: "2.0", id: 3, method: "resources/list" },
      { jsonrpc: "2.0", id: 4, method: "prompts/list" },
    ]);

    const init = responses.get(1);
    assert.equal(init.result.serverInfo.name, "seis");

    const tools = responses.get(2).result.tools.map((t) => t.name).sort();
    assert.deepEqual(tools, [
      "a11y_check",
      "drawings_catalog",
      "i18n_add_key",
      "i18n_get",
      "i18n_rename_key",
      "i18n_search",
      "i18n_status",
      "i18n_unreferenced",
      "run_all_checks",
      "security_audit",
      "seis_ai_core_model_scaling_status",
      "seis_ai_core_provider_status",
      "seis_ai_core_subagent_dry_run",
      "seis_ai_core_subagent_model",
      "seis_ai_core_subagent_review_ledger",
      "seis_ai_core_version_promotion_dry_run",
      "seis_ai_core_version_status",
      "seis_cloud_plan",
      "seis_cloud_status",
      "seis_code_plan",
      "seis_code_status",
      "seis_data_plan",
      "seis_data_status",
      "seis_design_plan",
      "seis_design_status",
      "seis_god_mode_status",
      "seis_hub_plan",
      "seis_hub_status",
      "seis_plugin_integration",
      "seo_audit",
      "site_config_get",
      "style_audit",
      "web_contract_check",
      "web_perf_audit",
      "workspace_status",
    ]);

    const resources = responses.get(3).result.resources.map((r) => r.uri).sort();
    assert.deepEqual(resources, [
      "seis://agent/god-mode-status.json",
      "seis://agent/plugin-integration.json",
      "seis://ai/150b-frontier-model-program.json",
      "seis://ai/20b-dataset-card-template.json",
      "seis://ai/20b-model-card-template.json",
      "seis://ai/512b-apex-model-program.json",
      "seis://ai/720b-agi-frontier-boundary.json",
      "seis://ai/agent-permission-matrix.json",
      "seis://ai/agent-role-schema.json",
      "seis://ai/agi-evaluation-protocol.json",
      "seis://ai/agi-public-readiness-evidence.json",
      "seis://ai/approval-fixture.json",
      "seis://ai/cancellation-fixture.json",
      "seis://ai/dry-run-task-queue.json",
      "seis://ai/execution-ledger-fixture.json",
      "seis://ai/full-usage-mcp-binding.json",
      "seis://ai/mcp-runtime-contract.json",
      "seis://ai/model-frontier-escalation-policy.json",
      "seis://ai/model-parameter-ladder.json",
      "seis://ai/model-scaling-hardware-profile.json",
      "seis://ai/provider-registry.json",
      "seis://ai/redaction-fixture.json",
      "seis://ai/sub-agent-5-year-plan-view.json",
      "seis://ai/sub-agent-5-year-plan.json",
      "seis://ai/subagent-operating-model.json",
      "seis://ai/subagent-review-ledger.json",
      "seis://ai/subagent-round-execution-evidence-ledger.json",
      "seis://ai/subagent-runtime-fixtures.json",
      "seis://ai/subagent-swarm-round-ledger.json",
      "seis://ai/version-promotion-gates.json",
      "seis://ai/version-registry.json",
      "seis://web/site-config.json",
      "seis://web/translations.json",
    ]);

    const prompts = responses.get(4).result.prompts.map((p) => p.name).sort();
    assert.deepEqual(prompts, ["add_i18n_key", "audit_and_fix", "review_locale"]);
  });

  it("renders the add_i18n_key prompt with arguments", async () => {
    const responses = await rpcSession([
      {
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: "2024-11-05",
          capabilities: {},
          clientInfo: { name: "seis-smoke", version: "0.0.0" },
        },
      },
      { jsonrpc: "2.0", method: "notifications/initialized" },
      {
        jsonrpc: "2.0",
        id: 2,
        method: "prompts/get",
        params: {
          name: "add_i18n_key",
          arguments: { key: "test.key", meaning: "a test string" },
        },
      },
    ]);

    const prompt = responses.get(2);
    assert.ok(!prompt.error, `prompts/get errored: ${JSON.stringify(prompt.error)}`);
    const text = prompt.result.messages[0].content.text;
    assert.ok(text.includes('"test.key"'));
    assert.ok(text.includes("a test string"));
    assert.ok(text.includes("i18n_add_key"));
  });

  it("reads the SEIS plugin integration resource through the protocol", async () => {
    const responses = await rpcSession([
      {
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: "2024-11-05",
          capabilities: {},
          clientInfo: { name: "seis-smoke", version: "0.0.0" },
        },
      },
      { jsonrpc: "2.0", method: "notifications/initialized" },
      {
        jsonrpc: "2.0",
        id: 2,
        method: "resources/read",
        params: {
          uri: "seis://agent/plugin-integration.json",
        },
      },
    ]);

    const resource = responses.get(2);
    assert.ok(!resource.error, `resources/read errored: ${JSON.stringify(resource.error)}`);
    const payload = JSON.parse(resource.result.contents[0].text);
    assert.equal(payload.id, "seis-agent-plugin-integration");
    assert.equal(payload.primaryInstallId, "seis-ai-agent@seis-repo");
  });

  it("reads the SEIS AI Core MCP runtime contract resource through the protocol", async () => {
    const responses = await rpcSession([
      {
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: "2024-11-05",
          capabilities: {},
          clientInfo: { name: "seis-smoke", version: "0.0.0" },
        },
      },
      { jsonrpc: "2.0", method: "notifications/initialized" },
      {
        jsonrpc: "2.0",
        id: 2,
        method: "resources/read",
        params: {
          uri: "seis://ai/mcp-runtime-contract.json",
        },
      },
    ]);

    const resource = responses.get(2);
    assert.ok(!resource.error, `resources/read errored: ${JSON.stringify(resource.error)}`);
    const payload = JSON.parse(resource.result.contents[0].text);
    assert.equal(payload.id, "seis-ai-core-mcp-runtime-contract");
    assert.equal(payload.toolCount, 35);
    assert.equal(payload.resourceCount, 33);
    assert.equal(payload.fullUsageMcpBindingResource, "seis://ai/full-usage-mcp-binding.json");
    assert.equal(payload.transport, "stdio JSON-RPC");
  });

  it("reads the SEIS full usage MCP binding resource through the protocol", async () => {
    const responses = await rpcSession([
      {
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: "2024-11-05",
          capabilities: {},
          clientInfo: { name: "seis-smoke", version: "0.0.0" },
        },
      },
      { jsonrpc: "2.0", method: "notifications/initialized" },
      {
        jsonrpc: "2.0",
        id: 2,
        method: "resources/read",
        params: {
          uri: "seis://ai/full-usage-mcp-binding.json",
        },
      },
    ]);

    const resource = responses.get(2);
    assert.ok(!resource.error, `resources/read errored: ${JSON.stringify(resource.error)}`);
    const payload = JSON.parse(resource.result.contents[0].text);
    assert.equal(payload.id, "seis-full-usage-mcp-binding");
    assert.equal(payload.status, "repo-owned-mcp-binding-active");
    assert.equal(payload.activeRepoOwnedBinding.serverId, "seis");
    assert.equal(payload.runtimeContract.resourceCount, 33);
  });

  it("calls the SEIS God Mode status tool through the protocol", async () => {
    const responses = await rpcSession([
      {
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: "2024-11-05",
          capabilities: {},
          clientInfo: { name: "seis-smoke", version: "0.0.0" },
        },
      },
      { jsonrpc: "2.0", method: "notifications/initialized" },
      {
        jsonrpc: "2.0",
        id: 2,
        method: "tools/call",
        params: {
          name: "seis_god_mode_status",
          arguments: {},
        },
      },
    ]);

    const response = responses.get(2);
    assert.ok(!response.error, `tools/call errored: ${JSON.stringify(response.error)}`);
    const payload = JSON.parse(response.result.content[0].text);
    assert.equal(payload.ok, true);
    assert.equal(payload.tool, "seis_god_mode_status");
    assert.equal(payload.runState.current, "pending-validation");
    assert.equal(payload.moduleCount, 5);
  });

  it("reads the SEIS AI Core provider registry resource through the protocol", async () => {
    const responses = await rpcSession([
      {
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: "2024-11-05",
          capabilities: {},
          clientInfo: { name: "seis-smoke", version: "0.0.0" },
        },
      },
      { jsonrpc: "2.0", method: "notifications/initialized" },
      {
        jsonrpc: "2.0",
        id: 2,
        method: "resources/read",
        params: {
          uri: "seis://ai/provider-registry.json",
        },
      },
    ]);

    const resource = responses.get(2);
    assert.ok(!resource.error, `resources/read errored: ${JSON.stringify(resource.error)}`);
    const payload = JSON.parse(resource.result.contents[0].text);
    assert.equal(payload.id, "seis-ai-core-provider-registry");
    assert.equal(payload.coreCredentialRequirement, "none");
    assert.ok(payload.publicStates.includes("Missing Key"));
  });

  it("reads the SEIS AI Core model scaling profile resource through the protocol", async () => {
    const responses = await rpcSession([
      {
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: "2024-11-05",
          capabilities: {},
          clientInfo: { name: "seis-smoke", version: "0.0.0" },
        },
      },
      { jsonrpc: "2.0", method: "notifications/initialized" },
      {
        jsonrpc: "2.0",
        id: 2,
        method: "resources/read",
        params: {
          uri: "seis://ai/model-scaling-hardware-profile.json",
        },
      },
    ]);

    const resource = responses.get(2);
    assert.ok(!resource.error, `resources/read errored: ${JSON.stringify(resource.error)}`);
    const payload = JSON.parse(resource.result.contents[0].text);
    assert.equal(payload.id, "seis-model-scaling-hardware-profile");
    assert.equal(payload.currentTarget.parameterClass, "20B");
    assert.equal(payload.currentTarget.minimumSystemRamGb, 16);
    assert.equal(payload.currentTarget.inferenceAvailable, false);
    assert.ok(payload.scaleLadder.some((entry) => entry.parameterClass === "70B"));
    assert.equal(payload.frontierTarget.parameterClass, "150B");
    assert.equal(payload.frontierTarget.inferenceAvailable, false);
    assert.ok(payload.scaleLadder.some((entry) => entry.parameterClass === "150B"));
    assert.equal(payload.apexTarget.parameterClass, "512B");
    assert.equal(payload.apexTarget.inferenceAvailable, false);
    assert.ok(payload.scaleLadder.some((entry) => entry.parameterClass === "512B"));
  });

  it("reads the SEIS AI Core model parameter ladder resource through the protocol", async () => {
    const responses = await rpcSession([
      {
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: "2024-11-05",
          capabilities: {},
          clientInfo: { name: "seis-smoke", version: "0.0.0" },
        },
      },
      { jsonrpc: "2.0", method: "notifications/initialized" },
      {
        jsonrpc: "2.0",
        id: 2,
        method: "resources/read",
        params: {
          uri: "seis://ai/model-parameter-ladder.json",
        },
      },
    ]);

    const resource = responses.get(2);
    assert.ok(!resource.error, `resources/read errored: ${JSON.stringify(resource.error)}`);
    const payload = JSON.parse(resource.result.contents[0].text);
    assert.equal(payload.id, "seis-model-parameter-ladder");
    assert.equal(payload.status, "planning-contract-not-runtime");
    assert.equal(payload.routeEligibleToday, false);
    assert.deepEqual(payload.promotionOrder, ["local-demo", "20B", "70B", "150B", "300B+", "512B", "520B", "highest-available-future"]);
    assert.ok(payload.targets.some((entry) => entry.parameterClass === "20B" && entry.minimumRamClass === "16GB+ RAM"));
    assert.ok(payload.targets.some((entry) => entry.parameterClass === "70B" && entry.status === "research-roadmap"));
    assert.ok(payload.targets.some((entry) => entry.parameterClass === "150B" && entry.status === "frontier-research-roadmap"));
    assert.ok(payload.targets.some((entry) => entry.parameterClass === "300B+" && entry.status === "not-scoped"));
    assert.ok(payload.targets.some((entry) => entry.parameterClass === "512B" && entry.status === "apex-program-plan-only"));
    assert.ok(payload.targets.some((entry) => entry.parameterClass === "520B" && entry.status === "next-frontier-boundary-plan-only"));
    assert.ok(payload.targets.some((entry) => entry.parameterClass === "highest-available-future" && entry.status === "not-scoped"));
    assert.ok(payload.targets.every((entry) => entry.trainingStatus === "not-started"));
    assert.ok(payload.targets.every((entry) => entry.routeEligibleToday === false));
    assert.ok(payload.targets.every((entry) => entry.runtimeAuthority === false));
  });

  it("reads the SEIS AI Core frontier escalation policy resource through the protocol", async () => {
    const responses = await rpcSession([
      {
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: "2024-11-05",
          capabilities: {},
          clientInfo: { name: "seis-smoke", version: "0.0.0" },
        },
      },
      { jsonrpc: "2.0", method: "notifications/initialized" },
      {
        jsonrpc: "2.0",
        id: 2,
        method: "resources/read",
        params: {
          uri: "seis://ai/model-frontier-escalation-policy.json",
        },
      },
    ]);

    const resource = responses.get(2);
    assert.ok(!resource.error, `resources/read errored: ${JSON.stringify(resource.error)}`);
    const payload = JSON.parse(resource.result.contents[0].text);
    assert.equal(payload.id, "seis-model-frontier-escalation-policy");
    assert.equal(payload.status, "policy-active-research-gated");
    assert.equal(payload.resourceUri, "seis://ai/model-frontier-escalation-policy.json");
    assert.equal(payload.routeEligibleToday, false);
    assert.ok(payload.decisionRules.some((rule) => rule.id === "no-skip-20b" && rule.enforcedStatus === "blocked"));
    assert.ok(payload.escalationStages.some((stage) => stage.id === "stage-3-150b-frontier" && stage.routeEligibleToday === false));
    assert.ok(payload.escalationStages.some((stage) => stage.id === "stage-4-512b-apex" && stage.routeEligibleToday === false));
    assert.ok(payload.escalationStages.filter((stage) => stage.parameterClass !== "demo-only").every((stage) => stage.allowedToday === false));
  });

  it("reads the SEIS AI Core 150B frontier model program resource through the protocol", async () => {
    const responses = await rpcSession([
      {
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: "2024-11-05",
          capabilities: {},
          clientInfo: { name: "seis-smoke", version: "0.0.0" },
        },
      },
      { jsonrpc: "2.0", method: "notifications/initialized" },
      {
        jsonrpc: "2.0",
        id: 2,
        method: "resources/read",
        params: {
          uri: "seis://ai/150b-frontier-model-program.json",
        },
      },
    ]);

    const resource = responses.get(2);
    assert.ok(!resource.error, `resources/read errored: ${JSON.stringify(resource.error)}`);
    const payload = JSON.parse(resource.result.contents[0].text);
    assert.equal(payload.id, "seis-150b-frontier-model-program");
    assert.equal(payload.status, "frontier-program-plan-only");
    assert.equal(payload.resourceUri, "seis://ai/150b-frontier-model-program.json");
    assert.equal(payload.target.parameterClass, "150B");
    assert.equal(payload.target.parameterCountBillion, 150);
    assert.equal(payload.routeEligibleToday, false);
    assert.equal(payload.runtimeAuthority, false);
    assert.equal(payload.trainingStatus, "not-started");
    assert.equal(payload.weightsAvailable, false);
    assert.equal(payload.inferenceAvailable, false);
    assert.equal(payload.benchmarkStatus, "not-run");
    assert.equal(payload.productionReady, false);
    assert.ok(payload.programStages.every((stage) => stage.routeEligibleToday === false));
  });

  it("reads the SEIS AI Core 512B apex model program resource through the protocol", async () => {
    const responses = await rpcSession([
      {
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: "2024-11-05",
          capabilities: {},
          clientInfo: { name: "seis-smoke", version: "0.0.0" },
        },
      },
      { jsonrpc: "2.0", method: "notifications/initialized" },
      {
        jsonrpc: "2.0",
        id: 2,
        method: "resources/read",
        params: {
          uri: "seis://ai/512b-apex-model-program.json",
        },
      },
    ]);

    const resource = responses.get(2);
    assert.ok(!resource.error, `resources/read errored: ${JSON.stringify(resource.error)}`);
    const payload = JSON.parse(resource.result.contents[0].text);
    assert.equal(payload.id, "seis-512b-apex-model-program");
    assert.equal(payload.status, "apex-program-plan-only");
    assert.equal(payload.resourceUri, "seis://ai/512b-apex-model-program.json");
    assert.equal(payload.target.parameterClass, "512B");
    assert.equal(payload.target.parameterCountBillion, 512);
    assert.equal(payload.routeEligibleToday, false);
    assert.equal(payload.runtimeAuthority, false);
    assert.equal(payload.trainingStatus, "not-started");
    assert.equal(payload.weightsAvailable, false);
    assert.equal(payload.inferenceAvailable, false);
    assert.equal(payload.benchmarkStatus, "not-run");
    assert.equal(payload.productionReady, false);
    assert.equal(payload.programStages.length, 7);
    assert.equal(payload.agentCouncil.leadAgents.length, 12);
    assert.equal(payload.sourceOfTruth.agiEvaluationProtocol, "content/development/seis-agi-evaluation-protocol.json");
    assert.equal(payload.agiReadinessDefinition.resourceUri, "seis://ai/agi-evaluation-protocol.json");
    assert.ok(payload.forbiddenClaimRules.includes("no-trained-512b-weights-claim"));
    assert.ok(payload.forbiddenClaimRules.includes("no-installed-ai-presence-as-training-evidence-claim"));
    assert.ok(payload.programStages.every((stage) => stage.routeEligibleToday === false));
  });

  it("reads the SEIS AI Core 720B AGI frontier boundary resource through the protocol", async () => {
    const responses = await rpcSession([
      {
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: "2024-11-05",
          capabilities: {},
          clientInfo: { name: "seis-smoke", version: "0.0.0" },
        },
      },
      { jsonrpc: "2.0", method: "notifications/initialized" },
      {
        jsonrpc: "2.0",
        id: 2,
        method: "resources/read",
        params: {
          uri: "seis://ai/720b-agi-frontier-boundary.json",
        },
      },
    ]);

    const resource = responses.get(2);
    assert.ok(!resource.error, `resources/read errored: ${JSON.stringify(resource.error)}`);
    const payload = JSON.parse(resource.result.contents[0].text);
    assert.equal(payload.id, "seis-720b-agi-frontier-boundary");
    assert.equal(payload.status, "agi-frontier-boundary-plan-only");
    assert.equal(payload.resourceUri, "seis://ai/720b-agi-frontier-boundary.json");
    assert.equal(payload.target.parameterClass, "720B");
    assert.equal(payload.target.parameterCountBillion, 720);
    assert.equal(payload.routeEligibleToday, false);
    assert.equal(payload.runtimeAuthority, false);
    assert.equal(payload.trainingStatus, "not-started");
    assert.equal(payload.weightsAvailable, false);
    assert.equal(payload.inferenceAvailable, false);
    assert.equal(payload.benchmarkStatus, "not-run");
    assert.equal(payload.productionReady, false);
    assert.equal(payload.agiClaimAllowed, false);
    assert.deepEqual(payload.supervisedCadence.roundWindows, [15, 30]);
    assert.equal(payload.mcpBoundary.defaultPermission, "read-only-or-plan-only");
    assert.ok(payload.forbiddenClaimRules.includes("no-trained-720b-weights-claim"));
    assert.ok(payload.forbiddenClaimRules.includes("no-720b-agi-capability-claim"));
  });

  it("reads the SEIS AI Core sub-agent swarm round ledger resource through the protocol", async () => {
    const responses = await rpcSession([
      {
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: "2024-11-05",
          capabilities: {},
          clientInfo: { name: "seis-smoke", version: "0.0.0" },
        },
      },
      { jsonrpc: "2.0", method: "notifications/initialized" },
      {
        jsonrpc: "2.0",
        id: 2,
        method: "resources/read",
        params: {
          uri: "seis://ai/subagent-swarm-round-ledger.json",
        },
      },
    ]);

    const resource = responses.get(2);
    assert.ok(!resource.error, `resources/read errored: ${JSON.stringify(resource.error)}`);
    const payload = JSON.parse(resource.result.contents[0].text);
    assert.equal(payload.id, "seis-ai-core-subagent-swarm-round-ledger");
    assert.equal(payload.status, "plan-only-supervised-ledger");
    assert.equal(payload.resourceUri, "seis://ai/subagent-swarm-round-ledger.json");
    assert.equal(payload.ownerObjectiveMap.defaultRoundWindow, 15);
    assert.equal(payload.ownerObjectiveMap.expandedRoundWindow, 30);
    assert.equal(payload.ownerObjectiveMap.expandedRoundWindowRequiresOwnerApproval, true);
    assert.equal(payload.runtimeBoundary.continuousBackgroundRuntime, "not-authorized");
    assert.equal(payload.runtimeBoundary.credentialAccess, "forbidden");
    assert.equal(payload.runtimeBoundary.sshExecution, "forbidden");
    assert.equal(payload.runtimeBoundary.cloudProvisioning, "forbidden");
    assert.equal(payload.runtimeBoundary.modelTraining, "forbidden");
    assert.equal(payload.runtimeBoundary.agiClaimAllowed, false);
    assert.equal(payload.runtimeBoundary.routeEligibleToday, false);
    assert.equal(payload.roundAssignments.length, 15);
    assert.ok(payload.forbiddenClaims.includes("SEIS has completed the 720B AGI target."));
  });

  it("reads the SEIS AI Core sub-agent round execution evidence ledger resource through the protocol", async () => {
    const responses = await rpcSession([
      {
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: "2024-11-05",
          capabilities: {},
          clientInfo: { name: "seis-smoke", version: "0.0.0" },
        },
      },
      { jsonrpc: "2.0", method: "notifications/initialized" },
      {
        jsonrpc: "2.0",
        id: 2,
        method: "resources/read",
        params: {
          uri: "seis://ai/subagent-round-execution-evidence-ledger.json",
        },
      },
    ]);

    const resource = responses.get(2);
    assert.ok(!resource.error, `resources/read errored: ${JSON.stringify(resource.error)}`);
    const payload = JSON.parse(resource.result.contents[0].text);
    assert.equal(payload.id, "seis-ai-core-subagent-round-execution-evidence-ledger");
    assert.equal(payload.status, "repo-local-supervised-closeout-evidence");
    assert.equal(payload.resourceUri, "seis://ai/subagent-round-execution-evidence-ledger.json");
    assert.equal(payload.runtimeBoundary.currentLevel, "evidence-ledger-only");
    assert.equal(payload.runtimeBoundary.backgroundAutomation, "disabled");
    assert.equal(payload.runtimeBoundary.continuousBackgroundRuntime, "not-authorized");
    assert.equal(payload.runtimeBoundary.credentialAccessPerformed, false);
    assert.equal(payload.runtimeBoundary.sshExecutionPerformed, false);
    assert.equal(payload.runtimeBoundary.deploymentPerformed, false);
    assert.equal(payload.runtimeBoundary.githubMutationPerformed, false);
    assert.equal(payload.runtimeBoundary.providerCallPerformed, false);
    assert.equal(payload.runtimeBoundary.modelTrainingPerformed, false);
    assert.equal(payload.runtimeBoundary.agiClaimAllowed, false);
    assert.equal(payload.runtimeBoundary.routeEligibleToday, false);
    assert.equal(payload.roundWindowState.defaultRoundWindow, 15);
    assert.equal(payload.roundWindowState.expandedRoundWindow, 30);
    assert.equal(payload.roundWindowState.expandedRoundWindowRequiresOwnerApproval, true);
    assert.ok(payload.roundWindowState.recordedCloseoutCount >= 5);
    assert.equal(payload.closeoutRecords.length, payload.roundWindowState.recordedCloseoutCount);
    assert.equal(payload.evidenceSummary.completionClaimAllowed, false);
    assert.equal(payload.evidenceSummary.continuousRuntimeClaimAllowed, false);
    assert.equal(payload.evidenceSummary.agiClaimAllowed, false);
    assert.ok(payload.forbiddenClaims.includes("SEIS has completed a real uninterrupted five-year autonomous run."));
    assert.ok(payload.forbiddenClaims.includes("SEIS has achieved 720B AGI."));
  });

  it("reads the SEIS AI Core AGI evaluation protocol resource through the protocol", async () => {
    const responses = await rpcSession([
      {
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: "2024-11-05",
          capabilities: {},
          clientInfo: { name: "seis-smoke", version: "0.0.0" },
        },
      },
      { jsonrpc: "2.0", method: "notifications/initialized" },
      {
        jsonrpc: "2.0",
        id: 2,
        method: "resources/read",
        params: {
          uri: "seis://ai/agi-evaluation-protocol.json",
        },
      },
    ]);

    const resource = responses.get(2);
    assert.ok(!resource.error, `resources/read errored: ${JSON.stringify(resource.error)}`);
    const payload = JSON.parse(resource.result.contents[0].text);
    assert.equal(payload.id, "seis-agi-evaluation-protocol");
    assert.equal(payload.status, "protocol-draft-not-run");
    assert.equal(payload.resourceUri, "seis://ai/agi-evaluation-protocol.json");
    assert.equal(payload.agiClaimAllowed, false);
    assert.equal(payload.evaluationRunStatus, "not-run");
    assert.equal(payload.routeEligibleToday, false);
    assert.equal(payload.runtimeAuthority, false);
    assert.ok(payload.evaluationDimensions.length >= 8);
    assert.ok(payload.negativeControls.includes("parameter count alone is not AGI evidence"));
    assert.ok(payload.forbiddenClaims.includes("SEIS has achieved real AGI."));
  });

  it("reads the SEIS AI Core AGI public readiness evidence resource through the protocol", async () => {
    const responses = await rpcSession([
      {
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: "2024-11-05",
          capabilities: {},
          clientInfo: { name: "seis-smoke", version: "0.0.0" },
        },
      },
      { jsonrpc: "2.0", method: "notifications/initialized" },
      {
        jsonrpc: "2.0",
        id: 2,
        method: "resources/read",
        params: {
          uri: "seis://ai/agi-public-readiness-evidence.json",
        },
      },
    ]);

    const resource = responses.get(2);
    assert.ok(!resource.error, `resources/read errored: ${JSON.stringify(resource.error)}`);
    const payload = JSON.parse(resource.result.contents[0].text);
    assert.equal(payload.id, "seis-agi-public-readiness-evidence");
    assert.equal(payload.status, "blocked-missing-real-agi-evidence");
    assert.equal(payload.resourceUri, "seis://ai/agi-public-readiness-evidence.json");
    assert.equal(payload.routeEligibleToday, false);
    assert.equal(payload.runtimeAuthority, false);
    assert.equal(payload.agiClaimAllowed, false);
    assert.equal(payload.publicReadyAsAgi, false);
    assert.equal(payload.publicReadyAsLocalDemo, true);
    assert.equal(payload.readinessSummary.acceptedClaimEvidenceCount, 0);
    assert.ok(payload.minimumClaimEvidenceMatrix.every((item) => item.claimAllowedIfMissing === false));
  });

  it("reads the SEIS AI Core 20B evidence card template resources through the protocol", async () => {
    const responses = await rpcSession([
      {
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: "2024-11-05",
          capabilities: {},
          clientInfo: { name: "seis-smoke", version: "0.0.0" },
        },
      },
      { jsonrpc: "2.0", method: "notifications/initialized" },
      {
        jsonrpc: "2.0",
        id: 2,
        method: "resources/read",
        params: {
          uri: "seis://ai/20b-model-card-template.json",
        },
      },
      {
        jsonrpc: "2.0",
        id: 3,
        method: "resources/read",
        params: {
          uri: "seis://ai/20b-dataset-card-template.json",
        },
      },
    ]);

    const modelResource = responses.get(2);
    const datasetResource = responses.get(3);
    assert.ok(!modelResource.error, `model card resource errored: ${JSON.stringify(modelResource.error)}`);
    assert.ok(!datasetResource.error, `dataset card resource errored: ${JSON.stringify(datasetResource.error)}`);
    const modelCard = JSON.parse(modelResource.result.contents[0].text);
    const datasetCard = JSON.parse(datasetResource.result.contents[0].text);
    assert.equal(modelCard.id, "seis-20b-model-card-template");
    assert.equal(modelCard.status, "template-not-filled");
    assert.equal(modelCard.routeEligibleToday, false);
    assert.equal(modelCard.weightsAvailable, false);
    assert.equal(datasetCard.id, "seis-20b-dataset-card-template");
    assert.equal(datasetCard.status, "template-not-filled");
    assert.equal(datasetCard.datasetDownloadAuthorized, false);
    assert.equal(datasetCard.trainingAuthorized, false);
    assert.equal(datasetCard.routeEligibleToday, false);
  });

  it("calls run_all_checks through the protocol", async () => {
    const responses = await rpcSession([
      {
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: "2024-11-05",
          capabilities: {},
          clientInfo: { name: "seis-smoke", version: "0.0.0" },
        },
      },
      { jsonrpc: "2.0", method: "notifications/initialized" },
      { jsonrpc: "2.0", id: 2, method: "tools/call", params: { name: "run_all_checks", arguments: {} } },
    ]);

    const call = responses.get(2);
    assert.ok(!call.error, `tools/call errored: ${JSON.stringify(call.error)}`);
    const payload = JSON.parse(call.result.content[0].text);
    assert.equal(typeof payload.ok, "boolean");
    assert.ok(payload.i18n);
    assert.ok(payload.seo);
    assert.ok(payload.contract);
    assert.ok(payload.drawings);
    assert.ok(payload.perf);
    assert.ok(payload.a11y);
    assert.ok(payload.security);
  });

  it("calls a personal SEIS lane plan tool through the protocol", async () => {
    const responses = await rpcSession([
      {
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: "2024-11-05",
          capabilities: {},
          clientInfo: { name: "seis-smoke", version: "0.0.0" },
        },
      },
      { jsonrpc: "2.0", method: "notifications/initialized" },
      {
        jsonrpc: "2.0",
        id: 2,
        method: "tools/call",
        params: {
          name: "seis_cloud_plan",
          arguments: { request: "prepare cloud readiness without deployment" },
        },
      },
    ]);

    const call = responses.get(2);
    assert.ok(!call.error, `tools/call errored: ${JSON.stringify(call.error)}`);
    const payload = JSON.parse(call.result.content[0].text);
    assert.equal(payload.ok, true);
    assert.equal(payload.laneId, "seis-cloud");
    assert.ok(payload.approvalBoundary.includes("explicit human approval"));
  });

  it("calls the SEIS AI Core provider status tool through the protocol", async () => {
    const responses = await rpcSession([
      {
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: "2024-11-05",
          capabilities: {},
          clientInfo: { name: "seis-smoke", version: "0.0.0" },
        },
      },
      { jsonrpc: "2.0", method: "notifications/initialized" },
      {
        jsonrpc: "2.0",
        id: 2,
        method: "tools/call",
        params: {
          name: "seis_ai_core_provider_status",
          arguments: {},
        },
      },
    ]);

    const call = responses.get(2);
    assert.ok(!call.error, `tools/call errored: ${JSON.stringify(call.error)}`);
    const payload = JSON.parse(call.result.content[0].text);
    assert.equal(payload.ok, true);
    assert.equal(payload.id, "seis-ai-core-provider-registry");
    assert.equal(payload.coreCredentialRequirement, "none");
    assert.equal(payload.providerCount, 7);
    assert.ok(payload.providers.some((provider) => provider.id === "seis-local-demo" && provider.routingEligible === true));
  });

  it("calls the SEIS AI Core model scaling status tool through the protocol", async () => {
    const responses = await rpcSession([
      {
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: "2024-11-05",
          capabilities: {},
          clientInfo: { name: "seis-smoke", version: "0.0.0" },
        },
      },
      { jsonrpc: "2.0", method: "notifications/initialized" },
      {
        jsonrpc: "2.0",
        id: 2,
        method: "tools/call",
        params: {
          name: "seis_ai_core_model_scaling_status",
          arguments: {},
        },
      },
    ]);

    const call = responses.get(2);
    assert.ok(!call.error, `tools/call errored: ${JSON.stringify(call.error)}`);
    const payload = JSON.parse(call.result.content[0].text);
    assert.equal(payload.ok, true);
    assert.equal(payload.id, "seis-model-scaling-hardware-profile");
    assert.equal(payload.coreCredentialRequirement, "none");
    assert.equal(payload.currentTarget.parameterClass, "20B");
    assert.equal(payload.currentTarget.minimumSystemRamGb, 16);
    assert.equal(payload.currentTarget.weightsAvailable, false);
    assert.equal(payload.currentTarget.inferenceAvailable, false);
    assert.equal(payload.currentTarget.runtimeAuthority, false);
    assert.equal(payload.benchmarkManifestPath, "reports/seis-model-scaling/20b-16gb-memory-benchmark.json");
    assert.equal(payload.benchmarkDryRunPath, "reports/seis-model-scaling/20b-benchmark-dry-run.json");
    assert.equal(payload.localHardwarePreflightCheckPath, "scripts/check-seis-model-local-hardware-preflight.mjs");
    assert.equal(payload.benchmarkEvidence.sourceHealth.benchmarkManifest.ok, true);
    assert.equal(payload.benchmarkEvidence.sourceHealth.benchmarkManifest.status, "ready");
    assert.equal(payload.benchmarkEvidence.sourceHealth.benchmarkDryRun.ok, true);
    assert.equal(payload.benchmarkEvidence.sourceHealth.benchmarkDryRun.status, "ready");
    assert.equal(payload.benchmarkEvidence.manifestStatus, "template-not-measured");
    assert.equal(payload.benchmarkEvidence.compatibilityClaim, "not-verified");
    assert.equal(payload.benchmarkEvidence.benchmarkEvidenceAvailable, false);
    assert.equal(payload.benchmarkEvidence.routeEligibleToday, false);
    assert.equal(payload.benchmarkEvidence.runtimeAuthority, false);
    assert.equal(payload.benchmarkEvidence.dryRunStatus, "dry-run-not-measured");
    assert.equal(payload.benchmarkEvidence.canRequestRealBenchmarkToday, false);
    assert.equal(payload.benchmarkEvidence.measuredBenchmark, false);
    assert.equal(payload.benchmarkEvidence.modelCompatibilityVerified, false);
    assert.equal(payload.benchmarkEvidence.sourceHealth.benchmarkManifest.ok, true);
    assert.equal(payload.benchmarkEvidence.sourceHealth.benchmarkManifest.status, "ready");
    assert.equal(payload.benchmarkEvidence.sourceHealth.benchmarkManifest.path, "reports/seis-model-scaling/20b-16gb-memory-benchmark.json");
    assert.equal(payload.benchmarkEvidence.sourceHealth.benchmarkDryRun.ok, true);
    assert.equal(payload.benchmarkEvidence.sourceHealth.benchmarkDryRun.status, "ready");
    assert.equal(payload.benchmarkEvidence.sourceHealth.benchmarkDryRun.path, "reports/seis-model-scaling/20b-benchmark-dry-run.json");
    assert.equal(payload.parameterLadderPath, "content/development/seis-model-parameter-ladder.json");
    assert.equal(payload.parameterLadder.id, "seis-model-parameter-ladder");
    assert.equal(payload.parameterLadder.resourceUri, "seis://ai/model-parameter-ladder.json");
    assert.equal(payload.parameterLadder.targetCount, 7);
    assert.equal(payload.parameterLadder.routeEligibleToday, false);
    assert.ok(payload.parameterLadder.targets.some((entry) => entry.parameterClass === "20B" && entry.minimumRamClass === "16GB+ RAM"));
    assert.ok(payload.parameterLadder.targets.some((entry) => entry.parameterClass === "300B+" && entry.status === "not-scoped"));
    assert.ok(payload.parameterLadder.targets.some((entry) => entry.parameterClass === "512B" && entry.status === "apex-program-plan-only"));
    assert.ok(payload.parameterLadder.targets.some((entry) => entry.parameterClass === "520B" && entry.status === "next-frontier-boundary-plan-only"));
    assert.ok(payload.parameterLadder.targets.some((entry) => entry.parameterClass === "highest-available-future" && entry.status === "not-scoped"));
    assert.equal(payload.frontierEscalationPolicyPath, "content/development/seis-model-frontier-escalation-policy.json");
    assert.equal(payload.frontierEscalationPolicy.id, "seis-model-frontier-escalation-policy");
    assert.equal(payload.frontierEscalationPolicy.resourceUri, "seis://ai/model-frontier-escalation-policy.json");
    assert.equal(payload.frontierEscalationPolicy.routeEligibleToday, false);
    assert.ok(payload.frontierEscalationPolicy.decisionRuleIds.includes("no-skip-20b"));
    assert.ok(payload.frontierEscalationPolicy.escalationStages.some((entry) => entry.parameterClass === "150B" && entry.routeEligibleToday === false));
    assert.ok(payload.frontierEscalationPolicy.escalationStages.some((entry) => entry.parameterClass === "512B" && entry.routeEligibleToday === false));
    assert.equal(payload.frontierModelProgramPath, "content/development/seis-150b-frontier-model-program.json");
    assert.equal(payload.frontierModelProgram.id, "seis-150b-frontier-model-program");
    assert.equal(payload.frontierModelProgram.resourceUri, "seis://ai/150b-frontier-model-program.json");
    assert.equal(payload.frontierModelProgram.trainingStatus, "not-started");
    assert.equal(payload.frontierModelProgram.weightsAvailable, false);
    assert.equal(payload.frontierModelProgram.inferenceAvailable, false);
    assert.equal(payload.frontierModelProgram.benchmarkStatus, "not-run");
    assert.equal(payload.frontierModelProgram.stageCount, 6);
    assert.equal(payload.apexModelProgramPath, "content/development/seis-512b-apex-model-program.json");
    assert.equal(payload.apexModelProgram.id, "seis-512b-apex-model-program");
    assert.equal(payload.apexModelProgram.resourceUri, "seis://ai/512b-apex-model-program.json");
    assert.equal(payload.apexModelProgram.trainingStatus, "not-started");
    assert.equal(payload.apexModelProgram.weightsAvailable, false);
    assert.equal(payload.apexModelProgram.inferenceAvailable, false);
    assert.equal(payload.apexModelProgram.benchmarkStatus, "not-run");
    assert.equal(payload.apexModelProgram.stageCount, 7);
    assert.equal(payload.agi720bFrontierBoundaryPath, "content/development/seis-720b-agi-frontier-boundary.json");
    assert.equal(payload.agi720bFrontierBoundary.id, "seis-720b-agi-frontier-boundary");
    assert.equal(payload.agi720bFrontierBoundary.resourceUri, "seis://ai/720b-agi-frontier-boundary.json");
    assert.equal(payload.agi720bFrontierBoundary.parameterClass, "720B");
    assert.equal(payload.agi720bFrontierBoundary.routeEligibleToday, false);
    assert.equal(payload.agi720bFrontierBoundary.runtimeAuthority, false);
    assert.equal(payload.agi720bFrontierBoundary.agiClaimAllowed, false);
    assert.deepEqual(payload.agi720bFrontierBoundary.roundWindows, [15, 30]);
    assert.equal(payload.agi720bFrontierBoundary.mcpDefaultPermission, "read-only-or-plan-only");
    assert.equal(payload.modelCardTemplatePath, "content/development/seis-20b-model-card-template.json");
    assert.equal(payload.datasetCardTemplatePath, "content/development/seis-20b-dataset-card-template.json");
    assert.equal(payload.evidenceTemplates.modelCard.status, "template-not-filled");
    assert.equal(payload.evidenceTemplates.modelCard.routeEligibleToday, false);
    assert.equal(payload.evidenceTemplates.datasetCard.status, "template-not-filled");
    assert.equal(payload.evidenceTemplates.datasetCard.datasetDownloadAuthorized, false);
    assert.equal(payload.evidenceTemplates.datasetCard.trainingAuthorized, false);
    assert.equal(payload.frontierTarget.parameterClass, "150B");
    assert.equal(payload.frontierTarget.weightsAvailable, false);
    assert.equal(payload.frontierTarget.inferenceAvailable, false);
    assert.equal(payload.frontierTarget.runtimeAuthority, false);
    assert.equal(payload.apexTarget.parameterClass, "512B");
    assert.equal(payload.apexTarget.weightsAvailable, false);
    assert.equal(payload.apexTarget.inferenceAvailable, false);
    assert.equal(payload.apexTarget.runtimeAuthority, false);
    assert.ok(payload.scaleLadder.some((entry) => entry.parameterClass === "70B" && entry.status === "research-roadmap"));
    assert.ok(payload.scaleLadder.some((entry) => entry.parameterClass === "150B" && entry.status === "frontier-research-roadmap"));
    assert.ok(payload.scaleLadder.some((entry) => entry.parameterClass === "512B" && entry.status === "apex-program-plan-only"));
  });

  it("calls the SEIS AI Core sub-agent model tool through the protocol", async () => {
    const responses = await rpcSession([
      {
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: "2024-11-05",
          capabilities: {},
          clientInfo: { name: "seis-smoke", version: "0.0.0" },
        },
      },
      { jsonrpc: "2.0", method: "notifications/initialized" },
      {
        jsonrpc: "2.0",
        id: 2,
        method: "tools/call",
        params: {
          name: "seis_ai_core_subagent_model",
          arguments: {},
        },
      },
    ]);

    const call = responses.get(2);
    assert.ok(!call.error, `tools/call errored: ${JSON.stringify(call.error)}`);
    const payload = JSON.parse(call.result.content[0].text);
    assert.equal(payload.ok, true);
    assert.equal(payload.runtimeBoundary.currentLevel, "status-and-plan-only");
    assert.equal(payload.runtimeFixtures.versionRegistry.id, "seis-ai-core-version-registry");
    assert.equal(payload.runtimeFixtures.reviewLedger.id, "seis-ai-core-subagent-review-ledger");
    assert.equal(payload.runtimeFixtures.swarmRoundLedger.id, "seis-ai-core-subagent-swarm-round-ledger");
    assert.equal(payload.runtimeFixtures.swarmRoundLedger.defaultRoundWindow, 15);
    assert.equal(payload.runtimeFixtures.swarmRoundLedger.expandedRoundWindow, 30);
    assert.equal(payload.runtimeFixtures.swarmRoundLedger.roundAssignmentCount, 15);
    assert.equal(payload.runtimeFixtures.swarmRoundLedger.continuousBackgroundRuntime, "not-authorized");
    assert.equal(payload.runtimeFixtures.swarmRoundLedger.agiClaimAllowed, false);
    assert.equal(
      payload.runtimeFixtures.roundExecutionEvidenceLedger.id,
      "seis-ai-core-subagent-round-execution-evidence-ledger"
    );
    assert.equal(payload.runtimeFixtures.roundExecutionEvidenceLedger.currentLevel, "evidence-ledger-only");
    assert.ok(payload.runtimeFixtures.roundExecutionEvidenceLedger.recordedCloseoutCount >= 5);
    assert.equal(
      payload.runtimeFixtures.roundExecutionEvidenceLedger.recordCount,
      payload.runtimeFixtures.roundExecutionEvidenceLedger.recordedCloseoutCount
    );
    assert.equal(payload.runtimeFixtures.roundExecutionEvidenceLedger.credentialAccessPerformed, false);
    assert.equal(payload.runtimeFixtures.roundExecutionEvidenceLedger.providerCallPerformed, false);
    assert.equal(payload.runtimeFixtures.roundExecutionEvidenceLedger.modelTrainingPerformed, false);
    assert.equal(payload.runtimeFixtures.roundExecutionEvidenceLedger.completionClaimAllowed, false);
    assert.equal(payload.runtimeFixtures.roundExecutionEvidenceLedger.continuousRuntimeClaimAllowed, false);
    assert.equal(payload.runtimeFixtures.roundExecutionEvidenceLedger.agiClaimAllowed, false);
    assert.equal(payload.runtimeFixtures.runtimeFixturePack.id, "seis-ai-core-subagent-runtime-fixtures");
    assert.equal(payload.runtimeFixtures.dryRunTaskQueue.dryRunOnly, true);
    assert.equal(payload.runtimeFixtures.approvalFixture.blanketApprovalAllowed, false);
    assert.equal(payload.longHorizonPlan.id, "sub-agent-5-year-plan");
  });

  it("calls the SEIS AI Core version status tool through the protocol", async () => {
    const responses = await rpcSession([
      {
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: "2024-11-05",
          capabilities: {},
          clientInfo: { name: "seis-smoke", version: "0.0.0" },
        },
      },
      { jsonrpc: "2.0", method: "notifications/initialized" },
      {
        jsonrpc: "2.0",
        id: 2,
        method: "tools/call",
        params: {
          name: "seis_ai_core_version_status",
          arguments: {},
        },
      },
    ]);

    const call = responses.get(2);
    assert.ok(!call.error, `tools/call errored: ${JSON.stringify(call.error)}`);
    const payload = JSON.parse(call.result.content[0].text);
    assert.equal(payload.ok, true);
    assert.equal(payload.id, "seis-ai-core-version-registry");
    assert.equal(payload.currentVersion.id, "seis-ai-core-v0.1");
    assert.equal(payload.runtimeBoundary.currentLevel, "status-and-plan-only");
    assert.equal(payload.truthBoundaries.isTrainedModel, false);
  });

  it("calls the SEIS AI Core version promotion dry-run tool through the protocol", async () => {
    const responses = await rpcSession([
      {
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: "2024-11-05",
          capabilities: {},
          clientInfo: { name: "seis-smoke", version: "0.0.0" },
        },
      },
      { jsonrpc: "2.0", method: "notifications/initialized" },
      {
        jsonrpc: "2.0",
        id: 2,
        method: "tools/call",
        params: {
          name: "seis_ai_core_version_promotion_dry_run",
          arguments: { versionTarget: "v0.1-foundation" },
        },
      },
    ]);

    const call = responses.get(2);
    assert.ok(!call.error, `tools/call errored: ${JSON.stringify(call.error)}`);
    const payload = JSON.parse(call.result.content[0].text);
    assert.equal(payload.ok, true);
    assert.equal(payload.versionTarget, "v0.1-foundation");
    assert.equal(payload.dryRunDecision, "eligible-for-internal-review");
    assert.equal(payload.releasePromotionAllowed, false);
    assert.equal(payload.realExecutionBlocked, true);
    assert.equal(payload.externalMutationPerformed, false);
  });

  it("calls the SEIS AI Core dry-run evaluator through the protocol", async () => {
    const responses = await rpcSession([
      {
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: "2024-11-05",
          capabilities: {},
          clientInfo: { name: "seis-smoke", version: "0.0.0" },
        },
      },
      { jsonrpc: "2.0", method: "notifications/initialized" },
      {
        jsonrpc: "2.0",
        id: 2,
        method: "tools/call",
        params: {
          name: "seis_ai_core_subagent_dry_run",
          arguments: {
            taskId: "dry-run-seis-code-patch-plan",
            signal: "operator-cancel",
          },
        },
      },
    ]);

    const call = responses.get(2);
    assert.ok(!call.error, `tools/call errored: ${JSON.stringify(call.error)}`);
    const payload = JSON.parse(call.result.content[0].text);
    assert.equal(payload.ok, true);
    assert.equal(payload.decision, "cancelled");
    assert.equal(payload.dryRunOnly, true);
    assert.equal(payload.realExecutionBlocked, true);
    assert.equal(payload.externalMutationPerformed, false);
  });

  it("calls the SEIS AI Core review ledger tool through the protocol", async () => {
    const responses = await rpcSession([
      {
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: "2024-11-05",
          capabilities: {},
          clientInfo: { name: "seis-smoke", version: "0.0.0" },
        },
      },
      { jsonrpc: "2.0", method: "notifications/initialized" },
      {
        jsonrpc: "2.0",
        id: 2,
        method: "tools/call",
        params: {
          name: "seis_ai_core_subagent_review_ledger",
          arguments: {
            quarterId: "Y1-Q2",
          },
        },
      },
    ]);

    const call = responses.get(2);
    assert.ok(!call.error, `tools/call errored: ${JSON.stringify(call.error)}`);
    const payload = JSON.parse(call.result.content[0].text);
    assert.equal(payload.ok, true);
    assert.equal(payload.id, "seis-ai-core-subagent-review-ledger");
    assert.equal(payload.summary.quarterCount, 20);
    assert.equal(payload.selectedQuarter.id, "Y1-Q2");
    assert.equal(payload.runtimeBoundary.writeExecution, "disabled");
  });
});
