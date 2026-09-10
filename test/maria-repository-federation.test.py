from __future__ import annotations

import sys
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "packages" / "maria-runtime" / "python"))

from maria_runtime.repositories import (
    RepositoryFederation,
    RepositoryRecord,
    SourcePolicy,
)


class RepositoryFederationTests(unittest.TestCase):
    def test_owned_and_external_repositories_remain_distinct(self):
        federation = RepositoryFederation()
        federation.register(RepositoryRecord(
            full_name="emirhankudun-ux/SEIS",
            owner="emirhankudun-ux",
            name="SEIS",
            visibility="public",
            project="SEIS",
            role="core-platform",
            source_policy=SourcePolicy.OWNED,
        ))
        federation.register(RepositoryRecord(
            full_name="alpunlu12-commits/jarvis",
            owner="alpunlu12-commits",
            name="jarvis",
            visibility="public",
            project="External Inspiration",
            role="assistant-reference",
            source_policy=SourcePolicy.EXTERNAL_REFERENCE,
        ))

        self.assertEqual([r.full_name for r in federation.owned()], ["emirhankudun-ux/SEIS"])
        self.assertEqual([r.full_name for r in federation.external_references()], ["alpunlu12-commits/jarvis"])

    def test_every_repository_is_individually_addressable(self):
        federation = RepositoryFederation()
        for full_name, project in [
            ("emirhankudun-ux/SEIS", "SEIS"),
            ("emirhankudun-ux/Eleni-Neferi-", "Eleni-Neferi"),
            ("emirhankudun-ux/Pantechnoepistemonoesis", "Pantechnoepistemonoesis"),
            ("emirhankudun-ux/PANTECHNOSYNI", "PANTECHNOSYNI"),
        ]:
            owner, name = full_name.split("/", 1)
            federation.register(RepositoryRecord(
                full_name=full_name,
                owner=owner,
                name=name,
                visibility="public",
                project=project,
                role="project",
                source_policy=SourcePolicy.OWNED,
            ))

        self.assertEqual(federation.get("emirhankudun-ux/Eleni-Neferi-").project, "Eleni-Neferi")
        self.assertEqual(len(federation.list_all()), 4)

    def test_external_repository_cannot_be_vendored_without_license_decision(self):
        federation = RepositoryFederation()
        with self.assertRaises(ValueError):
            federation.register(RepositoryRecord(
                full_name="alpunlu12-commits/dinamik-ada",
                owner="alpunlu12-commits",
                name="dinamik-ada",
                visibility="public",
                project="External Inspiration",
                role="ui-reference",
                source_policy=SourcePolicy.VENDORED,
                license_id=None,
                license_reviewed=False,
            ))

    def test_compact_brief_does_not_embed_repository_source(self):
        federation = RepositoryFederation()
        federation.register(RepositoryRecord(
            full_name="emirhankudun-ux/SEIS",
            owner="emirhankudun-ux",
            name="SEIS",
            visibility="public",
            project="SEIS",
            role="core-platform",
            source_policy=SourcePolicy.OWNED,
            default_branch="main",
            health="available",
        ))
        brief = federation.compact_brief("emirhankudun-ux/SEIS")
        self.assertEqual(brief["repository"], "emirhankudun-ux/SEIS")
        self.assertEqual(brief["default_branch"], "main")
        self.assertNotIn("source", brief)
        self.assertNotIn("files", brief)


if __name__ == "__main__":
    unittest.main()
