from __future__ import annotations

from dataclasses import dataclass
import os
from pathlib import Path
import re
import stat

from .context import ContextFact


class WorkspaceEvidenceError(ValueError):
    """Raised when selected workspace identity cannot be trusted."""


@dataclass(frozen=True)
class WorkspaceEvidenceSnapshot:
    """Minimal verified Git identity for one explicitly selected workspace.

    The snapshot is evidence only. It intentionally carries no remote URL,
    credential, file listing, diff, prompt, tool output or execution authority.
    """

    project: str
    current_branch: str
    repository_revision: str
    observed_at: str

    def __post_init__(self) -> None:
        if not isinstance(self.project, str) or not self.project.strip() or len(self.project) > 512:
            raise WorkspaceEvidenceError("invalid project")
        # Snapshots are public typed evidence and can be constructed without the
        # filesystem source. Apply the same branch grammar here so direct typed
        # construction cannot certify an identity capture() would reject.
        if not GitWorkspaceEvidenceSource._safe_branch(self.current_branch):
            raise WorkspaceEvidenceError("invalid current branch")
        if not GitWorkspaceEvidenceSource._is_revision(self.repository_revision):
            raise WorkspaceEvidenceError("invalid repository revision")
        if not isinstance(self.observed_at, str) or not self.observed_at.strip() or len(self.observed_at) > 128:
            raise WorkspaceEvidenceError("invalid observed_at")
        # Reuse ContextFact's timestamp contract so emitted evidence is always
        # admissible to ProjectContextEngine without a second time grammar.
        try:
            ContextFact(
                key="workspace-evidence-validation",
                value="valid",
                source="git-workspace-head",
                project=self.project,
                confidence=1.0,
                verified=True,
                observed_at=self.observed_at,
            )
        except (TypeError, ValueError, AttributeError) as exc:
            raise WorkspaceEvidenceError("invalid observed_at") from exc

    @property
    def execution_authorized(self) -> bool:
        return False

    def context_facts(self) -> tuple[ContextFact, ContextFact]:
        return (
            ContextFact(
                key="current_branch",
                value=self.current_branch,
                source="git-workspace-head",
                project=self.project,
                confidence=1.0,
                verified=True,
                observed_at=self.observed_at,
            ),
            ContextFact(
                key="repository_revision",
                value=self.repository_revision,
                source="git-workspace-head",
                project=self.project,
                confidence=1.0,
                verified=True,
                observed_at=self.observed_at,
            ),
        )


