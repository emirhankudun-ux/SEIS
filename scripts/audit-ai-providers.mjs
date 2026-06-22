#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "docs", "audits");
const OUT_MD = path.join(OUT_DIR, "AI_PROVIDER_AND_CREDENTIAL_AUDIT.md");
const OUT_JSON = path.join(OUT_DIR, "ai-provider-audit.json");
const TODAY = "2026-06-22";

const providerCatalog = [
  provider("OpenAI", "cloud model provider", ["openai", "@openai/", "@ai-sdk/openai"], ["api.openai.com", "/v1/responses", "/v1/chat/completions"], ["OPENAI_API_KEY", "OPENAI_BASE_URL", "OPENAI_ORG_ID", "OPENAI_PROJECT_ID"], ["gpt-"]),
  provider("Anthropic Claude", "cloud model provider", ["@anthropic-ai/sdk", "anthropic", "@ai-sdk/anthropic"], ["api.anthropic.com"], ["ANTHROPIC_API_KEY"], ["claude-"]),
  provider("Google Gemini", "cloud model provider", ["@google/genai", "@google/generative-ai", "google-generativeai", "@ai-sdk/google"], ["generativelanguage.googleapis.com"], ["GEMINI_API_KEY"], ["gemini-"]),
  provider("Google Vertex AI", "cloud model platform", ["@google-cloud/vertexai", "google-cloud-aiplatform", "@ai-sdk/google-vertex"], ["aiplatform.googleapis.com"], ["GOOGLE_CLOUD_PROJECT", "GOOGLE_CLOUD_LOCATION", "GOOGLE_APPLICATION_CREDENTIALS"], ["vertex"]),
  provider("Azure OpenAI", "cloud model provider", ["@azure/openai", "AzureOpenAI"], ["openai.azure.com"], ["AZURE_OPENAI_API_KEY", "AZURE_OPENAI_ENDPOINT", "AZURE_OPENAI_API_VERSION", "AZURE_OPENAI_DEPLOYMENT"], ["azure-openai"]),
  provider("AWS Bedrock", "cloud model platform", ["@aws-sdk/client-bedrock-runtime", "@ai-sdk/amazon-bedrock", "boto3"], ["bedrock-runtime"], ["AWS_REGION", "AWS_PROFILE"], ["bedrock"]),
  provider("Groq", "cloud model provider", ["groq-sdk", "@ai-sdk/groq"], ["api.groq.com"], ["GROQ_API_KEY"], ["llama3", "mixtral"]),
  provider("Mistral", "cloud model provider", ["@mistralai/mistralai", "mistralai", "@ai-sdk/mistral"], ["api.mistral.ai"], ["MISTRAL_API_KEY"], ["mistral"]),
  provider("Cohere", "cloud model provider", ["cohere-ai", "cohere", "@ai-sdk/cohere"], ["api.cohere.com"], ["COHERE_API_KEY"], ["command-r"]),
  provider("Perplexity", "cloud model provider", ["api.perplexity.ai"], ["api.perplexity.ai"], ["PERPLEXITY_API_KEY"], ["sonar"]),
  provider("Hugging Face", "model hosting provider", ["@huggingface/inference", "huggingface_hub"], ["api-inference.huggingface.co", "huggingface.co"], ["HF_TOKEN"], ["hf_"]),
  provider("Replicate", "media/model provider", ["replicate"], ["api.replicate.com"], ["REPLICATE_API_TOKEN"], ["replicate"]),
  provider("Together AI", "cloud model provider", ["together-ai", "@ai-sdk/togetherai"], ["api.together.xyz"], ["TOGETHER_API_KEY"], ["together"]),
  provider("OpenRouter", "model gateway", ["openrouter"], ["openrouter.ai/api/v1"], ["OPENROUTER_API_KEY"], ["openrouter"]),
  provider("Ollama", "local model provider", ["ollama"], ["127.0.0.1:11434", "localhost:11434"], ["OLLAMA_BASE_URL", "OLLAMA_HOST"], ["ollama"]),
  provider("LM Studio", "local model provider", ["lm studio"], ["127.0.0.1:1234", "localhost:1234"], ["LM_STUDIO_BASE_URL"], ["lm-studio"]),
  provider("xAI", "cloud model provider", ["xai"], ["api.x.ai"], ["XAI_API_KEY"], ["grok"]),
  provider("DeepSeek", "cloud model provider", ["deepseek"], ["api.deepseek.com"], ["DEEPSEEK_API_KEY"], ["deepseek"]),
  provider("Fireworks AI", "cloud model provider", ["fireworks"], ["api.fireworks.ai"], ["FIREWORKS_API_KEY"], ["fireworks"]),
  provider("Cerebras", "cloud model provider", ["cerebras"], ["api.cerebras.ai"], ["CEREBRAS_API_KEY"], ["cerebras"]),
  provider("SambaNova", "cloud model provider", ["sambanova"], ["api.sambanova.ai"], ["SAMBANOVA_API_KEY"], ["sambanova"]),
  provider("Cloudflare Workers AI", "cloud model platform", ["cloudflare"], ["workers.ai", "ai.cloudflare.com"], ["CLOUDFLARE_ACCOUNT_ID", "CLOUDFLARE_API_TOKEN"], ["@cf/"]),
  provider("NVIDIA NIM", "cloud model provider", ["nvidia"], ["integrate.api.nvidia.com"], ["NVIDIA_API_KEY"], ["nim"]),
  provider("AI21", "cloud model provider", ["ai21"], ["api.ai21.com"], ["AI21_API_KEY"], ["jamba"]),
  provider("Voyage AI", "embedding provider", ["voyage"], ["api.voyageai.com"], ["VOYAGE_API_KEY"], ["voyage"]),
  provider("Jina AI", "embedding/reranking provider", ["jina"], ["api.jina.ai"], ["JINA_API_KEY"], ["jina"]),
  provider("Stability AI", "image provider", ["stability"], ["api.stability.ai"], ["STABILITY_API_KEY"], ["stable-diffusion"]),
  provider("fal.ai", "media provider", ["@fal-ai", "fal.ai"], ["fal.ai"], ["FAL_KEY"], []),
  provider("ElevenLabs", "speech provider", ["elevenlabs"], ["api.elevenlabs.io"], ["ELEVENLABS_API_KEY"], ["elevenlabs"]),
  provider("AssemblyAI", "speech provider", ["assemblyai"], ["api.assemblyai.com"], ["ASSEMBLYAI_API_KEY"], ["assemblyai"]),
  provider("Deepgram", "speech provider", ["deepgram"], ["api.deepgram.com"], ["DEEPGRAM_API_KEY"], ["deepgram"]),
  provider("Runway", "media provider", ["runway"], ["api.runwayml.com"], ["RUNWAY_API_KEY"], ["runway"]),
  provider("Luma", "media provider", ["luma"], ["api.lumalabs.ai"], ["LUMA_API_KEY"], ["luma"]),
  provider("Ideogram", "image provider", ["ideogram"], ["api.ideogram.ai"], ["IDEOGRAM_API_KEY"], ["ideogram"]),
  provider("Vercel AI SDK", "abstraction layer", ["ai", "@ai-sdk/"], [], [], ["streamText", "generateText"]),
  provider("LangChain", "abstraction layer", ["langchain", "@langchain/"], [], [], ["langchain"]),
  provider("LangGraph", "agent graph layer", ["langgraph", "@langchain/langgraph"], [], [], ["langgraph"]),
  provider("LlamaIndex", "retrieval layer", ["llamaindex"], [], [], ["llamaindex"]),
  provider("LiteLLM", "model gateway", ["litellm"], [], ["LITELLM_API_KEY"], ["litellm"]),
  provider("Portkey", "model gateway", ["portkey"], ["api.portkey.ai"], ["PORTKEY_API_KEY"], ["portkey"]),
  provider("Helicone", "AI observability gateway", ["helicone"], ["helicone.ai"], ["HELICONE_API_KEY"], ["helicone"])
];

