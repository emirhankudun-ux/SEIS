# Alpha.10 follow-up — timed-out plugin quarantine

Date: 2026-09-14. Branch: `maria-seis-v4-platform`. PR: #226.

## Problem

Plugin initialization cancellation is cooperative because plugin factories still execute in the SEIS host process. The host already prevented a late factory result from being published after the last waiter cancelled or timed out. However, when an initialization exceeded the host timeout, later settled, and the registration supplied no disposer, the host discarded that returned instance and allowed a later invocation to run the factory again.

That retry could duplicate detached side effects from initialization that failed to respect the host execution budget. Discarding the returned JavaScript object is not proof that files, subprocesses, sockets or other side effects were cleaned up.

## Bounded fix

When the last initialization waiter leaves because its host timeout expired, the shared initialization signal keeps the `plugin-timeout` reason. If that timed-out factory later settles:

- a usable registered disposer still moves the late instance to `cleanup-required`, so explicit host cleanup remains possible;
- without a usable cleanup path, the registration moves to `quarantined` and subsequent invocation fails closed with `plugin-quarantined`;
- the host does not automatically retry that timed-out factory.

Explicit caller cancellation retains the previous retry behavior after the abandoned factory settles, because a user cancellation is not by itself evidence that the plugin exceeded the configured execution budget. This distinction also preserves the existing cancellation contract.

## Test-first evidence

A focused regression was committed first as `tests/plugin-quarantine.test.mjs`. On the unchanged production host, the exact-tree MARIA Platform Core workflow failed at `npm test` on both Ubuntu and macOS because a timed-out late-settling registration returned to `registered` instead of entering quarantine.

The minimal host change propagates the last-waiter interruption reason into the shared initialization controller and quarantines only late settlement after `plugin-timeout` when cleanup support is unavailable. Exact-head workflow results after this fix are the authoritative verification record.

## Truthfulness boundary

This quarantine does **not** terminate an uncooperative plugin, roll back detached side effects, create a sandbox, or provide process isolation. It only prevents SEIS from automatically invoking the same timed-out registration again after the host has lost cleanup authority.

Strong containment for untrusted third-party plugins still requires an enforceable boundary such as a dedicated process with explicit IPC, resource limits, termination semantics and audited capability forwarding.
