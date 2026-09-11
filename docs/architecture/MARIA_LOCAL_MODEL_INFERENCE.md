# MARIA Local Model Inference

## Status

Active bounded execution contract for `feature/maria-intelligence-fabric-v1`.

This slice adds explicit text-cognition adapters for already-running, already-routed local Ollama and LM Studio models. It does **not** launch either runtime, load or download a model, discover arbitrary endpoints, authenticate cloud services, grant tool authority, or enable uncontrolled background inference.

## Components

- `OllamaModelWorkAdapter`
  - fixed provider identity: `ollama`
  - default literal-loopback port: `11434`
  - fixed endpoint: `POST /api/chat`
  - non-streaming text cognition only
- `LMStudioModelWorkAdapter`
  - fixed provider identity: `lm-studio`
  - default literal-loopback port: `1234`
  - fixed endpoint: `POST /v1/chat/completions`
  - non-streaming text cognition only
- `LocalModelLimits`
  - per-call request/response/context/timeout ceilings
  - hard ceilings independent of provider-advertised limits
- `LocalModelRequest` / `LocalModelResponse`
  - narrow transport envelopes
  - request body and all raw response fields are hidden from normal `repr`
- `LoopbackModelHTTPTransport`
  - literal `127.0.0.1` only
  - no hostname/DNS selection
  - no proxy/environment routing
  - no redirects
  - no credentials
  - no automatic retry
  - whole-I/O deadline enforced with socket shutdown

## Trust boundary

Discovery and inference are deliberately separate.

```text
LocalRuntimeProbe / discovery evidence
              |
              v
verified ModelSpec + canonical capability
              |
              v
ModelRouter / WorkRoutePlan
              |
              v
ModelWorkStepRunner
              |
              v
explicit Ollama or LM Studio adapter
              |
              v
fixed literal-loopback HTTP transport
```

A successful discovery probe does not execute inference. A routed model does not grant tool authority. A model adapter does not discover or launch a runtime. A local HTTP endpoint cannot be selected by arbitrary URL, hostname, path, method, or request header.

## Input contract

The concrete adapters accept only a `ModelWorkInput` whose payload is exactly:

```json
{
  "messages": [
    {"role": "system|user|assistant", "content": "text"}
  ]
}
```

The adapter rejects hidden provider overrides such as:

- `model`
- `stream`
- `tools`
- arbitrary provider options
- image/tool content structures
- tool-role messages
- tool calls embedded in input records

This keeps provider identity, model identity, endpoint selection, streaming mode, output budget, and context allocation under runtime policy rather than prompt-controlled payloads.

## Budget contract

Defaults are intentionally below hard ceilings:

| Limit | Default | Hard ceiling |
| --- | ---: | ---: |
| Request bytes | 262,144 | 1,048,576 |
| Response bytes | 1,048,576 | 4,194,304 |
| Context allocation | 8,192 tokens | 65,536 tokens |
| Timeout | 120,000 ms | 300,000 ms |

`max_output_tokens` remains separately bounded by `ModelWorkStepBinding` and the adapter. Ollama `num_ctx` uses the smaller of the routed model context and the configured local context ceiling; it never blindly allocates the provider-advertised maximum.

Before network I/O the adapter checks:

1. exact provider family;
2. local model identity;
3. current availability;
4. required `chat` capability;
5. model-name shape and control characters;
6. timeout and output-token bounds;
7. positive input-token estimate;
8. estimated input + output against the bounded context allocation;
9. message schema and count;
10. encoded request-byte size.

After the provider returns, reported input/output usage is revalidated against the same output/context ceilings.

## Transport deadline

The default transport uses a literal `127.0.0.1` connection and a whole-I/O deadline. A plain socket inactivity timeout is insufficient because a peer can slowly drip headers or body bytes while continually resetting inactivity timers.

The transport therefore keeps the connected socket reference and starts one bounded watchdog. When the deadline expires it shuts down that exact socket, causing slow header/body reads to fail. The watchdog is cancelled and joined before return so no deadline thread is left behind.