const deploymentCredentialNames = [
  "GITHUB_TOKEN",
  "CLOUDFLARE_API_TOKEN",
  "VERCEL_TOKEN",
  "NETLIFY_AUTH_TOKEN",
  "AZURE_STATIC_WEB_APPS_API_TOKEN",
  "AWS_AMPLIFY_DEPLOY_TOKEN",
  "FIREBASE_DEPLOY_TOKEN"
];

const skipDirs = new Set([
  ".git",
  "node_modules",
  "dist",
  "build",
  ".cache",
  ".next",
  ".turbo",
  "coverage",
  ".venv",
  "__pycache__",
  "releases"
]);

const skipFiles = new Set([
  "scripts/audit-ai-providers.mjs",
  "docs/audits/AI_PROVIDER_AND_CREDENTIAL_AUDIT.md",
  "docs/audits/ai-provider-audit.json"
]);

const allowedExtensions = new Set([
  ".cjs", ".css", ".env", ".html", ".js", ".json", ".jsx", ".md", ".mjs",
  ".py", ".sh", ".sql", ".toml", ".ts", ".tsx", ".yaml", ".yml"
]);

const publicSecretRegex = /\b(VITE_|NEXT_PUBLIC_|PUBLIC_|REACT_APP_|NUXT_PUBLIC_|EXPO_PUBLIC_|ASTRO_PUBLIC_)[A-Z0-9_]*(API_KEY|TOKEN|SECRET|PASSWORD)\b/g;
const hardcodedSecretRegexes = [
  ["private_key_block", /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
  ["openai_like_key", /\bsk-[A-Za-z0-9_-]{20,}\b/],
  ["github_token_like", /\bgh[pousr]_[A-Za-z0-9_]{20,}\b/],
  ["slack_token_like", /\bxox[baprs]-[A-Za-z0-9-]{20,}\b/],
  ["assignment_like_secret", /\b(API_KEY|TOKEN|SECRET|PASSWORD)\b\s*[:=]\s*["']?[A-Za-z0-9_./+=-]{12,}/i]
];

const files = walk(ROOT);
const packageDependencies = readPackageDependencies();
const providerFindings = new Map(providerCatalog.map((entry) => [entry.name, {
  provider: entry.name,
  category: entry.category,
  expectedEnvironmentVariables: entry.envVars,
  apiKeyRequired: entry.envVars.some((name) => /KEY|TOKEN|CREDENTIALS/.test(name)),
  packageOrSdk: [],
  endpoints: [],
  modelIdentifiers: [],
  locations: [],
  frontendDirectCall: false,
  backendSide: false,
  documentationOnly: true,
  placeholderOnly: false,
  runtimeVerified: false,
  reachableRealNetworkCall: false,
  noKeyFallback: entry.name === "Ollama" || entry.name === "LM Studio" ? "local provider normally requires no API key" : "not verified",
  status: "Documentation Only",
  recommendedAction: "Keep documentation-only until an approved implementation exists.",
  finalDecision: "Retain"
}]));

const secretFindings = [];
const deploymentCredentialFindings = [];

for (const dependency of packageDependencies) {
  for (const providerEntry of providerCatalog) {
    if (providerEntry.sdkPatterns.some((pattern) => dependency.includes(pattern))) {
      providerFindings.get(providerEntry.name).packageOrSdk.push(dependency);
    }
  }
}

for (const file of files) {
  const rel = toRel(file);
  const text = readFileSafe(file);
  if (text === null) {
    continue;
  }
  const lines = text.split(/\r?\n/);
  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    for (const [type, regex] of hardcodedSecretRegexes) {
      if (regex.test(line)) {
        if (type === "assignment_like_secret" && /(process\.env|os\.environ|envSet\(|getenv\()/i.test(line)) {
          continue;
        }
        secretFindings.push({ type, path: rel, line: lineNumber, severity: type === "private_key_block" ? "critical" : "high" });
      }
    }
    for (const match of line.matchAll(publicSecretRegex)) {
      secretFindings.push({ type: "public_prefixed_secret_variable", variable: match[0], path: rel, line: lineNumber, severity: "high" });
    }
    for (const credentialName of deploymentCredentialNames) {
      if (line.includes(credentialName)) {
        deploymentCredentialFindings.push({ name: credentialName, path: rel, line: lineNumber, surface: classifySurface(rel) });
      }
    }
    for (const providerEntry of providerCatalog) {
      const hitKinds = [];
      for (const envVar of providerEntry.envVars) {
        if (line.includes(envVar)) {
          hitKinds.push(`env:${envVar}`);
        }
      }
      for (const endpoint of providerEntry.endpoints) {
        if (endpoint && line.includes(endpoint)) {
          hitKinds.push(`endpoint:${endpoint}`);
        }
      }
      for (const model of providerEntry.modelPatterns) {
        if (model && line.toLowerCase().includes(model.toLowerCase())) {
          hitKinds.push(`model:${model}`);
        }
      }
      if (hitKinds.length === 0) {
        continue;
      }
      const record = providerFindings.get(providerEntry.name);
      record.locations.push({ path: rel, line: lineNumber, matchTypes: hitKinds, surface: classifySurface(rel) });
      for (const kind of hitKinds) {
        if (kind.startsWith("endpoint:")) {
          record.endpoints.push(kind.replace("endpoint:", ""));
        }
        if (kind.startsWith("model:")) {
          record.modelIdentifiers.push(kind.replace("model:", ""));
        }
      }
      if (!isDocsOnly(rel)) {
        record.documentationOnly = false;
      }
      if (rel === ".env.example" || rel.endsWith(".example.json") || rel.includes("example")) {
        record.placeholderOnly = true;
      }
    }
  });
}

const providers = [...providerFindings.values()]
  .filter((record) => record.packageOrSdk.length > 0 || record.locations.length > 0)
  .map(finalizeProviderRecord)
  .sort((a, b) => a.provider.localeCompare(b.provider));

const report = {
  generatedAt: TODAY,
  mode: "redacted_static_repository_audit",
  inspectedFiles: files.length,
  providers,
  deploymentCredentialReferences: dedupeLocations(deploymentCredentialFindings, ["name", "path", "line"]),
  secretFindings: dedupeLocations(secretFindings, ["type", "variable", "path", "line"]),
  finalRequiredCredentialList: {
    requiredForCoreSEIS: [],
    requiredForEnabledLiveFeatures: [],
    optionalProviders: [],
    detectedProviderReferences: providers.map((providerRecord) => ({
      provider: providerRecord.provider,
      expectedEnvironmentVariables: providerRecord.expectedEnvironmentVariables,
      status: providerRecord.status
    })),
    noKeyProviders: providers.filter((providerRecord) => providerRecord.noKeyFallback.includes("no API key")).map((providerRecord) => providerRecord.provider),
    removedOrUnusedVariables: []
  }
};

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT_JSON, `${JSON.stringify(report, null, 2)}\n`);
writeFileSync(OUT_MD, renderMarkdown(report));

console.log(`AI provider audit written: ${toRel(OUT_MD)}`);
console.log(`AI provider audit JSON written: ${toRel(OUT_JSON)}`);
console.log(`Providers detected: ${providers.length}`);
console.log(`Secret findings without values: ${report.secretFindings.length}`);

function provider(name, category, sdkPatterns, endpoints, envVars, modelPatterns) {
  return { name, category, sdkPatterns, endpoints, envVars, modelPatterns };
}

function walk(dir) {
  const output = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    const rel = toRel(full);
    const stats = statSync(full);
    if (stats.isDirectory()) {
      if (skipDirs.has(entry) || rel.startsWith("apps/web/public/media/")) {
        continue;
      }
      output.push(...walk(full));
      continue;
    }
    if (!stats.isFile() || stats.size > 1_000_000) {
      continue;
    }
    if (skipFiles.has(rel)) {
      continue;
    }
    if (entry.startsWith(".env") && !entry.includes("example")) {
      continue;
    }
    const ext = path.extname(entry);
    if (allowedExtensions.has(ext) || entry === "Dockerfile" || entry.endsWith(".conf")) {
      output.push(full);
    }
  }
  return output;
}

function readPackageDependencies() {
  const packagePath = path.join(ROOT, "package.json");
  if (!existsSync(packagePath)) {
    return [];
  }
  const payload = JSON.parse(readFileSync(packagePath, "utf8"));
  return [
    ...Object.keys(payload.dependencies || {}),
    ...Object.keys(payload.devDependencies || {}),
    ...Object.keys(payload.optionalDependencies || {})
  ];
}

function readFileSafe(file) {
  try {
    const text = readFileSync(file, "utf8");
    if (text.includes("\u0000")) {
      return null;
    }
    return text;
  } catch {
    return null;
  }
}

function finalizeProviderRecord(record) {
  record.packageOrSdk = unique(record.packageOrSdk);
  record.endpoints = unique(record.endpoints);
  record.modelIdentifiers = unique(record.modelIdentifiers);
  record.locations = dedupeLocations(record.locations, ["path", "line", "matchTypes"]);
  const runtimeSignalLocations = record.locations.filter((location) => {
    const hasRuntimeSignal = (location.matchTypes || []).some((kind) => kind.startsWith("env:") || kind.startsWith("endpoint:"));
    return hasRuntimeSignal && !isDocsOnly(location.path) && location.surface !== "placeholder";
  });
  record.frontendDirectCall = runtimeSignalLocations.some((location) => location.surface === "frontend");
  record.backendSide = runtimeSignalLocations.some((location) => location.surface === "backend" || location.surface === "script");
  if (record.frontendDirectCall) {
    record.status = "Frontend Direct Call";
    record.recommendedAction = "Move any live provider call behind a backend gateway before enabling.";
    record.finalDecision = "Refactor";
  } else if (record.backendSide || record.packageOrSdk.length > 0) {
    record.status = "Live but Unverified";
    record.recommendedAction = "Retain as unverified until provider health, no-key startup, and redaction tests exist.";
    record.finalDecision = "Retain";
  } else if (record.placeholderOnly) {
    record.status = "Placeholder";
    record.recommendedAction = "Keep placeholders only if referenced by current docs or deployment templates.";
    record.finalDecision = "Retain";
  } else if (record.documentationOnly) {
    record.status = "Documentation Only";
    record.recommendedAction = "Do not request keys or claim live support from documentation-only references.";
    record.finalDecision = "Retain";
  } else {
    record.status = "Unknown";
    record.recommendedAction = "Review manually before enabling.";
    record.finalDecision = "Retain";
  }
  record.apiKeyRequiredState = record.apiKeyRequired ? "optional or required only if feature is enabled" : "unused or not required";
  record.securityFindings = record.frontendDirectCall ? ["Potential frontend/provider exposure path requires review."] : [];
  return record;
}

function renderMarkdown(payload) {
  const providerRows = payload.providers.map((item) => [
    item.provider,
    item.category,
    item.status,
    item.expectedEnvironmentVariables.join(", ") || "none detected",
    item.locations.length,
    item.frontendDirectCall ? "yes" : "no",
    item.backendSide ? "yes" : "no",
    item.finalDecision,
    item.recommendedAction
  ]);

  const secretRows = payload.secretFindings.map((item) => [
    item.type,
    item.variable || "omitted",
    item.path,
    String(item.line),
    item.severity,
    "value intentionally omitted"
  ]);

  const deploymentRows = payload.deploymentCredentialReferences.map((item) => [
    item.name,
    item.path,
    String(item.line),
    item.surface
  ]);

  return `# AI Provider And Credential Audit

Date: ${payload.generatedAt}

## Purpose

This is a redacted static repository audit. It detects provider references,
credential variable references, potential client exposure patterns, and
secret-like patterns without printing secret values and without calling any
external provider.

## Scope Inspected

- Text source, docs, config, scripts, app, package, server, deploy, and content
  files under the repository root.
- Real \`.env\` files are intentionally skipped.
- Binary files, release archives, \`node_modules\`, generated build folders, and
  media assets are skipped.

Inspected files: ${payload.inspectedFiles}

## Provider Matrix

${table(["Provider", "Category", "Status", "Expected env vars", "Locations", "Frontend direct", "Backend side", "Decision", "Recommended action"], providerRows)}

## Secret-Exposure Findings

${payload.secretFindings.length === 0 ? "No secret-like values were reported by this static scan." : table(["Type", "Variable", "Path", "Line", "Severity", "Value"], secretRows)}

## Deployment Credential References

${payload.deploymentCredentialReferences.length === 0 ? "No deployment credential variable references were detected." : table(["Name", "Path", "Line", "Surface"], deploymentRows)}

## Frontend Direct-Call Findings

${payload.providers.filter((item) => item.frontendDirectCall).length === 0 ? "No frontend direct model-provider endpoint or secret-variable path was detected by this scan." : payload.providers.filter((item) => item.frontendDirectCall).map((item) => `- ${item.provider}: review ${item.locations.length} location(s).`).join("\n")}

## Real Live Integrations

None runtime-verified in this pass. Do not treat documentation, placeholders,
or environment variable references as live provider support.

## Mock And Placeholder Integrations

Placeholder or documentation-only references are retained as planning material
only. They do not require API keys for core SEIS.

## Final Required API Key List

### Required For Core SEIS

- None.

### Required For Enabled Live Features

- None verified in this pass.

### Optional Providers

${payload.finalRequiredCredentialList.optionalProviders.length === 0 ? "- None detected." : payload.finalRequiredCredentialList.optionalProviders.map((item) => `- ${item.provider}: ${item.expectedEnvironmentVariables.join(", ") || "no key variable detected"} (${item.status})`).join("\n")}

### Detected Provider References

These references do not prove enabled live features or required API keys.

${payload.finalRequiredCredentialList.detectedProviderReferences.length === 0 ? "- None detected." : payload.finalRequiredCredentialList.detectedProviderReferences.map((item) => `- ${item.provider}: ${item.expectedEnvironmentVariables.join(", ") || "no key variable detected"} (${item.status})`).join("\n")}

### No-Key Providers

${payload.finalRequiredCredentialList.noKeyProviders.length === 0 ? "- None currently implemented." : payload.finalRequiredCredentialList.noKeyProviders.map((item) => `- ${item}`).join("\n")}

## Remaining Manual Actions

- Review every \`Live but Unverified\` or \`Frontend Direct Call\` finding before
  enabling provider runtime behavior.
- Add typed server-only environment validation before live provider adapters.
- Run a dedicated secret-history scanner before any public-readiness claim.
- Keep cloud deployment credentials server-only.

## Related Documents

- [../ai/seis-ai-core.md](../ai/seis-ai-core.md)
- [../security/security-baseline.md](../security/security-baseline.md)
- [../../SECURITY.md](../../SECURITY.md)
`;
}

function table(headers, rows) {
  const escapeCell = (value) => String(value).replace(/\|/g, "\\|").replace(/\n/g, " ");
  return [
    `| ${headers.map(escapeCell).join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map(escapeCell).join(" | ")} |`)
  ].join("\n");
}

