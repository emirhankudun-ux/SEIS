#!/usr/bin/env python3
"""Synthetic request-key peak allocation benchmark; no models or network.

The reference reproduces PR #249's initial whole-buffer serialization strategy
under the same request preflight. This is not an end-to-end SEIS benchmark.
Input construction and imports are outside the measured interval; peak bytes
are tracemalloc allocations, not process RSS. Timing is measured separately
with tracing off. No numeric speed/memory threshold is an acceptance gate.
"""
from __future__ import annotations

import argparse
import gc
import hashlib
import json
from pathlib import Path
import platform
import statistics
import sys
import time
import tracemalloc

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "packages" / "maria-runtime" / "python"))
from maria_runtime.cache import PromptCache, _estimated_size

BUDGET = 1024 * 1024


def whole_buffer_key(messages):
    request = {"messages": messages, "model": "fixture", "temperature": 0.2, "extra": {}}
    if _estimated_size(request, BUDGET, string_keys_only=True) is None:
        return None
    canonical = json.dumps(request, ensure_ascii=False, sort_keys=True,
                           separators=(",", ":"), allow_nan=False)
    encoded = canonical.encode("utf-8")
    if len(encoded) > BUDGET:
        return None
    return hashlib.sha256(encoded).hexdigest()


def measure(function, messages, expected, runs):
    peaks = []
    elapsed = []
    for _ in range(runs):
        gc.collect()
        tracemalloc.start()
        try:
            result = function(messages)
            _, peak = tracemalloc.get_traced_memory()
        finally:
            tracemalloc.stop()
        if result != expected:
            raise RuntimeError("benchmark changed request-key semantics")
        peaks.append(peak)
    for _ in range(runs):
        gc.collect()
        started = time.perf_counter_ns()
        result = function(messages)
        elapsed.append((time.perf_counter_ns() - started) / 1_000_000)
        if result != expected:
            raise RuntimeError("timing run changed request-key semantics")
    return {"peak_median_bytes": statistics.median(peaks),
            "elapsed_median_ms": round(statistics.median(elapsed), 3)}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--runs", type=int, default=5, help="samples per strategy (1-25)")
    args = parser.parse_args()
    if not 1 <= args.runs <= 25:
        parser.error("--runs must be between 1 and 25")
    cache = PromptCache()
    def streaming_key(messages):
        return cache._key(messages, model="fixture", temperature=0.2)
    fixtures = {
        "large-ascii": [{"role": "user", "content": "x" * (768 * 1024)}],
        "many-parts": [{"role": "user", "content": str(i) + "x" * 2048} for i in range(256)],
        "unicode": [{"role": "user", "content": "日本🌍" * 40000}],
        "escape-over-budget": [{"role": "user", "content": "\x00" * 180000}],
    }
    results = []
    for name, messages in fixtures.items():
        expected = whole_buffer_key(messages)
        if streaming_key(messages) != expected:
            raise RuntimeError("reference/current digest mismatch")
        for strategy, function in (("whole-buffer-reference", whole_buffer_key),
                                   ("streaming", streaming_key)):
            results.append({"fixture": name, "strategy": strategy,
                            "admitted": expected is not None,
                            **measure(function, messages, expected, args.runs)})
    print(json.dumps({"scope": "synthetic-request-key-only", "python": platform.python_version(),
                      "platform": platform.system(), "runs": args.runs,
                      "request_budget_bytes": BUDGET, "results": results}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
