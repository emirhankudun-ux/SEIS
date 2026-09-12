"""Cache request admission and recoverable allocation-failure regressions.

MemoryError is injected at allocation boundaries rather than exhausting the
runner. Behavioral assertions use the real cache before and after each fault.
"""
from __future__ import annotations

from collections import OrderedDict
import hashlib
import json
import random
from pathlib import Path
import sys
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "packages" / "maria-runtime" / "python"))
from maria_runtime import cache as cache_module
from maria_runtime.cache import PromptCache


def messages(text="synthetic"):
    return [{"role": "user", "content": text}]


def put(cache, name, value):
    cache.put(messages(name), value, model="fixture", temperature=0.2)


def get(cache, name):
    return cache.get(messages(name), model="fixture", temperature=0.2)


def canonical_key(value, extra=None):
    request = {"messages": value, "model": "fixture", "temperature": 0.2,
               "extra": {} if extra is None else extra}
    return hashlib.sha256(json.dumps(request, ensure_ascii=False, sort_keys=True,
                         separators=(",", ":"), allow_nan=False).encode("utf-8")).hexdigest()


class CacheRequestAdmissionTests(unittest.TestCase):
    def test_streaming_preserves_existing_canonical_digest(self):
        cache = PromptCache()
        for text, extra in [
            ("plain", {}),
            ("Türkçe Ελληνικά 日本語 🌍", {"seed": 4, "stops": ["x", "y"]}),
            ("quotes\"\\\n\x00", {"nested": {"β": True, "α": None}}),
            ("arrays", {"a": (1, 2.5, False), "z": -0.0}),
            ("large" * 20000, {"temperature": 0.1}),
        ]:
            with self.subTest(text=text[:20]):
                request = messages(text)
                self.assertEqual(cache._key(request, model="fixture", temperature=0.2, extra=extra),
                                 canonical_key(request, extra))

    def test_deterministic_nested_corpus_preserves_request_identity(self):
        rng = random.Random(713)
        samples = [None, False, True, 0, -1, 2 ** 80, -0.0, 1.25,
                   "é", "e\u0301", "日本", "🌍", "\u2028", "\\\"\n"]
        def value(depth):
            if depth == 0 or rng.randrange(3) == 0:
                return rng.choice(samples)
            if rng.randrange(2):
                return [value(depth - 1) for _ in range(rng.randrange(5))]
            return {"key-" + str(i): value(depth - 1) for i in range(rng.randrange(5))}
        cache = PromptCache()
        for index in range(100):
            request = [{"role": "user", "content": value(4)}]
            extra = {"options": value(3)}
            with self.subTest(index=index):
                self.assertEqual(cache._key(request, model="fixture", temperature=0.2, extra=extra),
                                 canonical_key(request, extra))

    def test_request_hash_does_not_materialize_full_json(self):
        request = messages("x" * 50000)
        expected = canonical_key(request)
        cache = PromptCache()
        with patch("maria_runtime.cache.json.dumps", side_effect=AssertionError("whole JSON buffer")):
            actual = cache._key(request, model="fixture", temperature=0.2)
        self.assertEqual(actual, expected)

    def test_hash_updates_are_bounded_even_for_single_unicode_literal(self):
        request = messages("🌍" * 30000)
        expected = canonical_key(request)
        real_sha = hashlib.sha256
        updates = []

        class ObservedHash:
            def __init__(self, data=b""):
                self.inner = real_sha()
                if data:
                    self.update(data)
            def update(self, data):
                updates.append(len(data))
                self.inner.update(data)
            def hexdigest(self):
                return self.inner.hexdigest()

        with patch("maria_runtime.cache.hashlib.sha256", ObservedHash):
            actual = PromptCache()._key(request, model="fixture", temperature=0.2)
        self.assertEqual(actual, expected)
        self.assertTrue(updates)
        self.assertLessEqual(max(updates), 16384)

    def test_byte_overflow_stops_encoder_before_next_chunk(self):
        cache = PromptCache(max_request_bytes=2048)
        advanced = []

        def chunks(*args, **kwargs):
            yield "{" + " " * 1500
            yield "🌍" * 200  # Fits remaining character count, exceeds UTF-8 bytes.
            advanced.append(True)
            raise AssertionError("encoder advanced after the byte ceiling")

        with patch("maria_runtime.cache.json.JSONEncoder.iterencode", chunks):
            key = cache._key(messages(), model="fixture", temperature=0.2)
        self.assertIsNone(key)
        self.assertEqual(advanced, [])

    def test_escaped_json_exact_byte_boundary(self):
        request = messages("\x00" * 600)
        encoded = json.dumps({"messages": request, "model": "fixture", "temperature": 0.2,
                              "extra": {}}, ensure_ascii=False, sort_keys=True,
                             separators=(",", ":"), allow_nan=False).encode("utf-8")
        accepted = PromptCache(max_request_bytes=len(encoded))
        denied = PromptCache(max_request_bytes=len(encoded) - 1)
        self.assertEqual(accepted._key(request, model="fixture", temperature=0.2),
                         hashlib.sha256(encoded).hexdigest())
        self.assertIsNone(denied._key(request, model="fixture", temperature=0.2))

    def test_nonstring_dictionary_keys_do_not_alias_valid_requests(self):
        for invalid, valid in [(1, "1"), (True, "true"), (None, "null"), (1.5, "1.5")]:
            with self.subTest(key=invalid):
                cache = PromptCache()
                cache.put(messages(), "valid", model="fixture", temperature=0.2, extra={valid: "v"})
                self.assertIsNone(cache.get(messages(), model="fixture", temperature=0.2,
                                            extra={invalid: "v"}))
                cache.put(messages(), "invalid", model="fixture", temperature=0.2, extra={invalid: "v"})
                self.assertEqual(cache.get(messages(), model="fixture", temperature=0.2,
                                           extra={valid: "v"}), "valid")
                self.assertEqual(cache.stats()["size"], 1)

    def test_nested_nonstring_key_bypasses_before_encoding(self):
        cache = PromptCache()
        request = [{"role": "user", "content": {"parts": [{1: "v"}]}}]
        with patch("maria_runtime.cache.json.JSONEncoder.iterencode",
                   side_effect=AssertionError("invalid request reached encoder")):
            cache.put(request, "invalid", model="fixture", temperature=0.2)
            self.assertIsNone(cache.get(request, model="fixture", temperature=0.2))
        self.assertEqual(cache.stats()["size"], 0)

    def test_invalid_unicode_and_nonfinite_requests_do_not_publish_partial_keys(self):
        cache = PromptCache()
        for text, extra in [("\ud800", {}), ("ok", {"value": float("nan")}),
                            ("ok", {"value": float("inf")})]:
            with self.subTest(extra=extra):
                cache.put(messages(text), "invalid", model="fixture", temperature=0.2, extra=extra)
                self.assertIsNone(cache.get(messages(text), model="fixture", temperature=0.2, extra=extra))
        self.assertEqual(cache.stats()["size"], 0)

    def test_json_key_rules_do_not_restrict_response_dictionary_keys(self):
        cache = PromptCache()
        value = {1: "numeric response key", (2, 3): bytearray(b"ok")}
        put(cache, "a", value)
        self.assertEqual(get(cache, "a"), value)


