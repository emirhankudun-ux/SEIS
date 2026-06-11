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
  it("initializes and lists 16 tools, 3 prompts, 2 resources", async () => {
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
      "seo_audit",
      "site_config_get",
      "style_audit",
      "web_contract_check",
      "web_perf_audit",
      "workspace_status",
    ]);

    const resources = responses.get(3).result.resources.map((r) => r.uri).sort();
    assert.deepEqual(resources, [
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
});
