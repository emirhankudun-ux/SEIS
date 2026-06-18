"""Minimal TF-IDF-like retrieval for local documentation."""

from __future__ import annotations

import hashlib
import json
import math
import re
from collections import Counter

from config import DOCS_DIR, VECTORS_DIR

_WORD_RE = re.compile(r"\w+", re.UNICODE)
_STOPWORDS = {
    "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
    "ve", "ile", "için", "ama", "bir", "bu", "şu", "o", "da", "de", "ki",
}


def _tokenize(text: str) -> list[str]:
    return [w.lower() for w in _WORD_RE.findall(text) if w.lower() not in _STOPWORDS and len(w) > 1]


def _chunk(text: str, chunk_size: int = 500, overlap: int = 50) -> list[str]:
    chunks: list[str] = []
    start = 0
    while start < len(text):
        end = min(start + chunk_size, len(text))
        chunks.append(text[start:end])
        if end >= len(text):
            break
        start = end - overlap
    return chunks


def _vectorize(text: str) -> dict[str, float]:
    tokens = _tokenize(text)
    if not tokens:
        return {}
    tf = Counter(tokens)
    total = len(tokens)
    return {t: c / total for t, c in tf.items()}


def _vector_file(source: str):
    return VECTORS_DIR / (hashlib.md5(source.encode("utf-8")).hexdigest() + ".json")


def index_file(path):
    try:
        text = path.read_text(encoding="utf-8", errors="replace")
    except Exception as exc:
        print(f"[RAG] Could not index {path}: {exc}")
        return

    chunks = _chunk(text)
    payload = {"source": str(path), "chunks": []}
    for idx, chunk in enumerate(chunks):
        payload["chunks"].append({
            "id": f"{path.name}#{idx}",
            "text": chunk,
            "vec": _vectorize(chunk),
        })

    _vector_file(str(path)).write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")
    print(f"[RAG] Indexed {path} ({len(chunks)} chunks)")


def index_all() -> None:
    VECTORS_DIR.mkdir(parents=True, exist_ok=True)
    allowed = {".md", ".txt", ".py", ".js", ".ts", ".json", ".yaml", ".yml", ".html", ".css"}
    for file in DOCS_DIR.rglob("*"):
        if file.is_file() and file.suffix.lower() in allowed:
            index_file(file)


def _cosine(vec1: dict[str, float], vec2: dict[str, float]) -> float:
    if not vec1 or not vec2:
        return 0.0
    keys = set(vec1.keys()) & set(vec2.keys())
    if not keys:
        return 0.0
    dot = sum(vec1[k] * vec2[k] for k in keys)
    norm1 = math.sqrt(sum(x * x for x in vec1.values()))
    norm2 = math.sqrt(sum(x * x for x in vec2.values()))
    if not norm1 or not norm2:
        return 0.0
    return dot / (norm1 * norm2)


def search(query: str, k: int = 3) -> list[dict]:
    qvec = _vectorize(query)
    if not qvec:
        return []

    scored: list[tuple[float, dict]] = []
    for vec_file in VECTORS_DIR.glob("*.json"):
        try:
            payload = json.loads(vec_file.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            continue
        source = payload.get("source", "?")
        for chunk in payload.get("chunks", []):
            score = _cosine(qvec, chunk.get("vec", {}))
            if score > 0:
                scored.append((score, {"source": source, "text": chunk.get("text", ""), "score": round(score, 4)}))

    scored.sort(key=lambda item: item[0], reverse=True)
    return [h for _, h in scored[:k]]
