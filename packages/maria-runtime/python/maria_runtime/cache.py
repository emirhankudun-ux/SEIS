from __future__ import annotations

from collections import OrderedDict
from copy import deepcopy
import hashlib
import json
from typing import Any, Optional


class PromptCache:
    """Small in-memory LRU cache keyed by the complete generation request."""

    def __init__(self, max_size: int = 32) -> None:
        if max_size < 1:
            raise ValueError("max_size must be positive")
        self.max_size = max_size
        self._cache: OrderedDict[str, Any] = OrderedDict()
        self.hits = 0
        self.misses = 0

    def _key(
        self,
        messages: list[dict[str, Any]],
        *,
        model: str,
        temperature: float,
        extra: Optional[dict[str, Any]] = None,
    ) -> str:
        request = {
            "messages": messages,
            "model": model,
            "temperature": temperature,
            "extra": extra or {},
        }
        canonical = json.dumps(
            request,
            ensure_ascii=False,
            sort_keys=True,
            separators=(",", ":"),
        )
        return hashlib.sha256(canonical.encode("utf-8")).hexdigest()

    def get(
        self,
        messages: list[dict[str, Any]],
        *,
        model: str,
        temperature: float,
        extra: Optional[dict[str, Any]] = None,
    ) -> Any:
        key = self._key(messages, model=model, temperature=temperature, extra=extra)
        if key not in self._cache:
            self.misses += 1
            return None
        self.hits += 1
        self._cache.move_to_end(key)
        return deepcopy(self._cache[key])

    def put(
        self,
        messages: list[dict[str, Any]],
        response: Any,
        *,
        model: str,
        temperature: float,
        extra: Optional[dict[str, Any]] = None,
    ) -> None:
        key = self._key(messages, model=model, temperature=temperature, extra=extra)
        self._cache[key] = deepcopy(response)
        self._cache.move_to_end(key)
        while len(self._cache) > self.max_size:
            self._cache.popitem(last=False)

    def stats(self) -> dict[str, float | int]:
        total = self.hits + self.misses
        return {
            "hits": self.hits,
            "misses": self.misses,
            "size": len(self._cache),
            "hit_rate": round(self.hits / total, 3) if total else 0.0,
        }
