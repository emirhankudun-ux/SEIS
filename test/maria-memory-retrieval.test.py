from __future__ import annotations

import sys
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "packages" / "maria-runtime" / "python"))

from maria_runtime.context import ContextFact, ProjectContextEngine
from maria_runtime.memory_retrieval import BM25Index, ProjectContextRetriever, TextNormalizer


class MariaMemoryRetrievalTests(unittest.TestCase):
    def test_text_normalizer_handles_turkish_case_and_punctuation(self):
        tokens = TextNormalizer.tokenize("İstanbul'da GİT durumu nasıl?")
        self.assertIn("istanbul", tokens)
        self.assertIn("git", tokens)
        self.assertIn("durumu", tokens)
        self.assertIn("nasıl", tokens)

    def test_bm25_ranks_relevant_document_first(self):
        index = BM25Index()
        index.add("git", "Git branch pull request repository merge")
        index.add("vision", "camera image vision analysis routing")
        index.add("audio", "speech microphone wake word audio")

        hits = index.search("repository branch", top_k=2)

        self.assertEqual(hits[0].document_id, "git")
        self.assertGreater(hits[0].score, 0.0)

    def test_context_retriever_is_project_scoped(self):
        engine = ProjectContextEngine(
            (
                ContextFact(
                    key="repo-state",
                    value="SEIS branch feature/maria-learning-fabric-v1",
                    source="github",
                    project="SEIS",
                    confidence=0.99,
                    verified=True,
                    observed_at="2026-09-11T07:10:00Z",
                ),
                ContextFact(
                    key="repo-state",
                    value="Deadly Evil Unreal vertical slice",
                    source="github",
                    project="DeadlyEvil",
                    confidence=0.99,
                    verified=True,
                    observed_at="2026-09-11T07:10:00Z",
                ),
            )
        )
        retriever = ProjectContextRetriever(engine)

        hits = retriever.search("learning fabric branch", project="SEIS")

        self.assertEqual(len(hits), 1)
        self.assertEqual(hits[0].fact.project, "SEIS")
        self.assertIn("learning-fabric", str(hits[0].fact.value))

    def test_context_retriever_can_require_verified_facts(self):
        engine = ProjectContextEngine(
            (
                ContextFact(
                    key="model",
                    value="Qwen local candidate",
                    source="manual-note",
                    project="SEIS",
                    confidence=0.80,
                    verified=False,
                    observed_at="2026-09-11T07:10:00Z",
                ),
                ContextFact(
                    key="model",
                    value="Ollama local runtime verified",
                    source="runtime-probe",
                    project="SEIS",
                    confidence=0.95,
                    verified=True,
                    observed_at="2026-09-11T07:11:00Z",
                ),
            )
        )
        retriever = ProjectContextRetriever(engine)

        hits = retriever.search("local runtime", project="SEIS", verified_only=True)

        self.assertEqual(len(hits), 1)
        self.assertTrue(hits[0].fact.verified)
        self.assertEqual(hits[0].fact.source, "runtime-probe")

    def test_empty_query_returns_no_hits(self):
        index = BM25Index()
        index.add("one", "some useful text")
        self.assertEqual(index.search("   "), [])


if __name__ == "__main__":
    unittest.main()
