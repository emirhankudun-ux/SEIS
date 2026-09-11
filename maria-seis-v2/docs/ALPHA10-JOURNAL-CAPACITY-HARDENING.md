# Alpha.10 follow-up — execution journal capacity safety

Date: 2026-09-11. Branch: `maria-seis-v4-platform`. PR: #226. Parent checkpoint: `7a33fb19406a1484ce01f3b679715841cb56c9e9`.

## Problem

The bounded execution journal previously enforced its record limit with tail slicing. Under sustained history, that could evict an older `running` record even though recovery treats the latest `running` record for a run as an interrupted-execution marker. Persistent reload used the same truncation behavior, so restarting the host could also lose the only recovery marker for an unfinished live run.

## Bounded fix

Journal compaction now derives active markers from each run ID's latest journal state. Active `running` markers and the record currently being committed are not eviction candidates. Older terminal or superseded history is evicted first.

If a new protected record cannot fit without discarding an active recovery marker, the journal throws `journal-active-capacity-exhausted`. The existing live orchestrator already treats a failed audit start as `unavailable` before invoking the runtime, so journal pressure fails closed instead of silently executing without recoverable audit evidence.

A superseded `running` record is not protected forever: when the same run ID has a later terminal record, the older marker is eligible for eviction. This matches the existing recovery scanner's latest-state semantics.

No automatic replay or resume is added. No external model, third-party MCP, OS-control, voice, vision, Unreal or Blender capability is enabled or claimed by this change.

## Test-first evidence

On the unchanged alpha.10 journal implementation, three new capacity tests failed for the intended reasons:

- an active recovery marker was evicted before terminal history;
- capacity exhaustion did not refuse a third active run;
- persistent reload discarded an active recovery marker.

After the bounded retention change, five focused tests pass, including latest-state semantics and a live-orchestrator integration case proving the runtime is not invoked when active recovery markers consume journal capacity.

Fresh local checks performed for this follow-up:

- focused journal-capacity suite: **5/5 passed**;
- broad compatibility regression: **157/157 Node tests passed** on the packaged alpha.8 baseline with the current audit-lifecycle orchestrator and this journal change applied;
- zero failed, skipped or cancelled tests in that compatibility run.

The exact alpha.10 full suite was not reconstructed and rerun in this environment, so the compatibility result above is not presented as a replacement for alpha.10's previously recorded verification. The parent alpha.10 checkpoint separately records 165/165 Node tests, 17/17 offline Chromium checks, and its MCP, recovery and loopback OpenAI-compatible transport acceptance checks.
