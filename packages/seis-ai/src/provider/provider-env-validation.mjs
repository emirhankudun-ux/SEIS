import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

export const AI_CORE_PROVIDER_ENV_VALIDATION_SCHEMA_VERSION = "1.0.0";
export const AI_CORE_PROVIDER_ENV_VALIDATION_PATH = "content/development/seis-ai-core-provider-registry.json";

const PUBLIC_ENV_PREFIXES = Object.freeze([
  "VITE_",
  "NEXT_PUBLIC_",
  "PUBLIC_",
  "REACT_APP_",
  "NUXT_PUBLIC_",
  "EXPO_PUBLIC_",
  "ASTRO_PUBLIC_",
]);

const CREDENTIAL_NAME_PATTERN = /(API_KEY|TOKEN|SECRET|PASSWORD|CREDENTIAL)/;
const ENVIRONMENT_MODES = new Set(["session", "none", "server-only-key", "local-service", "disabled"]);
const PLACEHOLDER_PATTERN = /^(?:placeholder|redacted|example|dummy|changeme|not[-_ ]?(?:set|required|needed)|test(?:[-_ ]?key)?)$/i;

export function readProviderEnvironmentContract(repoRoot) {
  const filePath = path.join(repoRoot, ...AI_CORE_PROVIDER_ENV_VALIDATION_PATH.split("/"));
  if (!existsSync(filePath)) {
    throw new Error(`SEIS provider environment contract is missing: ${AI_CORE_PROVIDER_ENV_VALIDATION_PATH}`);
  }

  let registry;
  try {
    registry = JSON.parse(readFileSync(filePath, "utf8"));
  } catch (error) {
    throw new Error(`SEIS provider environment contract is invalid JSON: ${error.message}`);
  }

  validateEnvironmentContractShape(registry);
  return registry;
}

export function validateProviderEnvironment(repoRoot = process.cwd(), options = {}) {
  const registry = options.registry || readProviderEnvironmentContract(repoRoot);
  validateEnvironmentContractShape(registry);

  const environment = registry.environmentValidation;
  const env = options.env || process.env;
  const publicEnvPrefixes = Array.isArray(environment.publicEnvPrefixes)
    ? environment.publicEnvPrefixes
    : PUBLIC_ENV_PREFIXES;
  const publicSecretEnvKeys = Object.keys(env)
    .filter((name) => isPublicEnvironmentName(name, publicEnvPrefixes) && CREDENTIAL_NAME_PATTERN.test(name))
    .sort();
  const providers = (registry.providers || []).map((provider) => validateProvider(provider, env, publicSecretEnvKeys));
  const invalidProviders = providers.filter((provider) => provider.invalidEnv.length > 0);

  return {
    id: "seis-ai-core-provider-environment-validation",
    schemaVersion: AI_CORE_PROVIDER_ENV_VALIDATION_SCHEMA_VERSION,
    registryPath: AI_CORE_PROVIDER_ENV_VALIDATION_PATH,
    mode: environment.mode,
    status: publicSecretEnvKeys.length > 0 || invalidProviders.length > 0
      ? "blocked-unsafe-environment"
      : "validated-no-network",
    ok: publicSecretEnvKeys.length === 0 && invalidProviders.length === 0,
    providerCount: providers.length,
    configuredProviderCount: providers.filter((provider) => provider.configured).length,
    missingRequiredProviderCount: providers.filter((provider) => provider.missingRequiredEnv.length > 0).length,
    invalidProviderCount: invalidProviders.length,
    publicSecretExposureCount: publicSecretEnvKeys.length,
    publicEnvKeys: publicSecretEnvKeys,
    secretValuesReturned: false,
    secretValuesLogged: false,
    credentialAuthenticationPerformed: false,
    networkCalled: false,
    externalMutationPerformed: false,
    liveRoutingEnabled: false,
    providers,
    nextSafeActions: [
      "Treat present server-only values as shape-valid only; do not call a provider from this report.",
      "Keep Missing Key and Disabled providers out of routing until a separate adapter and approval gate exists.",
      ...(publicSecretEnvKeys.length > 0
        ? ["Remove public-prefixed provider credential variables from client and build environments."]
        : []),
    ],
  };
}

