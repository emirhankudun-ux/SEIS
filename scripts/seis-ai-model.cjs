// SEIS native AI model — executable architecture specification (the "model card"
// in code form) for SEIS's own 150-billion-parameter foundation model.
//
// Documented spec:  docs/platform/seis-native-ai-model.md
// Machine-readable:  content/governance/seis-ai-model.json (kept in sync by
//                    check:seis-ai-model — doc + JSON + code must agree)
// Routing context:   docs/platform/hybrid-ai-routing-policy.md
//
// Why this lives as a spec, not weights: a 150B-parameter model is trained on a
// GPU cluster, not in this repo. SEIS records the model the same way it records
// every other capability — as a governed, machine-readable, CI-validated record
// of intent and architecture. The check below proves the declared architecture
// actually computes to ~150B parameters, so the headline number is never just a
// claim. When weights exist, `status` advances and `artifact` is filled in.

// ---------------------------------------------------------------------------
// Architecture — dense, decoder-only transformer (GPT/Llama family).
// The parameter count is derived from these numbers, not asserted by hand.
// ---------------------------------------------------------------------------
const ARCHITECTURE = {
  family: "decoder-only-transformer",
  hiddenSize: 12288, // d_model
  numLayers: 82,
  numAttentionHeads: 96, // head dim = 12288 / 96 = 128
  numKeyValueHeads: 12, // grouped-query attention (8x KV compression)
  feedForwardMultiplier: 3.25, // SwiGLU d_ff = 3.25 * d_model = 39936 (Llama-style)
  vocabSize: 128256,
  maxContextTokens: 32768,
  positionalEncoding: "rope",
  normalization: "rmsnorm",
  activation: "swiglu",
  tiedEmbeddings: true,
};

const TARGET_PARAMETERS = 150_000_000_000; // 150 billion
const TOLERANCE = 0.03; // declared total must land within ±3% of the target

// Derives the parameter count from ARCHITECTURE. Counts the dominant terms
// (embeddings, attention projections, feed-forward) plus the small norm terms,
// so the total is a faithful estimate rather than a round figure.
function computeParameters(arch = ARCHITECTURE) {
  const d = arch.hiddenSize;
  const L = arch.numLayers;
  const dff = arch.feedForwardMultiplier * d;
  const headDim = d / arch.numAttentionHeads;

  // Attention projections per layer (GQA: Q is full width, K/V are compressed
  // to numKeyValueHeads, output projection is full width).
  const qProj = d * d;
  const kvProj = 2 * d * (arch.numKeyValueHeads * headDim);
  const oProj = d * d;
  const attnPerLayer = qProj + kvProj + oProj;

  // SwiGLU feed-forward has three matrices: gate, up (both d -> dff) and
  // down (dff -> d).
  const ffnPerLayer = 3 * d * dff;

  // Two RMSNorm gains per layer (attention + ffn), each of width d.
  const normPerLayer = 2 * d;

  const perLayer = attnPerLayer + ffnPerLayer + normPerLayer;
  const layers = L * perLayer;

  // Token embedding (tied with the output projection, so counted once) plus the
  // final pre-logits norm.
  const embeddings = arch.vocabSize * d;
  const finalNorm = d;

  const total = layers + embeddings + finalNorm + (arch.tiedEmbeddings ? 0 : embeddings);

  return {
    perLayer,
    attnPerLayer,
    ffnPerLayer,
    layers,
    embeddings,
    finalNorm,
    total,
    totalBillions: Math.round((total / 1e9) * 10) / 10,
  };
}

// The spec object that mirrors content/governance/seis-ai-model.json.
const MODEL = {
  id: "seis-native-ai-model",
  name: "SEIS-150B",
  parametersBillions: 150,
  status: "specification", // specification -> training -> evaluation -> released
  doc: "docs/platform/seis-native-ai-model.md",
  executable: "scripts/seis-ai-model.cjs",
  record: "content/governance/seis-ai-model.json",
  routingDoc: "docs/platform/hybrid-ai-routing-policy.md",
  architecture: ARCHITECTURE,
  training: {
    paradigm: "self-supervised pretraining + instruction tuning + preference alignment",
    tokensBillions: 3000, // ~20 tokens/param (Chinchilla-style data budget)
    precision: "bf16",
    optimizer: "adamw",
    parallelism: ["tensor", "pipeline", "data", "fully-sharded"],
    estimatedAccelerators: "1k+ high-memory GPUs (e.g. H100-class)",
  },
  routing: {
    // The hybrid routing policy is unchanged: OpenAI/Codex stays the operational
    // default writer/runtime today. SEIS-150B is the sovereign in-house tier the
    // policy routes to as it matures — recorded here, not yet the live default.
    tier: "sovereign-inhouse",
    defaultTodayRemains: "codex",
    promoteWhen: "status === 'released' && evaluation gates pass",
  },
  artifact: null, // filled with weight location/hash once trained
};

module.exports = {
  ARCHITECTURE,
  MODEL,
  TARGET_PARAMETERS,
  TOLERANCE,
  computeParameters,
};
