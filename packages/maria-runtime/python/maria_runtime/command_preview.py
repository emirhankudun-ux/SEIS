"""Bounded legacy command decoding for preview, never execution.

Model output is untrusted data. This module has no dispatcher, approval input,
I/O, or target resolution. A future executor must independently validate targets
and obtain host-owned authorization; this preview is not an execution plan.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum

from .permissions import ActionClass, PermissionEngine

MAX_COMMAND_BYTES = 4096


class CommandPreviewError(ValueError):
    """A fixed diagnostic code; never include model output or local paths."""


class LegacyCommand(str, Enum):
    ARA = "ARA"
    APP = "APP"
    YT = "YT"
    NOT = "NOT"
    SAAT = "SAAT"
    KILIT = "KILIT"
    KLASOR = "KLASOR"
    YAZI = "YAZI"
    KONUS = "KONUS"


_ACTION_CLASSES = {
    LegacyCommand.ARA: ActionClass.EXTERNAL,
    LegacyCommand.APP: ActionClass.EXTERNAL,
    LegacyCommand.YT: ActionClass.EXTERNAL,
    LegacyCommand.NOT: ActionClass.MODIFY,
    LegacyCommand.SAAT: ActionClass.READ,
    LegacyCommand.KILIT: ActionClass.PRIVACY_SENSITIVE,
    LegacyCommand.KLASOR: ActionClass.MODIFY,
    LegacyCommand.YAZI: ActionClass.MODIFY,
    LegacyCommand.KONUS: ActionClass.READ,
}
_NO_ARGUMENT = frozenset({LegacyCommand.SAAT, LegacyCommand.KILIT})


def _check_text(value: str) -> None:
    if type(value) is not str:
        raise CommandPreviewError("invalid-command-type")
    # Bound allocation before encoding; UTF-8 never has fewer bytes than scalars.
    if len(value) > MAX_COMMAND_BYTES:
        raise CommandPreviewError("command-too-large")
    try:
        size = len(value.encode("utf-8"))
    except UnicodeEncodeError:
        raise CommandPreviewError("invalid-command-encoding") from None
    if size > MAX_COMMAND_BYTES:
        raise CommandPreviewError("command-too-large")


def _check_record(value: str) -> None:
    if any(ord(char) < 32 or 127 <= ord(char) <= 159
           or char in "\u2028\u2029" for char in value):
        raise CommandPreviewError("invalid-command-framing")


@dataclass(frozen=True)
class LegacyCommandPreview:
    """Immutable syntax preview. Argument data is hidden from ordinary repr."""

    command: LegacyCommand
    argument: str = field(repr=False)

    def __post_init__(self) -> None:
        if type(self.command) is not LegacyCommand:
            raise CommandPreviewError("invalid-command-token")
        _check_text(self.argument)
        record = self.command.value + "|" + self.argument
        _check_text(record)
        _check_record(record)
        if self.command in _NO_ARGUMENT:
            if self.argument != "":
                raise CommandPreviewError("unexpected-command-argument")
        elif not self.argument.strip():
            raise CommandPreviewError("missing-command-argument")

    @property
    def action_class(self) -> ActionClass:
        return _ACTION_CLASSES[self.command]

    @property
    def requires_approval(self) -> bool:
        # Consult existing policy without exposing argument data or accepting
        # model-supplied approval. Its allowed field is deliberately not exported.
        return PermissionEngine().evaluate(
            self.action_class,
            target="legacy-command:" + self.command.value,
            approved=False,
        ).requires_approval

    @property
    def execution_authorized(self) -> bool:
        return False

    def to_dict(self, *, include_argument: bool = False) -> dict[str, object]:
        if type(include_argument) is not bool:
            raise CommandPreviewError("invalid-disclosure-option")
        result: dict[str, object] = {
            "mode": "preview-only",
            "command": self.command.value,
            "action_class": self.action_class.value,
            "requires_approval": self.requires_approval,
            "execution_authorized": self.execution_authorized,
            "argument_redacted": not include_argument,
        }
        if include_argument:
            result["argument"] = self.argument
        return result


def preview_legacy_command(value: str) -> LegacyCommandPreview:
    """Decode exactly one TOKEN|argument record, preserving argument identity.

    The complete input, including an optional single LF/CRLF ending, is bounded.
    Further pipes are literal argument data, never a second executable command.
    """
    _check_text(value)
    if value.endswith("\r\n"):
        value = value[:-2]
    elif value.endswith("\n"):
        value = value[:-1]
    _check_record(value)
    token, separator, argument = value.partition("|")
    if not separator:
        raise CommandPreviewError("missing-command-delimiter")
    try:
        command = LegacyCommand(token)
    except ValueError:
        raise CommandPreviewError("unknown-command-token") from None
    return LegacyCommandPreview(command=command, argument=argument)
