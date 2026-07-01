import { existsSync, readFileSync } from "node:fs";

const file = ".env.example";
const failures = [];

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

ensure(existsSync(file), ".env.example must exist");

const text = existsSync(file) ? readFileSync(file, "utf8") : "";
const lines = text.split(/\r?\n/);
const entries = [];
const seenKeys = new Map();

for (const [index, line] of lines.entries()) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;

  const match = trimmed.match(/^([A-Z0-9_]+)=(.*)$/);
  ensure(Boolean(match), `.env.example line ${index + 1} must be KEY=value syntax`);
  if (!match) continue;

  const [, key, rawValue] = match;
  const value = rawValue.trim();
  entries.push({ key, value, line: index + 1 });

  if (!seenKeys.has(key)) seenKeys.set(key, []);
  seenKeys.get(key).push(index + 1);
}

for (const [key, locations] of seenKeys.entries()) {
  ensure(locations.length === 1, `.env.example must not duplicate ${key}; lines ${locations.join(", ")}`);
}

const requiredPairs = new Map([
  ["NODE_ENV", "development"],
  ["SEIS_AI_MODE", "local-demo"],
  ["SEIS_AI_DEFAULT_PROVIDER", "local-demo"],
  ["SEIS_AI_ROUTING_MODE", "manual"],
  ["SEIS_AI_LOCAL_ONLY", "1"],
  ["VITE_API_URL", "http://localhost:3000"],
  ["OLLAMA_BASE_URL", "http://127.0.0.1:11434"],
  ["OLLAMA_HOST", "http://127.0.0.1:11434"],
  ["HOST", "127.0.0.1"],
  ["PORT", "4177"],
]);

for (const [key, expected] of requiredPairs.entries()) {
  const entry = entries.find((item) => item.key === key);
  ensure(Boolean(entry), `.env.example must include ${key}`);
  ensure(entry?.value === expected, `.env.example ${key} must be ${expected}`);
}

for (const key of [
  "OPENAI_API_KEY",
  "ANTHROPIC_API_KEY",
  "GEMINI_API_KEY",
  "AUTH_TOKEN",
]) {
  const entry = entries.find((item) => item.key === key);
  ensure(Boolean(entry), `.env.example must include blank ${key}`);
  ensure(entry?.value === "", `.env.example ${key} must stay blank`);
}

for (const entry of entries) {
  const isSensitive = /(API_KEY|TOKEN|SECRET|PASSWORD|PRIVATE_KEY|CREDENTIAL|CREDENTIALS)$/i.test(entry.key);
  if (isSensitive) {
    ensure(entry.value === "", `.env.example ${entry.key} on line ${entry.line} must stay blank`);
  }

  const isPublicSecret = /^VITE_/.test(entry.key) && /(API_KEY|TOKEN|SECRET|PASSWORD|PRIVATE_KEY|CREDENTIAL|CREDENTIALS)$/i.test(entry.key);
  ensure(!isPublicSecret, `.env.example must not expose browser-visible secret variable ${entry.key}`);
}

for (const forbidden of [
  "Verified current",
  "gpt-5.5",
  "gpt-5.4",
  "claude-opus-4-8",
  "claude-opus-4-6",
  "gemini-3.1",
  "sk-",
  "github_pat_",
  "ghp_",
  "BEGIN OPENSSH PRIVATE KEY",
]) {
  ensure(!text.includes(forbidden), `.env.example must not include ${forbidden}`);
}

for (const phrase of [
  "Core SEIS and demo mode must work without cloud provider keys",
  "Do not put secrets in VITE_ variables",
  "These placeholders do not enable live provider support",
  "Keep empty until verified in live adapter docs",
]) {
  ensure(text.includes(phrase), `.env.example must document: ${phrase}`);
}

if (failures.length > 0) {
  console.error("SEIS env example check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("SEIS env example check passed.");
