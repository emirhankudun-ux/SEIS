from __future__ import annotations

from collections import OrderedDict
from copy import deepcopy
import hashlib
import json
import sys
from threading import Lock
from typing import Any, Optional


class _Uncacheable(Exception):
    """Internal signal: optional cache admission exceeded its safety budget."""


def _estimated_size(
    value: Any, limit: int, *, string_keys_only: bool = False
) -> Optional[int]:
    """Bounded, conservative size of plain data; never inspect user objects.

    Repeated references count more than once. Container/allocator overhead
    outside this value is not a process-RSS measurement. Depth and visit caps
    also prevent cyclic or very wide values from monopolizing traversal/copy.
    """
    total = 0
    visits = 0

    def visit(item: Any, depth: int) -> None:
        nonlocal total, visits
        visits += 1
        kind = type(item)
        if depth > 32 or visits > 16384:
            raise _Uncacheable
        if kind not in (str, bytes, bytearray, int, float, bool, type(None), list, tuple, dict):
            raise _Uncacheable
        total += sys.getsizeof(item)
        if total > limit:
            raise _Uncacheable
        if kind is dict:
            for key, child in item.items():
                if string_keys_only and type(key) is not str:
                    raise _Uncacheable
                visit(key, depth + 1)
                visit(child, depth + 1)
        elif kind in (list, tuple):
            for child in item:
                visit(child, depth + 1)

    try:
        visit(value, 0)
    except _Uncacheable:
        return None
    return total


def _integer_budget(name: str, value: int, minimum: int = 0) -> int:
    if type(value) is not int:
        raise TypeError(f"{name} must be an integer")
    if value < minimum:
        raise ValueError(f"{name} must be at least {minimum}")
    return value


