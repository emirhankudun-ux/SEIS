import assert from "node:assert/strict";
import { describe, it } from "node:test";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  AI_CORE_PROVIDER_ENV_VALIDATION_SCHEMA_VERSION,
  readProviderEnvironmentContract,
  validateProviderEnvironment,
} from "../src/provider/provider-env-validation.mjs";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

describe("SEIS server-only provider environment validation", () => {
  it("loads the source-backed environment policy without provider calls", () => {
    const registry = readProviderEnvironmentContract(packageRoot);

    assert.equal(registry.environmentValidation.schemaVersion, AI_CORE_PROVIDER_ENV_VALIDATION_SCHEMA_VERSION);
    assert.equal(registry.environmentValidation.mode, "server-only-presence-and-shape");
    assert.equal(registry.environmentValidation.secretValuesReturned, false);
    assert.ok(registry.providers.every((provider) => provider.environmentPolicy));
  });

  it("passes a zero-key startup while keeping optional live providers missing", () => {
    const report = validateProviderEnvironment(packageRoot, { env: {} });
    const openai = report.providers.find((provider) => provider.id === "openai-general");
    const localDemo = report.providers.find((provider) => provider.id === "seis-local-demo");

    assert.equal(report.ok, true);
    assert.equal(report.status, "validated-no-network");
    assert.equal(report.secretValuesReturned, false);
    assert.equal(report.credentialAuthenticationPerformed, false);
    assert.equal(report.networkCalled, false);
    assert.equal(openai.status, "missing-required");
    assert.deepEqual(openai.missingRequiredEnv, ["OPENAI_API_KEY"]);
    assert.equal(localDemo.status, "not-required");
  });

  it("reports presence and endpoint shape without claiming authentication or health", () => {
    const report = validateProviderEnvironment(packageRoot, {
      env: {
        ANTHROPIC_API_KEY: "server-value-that-is-never-returned",
        OPENAI_API_KEY: "server-value-that-is-never-returned",
        OPENAI_BASE_URL: "https://api.openai.example/v1",
        OLLAMA_BASE_URL: "127.0.0.1:11434",
      },
    });
    const openai = report.providers.find((provider) => provider.id === "openai-general");
    const ollama = report.providers.find((provider) => provider.id === "ollama-local");
    const serialized = JSON.stringify(report);

    assert.equal(report.ok, true);
    assert.equal(openai.status, "present-no-network-check");
    assert.equal(openai.presentRequiredEnv[0], "OPENAI_API_KEY");
    assert.equal(ollama.status, "endpoint-present-no-network-check");
    assert.equal(report.networkCalled, false);
    assert.equal(report.credentialAuthenticationPerformed, false);
    assert.equal(serialized.includes("server-value-that-is-never-returned"), false);
    assert.ok(report.providers.every((provider) => provider.networkCalled === false));
  });

  it("fails closed for public-prefixed credentials without exposing their values", () => {
    const report = validateProviderEnvironment(packageRoot, {
      env: { NEXT_PUBLIC_OPENAI_API_KEY: "super-secret-value" },
    });

    assert.equal(report.ok, false);
    assert.equal(report.status, "blocked-unsafe-environment");
    assert.deepEqual(report.publicEnvKeys, ["NEXT_PUBLIC_OPENAI_API_KEY"]);
    assert.deepEqual(
      report.providers.find((provider) => provider.id === "openai-general").publicExposureEnv,
      ["NEXT_PUBLIC_OPENAI_API_KEY"],
    );
    assert.equal(JSON.stringify(report).includes("super-secret-value"), false);
  });

  it("rejects placeholder secrets and malformed local endpoints without network access", () => {
    const report = validateProviderEnvironment(packageRoot, {
      env: {
        OPENAI_API_KEY: "placeholder",
        OLLAMA_BASE_URL: "localhost",
      },
    });
    const openai = report.providers.find((provider) => provider.id === "openai-general");
    const ollama = report.providers.find((provider) => provider.id === "ollama-local");

    assert.equal(report.ok, false);
    assert.deepEqual(openai.invalidEnv, [{ name: "OPENAI_API_KEY", issue: "placeholder-value" }]);
    assert.deepEqual(ollama.invalidEnv, [{ name: "OLLAMA_BASE_URL", issue: "invalid-endpoint-shape" }]);
    assert.equal(report.networkCalled, false);
  });
});
