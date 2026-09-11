# Alpha.10 follow-up — plugin cancellation lifecycle

Date: 2026-09-11. Branch: `maria-seis-v4-platform`. PR: #226. Parent checkpoint: `beba6f14e4130b29573b1cd1df2a11eca4470962`.

## Problem

The v2 plugin host bounded a capability call only after plugin factory initialization had completed. A plugin factory that never settled could therefore hang outside the configured timeout. Capability timeout also stopped waiting at the host boundary without delivering an abort signal to cooperative plugin code, and an external abort signal was not raced by the host.

That is a lifecycle and permission-boundary problem: cancellation must be a host contract, not merely an optional convention inside an individual capability.

## Bounded fix

Each invocation now creates a host-owned `AbortController` before plugin initialization starts. One timeout budget covers both factory initialization and capability execution. The resulting signal is passed to both the plugin factory and the capability context.

An authorized caller may provide an external `AbortSignal`. A pre-aborted signal returns `plugin-cancelled` without starting initialization; an in-flight abort is linked to the host controller and resolves the host call as `cancelled`. Malformed cancellation-signal objects fail closed.

The existing manifest compatibility, declared-capability and granted-permission checks remain ahead of plugin initialization.

## Test-first evidence

Three focused regressions were written against the unchanged host and failed for the intended reasons:

- a never-settling factory exceeded the configured plugin timeout;
- a timed-out capability did not receive an aborted signal;
- external cancellation did not bound a running invocation.

After the lifecycle fix:

- focused cancellation suite: **3/3 passed**;
- broad compatibility regression on the packaged alpha.8 baseline with this plugin-host change: **155/155 Node tests passed**, zero failed/skipped/cancelled.

The exact alpha.10 full suite was not reconstructed locally in this environment before publication of this commit. CI on the new branch head remains the authoritative exact-tree gate when a workflow is available.

## Truthfulness boundary

This is **cooperative same-process cancellation**, not a sandbox and not process termination. A buggy or hostile plugin that ignores the supplied abort signal may continue its own asynchronous side effects after the host stops awaiting it. Strong containment for untrusted plugins still requires process isolation or another enforceable execution boundary. No external plugin, real model, native computer-control, voice, vision, Unreal or Blender capability is claimed as verified by this change.
