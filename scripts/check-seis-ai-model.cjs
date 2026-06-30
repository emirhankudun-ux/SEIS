#!/usr/bin/env node
// Validates the SEIS native AI model spec (SEIS-150B) — WITHOUT requiring any AI
// tooling or weights, so it is safe to run in CI. It proves the headline "150B"
// is backed by the declared architecture, and that doc + JSON + code agree.
//
// Model card: docs/platform/seis-native-ai-model.md
const { existsSync, readFileSync } = require("node:fs");
const {
  MODEL,
  ARCHITECTURE,
  TARGET_PARAMETERS,
  TOLERANCE,
  computeParameters,
} = require("./seis-ai-model.cjs");

const modelDoc = "docs/platform/seis-native-ai-model.md";
const routingDoc = "docs/platform/hybrid-ai-routing-policy.md";
const modelRecord = "content/governance/seis-ai-model.json";
const LIFECYCLE = ["specification", "training", "evaluation", "released"];

const failures = [];
const ensure = (condition, message) => {
  if (!condition) failures.push(message);
};

// 1. The declared architecture must compute to within tolerance of the target.
const params = computeParameters(ARCHITECTURE);
const drift = Math.abs(params.total - TARGET_PARAMETERS) / TARGET_PARAMETERS;
ensure(
  drift <= TOLERANCE,
  `architecture computes to ${params.totalBillions}B params, ` +
    `which is ${(drift * 100).toFixed(2)}% from the ${TARGET_PARAMETERS / 1e9}B target (max ${(TOLERANCE * 100).toFixed(0)}%)`,
);

// 2. The declared headline must match the computed total (rounded to billions).
ensure(
  Math.round(params.total / 1e9) === MODEL.parametersBillions,
  `parametersBillions (${MODEL.parametersBillions}) must match the computed ${Math.round(params.total / 1e9)}B`,
);

// 3. Status must be a known lifecycle stage.
ensure(LIFECYCLE.includes(MODEL.status), `status must be one of ${LIFECYCLE.join("/")} (got "${MODEL.status}")`);

// 4. Until released, the in-house model must NOT be the live routing default —
//    it cannot silently override the hybrid policy before weights exist.
if (MODEL.status !== "released") {
  ensure(
    MODEL.routing.defaultTodayRemains === "codex",
    "while not released, routing.defaultTodayRemains must stay codex (hybrid policy default)",
  );
  ensure(MODEL.artifact === null, "artifact must be null until the model is released");
}

// 5. Architecture sanity: head dim divides evenly, KV heads compress, GQA holds.
ensure(
  ARCHITECTURE.hiddenSize % ARCHITECTURE.numAttentionHeads === 0,
  "hiddenSize must be divisible by numAttentionHeads",
);
ensure(
  ARCHITECTURE.numAttentionHeads % ARCHITECTURE.numKeyValueHeads === 0,
  "numAttentionHeads must be divisible by numKeyValueHeads (grouped-query attention)",
);
ensure(ARCHITECTURE.maxContextTokens > 0, "maxContextTokens must be positive");
ensure(ARCHITECTURE.vocabSize > 0, "vocabSize must be positive");

// 6. The model card and routing doc must exist and the doc must state 150B.
ensure(existsSync(modelDoc), `missing ${modelDoc}`);
ensure(existsSync(routingDoc), `missing ${routingDoc}`);
if (existsSync(modelDoc)) {
  const doc = readFileSync(modelDoc, "utf8").toLowerCase();
  ensure(doc.includes("150b") || doc.includes("150-billion"), "model card must name the 150B headline");
  ensure(doc.includes("specification"), "model card must document the specification status");
}

// 7. The machine-readable record must stay in sync with the executable spec
//    (single source of truth: doc + JSON + code must agree).
ensure(existsSync(modelRecord), `missing ${modelRecord}`);
if (existsSync(modelRecord)) {
  let record = null;
  try {
    record = JSON.parse(readFileSync(modelRecord, "utf8"));
  } catch (error) {
    failures.push(`${modelRecord} is not valid JSON: ${error.message}`);
  }
  if (record) {
    ensure(record.id === MODEL.id, "record id must match the executable spec");
    ensure(record.name === MODEL.name, "record name must match the executable spec");
    ensure(
      record.parametersBillions === MODEL.parametersBillions,
      "record parametersBillions must match the executable spec",
    );
    ensure(record.status === MODEL.status, "record status must match the executable spec");
    ensure(record.doc === MODEL.doc, "record.doc must match the executable spec");
    ensure(
      JSON.stringify(record.architecture) === JSON.stringify(ARCHITECTURE),
      "record architecture must match the executable ARCHITECTURE exactly",
    );
    ensure(
      JSON.stringify(record.routing) === JSON.stringify(MODEL.routing),
      "record routing must match the executable spec exactly",
    );
  }
}

if (failures.length > 0) {
  console.error("SEIS native AI model check failed:");
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log(
  `SEIS native AI model check passed (${MODEL.name}: ${params.totalBillions}B params, status=${MODEL.status}).`,
);
