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


class DurableWorkCheckpointStore:
    """Persist redacted ``WorkPlanCheckpoint`` evidence atomically.

    The existing work executor deliberately keeps transient step results out of
    ``WorkPlanCheckpoint``. This store preserves that boundary: it serializes
    evidence only and provides an advisory recovery assessment. It does not
    resume work, replay tools, restore files, cache permissions, or authorize an
    external action. A recovery candidate must be re-planned and freshly
    authorized by the normal routing/execution path.

    The configured checkpoint root and each project directory must be ordinary
    directories, not symbolic links. Persisted checkpoint files are opened
    without following the final path symlink where the host supports
    ``O_NOFOLLOW``. This keeps recovery evidence within the configured storage
    boundary instead of silently trusting filesystem aliases.
    """

    SCHEMA_VERSION = 1
    DEFAULT_MAX_BYTES = 256 * 1024
    _ID_RE = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$")
    _SAFE_FAILURE_RE = re.compile(r"^[a-z0-9][a-z0-9._:-]{0,127}$")
    _MAX_STEPS = 256
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
    _ROOT_FIELDS = {
        "schema_version",
        "project_id",
        "work_id",
        "saved_at",
        "checkpoint",
    }

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

    def save(self, project_id: str, work_id: str, checkpoint: WorkPlanCheckpoint) -> Path:
        if not isinstance(checkpoint, WorkPlanCheckpoint):
            raise TypeError("checkpoint must be WorkPlanCheckpoint")
        project = self._validated_id(project_id, field_name="project_id")
        work = self._validated_id(work_id, field_name="work_id")
        self._validate_checkpoint(checkpoint, error_type=ValueError)

        payload = {
            "schema_version": self.SCHEMA_VERSION,
            "project_id": project,
            "work_id": work,
            "saved_at": time.time(),
            "checkpoint": self._checkpoint_to_dict(checkpoint),
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

        if not isinstance(payload, dict) or set(payload) != self._ROOT_FIELDS:
            raise CheckpointCorruptError("checkpoint envelope schema mismatch")
        if payload.get("schema_version") != self.SCHEMA_VERSION:
            raise CheckpointCorruptError("unsupported checkpoint schema version")
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
        return restored

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
    def _validate_checkpoint(cls, checkpoint: WorkPlanCheckpoint, *, error_type: type[Exception]) -> None:
        def fail(message: str) -> None:
            raise error_type(message)

        if len(checkpoint.steps) > cls._MAX_STEPS:
            fail("checkpoint contains too many steps")
        states = {
            WorkStepState.SUCCEEDED: 0,
            WorkStepState.FAILED: 0,
            WorkStepState.BLOCKED: 0,
            WorkStepState.CANCELLED: 0,
        }
        seen: set[str] = set()
        for step in checkpoint.steps:
            if not isinstance(step, WorkStepExecutionEvidence):
                fail("checkpoint contains invalid step evidence")
            if not isinstance(step.step_id, str) or not step.step_id or len(step.step_id) > 128:
                fail("invalid step id")
            if step.step_id in seen:
                fail("checkpoint contains duplicate step ids")
            seen.add(step.step_id)
            if not isinstance(step.target_name, str) or not step.target_name or len(step.target_name) > 256:
                fail("invalid target name")
            if isinstance(step.attempts, bool) or not isinstance(step.attempts, int) or step.attempts < 0:
                fail("invalid attempt count")
            if len(step.depends_on) > cls._MAX_STEPS or any(
                not isinstance(dep, str) or not dep or len(dep) > 128 for dep in step.depends_on
            ):
                fail("invalid checkpoint dependency")
            if step.failure is not None and cls._SAFE_FAILURE_RE.fullmatch(step.failure) is None:
                fail("failure category is not a bounded safe identifier")
            states[step.state] += 1

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
            if checkpoint.next_step_id not in seen:
                fail("next step id is not present in checkpoint")
            matching = next(step for step in checkpoint.steps if step.step_id == checkpoint.next_step_id)
            if matching.state is not WorkStepState.CANCELLED:
                fail("next step must identify a cancelled step")
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
