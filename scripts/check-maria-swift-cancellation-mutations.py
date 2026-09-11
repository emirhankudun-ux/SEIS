#!/usr/bin/env python3
"""Reproduce two import-cancellation regressions in an isolated Swift package.

Copies only the named recovery sources/tests. Never mutates the repository,
launches the app, imports user snapshots, or runs repository package plugins.
This is a selected-source check, not a replacement for full native CI.
"""
from __future__ import annotations

import argparse
import hashlib
from pathlib import Path
import re
import shutil
import subprocess
import tempfile


SOURCES = (
    "SeisMariaRecovery.swift",
    "SeisMariaRecoveryJSON.swift",
    "SeisMariaRecoveryFileReader.swift",
)
TESTS = (
    "SeisMariaRecoveryCancellationTests.swift",
    "SeisMariaRecoveryAsyncReaderTests.swift",
)
MANIFEST = '''// swift-tools-version: 6.0
import PackageDescription
let package = Package(
    name: "SeisPlatformKit",
    platforms: [.macOS(.v13)],
    products: [.library(name: "SeisPlatformKit", targets: ["SeisPlatformKit"])],
    targets: [
        .target(name: "SeisPlatformKit"),
        .testTarget(name: "SeisPlatformKitTests", dependencies: ["SeisPlatformKit"])
    ]
)
'''
STRUCTURED_BLOCK = '''        return try await withThrowingTaskGroup(of: SeisMariaRecoverySnapshot.self) { group in
            group.addTask {
                try Task.checkCancellation()
                return try operation(url)
            }
            guard let snapshot = try await group.next() else {
                throw SeisMariaRecoveryError.unreadableFile
            }
            // Even a synchronous API that ignores cancellation must not publish
            // a late successful result to a cancelled importing task.
            try Task.checkCancellation()
            return snapshot
        }'''
LATE_SUCCESS_CHECK = '''            // Even a synchronous API that ignores cancellation must not publish
            // a late successful result to a cancelled importing task.
            try Task.checkCancellation()
            return snapshot'''


def run_check(swift: str, package: Path, label: str, *, failure_test: str | None = None) -> None:
    selector = failure_test or "SeisMariaRecovery(Cancellation|AsyncReader)Tests"
    command = [swift, "test", "--package-path", str(package), "--disable-xctest", "--filter", selector]
    try:
        result = subprocess.run(command, capture_output=True, text=True, timeout=120, check=False)
    except subprocess.TimeoutExpired as exc:
        raise RuntimeError(f"{label}: verification timed out; not a passing mutation check") from exc
    output = result.stdout + result.stderr
    if failure_test is None:
        count = re.search(r"Test run with (\d+) tests.*passed", output)
        passed = result.returncode == 0 and count is not None and int(count[1]) >= 15
    else:
        # A compiler/environment failure does not prove regression sensitivity.
        expected_issue = f"Test {failure_test}() recorded an issue"
        passed = result.returncode != 0 and expected_issue in output
    if not passed:
        tail = "\n".join(output.splitlines()[-35:])
        raise RuntimeError(f"{label}: unexpected verification result ({result.returncode})\n{tail}")
    print(f"{label}: {'expected regression detected' if failure_test else 'tests passed'}", flush=True)


def verify(repo: Path, swift: str) -> None:
    source_package = repo / "packages" / "seis_platform_swift"
    copied: dict[Path, bytes] = {}
    with tempfile.TemporaryDirectory(prefix="seis-recovery-mutations-") as directory:
        package = Path(directory)
        (package / "Package.swift").write_text(MANIFEST, encoding="utf-8")
        for relative_dir, names in (("Sources/SeisPlatformKit", SOURCES), ("Tests/SeisPlatformKitTests", TESTS)):
            target_dir = package / relative_dir
            target_dir.mkdir(parents=True)
            for name in names:
                source = source_package / relative_dir / name
                data = source.read_bytes()
                copied[source] = data
                (target_dir / name).write_bytes(data)
                print(f"source-sha256 {source.relative_to(repo)} {hashlib.sha256(data).hexdigest()}", flush=True)

        reader = package / "Sources/SeisPlatformKit/SeisMariaRecoveryFileReader.swift"
        original = reader.read_text(encoding="utf-8")
        if original.count(STRUCTURED_BLOCK) != 1 or original.count(LATE_SUCCESS_CHECK) != 1:
            raise RuntimeError("Mutation anchors changed; review this checker instead of skipping mutations")
        run_check(swift, package, "baseline")
        try:
            detached = original.replace(STRUCTURED_BLOCK, '''        let worker = Task.detached { try operation(url) }
        let snapshot = try await worker.value
        try Task.checkCancellation()
        return snapshot''', 1)
            reader.write_text(detached, encoding="utf-8")
            run_check(swift, package, "detached-worker", failure_test="callerCancellationReachesWorkerAndWaitsForCleanup")
            reader.write_text(original.replace(LATE_SUCCESS_CHECK, "            return snapshot", 1), encoding="utf-8")
            run_check(swift, package, "late-success", failure_test="cancelledCallerRejectsLateSuccessFromUncooperativeWorker")
        finally:
            reader.write_text(original, encoding="utf-8")
        run_check(swift, package, "restored")

    if any(source.read_bytes() != data for source, data in copied.items()):
        raise RuntimeError("Repository sources changed during verification; rerun against a stable checkout")
    print("Verified 2 targeted mutations; repository source bytes unchanged. Full native CI remains required.")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo-root", type=Path, default=Path(__file__).resolve().parents[1])
    args = parser.parse_args()
    swift = shutil.which("swift")
    if swift is None:
        parser.exit(2, "A local Swift toolchain is required; nothing was installed.\n")
    try:
        verify(args.repo_root.resolve(), swift)
    except (OSError, RuntimeError, UnicodeError) as exc:
        parser.exit(1, f"{exc}\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
