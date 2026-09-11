from __future__ import annotations

from dataclasses import dataclass
from enum import Enum
import json
import math
import os
from pathlib import Path
import re
import stat
import tempfile
import time
from typing import Any

from .fabric_router import RouteKind
from .recovery_reconciliation import RecoveryAnchor
from .work_execution import (
    WorkPlanCheckpoint,
    WorkStepExecutionEvidence,
    WorkStepState,
)


class CheckpointCorruptError(RuntimeError):
    """Raised when persisted checkpoint evidence cannot be trusted."""


class RecoveryDisposition(str, Enum):
    NOT_FOUND = "not-found"
    COMPLETE = "complete"
    REPLAN_REQUIRED = "replan-required"


@dataclass(frozen=True)
class RecoveryAssessment:
    """Advisory recovery state only; never an execution authorization."""

    disposition: RecoveryDisposition
    next_step_id: str | None = None

    @property
    def replan_required(self) -> bool:
        return self.disposition is RecoveryDisposition.REPLAN_REQUIRED

    @property
    def execution_authorized(self) -> bool:
        return False


@dataclass(frozen=True)
class RecoveryCatalogEntry:
    """Public-safe discovery metadata for one persisted work checkpoint."""

    project_id: str
    work_id: str
    disposition: RecoveryDisposition
    next_step_id: str | None = None

    @property
    def replan_required(self) -> bool:
        return self.disposition is RecoveryDisposition.REPLAN_REQUIRED

    @property
    def execution_authorized(self) -> bool:
        return False


@dataclass(frozen=True)
class DurableRecoveryRecord:
    """Versioned durable recovery evidence without execution authority."""

    checkpoint: WorkPlanCheckpoint
    recovery_anchor: RecoveryAnchor | None
    schema_version: int

    @property
    def execution_authorized(self) -> bool:
        return False