class CacheAllocationFailureTests(unittest.TestCase):
    def seeded(self):
        cache = PromptCache()
        put(cache, "a", {"answer": "old"})
        put(cache, "b", {"answer": "keep until pressure"})
        return cache

    def assert_released(self, cache, *, hits=0, misses=0, skipped=0):
        stats = cache.stats()
        self.assertEqual(stats["size"], 0)
        self.assertEqual(stats["estimated_bytes"], 0)
        self.assertEqual(stats["allocation_failures"], 1)
        self.assertEqual(stats["hits"], hits)
        self.assertEqual(stats["misses"], misses)
        self.assertEqual(stats["skipped"], skipped)
        put(cache, "after", {"answer": "works"})
        self.assertEqual(get(cache, "after"), {"answer": "works"})

    def test_put_copy_failure_releases_optional_data(self):
        cache = self.seeded()
        with patch("maria_runtime.cache.deepcopy", side_effect=MemoryError):
            try:
                put(cache, "a", {"answer": "new"})
            except MemoryError:
                self.fail("optional cache copy leaked MemoryError")
        self.assert_released(cache, skipped=1)

    def test_get_copy_failure_is_a_miss_not_a_hit(self):
        cache = self.seeded()
        with patch("maria_runtime.cache.deepcopy", side_effect=MemoryError):
            try:
                result = get(cache, "a")
            except MemoryError:
                self.fail("optional cache read leaked MemoryError")
        self.assertIsNone(result)
        self.assert_released(cache, misses=1)

    def test_put_request_hash_failure_releases_potentially_stale_data(self):
        cache = self.seeded()
        with patch("maria_runtime.cache.hashlib.sha256", side_effect=MemoryError):
            try:
                put(cache, "a", {"answer": "new"})
            except MemoryError:
                self.fail("key allocation failure escaped put")
        self.assert_released(cache, skipped=1)

    def test_get_request_hash_failure_releases_cache(self):
        cache = self.seeded()
        with patch("maria_runtime.cache.hashlib.sha256", side_effect=MemoryError):
            try:
                result = get(cache, "a")
            except MemoryError:
                self.fail("key allocation failure escaped get")
        self.assertIsNone(result)
        self.assert_released(cache, misses=1)

    def test_request_preflight_failure_is_contained(self):
        cache = self.seeded()
        with patch("maria_runtime.cache._estimated_size", side_effect=MemoryError):
            try:
                put(cache, "a", "new")
            except MemoryError:
                self.fail("request preflight failure escaped")
        self.assert_released(cache, skipped=1)

    def test_post_copy_measurement_failure_clears_accounting(self):
        cache = self.seeded()
        real_measure = cache_module._estimated_size
        calls = 0
        def measured(*args, **kwargs):
            nonlocal calls
            calls += 1
            if calls == 3:
                raise MemoryError
            return real_measure(*args, **kwargs)
        with patch("maria_runtime.cache._estimated_size", measured):
            try:
                put(cache, "a", {"answer": "new"})
            except MemoryError:
                self.fail("post-copy measurement failure escaped")
        self.assertEqual(calls, 3)
        self.assert_released(cache, skipped=1)

    def test_partial_mapping_insert_failure_releases_entries(self):
        cache = self.seeded()
        class FailedInsert(OrderedDict):
            def __setitem__(self, key, value):
                super().__setitem__(key, value)
                raise MemoryError
        failing = FailedInsert()
        for key, value in cache._cache.items():
            OrderedDict.__setitem__(failing, key, value)
        cache._cache = failing
        with _NoMemoryError(self):
            put(cache, "c", "new")
        self.assertEqual(cache.stats()["size"], 0)
        self.assertEqual(cache.stats()["estimated_bytes"], 0)
        self.assertEqual(cache.stats()["allocation_failures"], 1)
        cache._cache = OrderedDict()
        put(cache, "d", "D")
        self.assertEqual(get(cache, "d"), "D")

    def test_nonmemory_programming_errors_are_not_swallowed(self):
        cache = self.seeded()
        with patch("maria_runtime.cache.deepcopy", side_effect=RuntimeError("test defect")):
            with self.assertRaisesRegex(RuntimeError, "test defect"):
                put(cache, "a", "new")
        self.assertEqual(cache.stats().get("allocation_failures", 0), 0)

    def test_cancellation_is_not_swallowed(self):
        cache = self.seeded()
        with patch("maria_runtime.cache.deepcopy", side_effect=KeyboardInterrupt):
            with self.assertRaises(KeyboardInterrupt):
                get(cache, "a")

    def test_explicit_clear_keeps_allocation_failure_history(self):
        cache = self.seeded()
        with patch("maria_runtime.cache.deepcopy", side_effect=MemoryError):
            with _NoMemoryError(self):
                put(cache, "a", "new")
        cache.clear()
        self.assertEqual(cache.stats()["allocation_failures"], 1)
        self.assertEqual(cache.stats()["estimated_bytes"], 0)


class _NoMemoryError:
    def __init__(self, testcase):
        self.testcase = testcase
    def __enter__(self):
        return self
    def __exit__(self, kind, value, traceback):
        if kind is MemoryError:
            self.testcase.fail("recoverable allocation failure crossed cache boundary")
        return False


if __name__ == "__main__":
    unittest.main()