The transport accepts the exact `LocalModelRequest` type rather than subclasses. This prevents an injected subclass from overriding the derived fixed endpoint and turning the transport into a general-purpose localhost HTTP client.

## Response contract

Only one complete assistant text generation is accepted.

For Ollama, success requires:

- HTTP 200 JSON;
- exact returned model identity;
- `done: true`;
- `done_reason: "stop"`;
- assistant role;
- non-empty text content;
- valid non-negative integer `prompt_eval_count` and `eval_count`;
- no tool calls, function call, or image output.

For LM Studio, success requires:

- HTTP 200 JSON;
- exact returned model identity;
- exactly one choice at index `0`;
- `finish_reason: "stop"`;
- assistant role;
- non-empty text content;
- valid non-negative integer prompt/completion usage;
- consistent `total_tokens` when present;
- no tool calls, function call, or image output.

Partial generations, length-limited completions, tool-call output, malformed JSON, duplicate JSON keys, non-finite JSON constants, model mismatch, missing usage, unsupported media type, oversized responses, and invalid response metadata fail closed.

Provider reasoning/thinking fields are never returned as the public cognition result.

## Failure vocabulary and retry authority

Concrete adapters emit a bounded diagnostic vocabulary such as:

- `authentication-required`
- `invalid-model-input`
- `invalid-response`
- `model-mismatch`
- `request-too-large`
- `response-too-large`
- `output-budget-exceeded`
- `context-budget-exceeded`
- `incomplete-output`
- `unsupported-output`
- `policy-rejected`
- `provider-failure`
- `transport-failure`
- `rate-limited`
- `temporarily-unavailable`
- `timeout`

`ModelWorkStepRunner` retains only its fixed allowlist. Unknown provider categories collapse to `provider-failure`, so arbitrary provider text cannot become retained execution evidence.

Retry authority is narrower than diagnostic retention. Only the explicit transient categories can remain retryable:

- `transport-failure`
- `rate-limited`
- `temporarily-unavailable`
- `timeout`

The adapter itself never retries. `WorkPlanExecutor` remains the owner of bounded retry policy.

## Redaction and retention

Prompts, request bodies, provider response bodies, provider headers, model output, provider thinking text, exception strings, and dependency payloads are transient.

Normal diagnostic representations hide:

- `ModelWorkInput.payload`;
- `ModelAdapterResult.output`;
- `LocalModelRequest.body`;
- every raw `LocalModelResponse` field;
- `WorkStepRunResult.result`.

The adapters do not log raw requests or responses. Transport exceptions are mapped to fixed categories without retaining exception text.

## Verification

The focused contract suite covers:

- exact Ollama and LM Studio request construction;
- hidden-override rejection;
- provider/model/locality/capability checks;
- request, response, context, output, and timeout bounds;
- UTF-8 request sizing;
- model identity mismatch;
- provider usage accounting;
- incomplete/tool-call output rejection;
- normalized HTTP/transport failures;
- unknown-diagnostic collapse in `ModelWorkStepRunner`;
- public package exports;
- response representation redaction;
- request-subclass endpoint override prevention;
- a harmless real literal-loopback socket fixture;
- slow-header and slow-body deadline enforcement;
- redirect rejection and bounded reads;
- integration through `ModelWorkStepRunner` dependency input.

The fixture is not Ollama or LM Studio and performs no model inference. It only verifies the real local HTTP transport contract without requiring a provider installation in CI.

## Deliberately excluded

This slice does not add:

- automatic Ollama/LM Studio process launch;
- model load or download;
- runtime installation;
- arbitrary base URLs;
- non-loopback inference;
- proxy support;
- API keys or bearer headers;
- streaming output;
- images/vision payloads;
- embeddings;
- provider tool calls;
- persistent conversation storage;
- raw chain-of-thought retention;
- cloud-provider execution adapters.

Those capabilities must be introduced as separate reviewed contracts rather than widened through this local text-cognition boundary.