class DurableWorkCheckpointStore:
    """Persist redacted ``WorkPlanCheckpoint`` evidence atomically.

    The existing work executor deliberately keeps transient step results out of
    ``WorkPlanCheckpoint``. This store preserves that boundary: it serializes
    evidence only and provides an advisory recovery assessment. It does not
    resume work, replay tools, restore files, cache permissions, or authorize an
    external action. A recovery candidate must be re-planned and freshly
    authorized by the normal routing/execution path.

    Schema v2 may also persist a bounded ``RecoveryAnchor`` so restart-time
    reconciliation can compare checkpoint-time project/repository identity with
    current verified context. Schema v1 remains readable but has no anchor and
    therefore cannot fabricate one after the fact.

    The configured checkpoint root and each project directory must be ordinary
    directories, not symbolic links. Persisted checkpoint files are opened
    without following the final path symlink where the host supports
    ``O_NOFOLLOW``. This keeps recovery evidence within the configured storage
    boundary instead of silently trusting filesystem aliases.
    """

    LEGACY_SCHEMA_VERSION = 1
    SCHEMA_VERSION = 2
    DEFAULT_MAX_BYTES = 256 * 1024
    _ID_RE = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$")
    _SAFE_FAILURE_RE = re.compile(r"^[a-z0-9][a-z0-9._:-]{0,127}$")
    _MAX_STEPS = 256
    _MAX_DISCOVERY_FILES = 256
    _MAX_DISCOVERY_LIMIT = 256
    _MAX_DISCOVERY_ENTRIES = 1024
    _STEP_FIELDS = {
        "step_id",
        "route_kind",
        "target_name",
        "state",
        "attempts",
        "depends_on",
        "failure",
    }
    _CHECKPOINT_FIELDS = {
        "steps",
        "complete",
        "succeeded_steps",
        "failed_steps",
        "blocked_steps",
        "cancelled_steps",
        "next_step_id",
    }
    _ANCHOR_FIELDS = {
        "project",
        "active_goal",
        "current_repo",
        "current_branch",
        "repository_revision",
    }
    _ROOT_FIELDS_V1 = {
        "schema_version",
        "project_id",
        "work_id",
        "saved_at",
        "checkpoint",
    }
    _ROOT_FIELDS_V2 = _ROOT_FIELDS_V1 | {"recovery_anchor"}

    def __init__(self, root: str | os.PathLike[str], *, max_bytes: int = DEFAULT_MAX_BYTES) -> None:
        if isinstance(max_bytes, bool) or not isinstance(max_bytes, int) or max_bytes < 128:
            raise ValueError("max_bytes must be an integer >= 128")
        self.root = Path(root)
        self.max_bytes = max_bytes

    @classmethod
    def _validated_id(cls, value: str, *, field_name: str) -> str:
        if not isinstance(value, str) or value in {".", ".."} or cls._ID_RE.fullmatch(value) is None:
            raise ValueError(f"invalid {field_name}")
        return value

    @staticmethod
    def _is_symlink(path: Path) -> bool:
        try:
            return path.is_symlink()
        except OSError:
            return False

    def _prepare_project_parent(self, project: str) -> Path:
        if self._is_symlink(self.root):
            raise ValueError("checkpoint root must not be a symlink")
        try:
            self.root.mkdir(parents=True, exist_ok=True)
        except OSError as exc:
            raise ValueError("checkpoint root cannot be created") from exc
        if self._is_symlink(self.root) or not self.root.is_dir():
            raise ValueError("checkpoint root must be an ordinary directory")

        parent = self.root / project
        if self._is_symlink(parent):
            raise ValueError("checkpoint project directory must not be a symlink")
        try:
            parent.mkdir(mode=0o700, exist_ok=True)
        except OSError as exc:
            raise ValueError("checkpoint project directory cannot be created") from exc
        if self._is_symlink(parent) or not parent.is_dir():
            raise ValueError("checkpoint project directory must be an ordinary directory")
        return parent

    def _existing_project_parent(self, project: str) -> Path | None:
        if self._is_symlink(self.root):
            raise CheckpointCorruptError("checkpoint root is a symlink")
        if not self.root.exists():
            return None
        if not self.root.is_dir():
            raise CheckpointCorruptError("checkpoint root is not a directory")

        parent = self.root / project
        if self._is_symlink(parent):
            raise CheckpointCorruptError("checkpoint project directory is a symlink")
        if not parent.exists():
            return None
        if not parent.is_dir():
            raise CheckpointCorruptError("checkpoint project path is not a directory")
        return parent

    def path_for(
        self,
        project_id: str,
        work_id: str,
        *,
        create_parent: bool = False,
    ) -> Path:
        project = self._validated_id(project_id, field_name="project_id")
        work = self._validated_id(work_id, field_name="work_id")
        parent = self._prepare_project_parent(project) if create_parent else self.root / project
        return parent / f"{work}.json"

    def save(
        self,
        project_id: str,
        work_id: str,
        checkpoint: WorkPlanCheckpoint,
        *,
        recovery_anchor: RecoveryAnchor | None = None,
    ) -> Path:
        if not isinstance(checkpoint, WorkPlanCheckpoint):
            raise TypeError("checkpoint must be WorkPlanCheckpoint")
        if recovery_anchor is not None and not isinstance(recovery_anchor, RecoveryAnchor):
            raise TypeError("recovery_anchor must be RecoveryAnchor when present")
        project = self._validated_id(project_id, field_name="project_id")
        work = self._validated_id(work_id, field_name="work_id")
        self._validate_checkpoint(checkpoint, error_type=ValueError)
        if recovery_anchor is not None and recovery_anchor.project != project:
            raise ValueError("recovery anchor project does not match checkpoint project")

        payload = {
            "schema_version": self.SCHEMA_VERSION,
            "project_id": project,
            "work_id": work,
            "saved_at": time.time(),
            "checkpoint": self._checkpoint_to_dict(checkpoint),
            "recovery_anchor": (
                self._anchor_to_dict(recovery_anchor)
                if recovery_anchor is not None
                else None
            ),
        }
        encoded = json.dumps(
            payload,
            ensure_ascii=True,
            sort_keys=True,
            separators=(",", ":"),
            allow_nan=False,
        ).encode("utf-8")
        if len(encoded) > self.max_bytes:
            raise ValueError("checkpoint exceeds maximum persisted size")

        parent = self._prepare_project_parent(project)
        path = parent / f"{work}.json"
        temp_path: Path | None = None
        try:
            with tempfile.NamedTemporaryFile(
                mode="wb",
                dir=parent,
                prefix=f".{work}.",
                suffix=".tmp",
                delete=False,
            ) as handle:
                temp_path = Path(handle.name)
                handle.write(encoded)
                handle.flush()
                os.fsync(handle.fileno())
            os.replace(temp_path, path)
            temp_path = None
            self._fsync_directory(parent)
        finally:
            if temp_path is not None:
                try:
                    temp_path.unlink(missing_ok=True)
                except OSError:
                    pass
        return path

    def load(self, project_id: str, work_id: str) -> WorkPlanCheckpoint | None:
        record = self.load_record(project_id, work_id)
        return None if record is None else record.checkpoint

    def load_record(self, project_id: str, work_id: str) -> DurableRecoveryRecord | None:
        project = self._validated_id(project_id, field_name="project_id")
        work = self._validated_id(work_id, field_name="work_id")
        parent = self._existing_project_parent(project)
        if parent is None:
            return None
        path = parent / f"{work}.json"

        try:
            metadata = path.lstat()
        except FileNotFoundError:
            return None
        except OSError as exc:
            raise CheckpointCorruptError("checkpoint metadata cannot be read") from exc
        if stat.S_ISLNK(metadata.st_mode):
            raise CheckpointCorruptError("checkpoint path must not be a symlink")
        if not stat.S_ISREG(metadata.st_mode):
            raise CheckpointCorruptError("checkpoint path is not a regular file")
        if metadata.st_size <= 0 or metadata.st_size > self.max_bytes:
            raise CheckpointCorruptError("checkpoint size is outside trusted bounds")

        flags = os.O_RDONLY
        if hasattr(os, "O_NOFOLLOW"):
            flags |= os.O_NOFOLLOW
        try:
            fd = os.open(path, flags)
        except OSError as exc:
            raise CheckpointCorruptError("checkpoint cannot be opened safely") from exc
        try:
            opened = os.fstat(fd)
            if not stat.S_ISREG(opened.st_mode):
                raise CheckpointCorruptError("checkpoint handle is not a regular file")
            if opened.st_size <= 0 or opened.st_size > self.max_bytes:
                raise CheckpointCorruptError("checkpoint size is outside trusted bounds")
            chunks: list[bytes] = []
            remaining = self.max_bytes + 1
            while remaining > 0:
                chunk = os.read(fd, min(64 * 1024, remaining))
                if not chunk:
                    break
                chunks.append(chunk)
                remaining -= len(chunk)
            raw = b"".join(chunks)
        except OSError as exc:
            raise CheckpointCorruptError("checkpoint cannot be read") from exc
        finally:
            os.close(fd)
        if len(raw) > self.max_bytes:
            raise CheckpointCorruptError("checkpoint exceeds maximum persisted size")

        def reject_non_finite_constant(_: str) -> None:
            raise ValueError("non-finite JSON constant")

        def reject_duplicate_object(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
            result: dict[str, Any] = {}
            for key, value in pairs:
                if key in result:
                    raise ValueError("duplicate JSON object key")
                result[key] = value
            return result

        try:
            payload = json.loads(
                raw.decode("utf-8"),
                parse_constant=reject_non_finite_constant,
                object_pairs_hook=reject_duplicate_object,
            )
        except (UnicodeDecodeError, json.JSONDecodeError, ValueError) as exc:
            raise CheckpointCorruptError("checkpoint is not strict UTF-8 JSON") from exc

        if not isinstance(payload, dict):
            raise CheckpointCorruptError("checkpoint envelope schema mismatch")
        schema_version = payload.get("schema_version")
        if isinstance(schema_version, bool) or not isinstance(schema_version, int):
            raise CheckpointCorruptError("unsupported checkpoint schema version")
        if schema_version == self.LEGACY_SCHEMA_VERSION:
            expected_root_fields = self._ROOT_FIELDS_V1
        elif schema_version == self.SCHEMA_VERSION:
            expected_root_fields = self._ROOT_FIELDS_V2
        else:
            raise CheckpointCorruptError("unsupported checkpoint schema version")
        if set(payload) != expected_root_fields:
            raise CheckpointCorruptError("checkpoint envelope schema mismatch")
        if payload.get("project_id") != project or payload.get("work_id") != work:
            raise CheckpointCorruptError("checkpoint identity mismatch")
        saved_at = payload.get("saved_at")
        if isinstance(saved_at, bool) or not isinstance(saved_at, (int, float)):
            raise CheckpointCorruptError("invalid checkpoint timestamp")
        try:
            timestamp_is_finite = math.isfinite(saved_at)
        except (OverflowError, TypeError, ValueError):
            timestamp_is_finite = False
        if not timestamp_is_finite or saved_at <= 0:
            raise CheckpointCorruptError("invalid checkpoint timestamp")

        checkpoint_data = payload.get("checkpoint")
        try:
            restored = self._checkpoint_from_dict(checkpoint_data)
            self._validate_checkpoint(restored, error_type=CheckpointCorruptError)
        except CheckpointCorruptError:
            raise
        except (TypeError, ValueError, KeyError) as exc:
            raise CheckpointCorruptError("checkpoint evidence is invalid") from exc

        restored_anchor: RecoveryAnchor | None = None
        if schema_version == self.SCHEMA_VERSION:
            anchor_data = payload.get("recovery_anchor")
            if anchor_data is not None:
                try:
                    restored_anchor = self._anchor_from_dict(anchor_data)
                except (TypeError, ValueError, KeyError) as exc:
                    raise CheckpointCorruptError("recovery anchor evidence is invalid") from exc
                if restored_anchor.project != project:
                    raise CheckpointCorruptError(
                        "recovery anchor project does not match checkpoint project"
                    )

        return DurableRecoveryRecord(
            checkpoint=restored,
            recovery_anchor=restored_anchor,
            schema_version=schema_version,
        )

    def assess(self, project_id: str, work_id: str) -> RecoveryAssessment:
        checkpoint = self.load(project_id, work_id)
        if checkpoint is None:
            return RecoveryAssessment(RecoveryDisposition.NOT_FOUND)
        if checkpoint.complete:
            return RecoveryAssessment(RecoveryDisposition.COMPLETE)
        if checkpoint.next_step_id is None:
            raise CheckpointCorruptError("incomplete checkpoint has no next step")
        return RecoveryAssessment(
            RecoveryDisposition.REPLAN_REQUIRED,
            next_step_id=checkpoint.next_step_id,
        )

    def discover(
        self,
        project_id: str,
        *,
        include_complete: bool = False,
        limit: int = 64,
    ) -> tuple[RecoveryCatalogEntry, ...]:
        """Discover bounded durable recovery evidence for one project.

        Discovery is read-only and returns advisory metadata only. It never
        authorizes execution or returns a partial result when the caller's bound
        would be exceeded. Enumeration stops on the first entry beyond either
        the JSON-candidate or total-directory-entry budget, before sorting or
        loading any candidate. Non-JSON entries consume the scan budget too.
        """

        project = self._validated_id(project_id, field_name="project_id")
        if type(include_complete) is not bool:
            raise TypeError("include_complete must be boolean")
        if isinstance(limit, bool) or not isinstance(limit, int):
            raise TypeError("limit must be an integer")
        if not 1 <= limit <= self._MAX_DISCOVERY_LIMIT:
            raise ValueError(
                f"limit must be between 1 and {self._MAX_DISCOVERY_LIMIT}"
            )

        parent = self._existing_project_parent(project)
        if parent is None:
            return ()

        candidates: list[Path] = []
        try:
            # scandir streams names; collecting all entries first would defeat
            # the resource bound even if an overflow were rejected afterwards.
            with os.scandir(parent) as directory:
                for index, entry in enumerate(directory):
                    if index >= self._MAX_DISCOVERY_ENTRIES:
                        raise CheckpointCorruptError("recovery catalog exceeds trusted entry bound")
                    candidate = parent / entry.name
                    if candidate.suffix != ".json":
                        continue
                    if len(candidates) >= self._MAX_DISCOVERY_FILES:
                        raise CheckpointCorruptError("recovery catalog exceeds trusted file bound")
                    candidates.append(candidate)
        except OSError as exc:
            raise CheckpointCorruptError("recovery catalog cannot be enumerated") from exc
        candidates.sort(key=lambda path: path.name)

        entries: list[RecoveryCatalogEntry] = []
        for candidate in candidates:
            work_id = candidate.stem
            try:
                self._validated_id(work_id, field_name="work_id")
            except ValueError as exc:
                raise CheckpointCorruptError(
                    "recovery catalog contains an invalid work id"
                ) from exc

            assessment = self.assess(project, work_id)
            if assessment.disposition is RecoveryDisposition.NOT_FOUND:
                # A concurrent trusted cleanup may remove a candidate between
                # enumeration and load. Absence is not resumable evidence.
                continue
            if (
                assessment.disposition is RecoveryDisposition.COMPLETE
                and not include_complete
            ):
                continue

            entries.append(
                RecoveryCatalogEntry(
                    project_id=project,
                    work_id=work_id,
                    disposition=assessment.disposition,
                    next_step_id=assessment.next_step_id,
                )
            )
            if len(entries) > limit:
                raise CheckpointCorruptError(
                    "recovery catalog exceeds requested limit"
                )

        return tuple(entries)

    @classmethod
    def _checkpoint_to_dict(cls, checkpoint: WorkPlanCheckpoint) -> dict[str, Any]:
        return {
            "steps": [
                {
                    "step_id": step.step_id,
                    "route_kind": step.route_kind.value,
                    "target_name": step.target_name,
                    "state": step.state.value,
                    "attempts": step.attempts,
                    "depends_on": list(step.depends_on),
                    "failure": step.failure,
                }
                for step in checkpoint.steps
            ],
            "complete": checkpoint.complete,
            "succeeded_steps": checkpoint.succeeded_steps,
            "failed_steps": checkpoint.failed_steps,
            "blocked_steps": checkpoint.blocked_steps,
            "cancelled_steps": checkpoint.cancelled_steps,
            "next_step_id": checkpoint.next_step_id,
        }

    @classmethod
    def _checkpoint_from_dict(cls, value: Any) -> WorkPlanCheckpoint:
        if not isinstance(value, dict) or set(value) != cls._CHECKPOINT_FIELDS:
            raise CheckpointCorruptError("checkpoint body schema mismatch")
        steps_data = value.get("steps")
        if not isinstance(steps_data, list) or len(steps_data) > cls._MAX_STEPS:
            raise CheckpointCorruptError("checkpoint steps are outside trusted bounds")

        steps: list[WorkStepExecutionEvidence] = []
        for raw_step in steps_data:
            if not isinstance(raw_step, dict) or set(raw_step) != cls._STEP_FIELDS:
                raise CheckpointCorruptError("checkpoint step schema mismatch")
            depends_on = raw_step.get("depends_on")
            if not isinstance(depends_on, list) or not all(isinstance(item, str) for item in depends_on):
                raise CheckpointCorruptError("invalid checkpoint dependencies")
            steps.append(
                WorkStepExecutionEvidence(
                    step_id=raw_step["step_id"],
                    route_kind=RouteKind(raw_step["route_kind"]),
                    target_name=raw_step["target_name"],
                    state=WorkStepState(raw_step["state"]),
                    attempts=raw_step["attempts"],
                    depends_on=tuple(depends_on),
                    failure=raw_step["failure"],
                )
            )

        complete = value.get("complete")
        if type(complete) is not bool:
            raise CheckpointCorruptError("checkpoint complete flag must be boolean")
        counts = []
        for field_name in (
            "succeeded_steps",
            "failed_steps",
            "blocked_steps",
            "cancelled_steps",
        ):
            count = value.get(field_name)
            if isinstance(count, bool) or not isinstance(count, int) or count < 0:
                raise CheckpointCorruptError("invalid checkpoint count")
            counts.append(count)
        next_step_id = value.get("next_step_id")
        if next_step_id is not None and not isinstance(next_step_id, str):
            raise CheckpointCorruptError("invalid next step id")

        return WorkPlanCheckpoint(
            steps=tuple(steps),
            complete=complete,
            succeeded_steps=counts[0],
            failed_steps=counts[1],
            blocked_steps=counts[2],
            cancelled_steps=counts[3],
            next_step_id=next_step_id,
        )

    @classmethod
    def _anchor_to_dict(cls, anchor: RecoveryAnchor) -> dict[str, Any]:
        return {
            "project": anchor.project,
            "active_goal": anchor.active_goal,
            "current_repo": anchor.current_repo,
            "current_branch": anchor.current_branch,
            "repository_revision": anchor.repository_revision,
        }

    @classmethod
    def _anchor_from_dict(cls, value: Any) -> RecoveryAnchor:
        if not isinstance(value, dict) or set(value) != cls._ANCHOR_FIELDS:
            raise CheckpointCorruptError("recovery anchor schema mismatch")
        return RecoveryAnchor(
            project=value["project"],
            active_goal=value["active_goal"],
            current_repo=value["current_repo"],
            current_branch=value["current_branch"],
            repository_revision=value["repository_revision"],
        )

    @classmethod
    def _validate_checkpoint(cls, checkpoint: WorkPlanCheckpoint, *, error_type: type[Exception]) -> None:
        def fail(message: str) -> None:
            raise error_type(message)

        # Validate runtime types before equality, iteration, hashing or JSON
        # emission. Otherwise bool/int aliases can save a record we cannot load.
        if not isinstance(checkpoint.steps, tuple):
            fail("checkpoint steps must be a tuple")
        if type(checkpoint.complete) is not bool:
            fail("checkpoint complete flag must be boolean")
        for field_name in (
            "succeeded_steps", "failed_steps", "blocked_steps", "cancelled_steps"
        ):
            count = getattr(checkpoint, field_name)
            if isinstance(count, bool) or not isinstance(count, int) or count < 0:
                fail("invalid checkpoint count")
        if len(checkpoint.steps) > cls._MAX_STEPS:
            fail("checkpoint contains too many steps")
        states = {
            WorkStepState.SUCCEEDED: 0,
            WorkStepState.FAILED: 0,
            WorkStepState.BLOCKED: 0,
            WorkStepState.CANCELLED: 0,
        }
        seen: set[str] = set()
        first_cancelled_step_id: str | None = None
        for step in checkpoint.steps:
            if not isinstance(step, WorkStepExecutionEvidence):
                fail("checkpoint contains invalid step evidence")
            if not isinstance(step.route_kind, RouteKind):
                fail("invalid checkpoint route kind")
            if not isinstance(step.state, WorkStepState):
                fail("invalid checkpoint step state")
            if not isinstance(step.step_id, str) or not step.step_id or len(step.step_id) > 128:
                fail("invalid step id")
            if step.step_id in seen:
                fail("checkpoint contains duplicate step ids")
            if not isinstance(step.target_name, str) or not step.target_name or len(step.target_name) > 256:
                fail("invalid target name")
            if isinstance(step.attempts, bool) or not isinstance(step.attempts, int) or step.attempts < 0:
                fail("invalid attempt count")
            if not isinstance(step.depends_on, tuple):
                fail("checkpoint dependencies must be a tuple")
            if len(step.depends_on) > cls._MAX_STEPS or any(
                not isinstance(dep, str) or not dep or len(dep) > 128 for dep in step.depends_on
            ):
                fail("invalid checkpoint dependency")
            if len(set(step.depends_on)) != len(step.depends_on):
                fail("checkpoint contains duplicate dependency ids")
            if any(dependency not in seen for dependency in step.depends_on):
                fail("checkpoint dependency must reference an earlier step")
            if step.failure is not None and (
                not isinstance(step.failure, str)
                or cls._SAFE_FAILURE_RE.fullmatch(step.failure) is None
            ):
                fail("failure category is not a bounded safe identifier")
            if step.state not in states:
                fail("invalid checkpoint step state")
            if step.state is WorkStepState.SUCCEEDED:
                if step.attempts < 1:
                    fail("succeeded step requires at least one attempt")
                if step.failure is not None:
                    fail("succeeded step cannot carry failure evidence")
            elif step.state is WorkStepState.FAILED:
                if step.attempts < 1:
                    fail("failed step requires at least one attempt")
                if step.failure is None:
                    fail("failed step requires failure evidence")
            elif step.state is WorkStepState.BLOCKED:
                if step.attempts != 0:
                    fail("blocked step cannot have execution attempts")
                if step.failure is None:
                    fail("blocked step requires failure evidence")
            elif step.state is WorkStepState.CANCELLED:
                if step.failure is None:
                    fail("cancelled step requires failure evidence")
            if first_cancelled_step_id is None and step.state is WorkStepState.CANCELLED:
                first_cancelled_step_id = step.step_id
            states[step.state] += 1
            seen.add(step.step_id)

        actual = (
            states[WorkStepState.SUCCEEDED],
            states[WorkStepState.FAILED],
            states[WorkStepState.BLOCKED],
            states[WorkStepState.CANCELLED],
        )
        declared = (
            checkpoint.succeeded_steps,
            checkpoint.failed_steps,
            checkpoint.blocked_steps,
            checkpoint.cancelled_steps,
        )
        if actual != declared:
            fail("checkpoint counters do not match step evidence")
        if checkpoint.complete != (checkpoint.cancelled_steps == 0):
            fail("checkpoint completion flag is inconsistent")
        if checkpoint.next_step_id is not None:
            if first_cancelled_step_id is None:
                fail("next step requires a cancelled step")
            if checkpoint.next_step_id != first_cancelled_step_id:
                fail("next step must identify the first cancelled step")
        elif not checkpoint.complete:
            fail("incomplete checkpoint requires a next step")

    @staticmethod
    def _fsync_directory(path: Path) -> None:
        flags = os.O_RDONLY
        if hasattr(os, "O_DIRECTORY"):
            flags |= os.O_DIRECTORY
        try:
            fd = os.open(path, flags)
        except OSError:
            return
        try:
            os.fsync(fd)
        except OSError:
            pass
        finally:
            os.close(fd)
