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
    let settled = false;

    const cleanup = ({ terminate = false } = {}) => {
      clearTimeout(timer);
      if (!child.stdin.destroyed) child.stdin.end();
      if (terminate && child.exitCode === null) child.kill();
    };

    const succeed = (value) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(value);
    };

    const fail = (error) => {
      if (settled) return;
      settled = true;
      cleanup({ terminate: true });
      reject(error);
    };

    const timer = setTimeout(() => {
      fail(new Error(`MCP smoke timed out. stderr: ${stderr.slice(0, 500)}`));
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
          fail(new Error(`Non-JSON line on MCP stdout: ${line.slice(0, 200)}`));
          return;
        }
        if (expectedIds.every((id) => responses.has(id))) {
          succeed(responses);
          return;
        }
      }
    });

    child.on("error", fail);

    try {
      for (const req of requests) {
        child.stdin.write(JSON.stringify(req) + "\n");
      }
    } catch (error) {
      fail(error);
    }
  });
}

describe("seis-mcp stdio smoke", () => {
  it("initializes and lists 37 tools, 3 prompts, 30 resources", async () => {
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
      "seis_ai_core_read_only_route",
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
      "seis_hub_plan",
      "seis_hub_status",
      "seis_personal_lane_cycle",
      "seis_personal_lane_cycle_checks",
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
      "seis://agent/plugin-integration.json",
      "seis://ai/150b-frontier-model-program.json",
      "seis://ai/20b-dataset-card-template.json",
      "seis://ai/20b-model-card-template.json",
      "seis://ai/512b-apex-model-program.json",
      "seis://ai/agent-permission-matrix.json",
      "seis://ai/agent-role-schema.json",
      "seis://ai/agi-evaluation-protocol.json",
      "seis://ai/agi-github-user-readiness-gates.json",
      "seis://ai/agi-public-readiness-evidence.json",
      "seis://ai/approval-fixture.json",
      "seis://ai/cancellation-fixture.json",
      "seis://ai/dry-run-task-queue.json",
      "seis://ai/execution-ledger-fixture.json",
      "seis://ai/mcp-runtime-contract.json",
      "seis://ai/model-frontier-escalation-policy.json",
      "seis://ai/model-parameter-ladder.json",
      "seis://ai/model-scaling-hardware-profile.json",
      "seis://ai/provider-registry.json",
      "seis://ai/read-only-router-runtime.json",
      "seis://ai/redaction-fixture.json",
      "seis://ai/sub-agent-5-year-plan-view.json",
      "seis://ai/sub-agent-5-year-plan.json",
      "seis://ai/subagent-operating-model.json",
      "seis://ai/subagent-review-ledger.json",
      "seis://ai/subagent-runtime-fixtures.json",
      "seis://ai/version-promotion-gates.json",
      "seis://ai/version-registry.json",
      "seis://web/site-config.json",
      "seis://web/translations.json",
    ]);

    const prompts = responses.get(4).result.prompts.map((p) => p.name).sort();
    assert.deepEqual(prompts, ["add_i18n_key", "audit_and_fix", "review_locale"]);
  });

  it("returns standard JSON-RPC errors without terminating the transport", async () => {
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
      { jsonrpc: "2.0", id: 6 },
      { jsonrpc: "2.0", id: 2, method: "not/a-real-method" },
      { jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "not_a_real_tool", arguments: {} } },
      { jsonrpc: "2.0", id: 4, method: "resources/read", params: { uri: "seis://not-a-real-resource" } },
      { jsonrpc: "2.0", id: 5, method: "prompts/get", params: { name: "not_a_real_prompt" } },
    ]);

    assert.equal(responses.get(1).result.serverInfo.name, "seis");
    assert.equal(responses.get(6).error.code, -32600);
    assert.equal(responses.get(2).error.code, -32601);
    assert.equal(responses.get(3).error.code, -32602);
    assert.equal(responses.get(4).error.code, -32602);
    assert.equal(responses.get(5).error.code, -32602);
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
    assert.equal(payload.resourceCount, 30);
    assert.equal(payload.transport, "stdio newline-delimited JSON-RPC");
    assert.equal(payload.lifecycle, "initialize -> notifications/initialized -> tools/list");
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

  it("reads the SEIS AI Core permission and runtime evidence resources through the protocol", async () => {
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
        params: { uri: "seis://ai/agent-permission-matrix.json" },
      },
      {
        jsonrpc: "2.0",
        id: 3,
        method: "resources/read",
        params: { uri: "seis://ai/execution-ledger-fixture.json" },
      },
      {
        jsonrpc: "2.0",
        id: 4,
        method: "resources/read",
        params: { uri: "seis://ai/subagent-runtime-fixtures.json" },
      },
    ]);

    const permissionResource = responses.get(2);
    assert.ok(!permissionResource.error, `permission resource errored: ${JSON.stringify(permissionResource.error)}`);
    assert.equal(permissionResource.result.contents[0].uri, "seis://ai/agent-permission-matrix.json");
    const permission = JSON.parse(permissionResource.result.contents[0].text);
    assert.equal(permission.id, "seis-ai-core-agent-permission-matrix");
    assert.equal(permission.runtimeBoundary, "status-and-plan-only");
    assert.deepEqual(permission.levels.map((level) => level.level), [
      "read-only",
      "plan-only",
      "write-gated",
      "external-gated",
      "forbidden",
    ]);
    assert.deepEqual(permission.levels.filter((level) => level.status === "enabled").map((level) => level.level), [
      "read-only",
      "plan-only",
    ]);
    assert.deepEqual(permission.forbiddenWithoutSeparatePlan, [
      "credential access",
      "private key handling",
      "history rewrite",
      "public visibility change",
      "model training",
      "dataset ingestion",
      "unrestricted shell execution",
    ]);

    const ledgerResource = responses.get(3);
    assert.ok(!ledgerResource.error, `ledger resource errored: ${JSON.stringify(ledgerResource.error)}`);
    assert.equal(ledgerResource.result.contents[0].uri, "seis://ai/execution-ledger-fixture.json");
    const ledger = JSON.parse(ledgerResource.result.contents[0].text);
    assert.equal(ledger.id, "seis-ai-core-execution-ledger-fixture");
    assert.equal(ledger.mode, "append-only-planned");
    assert.equal(ledger.writerPolicy, "single-writer");
    assert.equal(ledger.requiredFields.length, 19);
    assert.deepEqual(ledger.recordsForbidden, [
      "secret values",
      "private keys",
      "raw provider errors",
      "unapproved external mutation",
    ]);
    assert.equal(ledger.sampleRecords.length, 1);
    assert.equal(ledger.sampleRecords[0].dryRunOnly, true);
    assert.equal(ledger.sampleRecords[0].realExecutionBlocked, true);
    assert.equal(ledger.sampleRecords[0].externalMutationPerformed, false);
    assert.equal(ledger.sampleRecords[0].fileMutationPerformed, false);
    assert.equal(ledger.sampleRecords[0].secretValuesStored, false);

    const runtimeResource = responses.get(4);
    assert.ok(!runtimeResource.error, `runtime fixtures resource errored: ${JSON.stringify(runtimeResource.error)}`);
    assert.equal(runtimeResource.result.contents[0].uri, "seis://ai/subagent-runtime-fixtures.json");
    const runtimeFixtures = JSON.parse(runtimeResource.result.contents[0].text);
    assert.equal(runtimeFixtures.id, "seis-ai-core-subagent-runtime-fixtures");
    assert.equal(runtimeFixtures.runtimeBoundary.currentLevel, "status-and-plan-only");
    assert.equal(runtimeFixtures.runtimeBoundary.backgroundAutomation, "disabled");
    assert.equal(runtimeFixtures.runtimeBoundary.writeExecution, "disabled");
    assert.equal(runtimeFixtures.runtimeBoundary.credentialAccess, "forbidden");
    assert.equal(runtimeFixtures.runtimeBoundary.externalMutation, "requires-explicit-human-approval");
    assert.deepEqual(runtimeFixtures.fixtures.map((fixture) => fixture.id), [
      "role-schema",
      "permission-matrix",
      "dry-run-task-queue",
      "cancellation-fixture",
      "approval-fixture",
      "redaction-fixture",
      "execution-ledger-fixture",
    ]);
    assert.equal(runtimeFixtures.executionLedgerFixture.mode, "append-only-planned");
    assert.equal(runtimeFixtures.executionLedgerFixture.sampleRecord.status, "cancelled");
    assert.equal(runtimeFixtures.executionLedgerFixture.sampleRecord.externalMutationPerformed, false);
  });

  it("reads the executable SEIS AI Core read-only router resource through the protocol", async () => {
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
        params: { uri: "seis://ai/read-only-router-runtime.json" },
      },
    ]);

    const resource = responses.get(2);
    assert.ok(!resource.error, `resources/read errored: ${JSON.stringify(resource.error)}`);
    const payload = JSON.parse(resource.result.contents[0].text);
    assert.equal(payload.id, "seis-ai-core-read-only-router-runtime");
    assert.equal(payload.runtimeBoundary.providerCalls, false);
    assert.equal(payload.modelClaimBoundary.isAgi, false);
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
    assert.deepEqual(payload.promotionOrder, ["local-demo", "20B", "70B", "150B", "300B+", "512B", "highest-available-future"]);
    assert.ok(payload.targets.some((entry) => entry.parameterClass === "20B" && entry.minimumRamClass === "16GB+ RAM"));
    assert.ok(payload.targets.some((entry) => entry.parameterClass === "70B" && entry.status === "research-roadmap"));
    assert.ok(payload.targets.some((entry) => entry.parameterClass === "150B" && entry.status === "frontier-research-roadmap"));
    assert.ok(payload.targets.some((entry) => entry.parameterClass === "300B+" && entry.status === "not-scoped"));
    assert.ok(payload.targets.some((entry) => entry.parameterClass === "512B" && entry.status === "apex-program-plan-only"));
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

  it("reads the SEIS AI Core AGI GitHub user readiness gates resource through the protocol", async () => {
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
          uri: "seis://ai/agi-github-user-readiness-gates.json",
        },
      },
    ]);

    const resource = responses.get(2);
    assert.ok(!resource.error, `resources/read errored: ${JSON.stringify(resource.error)}`);
    const payload = JSON.parse(resource.result.contents[0].text);
    assert.equal(payload.id, "seis-agi-github-user-readiness-gates");
    assert.equal(payload.status, "review-gated-local-demo-ready");
    assert.equal(payload.resourceUri, "seis://ai/agi-github-user-readiness-gates.json");
    assert.equal(payload.routeEligibleToday, false);
    assert.equal(payload.runtimeAuthority, false);
    assert.equal(payload.agiClaimAllowed, false);
    assert.equal(payload.publicReadyAsAgi, false);
    assert.equal(payload.publicReadyForLocalDemo, true);
    assert.equal(payload.githubReadyForEveryone, false);
    assert.ok(payload.readinessGates.some((gate) => gate.id === "public-release-approval" && gate.status === "approval-gated"));
    assert.ok(payload.forbiddenClaims.includes("GitHub users can run routeable 512B inference today."));
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

  it("executes run_all_checks through the protocol", async () => {
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

  it("executes a personal SEIS lane plan tool through the protocol", async () => {
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
    assert.equal(payload.sshBinding.alias, "SEIS-SSH");
    assert.equal(payload.sshBinding.serverAndPortPolicy, "preserve-existing-server-and-port");
    assert.equal(payload.sshBinding.liveClaimBlocked, true);
  });

  it("keeps all five personal lane plans available through the bounded protocol", async () => {
    const laneRequests = [
      [2, "seis_hub_plan", "seis", "review governance boundaries"],
      [3, "seis_cloud_plan", "seis-cloud", "prepare cloud readiness without deployment"],
      [4, "seis_code_plan", "seis-code", "prepare a repository validation plan"],
      [5, "seis_design_plan", "seis-design", "prepare a design quality review"],
      [6, "seis_data_plan", "seis-data", "prepare a schema freshness review"],
    ];
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
      ...laneRequests.map(([id, name, , request]) => ({
        jsonrpc: "2.0",
        id,
        method: "tools/call",
        params: { name, arguments: { request } },
      })),
    ]);

    for (const [id, , laneId, request] of laneRequests) {
      const call = responses.get(id);
      assert.ok(!call.error, `tools/call errored for ${laneId}: ${JSON.stringify(call.error)}`);
      const payload = JSON.parse(call.result.content[0].text);
      assert.equal(payload.ok, true);
      assert.equal(payload.laneId, laneId);
      assert.equal(payload.request, request);
      assert.ok(Array.isArray(payload.steps));
      assert.ok(Array.isArray(payload.defaultChecks));
      assert.ok(payload.approvalBoundary);
    }
  });

  it("executes the all-lane personal cycle plan through the protocol", async () => {
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
          name: "seis_personal_lane_cycle",
          arguments: { request: "review the next AI Core readiness change" },
        },
      },
    ]);

    const call = responses.get(2);
    assert.ok(!call.error, `tools/call errored: ${JSON.stringify(call.error)}`);
    const payload = JSON.parse(call.result.content[0].text);
    assert.equal(payload.ok, true);
    assert.equal(payload.status, "plan-ready");
    assert.deepEqual(payload.laneOrder, ["seis", "seis-cloud", "seis-code", "seis-design", "seis-data"]);
    assert.equal(payload.summary.total, 5);
    assert.equal(payload.runtimeBoundary.planOnly, true);
    assert.equal(payload.runtimeBoundary.providerCallsPerformed, false);
    assert.equal(payload.runtimeBoundary.githubMutationPerformed, false);
  });

  it("exposes bounded all-lane validation through the protocol", async () => {
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
          name: "seis_personal_lane_cycle_checks",
          arguments: { request: "validate the bounded personal lane cycle", timeoutMs: 100 },
        },
      },
    ], { timeoutMs: 15000 });

    const call = responses.get(2);
    assert.ok(!call.error, `tools/call errored: ${JSON.stringify(call.error)}`);
    const payload = JSON.parse(call.result.content[0].text);
    assert.equal(payload.status, "checks-blocked");
    assert.equal(payload.runtimeBoundary.localValidationPerformed, true);
    assert.equal(payload.runtimeBoundary.externalMutationPerformed, false);
    assert.equal(payload.runtimeBoundary.workspaceMutationDetected, false);
    assert.equal(payload.checkBoundary.shell, false);
    assert.equal(payload.checkBoundary.outputRedacted, true);
    assert.ok(payload.checks.length > 0);
    assert.ok(payload.checks.every((check) => !check.output.includes("AZURE_OPENAI_API_KEY")));
  });

  it("executes the SEIS AI Core provider status tool through the protocol", async () => {
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

  it("executes the SEIS AI Core read-only route tool through the protocol", async () => {
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
          name: "seis_ai_core_read_only_route",
          arguments: { taskType: "repository-validation", capability: "validation", localOnly: true, privacyMode: "local-only" },
        },
      },
    ]);

    const call = responses.get(2);
    assert.ok(!call.error, `tools/call errored: ${JSON.stringify(call.error)}`);
    const payload = JSON.parse(call.result.content[0].text);
    assert.equal(payload.selectedProvider, "codex-operator");
    assert.equal(payload.agentLane.id, "seis-code");
    assert.equal(payload.executionPerformed, false);
    assert.equal(payload.providerCallsPerformed, false);
  });

  it("executes the SEIS AI Core model scaling status tool through the protocol", async () => {
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
    assert.equal(payload.parameterLadder.targetCount, 6);
    assert.equal(payload.parameterLadder.routeEligibleToday, false);
    assert.ok(payload.parameterLadder.targets.some((entry) => entry.parameterClass === "20B" && entry.minimumRamClass === "16GB+ RAM"));
    assert.ok(payload.parameterLadder.targets.some((entry) => entry.parameterClass === "300B+" && entry.status === "not-scoped"));
    assert.ok(payload.parameterLadder.targets.some((entry) => entry.parameterClass === "512B" && entry.status === "apex-program-plan-only"));
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

  it("executes the SEIS AI Core sub-agent model tool through the protocol", async () => {
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
    assert.equal(payload.runtimeFixtures.runtimeFixturePack.id, "seis-ai-core-subagent-runtime-fixtures");
    assert.equal(payload.runtimeFixtures.dryRunTaskQueue.dryRunOnly, true);
    assert.equal(payload.runtimeFixtures.approvalFixture.blanketApprovalAllowed, false);
    assert.equal(payload.longHorizonPlan.id, "sub-agent-5-year-plan");
  });

  it("executes the SEIS AI Core version status tool through the protocol", async () => {
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

  it("executes the SEIS AI Core version promotion dry-run tool through the protocol", async () => {
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

  it("executes the SEIS AI Core dry-run evaluator through the protocol", async () => {
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
    assert.equal(payload.executionLedgerEvidence.mode, "append-only-planned");
    assert.equal(payload.executionLedgerEvidence.requiredFieldCount, 19);
    assert.equal(payload.executionLedgerEvidence.persistence, "disabled");
    assert.equal(payload.executionLedgerEvidence.recordWritten, false);
  });

  it("executes the SEIS AI Core review ledger tool through the protocol", async () => {
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
