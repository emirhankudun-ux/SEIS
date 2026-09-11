from __future__ import annotations

from dataclasses import dataclass
import math
import re
from typing import Iterable, Optional

from .context import ContextFact, ProjectContextEngine


class TextNormalizer:
    """Small deterministic tokenizer with Turkish-aware casing.

    This intentionally avoids embedding/runtime dependencies so retrieval remains
    available offline and can be used as a conservative fallback layer.
    """

    _TURKISH_CASE_MAP = str.maketrans({"İ": "i", "I": "ı"})
    _TOKEN_RE = re.compile(r"[\wçğıöşü]+", re.IGNORECASE | re.UNICODE)

    @classmethod
    def normalize(cls, text: str) -> str:
        if not isinstance(text, str):
            text = str(text)
        return text.translate(cls._TURKISH_CASE_MAP).lower()

    @classmethod
    def tokenize(cls, text: str) -> list[str]:
        normalized = cls.normalize(text)
        return [token for token in cls._TOKEN_RE.findall(normalized) if token]


@dataclass(frozen=True)
class BM25SearchHit:
    document_id: str
    score: float


class BM25Index:
    """In-memory BM25 index for small trusted context collections."""

    def __init__(self, *, k1: float = 1.5, b: float = 0.75) -> None:
        if k1 <= 0:
            raise ValueError("k1 must be positive")
        if not 0.0 <= b <= 1.0:
            raise ValueError("b must be between 0 and 1")
        self.k1 = k1
        self.b = b
        self._documents: dict[str, list[str]] = {}

    def add(self, document_id: str, text: str) -> None:
        if not document_id.strip():
            raise ValueError("document_id must be non-empty")
        self._documents[document_id] = TextNormalizer.tokenize(text)

    def extend(self, documents: Iterable[tuple[str, str]]) -> None:
        for document_id, text in documents:
            self.add(document_id, text)

    def search(self, query: str, *, top_k: int = 5) -> list[BM25SearchHit]:
        if top_k <= 0:
            raise ValueError("top_k must be positive")

        query_tokens = TextNormalizer.tokenize(query)
        if not query_tokens or not self._documents:
            return []

        lengths = {document_id: len(tokens) for document_id, tokens in self._documents.items()}
        average_length = sum(lengths.values()) / max(len(lengths), 1)
        if average_length == 0:
            return []

        document_count = len(self._documents)
        document_frequency: dict[str, int] = {}
        for token in set(query_tokens):
            document_frequency[token] = sum(
                1 for tokens in self._documents.values() if token in tokens
            )

        hits: list[BM25SearchHit] = []
        for document_id, tokens in self._documents.items():
            score = 0.0
            token_counts: dict[str, int] = {}
            for token in tokens:
                token_counts[token] = token_counts.get(token, 0) + 1

            for token in query_tokens:
                frequency = token_counts.get(token, 0)
                if frequency == 0:
                    continue
                df = document_frequency.get(token, 0)
                inverse_document_frequency = math.log(
                    1.0 + (document_count - df + 0.5) / (df + 0.5)
                )
                normalization = frequency + self.k1 * (
                    1.0 - self.b + self.b * lengths[document_id] / average_length
                )
                score += inverse_document_frequency * (
                    frequency * (self.k1 + 1.0) / normalization
                )

            if score > 0.0:
                hits.append(BM25SearchHit(document_id=document_id, score=score))

        hits.sort(key=lambda hit: (-hit.score, hit.document_id))
        return hits[:top_k]


@dataclass(frozen=True)
class ContextSearchHit:
    fact: ContextFact
    score: float


class ProjectContextRetriever:
    """BM25 retrieval over provenance-aware context facts.

    Retrieval is project-scoped and can be restricted to verified facts. It does
    not mutate context, promote evidence, or override ProjectContextEngine's
    conservative resolution policy.
    """

    def __init__(self, context: ProjectContextEngine) -> None:
        self.context = context

    def search(
        self,
        query: str,
        *,
        project: str,
        top_k: int = 5,
        verified_only: bool = False,
    ) -> list[ContextSearchHit]:
        if not project.strip():
            raise ValueError("project must be non-empty")
        if top_k <= 0:
            raise ValueError("top_k must be positive")
        if not TextNormalizer.tokenize(query):
            return []

        facts = [fact for fact in self.context.history(project=project)]
        if verified_only:
            facts = [fact for fact in facts if fact.verified]
        if not facts:
            return []

        index = BM25Index()
        fact_by_id: dict[str, ContextFact] = {}
        for position, fact in enumerate(facts):
            document_id = f"fact-{position}"
            searchable_text = " ".join(
                (
                    fact.key,
                    str(fact.value),
                    fact.source,
                    fact.fact_type,
                )
            )
            index.add(document_id, searchable_text)
            fact_by_id[document_id] = fact

        return [
            ContextSearchHit(fact=fact_by_id[hit.document_id], score=hit.score)
            for hit in index.search(query, top_k=top_k)
        ]