class PromptCache:
    """Optional in-memory LRU with count, retained-size and admission limits.

    Unsupported or oversized data bypasses caching, not model execution.
    Budgets are read-only; clear() lets a host release entries under pressure.
    Callers must not mutate input objects concurrently with get()/put().
    Recoverable allocation failures release optional entries and become misses
    or skipped writes; this is not a guarantee against process-wide OOM.
    """

    def __init__(
        self,
        max_size: int = 32,
        *,
        max_bytes: int = 8 * 1024 * 1024,
        max_entry_bytes: Optional[int] = None,
        max_request_bytes: int = 1024 * 1024,
    ) -> None:
        self._max_size = _integer_budget("max_size", max_size, 1)
        self._max_bytes = _integer_budget("max_bytes", max_bytes)
        entry_limit = 1024 * 1024 if max_entry_bytes is None else _integer_budget(
            "max_entry_bytes", max_entry_bytes
        )
        self._max_entry_bytes = min(entry_limit, self._max_bytes)
        self._max_request_bytes = _integer_budget("max_request_bytes", max_request_bytes)
        self._cache: OrderedDict[str, tuple[Any, int]] = OrderedDict()
        self._estimated_bytes = 0
        self._evictions = 0
        self._skipped = 0
        self._allocation_failures = 0
        self._lock = Lock()
        self.hits = 0
        self.misses = 0

    @property
    def max_size(self) -> int:
        return self._max_size

    @property
    def max_bytes(self) -> int:
        return self._max_bytes

    @property
    def max_entry_bytes(self) -> int:
        return self._max_entry_bytes

    @property
    def max_request_bytes(self) -> int:
        return self._max_request_bytes

    def _key(
        self,
        messages: list[dict[str, Any]],
        *,
        model: str,
        temperature: float,
        extra: Optional[dict[str, Any]] = None,
    ) -> Optional[str]:
        if not self.max_bytes or not self.max_entry_bytes or not self.max_request_bytes:
            return None
        if type(messages) is not list or type(model) is not str:
            return None
        if type(temperature) not in (int, float):
            return None
        if extra is not None and type(extra) is not dict:
            return None
        request = {
            "messages": messages,
            "model": model,
            "temperature": temperature,
            "extra": {} if extra is None else extra,
        }
        if _estimated_size(request, self.max_request_bytes, string_keys_only=True) is None:
            return None
        try:
            encoder = json.JSONEncoder(
                ensure_ascii=False,
                sort_keys=True,
                separators=(",", ":"),
                allow_nan=False,
            )
            digest = hashlib.sha256()
            encoded_size = 0
            for chunk in encoder.iterencode(request):
                # Even ASCII cannot fit if the character count exceeds the
                # remaining byte budget. Do not allocate its UTF-8 copy.
                if len(chunk) > self.max_request_bytes - encoded_size:
                    return None
                # iterencode may yield an entire large string literal. Slice
                # before UTF-8 conversion: at most 16 KiB per encoded block.
                for offset in range(0, len(chunk), 4096):
                    block = chunk[offset:offset + 4096].encode("utf-8")
                    encoded_size += len(block)
                    if encoded_size > self.max_request_bytes:
                        return None
                    digest.update(block)
            return digest.hexdigest()
        except (TypeError, ValueError, UnicodeError, RecursionError):
            return None

    def get(
        self,
        messages: list[dict[str, Any]],
        *,
        model: str,
        temperature: float,
        extra: Optional[dict[str, Any]] = None,
    ) -> Any:
        with self._lock:
            try:
                key = self._key(messages, model=model, temperature=temperature, extra=extra)
                if key is None or key not in self._cache:
                    self.misses += 1
                    return None
                isolated = deepcopy(self._cache[key][0])
                self._cache.move_to_end(key)
                self.hits += 1
                return isolated
            except MemoryError:
                # Optional acceleration must not fabricate a hit on copy failure.
                # Recovery is best-effort; sustained process OOM is not containable.
                isolated = None
                self._clear_locked()
                self._allocation_failures += 1
                self.misses += 1
                return None

    def _discard(self, key: str) -> None:
        previous = self._cache.pop(key, None)
        if previous is not None:
            self._estimated_bytes -= previous[1]

    def put(
        self,
        messages: list[dict[str, Any]],
        response: Any,
        *,
        model: str,
        temperature: float,
        extra: Optional[dict[str, Any]] = None,
    ) -> None:
        with self._lock:
            try:
                key = self._key(messages, model=model, temperature=temperature, extra=extra)
                if key is None:
                    self._skipped += 1
                    return
                # A non-admitted replacement must not leave an older response usable.
                self._discard(key)
                key_bytes = sys.getsizeof(key)
                limit = self.max_entry_bytes - key_bytes
                if _estimated_size(response, limit) is None:
                    self._skipped += 1
                    return
                isolated = deepcopy(response)
                # A copied container can have different allocation overhead.
                size = _estimated_size(isolated, limit)
                if size is None:
                    self._skipped += 1
                    return
                cost = size + key_bytes
                while self._cache and (
                    len(self._cache) >= self.max_size
                    or self._estimated_bytes + cost > self.max_bytes
                ):
                    _, (_, removed_cost) = self._cache.popitem(last=False)
                    self._estimated_bytes -= removed_cost
                    self._evictions += 1
                self._cache[key] = (isolated, cost)
                self._estimated_bytes += cost
            except MemoryError:
                isolated = None
                # Even a failed key allocation could be replacing an older
                # response. Clear optional state to avoid retaining stale data.
                self._clear_locked()
                self._allocation_failures += 1
                self._skipped += 1

    def _clear_locked(self) -> None:
        """Caller owns the non-reentrant lock; do not call public clear() here."""
        self._cache.clear()
        self._estimated_bytes = 0

    def clear(self) -> None:
        """Release cached references; lifetime diagnostic counters remain."""
        with self._lock:
            self._clear_locked()

    def stats(self) -> dict[str, float | int]:
        with self._lock:
            total = self.hits + self.misses
            return {
                "hits": self.hits,
                "misses": self.misses,
                "size": len(self._cache),
                "hit_rate": round(self.hits / total, 3) if total else 0.0,
                "estimated_bytes": self._estimated_bytes,
                "max_bytes": self.max_bytes,
                "max_entry_bytes": self.max_entry_bytes,
                "evictions": self._evictions,
                "skipped": self._skipped,
                "allocation_failures": self._allocation_failures,
            }