function validateEnvironmentContractShape(registry) {
  if (!registry || typeof registry !== "object") {
    throw new Error("SEIS provider environment contract must be an object");
  }
  if (registry.environmentValidation?.schemaVersion !== AI_CORE_PROVIDER_ENV_VALIDATION_SCHEMA_VERSION) {
    throw new Error("SEIS provider environment contract schema version mismatch");
  }
  if (registry.environmentValidation?.mode !== "server-only-presence-and-shape") {
    throw new Error("SEIS provider environment contract must stay server-only presence-and-shape");
  }
  if (registry.environmentValidation.secretValuesReturned !== false) {
    throw new Error("SEIS provider environment contract must never return secret values");
  }
  if (registry.environmentValidation.networkCalled !== false) {
    throw new Error("SEIS provider environment contract must never call the network");
  }
  if (!Array.isArray(registry.providers)) {
    throw new Error("SEIS provider environment contract providers must be an array");
  }

  for (const provider of registry.providers) {
    const policy = provider.environmentPolicy;
    const expected = new Set(Array.isArray(provider.expectedEnv) ? provider.expectedEnv : []);
    if (!policy || !ENVIRONMENT_MODES.has(policy.mode)) {
      throw new Error(`${provider.id} environment policy mode is invalid`);
    }
    for (const field of ["required", "optional", "secretVariables", "endpointVariables"]) {
      if (!Array.isArray(policy[field])) {
        throw new Error(`${provider.id} environment policy ${field} must be an array`);
      }
      for (const name of policy[field]) {
        if (!expected.has(name)) {
          throw new Error(`${provider.id} environment policy references undeclared variable ${name}`);
        }
      }
    }
    const policyVariables = new Set([...policy.required, ...policy.optional]);
    for (const name of expected) {
      if (!policyVariables.has(name)) {
        throw new Error(`${provider.id} environment policy does not classify declared variable ${name}`);
      }
    }
    if (policy.required.some((name) => policy.optional.includes(name))) {
      throw new Error(`${provider.id} environment policy cannot mark a variable required and optional`);
    }
    if (policy.secretVariables.some((name) => policy.endpointVariables.includes(name))) {
      throw new Error(`${provider.id} environment policy cannot treat a variable as secret and endpoint data`);
    }
  }
}

function validateProvider(provider, env, publicSecretEnvKeys) {
  const policy = provider.environmentPolicy;
  const requiredEnv = [...policy.required];
  const optionalEnv = [...policy.optional];
  const expectedEnv = [...new Set([...requiredEnv, ...optionalEnv])];
  const presentRequiredEnv = requiredEnv.filter((name) => hasValue(env[name]));
  const presentOptionalEnv = optionalEnv.filter((name) => hasValue(env[name]));
  const missingRequiredEnv = requiredEnv.filter((name) => !hasValue(env[name]));
  const invalidEnv = [...requiredEnv, ...optionalEnv]
    .filter((name) => hasValue(env[name]))
    .map((name) => ({ name, issue: validateValueShape(name, env[name], policy) }))
    .filter((item) => item.issue !== null);
  const publicExposureEnv = publicSecretEnvKeys.filter((name) =>
    expectedEnv.some((expectedName) => name.endsWith(expectedName)),
  );
  const configured = policy.mode !== "disabled" &&
    missingRequiredEnv.length === 0 &&
    invalidEnv.length === 0 &&
    !(policy.mode === "local-service" && presentOptionalEnv.length === 0);

  let status = "not-required";
  if (publicExposureEnv.length > 0) status = "unsafe-public-exposure";
  else if (invalidEnv.length > 0) status = "invalid-shape";
  else if (policy.mode === "disabled") status = "disabled";
  else if (policy.mode === "server-only-key" && missingRequiredEnv.length > 0) status = "missing-required";
  else if (policy.mode === "local-service" && presentOptionalEnv.length === 0) status = "not-configured";
  else if (policy.mode === "server-only-key") status = "present-no-network-check";
  else if (policy.mode === "local-service") status = "endpoint-present-no-network-check";

  return {
    id: provider.id,
    publicStatus: provider.publicStatus,
    mode: policy.mode,
    requiredEnv,
    optionalEnv,
    presentRequiredEnv,
    presentOptionalEnv,
    missingRequiredEnv,
    invalidEnv,
    publicExposureEnv,
    configured,
    status,
    credentialAuthenticationPerformed: false,
    networkCalled: false,
  };
}

function validateValueShape(name, value, policy) {
  if (typeof value !== "string" || value.trim().length === 0) return "empty-value";
  if (policy.secretVariables.includes(name) && PLACEHOLDER_PATTERN.test(value.trim())) {
    return "placeholder-value";
  }
  if (policy.endpointVariables.includes(name) && !isSafeEndpoint(value.trim())) {
    return "invalid-endpoint-shape";
  }
  return null;
}

function isSafeEndpoint(value) {
  if (/^https?:\/\/[^\s/]+(?:\/[^\s]*)?$/i.test(value)) return true;
  return /^[a-z0-9.-]+:\d{1,5}$/i.test(value);
}

function hasValue(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isPublicEnvironmentName(name, prefixes) {
  return prefixes.some((prefix) => name.startsWith(prefix));
}
