# Alpha.4 — Host Adapter & Live Runtime Verification

## Scope

This checkpoint adds the first explicit live-runtime contract without shipping a concrete external provider.

### Host adapter API v2
A registered adapter must provide:
- `connect`
- `health`
- `execute`
- `disconnect`

The manager exposes the adapter as ready only after a successful connect and health check. Only capabilities returned by health and already declared by the adapter may become executable.

### Live runtime
`LiveRuntimeAdapter` is dependency-injected. The shipped application does not instantiate it. It routes one selected ready provider and preserves run/project/intent identity in the returned receipt.

### Live verification
`verifyLiveReceipt` requires all of the following before external work may be reported as verified:
- `ok:true`
- mode `live`
- runtime `host-runtime-v1`
- provider attribution
- matching intent
- matching run ID
- matching project ID
- `outcomeVerified:true`
- at least one non-empty evidence item

Adapter readiness alone is not outcome verification.

## Fresh combined evidence

The alpha.4 branch state was reconstructed with the provider-supervisor additions and the live-runtime additions together.

- `npm test`: **80 / 80 Node tests passed**
- offline Chromium acceptance: **17 / 17 checks passed**

The Chromium harness ran network-free because loopback HTTP navigation is blocked by the execution environment. HTTP deployment is therefore not claimed as verified.

## Not yet shipped

No concrete OpenAI, local-model, MCP, macOS, Unreal or Blender transport is enabled by default. The next milestone is one real local-model trusted-host adapter, verified end to end before adding more live providers.
