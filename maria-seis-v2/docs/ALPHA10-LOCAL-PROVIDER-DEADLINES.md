# Local provider response deadlines

Status: implemented on the existing platform branch for PR #226; not a release.
Scope: the existing native Ollama and OpenAI-compatible host adapters only.

## Root cause

At `b1cbcc2638e48ea6f0d86966593d26bfebbea83a`, both adapters cleared their
request timer and external cancellation listener as soon as `fetch()` resolved.
Fetch resolves when response headers arrive, not when `response.json()` finishes.
A provider could therefore send headers and leave discovery, execution, or an
Ollama health refresh waiting indefinitely for the response body. The
OpenAI-compatible path also dispatched already-cancelled requests.

## Implemented behavior

Both adapters now call one small shared `requestLocalJson` helper. Their
public factory options, endpoints, request payloads, model-identity checks,
session interfaces and receipt formats remain unchanged.

- The existing request deadline covers headers **and** asynchronous JSON body
  consumption. It is not restarted when headers arrive.
- Cancellation rejects the caller and aborts the internal transport signal.
  An already-aborted request does not invoke fetch.
- The whole operation races an interruption promise, so a fetch/parser that
  ignores AbortSignal cannot keep the caller's promise pending.
- Late headers are not parsed; late body results cannot produce a successful
  session or completion receipt after cancellation or timeout.
- Timer and caller listener cleanup happens only after the request settles.
  A successful request is not aborted later by its former timer or caller.
- Network, HTTP and parsing failures retain fixed, redacted messages. Custom
  abort reasons and provider response details are not echoed.

This is a repair of the existing adapters, not a new provider, router,
permission mode, inference implementation, or retry strategy. The
OpenAI-compatible health method remains a session check; no new probe is added.

## Verification

The 21 new deadline tests ran before production changes: **16 failed, 5 passed**.
Failures reproduced missing body deadlines, ignored cancellation, late success,
pre-aborted dispatch, and fetch implementations ignoring abort. After the fix,
all **21 passed**, including real loopback HTTP tests for both adapters. The HTTP
fixtures explicitly wait until the client starts consuming a partial body,
then verify cancellation/timeout, socket closure, and a subsequent healthy
request. These fixtures are not AI models.

The complete package passed **251 Node tests** on Linux / Node 22.22.1, plus its
three pre-test scripts. The focused deadline suite passed 10 successive runs.
All existing `mcp:check`, `recovery:check` and `local-model:check` commands passed
with their narrow local package/process/transport scopes intact.

The existing offline browser script passed **17 checks** with Python Playwright
1.61.0 and the sandbox's Chromium. Initially Python Playwright was missing; it
was installed only in an isolated test environment, not added to the product.
No UI, styles, Maria portrait or orb code changed.

```sh
cd maria-seis-v2
npm test
npm run mcp:check
npm run recovery:check
npm run local-model:check
python3 tests/browser_smoke.py --offline
```

`MARIA Platform Core` adds dependency-free Node 22 checks on Ubuntu and macOS.
It runs on relevant pull requests and platform-branch/main pushes, so the
platform branch can obtain exact-head evidence even while its existing PR has
merge conflicts. It does not merge, publish, deploy or change other workflows.
Hosted results must be checked on the published head, not inferred from this file.

## Limits and rollback

Timers cannot preempt synchronous JavaScript, JSON parsing that blocks the event
loop, or a hostile in-process transport. An uncooperative provider may continue
its own computation after the caller stops waiting. This is not a byte-size,
CPU, memory, process-isolation, endpoint-locality, or model-intelligence guarantee.
Response-size limits and resource isolation remain separate work.

A transport receipt still has `outcomeVerified: false` and scope
`model-response-transport`; this fix cannot turn it into verified external work.
No credentials, external model service, real Ollama/LM Studio inference, user
files, native permissions or Python routing branches are involved. Revert the
focused helper/adapter/test/workflow/document changes to roll back; no persisted
user data or schema migration is required.

Reference: [WHATWG Fetch abort semantics](https://fetch.spec.whatwg.org/#abort-fetch).
The standard explains the lifecycle; regression results establish this patch's
limited tested behavior, not overall product security.