function classifySurface(rel) {
  if (isFrontend(rel)) return "frontend";
  if (isBackend(rel)) return "backend";
  if (isDocsOnly(rel)) return "documentation";
  if (rel === ".env.example" || rel.includes("example")) return "placeholder";
  if (rel.startsWith("scripts/")) return "script";
  if (rel.startsWith("deploy/")) return "deployment-config";
  return "repository";
}

function isDocsOnly(rel) {
  return rel.startsWith("docs/") || rel.startsWith("reports/") || rel.endsWith(".md");
}

function isFrontend(rel) {
  return rel.startsWith("apps/web/") && /\.(js|jsx|ts|tsx|html)$/.test(rel);
}

function isBackend(rel) {
  return rel.startsWith("server/") || rel.startsWith("apps/fullstack/") || rel.includes("/api/") || rel.startsWith("scripts/");
}

function unique(items) {
  return [...new Set(items.filter(Boolean))];
}

function dedupeLocations(items, keys) {
  const seen = new Set();
  const output = [];
  for (const item of items) {
    const key = keys.map((name) => Array.isArray(item[name]) ? item[name].join(",") : item[name] || "").join("|");
    if (seen.has(key)) continue;
    seen.add(key);
    output.push(item);
  }
  return output;
}

function toRel(fullPath) {
  return path.relative(ROOT, fullPath).split(path.sep).join("/");
}
