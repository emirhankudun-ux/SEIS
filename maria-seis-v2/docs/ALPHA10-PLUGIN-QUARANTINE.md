# Alpha.10 follow-up — abandoned plugin quarantine

Date: 2026-09-14. Branch: `maria-seis-v4-platform`. PR: #226.

## Problem

Plugin initialization cancellation is cooperative because plugin factories still execute in the SEIS host process. The host already prevented a late factory result from being published after the last waiter cancelled or timed out. However, when such an abandoned factory eventually returned an instance and the registration supplied no disposer, the host discarded that instance and allowed a later invocation to run the factory again.

That retry could duplicate detached side effects from an initialization that ignored its abort signal. Discarding the returned JavaScript object is not proof that files, subprocesses, sockets or other side effects were cleaned up.

## Bounded fix

If an abandoned initialization settles after its host signal was aborted:

- a usable registered disposer still moves the late instance to `cleanup-required`, so explicit host cleanup remains possible;
- without a usable cleanup path, the registration moves to `quarantined` and subsequent invocation fails closed with `plugin-quarantined`;
- the host does not automatically retry that factory.

This is intentionally conservative. It prevents repeated initialization attempts after the host has evidence that cooperative cancellation was not sufficient and no enforceable cleanup path exists.

## Test-first evidence

A focused regression was committed first as `tests/plugin-quarantine.test.mjs`. On the unchanged production host, the exact-tree MARIA Platform Core workflow failed at `npm test` on both Ubuntu and macOS because the registration returned to `registered` instead of entering quarantine.

The minimal host change then marks the registration quarantined after late abandoned settlement without cleanup support. The exact-head workflow result after this fix is the authoritative verification record.

## Truthfulness boundary

This quarantine does **not** terminate an uncooperative plugin, roll back detached side effects, create a sandbox, or provide process isolation. It only prevents SEIS from automatically invoking the same unsafe registration again after the host has lost cleanup authority.

Strong containment for untrusted third-party plugins still requires an enforceable boundary such as a dedicated process with explicit IPC, resource limits, termination semantics and audited capability forwarding.
