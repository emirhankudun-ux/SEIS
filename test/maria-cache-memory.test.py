from __future__ import annotations

from concurrent.futures import ThreadPoolExecutor
from copy import deepcopy
from pathlib import Path
import sys
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "packages" / "maria-runtime" / "python"))
from maria_runtime.cache import PromptCache


def request(name="a"):
    return [{"role": "user", "content": name}]


def put(cache, name, value):
    cache.put(request(name), value, model="local-test", temperature=0.2)


def get(cache, name):
    return cache.get(request(name), model="local-test", temperature=0.2)


class PromptCacheMemoryTests(unittest.TestCase):
    def test_default_rejects_large_payload_before_copy(self):
        cache = PromptCache()
        payload = bytearray(2 * 1024 * 1024)
        with patch("maria_runtime.cache.deepcopy", wraps=deepcopy) as copier:
            put(cache, "big", payload)
            self.assertEqual(copier.call_count, 0, "oversized payload must not be copied")
        self.assertEqual(cache.stats()["size"], 0)

    def test_entry_count_lru_is_preserved(self):
        cache = PromptCache(max_size=2)
        put(cache, "a", "A"); put(cache, "b", "B")
        self.assertEqual(get(cache, "a"), "A")
        put(cache, "c", "C")
        self.assertIsNone(get(cache, "b"))
        self.assertEqual(get(cache, "a"), "A")
        self.assertEqual(get(cache, "c"), "C")

    def test_memory_budget_evicts_lru_before_count_limit(self):
        cache = PromptCache(max_size=32, max_bytes=2500, max_entry_bytes=2000)
        put(cache, "a", bytearray(1000)); put(cache, "b", bytearray(1000))
        get(cache, "a")
        put(cache, "c", bytearray(1000))
        self.assertIsNone(get(cache, "b"))
        self.assertIsNotNone(get(cache, "a"))
        self.assertIsNotNone(get(cache, "c"))
        self.assertLessEqual(cache.stats()["estimated_bytes"], 2500)
        self.assertEqual(cache.stats()["evictions"], 1)

    def test_nested_payload_counts_children_not_only_root(self):
        cache = PromptCache(max_bytes=4096, max_entry_bytes=2048)
        put(cache, "large", {"items": [bytearray(3000)]})
        self.assertEqual(cache.stats()["size"], 0)

    def test_unicode_payload_is_not_measured_as_character_count(self):
        cache = PromptCache(max_bytes=4096, max_entry_bytes=1500)
        put(cache, "ascii", "a" * 500)
        put(cache, "unicode", "\U0001f30d" * 500)
        self.assertIsNotNone(get(cache, "ascii"))
        self.assertIsNone(get(cache, "unicode"))

    def test_oversized_replacement_invalidates_only_matching_key(self):
        cache = PromptCache(max_bytes=4096, max_entry_bytes=1024)
        put(cache, "a", "old"); put(cache, "b", "keep")
        put(cache, "a", bytearray(2048))
        self.assertIsNone(get(cache, "a"))
        self.assertEqual(get(cache, "b"), "keep")
        self.assertEqual(cache.stats()["skipped"], 1)

    def test_replacement_releases_previous_accounting(self):
        cache = PromptCache(max_bytes=4096)
        put(cache, "a", bytearray(2000))
        before = cache.stats()["estimated_bytes"]
        put(cache, "a", "small")
        self.assertLess(cache.stats()["estimated_bytes"], before)
        self.assertEqual(cache.stats()["size"], 1)
        self.assertEqual(cache.stats()["evictions"], 0)

    def test_put_and_get_remain_isolated(self):
        cache = PromptCache()
        original = {"nested": [bytearray(b"abc")]}
        put(cache, "a", original)
        before = cache.stats()["estimated_bytes"]
        original["nested"][0][0] = 120
        returned = get(cache, "a")
        self.assertEqual(returned["nested"][0], bytearray(b"abc"))
        returned["nested"].append("extra")
        self.assertEqual(get(cache, "a"), {"nested": [bytearray(b"abc")]})
        self.assertEqual(cache.stats()["estimated_bytes"], before)

    def test_opaque_payload_does_not_invoke_user_hooks(self):
        class Opaque:
            def __sizeof__(self):
                raise AssertionError("unsafe sizeof hook")
            def __deepcopy__(self, memo):
                raise AssertionError("unsafe copy hook")
        cache = PromptCache()
        put(cache, "a", {"opaque": Opaque()})
        self.assertEqual(cache.stats()["size"], 0)

    def test_builtin_subclass_is_not_traversed(self):
        class CustomList(list):
            def __iter__(self):
                raise AssertionError("unsafe iterator hook")
        cache = PromptCache()
        put(cache, "a", CustomList([1, 2]))
        self.assertEqual(cache.stats()["size"], 0)

    def test_cycles_and_deep_payloads_bypass_without_recursion_error(self):
        cache = PromptCache()
        cyclic = []; cyclic.append(cyclic)
        deep = "leaf"
        for _ in range(50):
            deep = [deep]
        put(cache, "cycle", cyclic); put(cache, "deep", deep)
        self.assertEqual(cache.stats()["size"], 0)
        self.assertEqual(cache.stats()["skipped"], 2)

    def test_shared_subobjects_preserve_aliasing_on_copy(self):
        cache = PromptCache()
        shared = ["value"]
        put(cache, "a", [shared, shared])
        result = get(cache, "a")
        self.assertIs(result[0], result[1])
        self.assertIsNot(result[0], shared)

    def test_wide_payload_traversal_is_bounded(self):
        cache = PromptCache(max_bytes=8 * 1024 * 1024)
        put(cache, "wide", [None] * 20000)
        self.assertEqual(cache.stats()["size"], 0)

    def test_large_request_bypasses_serialization_and_copy(self):
        cache = PromptCache(max_request_bytes=2048)
        messages = request("x" * 8192)
        with patch("maria_runtime.cache.json.dumps", side_effect=AssertionError("must not encode")):
            cache.put(messages, "small", model="local-test", temperature=0.2)
            self.assertIsNone(cache.get(messages, model="local-test", temperature=0.2))
        self.assertEqual(cache.stats()["size"], 0)

    def test_malformed_request_bypasses_instead_of_crashing(self):
        cache = PromptCache()
        cyclic = []; cyclic.append(cyclic)
        cache.put(cyclic, "small", model="m", temperature=0.2)
        self.assertIsNone(cache.get(cyclic, model="m", temperature=0.2))
        cache.put(request(), "small", model="m", temperature=0.2, extra={"blob": b"not-json"})
        self.assertEqual(cache.stats()["size"], 0)

    def test_full_request_identity_and_order_independent_extra(self):
        cache = PromptCache()
        a = request("first") + request("last")
        cache.put(a, "ok", model="m", temperature=0.2, extra={"b": 2, "a": 1})
        self.assertEqual(cache.get(a, model="m", temperature=0.2, extra={"a": 1, "b": 2}), "ok")
        for messages, model, temp in [(request("first") + request("other"), "m", 0.2), (a, "other", 0.2), (a, "m", 0.3)]:
            self.assertIsNone(cache.get(messages, model=model, temperature=temp, extra={"a": 1, "b": 2}))

    def test_zero_budget_disables_cache(self):
        cache = PromptCache(max_bytes=0)
        with patch("maria_runtime.cache.deepcopy", side_effect=AssertionError("disabled cache must not copy")):
            put(cache, "a", "A")
            self.assertIsNone(get(cache, "a"))
        self.assertEqual(cache.stats()["estimated_bytes"], 0)

    def test_clear_releases_entries_and_preserves_counters(self):
        cache = PromptCache()
        put(cache, "a", "A"); get(cache, "a"); get(cache, "b")
        before = cache.stats()
        cache.clear()
        after = cache.stats()
        self.assertEqual(after["estimated_bytes"], 0)
        self.assertEqual(after["size"], 0)
        self.assertEqual(after["hits"], before["hits"])
        self.assertEqual(after["misses"], before["misses"])
        cache.clear()
        put(cache, "c", "C")
        self.assertEqual(get(cache, "c"), "C")

    def test_configuration_requires_exact_nonnegative_integers(self):
        for field in ("max_size", "max_bytes", "max_entry_bytes", "max_request_bytes"):
            for value in (True, False, 1.5, "32", -1):
                with self.subTest(field=field, value=value):
                    with self.assertRaises((TypeError, ValueError)):
                        PromptCache(**{field: value})
        with self.assertRaises(ValueError):
            PromptCache(max_size=0)

    def test_budget_cannot_be_mutated_without_validation(self):
        cache = PromptCache()
        for field in ("max_size", "max_bytes", "max_entry_bytes", "max_request_bytes"):
            with self.subTest(field=field):
                with self.assertRaises(AttributeError):
                    setattr(cache, field, -1)

    def test_exact_entry_and_total_boundary(self):
        payload = bytearray(256)
        probe = PromptCache()
        key = probe._key(request(), model="local-test", temperature=0.2)
        cost = sys.getsizeof(key) + sys.getsizeof(deepcopy(payload))
        accepted = PromptCache(max_bytes=cost, max_entry_bytes=cost)
        put(accepted, "a", payload)
        self.assertEqual(accepted.stats()["estimated_bytes"], cost)
        self.assertEqual(get(accepted, "a"), payload)
        rejected = PromptCache(max_bytes=cost - 1, max_entry_bytes=cost - 1)
        put(rejected, "a", payload)
        self.assertEqual(rejected.stats()["size"], 0)

    def test_encoded_request_budget_rejects_escape_expansion(self):
        cache = PromptCache(max_request_bytes=2000)
        messages = request("\x00" * 800)
        cache.put(messages, "small", model="m", temperature=0.2)
        self.assertIsNone(cache.get(messages, model="m", temperature=0.2))
        self.assertEqual(cache.stats()["size"], 0)

    def test_zero_entry_or_request_budget_disables_admission(self):
        for options in ({"max_entry_bytes": 0}, {"max_request_bytes": 0}):
            with self.subTest(options=options):
                cache = PromptCache(**options)
                with patch("maria_runtime.cache.deepcopy", side_effect=AssertionError("disabled")):
                    put(cache, "a", "A")
                self.assertIsNone(get(cache, "a"))
                self.assertEqual(cache.stats()["estimated_bytes"], 0)

    def test_repeated_work_and_threads_keep_budgets_consistent(self):
        cache = PromptCache(max_size=5, max_bytes=8192, max_entry_bytes=4096)
        def work(worker):
            for i in range(80):
                name = f"{worker}-{i}"
                put(cache, name, {"payload": bytearray(1024)})
                get(cache, name)
                stats = cache.stats()
                self.assertLessEqual(stats["size"], 5)
                self.assertGreaterEqual(stats["estimated_bytes"], 0)
                self.assertLessEqual(stats["estimated_bytes"], 8192)
        with ThreadPoolExecutor(max_workers=4) as pool:
            list(pool.map(work, range(4)))
        cache.clear()
        self.assertEqual(cache.stats()["estimated_bytes"], 0)


if __name__ == "__main__":
    unittest.main()