class GitWorkspaceEvidenceSource:
    """Read bounded HEAD identity from one explicitly selected Git workspace.

    V1 supports ordinary `.git` directories only. It performs no Git subprocess,
    repository enumeration, remote/config lookup, write-back, credential access,
    worktree discovery or execution. Detached HEAD is deliberately rejected
    because it cannot truthfully produce `current_branch` evidence.
    """

    MAX_HEAD_BYTES = 4096
    MAX_REF_BYTES = 4096
    MAX_PACKED_REFS_BYTES = 256 * 1024
    _REVISION_RE = re.compile(r"^[0-9a-fA-F]{40}(?:[0-9a-fA-F]{24})?$")

    def capture(
        self,
        workspace_root: str | os.PathLike[str],
        *,
        project: str,
        observed_at: str,
    ) -> WorkspaceEvidenceSnapshot:
        root = Path(workspace_root)
        if not isinstance(project, str) or not project.strip() or len(project) > 512:
            raise WorkspaceEvidenceError("invalid project")
        if self._is_symlink(root) or not root.is_dir():
            raise WorkspaceEvidenceError("workspace root must be an ordinary directory")

        git_dir = root / ".git"
        if self._is_symlink(git_dir) or not git_dir.is_dir():
            raise WorkspaceEvidenceError("workspace .git must be an ordinary directory")

        first_head = self._read_regular_file(
            git_dir / "HEAD", self.MAX_HEAD_BYTES, encoding="utf-8"
        )
        first_ref, first_branch = self._parse_symbolic_head(first_head)
        first_revision = self._resolve_ref(git_dir, first_ref)

        # HEAD and its branch ref are separate files. Sample both twice so a
        # branch switch or ref move during capture is not certified as one
        # coherent observation. This is a bounded consistency check, not a
        # filesystem transaction or a promise that Git cannot change later.
        second_head = self._read_regular_file(
            git_dir / "HEAD", self.MAX_HEAD_BYTES, encoding="utf-8"
        )
        second_ref, second_branch = self._parse_symbolic_head(second_head)
        second_revision = self._resolve_ref(git_dir, second_ref)
        if (
            first_ref != second_ref
            or first_branch != second_branch
            or first_revision != second_revision
        ):
            raise WorkspaceEvidenceError("workspace identity changed during capture")

        return WorkspaceEvidenceSnapshot(
            project=project,
            current_branch=second_branch,
            repository_revision=second_revision,
            observed_at=observed_at,
        )

    def _resolve_ref(self, git_dir: Path, ref_name: str) -> str:
        ref_path = self._loose_ref_path(git_dir, ref_name)
        if ref_path is None:
            revision = self._resolve_packed_ref(git_dir, ref_name)
        else:
            try:
                raw_revision = self._read_regular_file(
                    ref_path, self.MAX_REF_BYTES, encoding="ascii"
                )
            except FileNotFoundError:
                revision = self._resolve_packed_ref(git_dir, ref_name)
            else:
                # Git accepts trailing whitespace/blank lines in a loose ref,
                # but a leading whitespace byte makes the object id invalid.
                # Check before strip() so we do not certify metadata Git rejects.
                if raw_revision[:1].isspace():
                    raise WorkspaceEvidenceError("branch ref contains an invalid revision")
                revision = raw_revision.strip()
        if not self._is_revision(revision):
            raise WorkspaceEvidenceError("branch ref contains an invalid revision")
        return revision.lower()

    def _loose_ref_path(self, git_dir: Path, ref_name: str) -> Path | None:
        parts = ref_name.split("/")
        current = git_dir
        for component in parts[:-1]:
            current = current / component
            try:
                metadata = current.lstat()
            except FileNotFoundError:
                return None
            except OSError as exc:
                raise WorkspaceEvidenceError("branch ref parent cannot be inspected") from exc
            if stat.S_ISLNK(metadata.st_mode) or not stat.S_ISDIR(metadata.st_mode):
                raise WorkspaceEvidenceError("branch ref parent must be an ordinary directory")
        return current / parts[-1]

    def _resolve_packed_ref(self, git_dir: Path, ref_name: str) -> str:
        try:
            raw = self._read_regular_file(
                git_dir / "packed-refs",
                self.MAX_PACKED_REFS_BYTES,
                encoding="ascii",
            )
        except FileNotFoundError as exc:
            raise WorkspaceEvidenceError("selected branch ref is missing") from exc

        matches: list[str] = []
        for line in raw.splitlines():
            if not line or line.startswith("#") or line.startswith("^"):
                continue
            parts = line.split(" ", 1)
            if len(parts) != 2:
                raise WorkspaceEvidenceError("packed refs contains malformed metadata")
            revision, name = parts
            if name == ref_name:
                matches.append(revision)
                if len(matches) > 1:
                    raise WorkspaceEvidenceError("packed refs contains duplicate branch identity")
        if len(matches) != 1:
            raise WorkspaceEvidenceError("selected branch ref is missing")
        return matches[0]

    @classmethod
    def _parse_symbolic_head(cls, raw: str) -> tuple[str, str]:
        # Git stores HEAD as one logical line. Remove only the metadata line
        # ending; str.strip() would also remove Git-valid non-ASCII whitespace
        # from the branch identity and could silently retarget the lookup.
        if raw.endswith("\r\n"):
            value = raw[:-2]
        elif raw.endswith("\n"):
            value = raw[:-1]
        else:
            value = raw
        if "\n" in value or "\r" in value:
            raise WorkspaceEvidenceError("workspace HEAD contains multiple lines")

        prefix = "ref: refs/heads/"
        if not value.startswith(prefix):
            raise WorkspaceEvidenceError("workspace HEAD is not a symbolic branch")
        ref_name = value.removeprefix("ref: ")
        branch = value.removeprefix(prefix)
        if not cls._safe_branch(branch):
            raise WorkspaceEvidenceError("workspace branch ref is unsafe")
        return ref_name, branch

    @staticmethod
    def _safe_branch(branch: object) -> bool:
        if not isinstance(branch, str):
            return False
        if (
            not branch
            or len(branch) > 512
            or branch == "@"
            or branch.startswith("/")
            or branch.endswith("/")
        ):
            return False
        if "\\" in branch or ".." in branch or "@{" in branch or "//" in branch:
            return False
        if branch.endswith(".") or branch.endswith(".lock"):
            return False
        parts = branch.split("/")
        if any(
            not part
            or part in {".", ".."}
            or part.startswith(".")
            or part.endswith(".lock")
            for part in parts
        ):
            return False
        return all(
            ord(character) >= 32
            and ord(character) != 127
            and character not in {" ", "~", "^", ":", "?", "*", "["}
            for character in branch
        )

    @classmethod
    def _is_revision(cls, value: object) -> bool:
        return isinstance(value, str) and cls._REVISION_RE.fullmatch(value) is not None

    @staticmethod
    def _is_symlink(path: Path) -> bool:
        try:
            return path.is_symlink()
        except OSError:
            return False

    @classmethod
    def _read_regular_file(cls, path: Path, maximum_bytes: int, *, encoding: str) -> str:
        try:
            metadata = path.lstat()
        except FileNotFoundError:
            raise
        except OSError as exc:
            raise WorkspaceEvidenceError("workspace metadata cannot be inspected") from exc
        if stat.S_ISLNK(metadata.st_mode) or not stat.S_ISREG(metadata.st_mode):
            raise WorkspaceEvidenceError("workspace metadata must be a regular file")
        if metadata.st_size <= 0 or metadata.st_size > maximum_bytes:
            raise WorkspaceEvidenceError("workspace metadata size is outside trusted bounds")

        flags = os.O_RDONLY
        if hasattr(os, "O_NOFOLLOW"):
            flags |= os.O_NOFOLLOW
        if hasattr(os, "O_CLOEXEC"):
            flags |= os.O_CLOEXEC
        try:
            descriptor = os.open(path, flags)
        except OSError as exc:
            raise WorkspaceEvidenceError("workspace metadata cannot be opened safely") from exc
        try:
            opened = os.fstat(descriptor)
            if not stat.S_ISREG(opened.st_mode) or opened.st_size <= 0 or opened.st_size > maximum_bytes:
                raise WorkspaceEvidenceError("workspace metadata handle is outside trusted bounds")
            chunks: list[bytes] = []
            remaining = maximum_bytes + 1
            while remaining > 0:
                chunk = os.read(descriptor, min(8192, remaining))
                if not chunk:
                    break
                chunks.append(chunk)
                remaining -= len(chunk)
            raw = b"".join(chunks)
        except OSError as exc:
            raise WorkspaceEvidenceError("workspace metadata cannot be read") from exc
        finally:
            os.close(descriptor)

        if not raw or len(raw) > maximum_bytes:
            raise WorkspaceEvidenceError("workspace metadata size is outside trusted bounds")
        try:
            return raw.decode(encoding)
        except UnicodeDecodeError as exc:
            raise WorkspaceEvidenceError("workspace metadata encoding is invalid") from exc
