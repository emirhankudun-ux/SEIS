#!/usr/bin/env python3

import fnmatch
import hashlib
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path


ROOT = Path.cwd()
REPORT_JSON = ROOT / "reports" / "language-distribution.json"
REPORT_MD = ROOT / "reports" / "language-distribution.md"
GITATTRIBUTES = ROOT / ".gitattributes"
CHECK_MODE = "--check" in sys.argv
TARGET_JAVASCRIPT_PERCENT = 21.0
FOCUS_LANGUAGE_SPLIT = ("JavaScript", "TypeScript", "Objective-C")

LANGUAGE_BALANCE_TARGETS = [
    {
        "id": "apple-swift-ecosystem",
        "label": "Apple / Swift ecosystem",
        "minPercent": 25.0,
        "maxPercent": 30.0,
        "languages": ["Swift", "Objective-C", "AppleScript"],
        "purpose": "Apple-first app, platform, policy, and native integration code.",
    },
    {
        "id": "ai-data-python-sql",
        "label": "AI, Data, Python, SQL",
        "minPercent": 18.0,
        "maxPercent": 22.0,
        "languages": ["Python", "SQL", "R", "Julia", "Scala", "JSON", "JSON-LD", "Turtle", "SPARQL"],
        "purpose": "AI, analytics, memory, context, data contracts, and knowledge governance.",
    },
    {
        "id": "typescript-javascript-tooling",
        "label": "TypeScript / JavaScript tooling",
        "minPercent": 15.0,
        "maxPercent": 20.0,
        "languages": ["TypeScript", "JavaScript"],
        "purpose": "Tooling, web interaction, MCP, automation, and agent surfaces.",
    },
    {
        "id": "android-jvm",
        "label": "Android / JVM",
        "minPercent": 10.0,
        "maxPercent": 15.0,
        "languages": ["Kotlin", "Java", "Groovy", "Clojure"],
        "purpose": "Android, JVM validation, and cross-platform policy contracts.",
    },
    {
        "id": "rust-c-cpp-systems",
        "label": "Rust / C / C++ systems",
        "minPercent": 10.0,
        "maxPercent": 15.0,
        "languages": ["Rust", "C", "C++", "Zig", "Assembly"],
        "purpose": "Systems, performance, safety, native audits, and low-level contracts.",
    },
    {
        "id": "go-infrastructure",
        "label": "Go / Infrastructure",
        "minPercent": 5.0,
        "maxPercent": 8.0,
        "languages": ["Go", "Shell", "YAML", "HCL", "TOML", "Bicep", "Nix", "CUE", "Rego", "Dockerfile"],
        "purpose": "Cloud, CI, deployment, server, policy, and infrastructure automation.",
    },
    {
        "id": "windows-dotnet",
        "label": "Windows / .NET",
        "minPercent": 5.0,
        "maxPercent": 8.0,
        "languages": ["C#", "F#", "Visual Basic", "PowerShell"],
        "purpose": "Windows platform and .NET policy contracts.",
    },
    {
        "id": "html-css-preview",
        "label": "HTML / CSS previews",
        "minPercent": 0.0,
        "maxPercent": 3.0,
        "languages": ["HTML", "CSS"],
        "purpose": "Docs, demos, previews, and lightweight product surfaces only.",
    },
]

SKIP_DIRS = {
    ".git",
    "node_modules",
    "dist",
    "build",
    ".build",
    "coverage",
    ".sync-backups",
    ".serena",
    ".npm",
    ".next",
    ".turbo",
    "__pycache__",
}

SKIP_DIR_PREFIXES = (
    ".dist.seis-cloud-check.",
    ".build-",
)

BINARY_EXTENSIONS = {
    ".apng",
    ".avif",
    ".bmp",
    ".gif",
    ".heic",
    ".ico",
    ".jpeg",
    ".jpg",
    ".mov",
    ".mp3",
    ".mp4",
    ".pdf",
    ".png",
    ".psd",
    ".sketch",
    ".ttf",
    ".webm",
    ".webp",
    ".woff",
    ".woff2",
    ".zip",
}

DOCUMENTATION_EXTENSIONS = {
    ".adoc",
    ".md",
    ".mdx",
    ".rst",
    ".txt",
}

LANGUAGE_BY_EXTENSION = {
    ".abap": "ABAP",
    ".ads": "Ada",
    ".apex": "Apex",
    ".awk": "AWK",
    ".applescript": "AppleScript",
    ".bat": "Batchfile",
    ".bicep": "Bicep",
    ".c": "C",
    ".cbl": "COBOL",
    ".cmd": "Batchfile",
    ".cairo": "Cairo",
    ".cel": "CEL",
    ".clj": "Clojure",
    ".cmake": "CMake",
    ".cob": "COBOL",
    ".conf": "HOCON",
    ".cpp": "C++",
    ".cr": "Crystal",
    ".cs": "C#",
    ".css": "CSS",
    ".cue": "CUE",
    ".d": "D",
    ".dart": "Dart",
    ".dhall": "Dhall",
    ".el": "Emacs Lisp",
    ".elm": "Elm",
    ".erl": "Erlang",
    ".ex": "Elixir",
    ".f90": "Fortran",
    ".fs": "F#",
    ".gd": "GDScript",
    ".glsl": "GLSL",
    ".go": "Go",
    ".graphql": "GraphQL",
    ".groovy": "Groovy",
    ".h": "C",
    ".hack": "Hack",
    ".hcl": "HCL",
    ".hpp": "C++",
    ".html": "HTML",
    ".java": "Java",
    ".jl": "Julia",
    ".js": "JavaScript",
    ".json": "JSON",
    ".jsonld": "JSON-LD",
    ".jsonnet": "Jsonnet",
    ".just": "Just",
    ".kdl": "KDL",
    ".kt": "Kotlin",
    ".lisp": "Common Lisp",
    ".lua": "Lua",
    ".m": "MATLAB",
    ".meson": "Meson",
    ".mjs": "JavaScript",
    ".ml": "OCaml",
    ".move": "Move",
    ".nim": "Nim",
    ".nix": "Nix",
    ".pas": "Pascal",
    ".php": "PHP",
    ".pl": "Perl",
    ".properties": "Java Properties",
    ".proto": "Protocol Buffers",
    ".ps1": "PowerShell",
    ".puml": "PlantUML",
    ".purs": "PureScript",
    ".py": "Python",
    ".qs": "Q#",
    ".r": "R",
    ".re": "ReasonML",
    ".rego": "Rego",
    ".res": "ReScript",
    ".rb": "Ruby",
    ".rkt": "Racket",
    ".rq": "SPARQL",
    ".rs": "Rust",
    ".scala": "Scala",
    ".scm": "Scheme",
    ".sh": "Shell",
    ".sol": "Solidity",
    ".sql": "SQL",
    ".star": "Starlark",
    ".st": "Smalltalk",
    ".swift": "Swift",
    ".tcl": "Tcl",
    ".tf": "HCL",
    ".toml": "TOML",
    ".ts": "TypeScript",
    ".tsx": "TypeScript",
    ".ttl": "Turtle",
    ".v": "V",
    ".vb": "Visual Basic",
    ".wat": "WebAssembly Text",
    ".wgsl": "WGSL",
    ".xml": "XML",
    ".yaml": "YAML",
    ".yml": "YAML",
    ".zig": "Zig",
}

LANGUAGE_BY_FILENAME = {
    ".env.example": "dotenv",
    "Dockerfile": "Dockerfile",
    "Makefile": "Make",
}

REQUIRED_LINGUIST_RULES = [
    ("release/**", "linguist-generated=true"),
    ("reports/**", "linguist-generated=true"),
    ("data/**", "linguist-generated=true"),
    ("content/development/*.json", "linguist-generated=true"),
    ("apps/web/src/i18n/locales.js", "linguist-generated=true"),
    ("SE*S/**", "linguist-vendored=true"),
    ("SEIS*/**", "linguist-vendored=true"),
    ("polyglot/typescript/**", "linguist-language=TypeScript"),
    ("polyglot/react/*.tsx", "linguist-language=TypeScript"),
    ("packages/seis-ai/types/**", "linguist-language=TypeScript"),
    ("polyglot/objective-c/**", "linguist-language=Objective-C"),
]

SELF_REPORT_PATHS = {
    "reports/language-distribution.json",
    "reports/language-distribution.md",
}

VOLATILE_REPORT_PATHS = {
    "reports/automation-refresh-seis-surface-summary.json",
    "cloud-migration-audit.ci.json",
}

RUNTIME_COMMANDS = [
    ("node", ["node", "--version"]),
    ("python3", ["python3", "--version"]),
    ("go", ["go", "version"]),
    ("rustc", ["rustc", "--version"]),
    ("swift", ["swift", "--version"]),
    ("javac", ["javac", "-version"]),
    ("dart", ["dart", "--version"]),
]


def main():
    if "--help" in sys.argv or "-h" in sys.argv:
        print_help()
        return 0

    unknown = [arg for arg in sys.argv[1:] if arg not in {"--check", "--help", "-h"}]
    if unknown:
        print(f"Unsupported option: {', '.join(unknown)}", file=sys.stderr)
        print_help()
        return 1

    rules = read_linguist_rules()
    report = build_report(rules)
    markdown = build_markdown(report)

    if CHECK_MODE:
        return check_report(report, markdown)

    write_text(REPORT_JSON, stable_json(report))
    write_text(REPORT_MD, markdown)
    summary = report["summary"]
    print(
        "SEIS language distribution report updated: "
        f"JavaScript {summary['javascriptPercent']}% "
        f"(target {summary['targetJavaScriptPercent']}%)."
    )
    print(f"Reports: {relative(REPORT_JSON)}, {relative(REPORT_MD)}")
    return 0


def print_help():
    print(
        """SEIS language distribution report

Commands:
  python3 scripts/create-language-distribution-report.py
  python3 scripts/create-language-distribution-report.py --check

This tool reads .gitattributes Linguist generated/vendor rules, measures the
counted source-language surface, and records the phased JavaScript 21% target.
"""
    )


def read_linguist_rules():
    if not GITATTRIBUTES.exists():
        return []

    rules = []
    for raw_line in GITATTRIBUTES.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#"):
            continue
        parts = line.split()
        if len(parts) < 2:
            continue
        pattern = parts[0].lstrip("/")
        attributes = parts[1:]
        reason = None
        if "linguist-generated=true" in attributes:
            reason = "linguist-generated"
        if "linguist-vendored=true" in attributes:
            reason = "linguist-vendored"
        if reason or any(attribute.startswith("linguist-language=") for attribute in attributes):
            rules.append({"pattern": pattern, "attributes": attributes, "reason": reason})
    return rules


def build_report(rules):
    counted_files = []
    excluded_counts = {}

    for file_path in iter_files():
        rel_path = file_path.relative_to(ROOT).as_posix()
        if rel_path in SELF_REPORT_PATHS or rel_path in VOLATILE_REPORT_PATHS:
            continue
        reason = exclusion_reason(rel_path, file_path, rules)
        size = file_path.stat().st_size

        if reason:
            excluded_counts[reason] = excluded_counts.get(reason, 0) + size
            continue

        language = detect_language(file_path, rel_path, rules)
        counted_files.append(
            {
                "path": rel_path,
                "language": language,
                "bytes": size,
            }
        )

    by_language = {}
    for item in counted_files:
        by_language[item["language"]] = by_language.get(item["language"], 0) + item["bytes"]

    total_bytes = sum(by_language.values())
    languages = [
        {
            "language": language,
            "bytes": byte_count,
            "percent": percent(byte_count, total_bytes),
        }
        for language, byte_count in sorted(by_language.items(), key=lambda entry: (-entry[1], entry[0]))
    ]

    javascript_bytes = by_language.get("JavaScript", 0)
    focus_split = build_focus_language_split(by_language, total_bytes)
    language_balance = build_language_balance(by_language, total_bytes)
    required_non_js_bytes = required_non_javascript_bytes(javascript_bytes, total_bytes)
    snapshot_hash = hash_counted_files(counted_files)
    largest_js = [
        item
        for item in sorted(
            (entry for entry in counted_files if entry["language"] == "JavaScript"),
            key=lambda entry: (-entry["bytes"], entry["path"]),
        )[:12]
    ]

    summary = {
        "countedFileCount": len(counted_files),
        "countedBytes": total_bytes,
        "javascriptBytes": javascript_bytes,
        "javascriptPercent": percent(javascript_bytes, total_bytes),
        "targetJavaScriptPercent": TARGET_JAVASCRIPT_PERCENT,
        "targetStatus": "met" if percent(javascript_bytes, total_bytes) <= TARGET_JAVASCRIPT_PERCENT else "above_target",
        "requiredAdditionalNonJavaScriptBytesForTarget": required_non_js_bytes,
        "phase": "phase_1_generated_vendor_control_then_real_polyglot_migration",
    }

    return {
        "version": 1,
        "id": "seis-language-distribution",
        "mode": "github_linguist_aligned_source_budget",
        "sourceReferences": {
            "linguistPolicy": ".gitattributes",
            "polyglotManifest": "polyglot/manifest.json",
            "fullstackLanguageMatrix": "content/development/fullstack-language-matrix.json",
        },
        "summary": summary,
        "languages": languages,
        "githubLanguagePanelSplit": focus_split,
        "languageBalanceTargets": language_balance,
        "largestJavaScriptFiles": largest_js,
        "excludedBytesByReason": dict(sorted(excluded_counts.items())),
        "requiredLinguistRules": [
            {"pattern": pattern, "attribute": attribute}
            for pattern, attribute in REQUIRED_LINGUIST_RULES
        ],
        "localRuntimeReadiness": runtime_readiness(),
        "nextMigrationOrder": [
            "Keep generated release, report, data, and local snapshot files out of GitHub Linguist counts.",
            "Move translation payloads from JavaScript modules into data files after UI fallback testing.",
            "Keep JavaScript, TypeScript, and Objective-C as separate language panels; Other is every remaining language only.",
            "Promote stable Node automation scripts to Python or Go only when the behavior is covered by checks.",
            "Grow Apple, Android, systems, Go/infrastructure, and Windows lanes through real SEIS features, not filler language-percentage code.",
            "Keep browser runtime JavaScript focused on interaction code; put contracts in typed or domain-specific languages.",
        ],
        "sourceSnapshot": {
            "hash": snapshot_hash,
            "algorithm": "sha256",
        },
    }


def iter_files():
    git_paths = git_source_paths()
    if git_paths is not None:
        for rel_path in git_paths:
            if has_skipped_dir(rel_path):
                continue
            path = ROOT / rel_path
            if path.is_file():
                yield path
        return

    for current_root, dirs, files in os.walk(ROOT):
        dirs[:] = sorted(
            dirname
            for dirname in dirs
            if dirname not in SKIP_DIRS
            and not dirname.startswith(SKIP_DIR_PREFIXES)
            and not dirname.endswith(".app")
            and not dirname.endswith(".xcarchive")
        )
        for name in sorted(files):
            path = Path(current_root) / name
            if path.is_file():
                yield path


def git_source_paths():
    result = subprocess.run(
        ["git", "ls-files", "-z", "--cached"],
        cwd=ROOT,
        text=True,
        capture_output=True,
    )
    if result.returncode != 0:
        return None

    paths = [path for path in result.stdout.split("\0") if path]
    return sorted(paths)


def has_skipped_dir(rel_path):
    return bool(set(rel_path.split("/")) & SKIP_DIRS) or any(
        part.startswith(SKIP_DIR_PREFIXES)
        for part in rel_path.split("/")
    )


def exclusion_reason(rel_path, file_path, rules):
    path_parts = set(rel_path.split("/"))
    if path_parts & SKIP_DIRS:
        return "workspace-ignore"
    if any(part.startswith(SKIP_DIR_PREFIXES) for part in rel_path.split("/")):
        return "workspace-ignore"
    if file_path.suffix.lower() in BINARY_EXTENSIONS:
        return "binary"
    if file_path.suffix.lower() in DOCUMENTATION_EXTENSIONS:
        return "documentation"
    for rule in rules:
        if matches_pattern(rel_path, rule["pattern"]):
            return rule["reason"]
    return None


def matches_pattern(rel_path, pattern):
    pattern = pattern.lstrip("/")
    if fnmatch.fnmatch(rel_path, pattern):
        return True
    if pattern.endswith("/**"):
        prefix = pattern[:-3]
        return rel_path == prefix or rel_path.startswith(prefix + "/") or matches_path_prefix(rel_path, prefix)
    return False


def matches_path_prefix(rel_path, prefix):
    rel_parts = rel_path.split("/")
    prefix_parts = prefix.split("/")
    if len(rel_parts) < len(prefix_parts):
        return False
    return all(fnmatch.fnmatch(path_part, pattern_part) for path_part, pattern_part in zip(rel_parts, prefix_parts))


def linguist_language_override(rel_path, rules):
    for rule in rules:
        if not matches_pattern(rel_path, rule["pattern"]):
            continue
        for attribute in rule["attributes"]:
            if attribute.startswith("linguist-language="):
                return attribute.split("=", 1)[1]
    return None


def detect_language(file_path, rel_path, rules):
    override = linguist_language_override(rel_path, rules)
    if override:
        return override

    name = file_path.name
    if name in LANGUAGE_BY_FILENAME:
        return LANGUAGE_BY_FILENAME[name]

    suffix = file_path.suffix.lower()
    if suffix == ".m" and "/objective-c/" in rel_path:
        return "Objective-C"
    if suffix == ".cjs":
        return "JavaScript"
    if suffix == ".mmd":
        return "Mermaid"
    if suffix == ".avsc":
        return "Avro"
    if suffix == ".taskfile.yml":
        return "YAML"
    if suffix == ".env":
        return "dotenv"
    return LANGUAGE_BY_EXTENSION.get(suffix, "Other")


def required_non_javascript_bytes(javascript_bytes, total_bytes):
    if javascript_bytes <= 0:
        return 0
    target_total = javascript_bytes / (TARGET_JAVASCRIPT_PERCENT / 100)
    required = target_total - total_bytes
    return int(required) if required > 0 else 0


def build_focus_language_split(by_language, total_bytes):
    focus_entries = []
    focus_bytes = 0
    for language in FOCUS_LANGUAGE_SPLIT:
        byte_count = by_language.get(language, 0)
        focus_bytes += byte_count
        focus_entries.append(
            {
                "language": language,
                "bytes": byte_count,
                "percent": percent(byte_count, total_bytes),
                "sourceLanguages": [language],
            }
        )

    other_source_languages = sorted(language for language in by_language if language not in FOCUS_LANGUAGE_SPLIT)
    other_bytes = total_bytes - focus_bytes
    focus_entries.append(
        {
            "language": "Other",
            "bytes": other_bytes,
            "percent": percent(other_bytes, total_bytes),
            "sourceLanguages": other_source_languages,
        }
    )
    return focus_entries


def build_language_balance(by_language, total_bytes):
    targets = []
    assigned_languages = set()
    for target in LANGUAGE_BALANCE_TARGETS:
        source_languages = [language for language in target["languages"] if by_language.get(language, 0) > 0]
        byte_count = sum(by_language.get(language, 0) for language in target["languages"])
        current_percent = percent(byte_count, total_bytes)
        if current_percent < target["minPercent"]:
            status = "below_target"
        elif current_percent > target["maxPercent"]:
            status = "above_target"
        else:
            status = "within_target"
        assigned_languages.update(target["languages"])
        targets.append(
            {
                "id": target["id"],
                "label": target["label"],
                "bytes": byte_count,
                "percent": current_percent,
                "minPercent": target["minPercent"],
                "maxPercent": target["maxPercent"],
                "status": status,
                "sourceLanguages": source_languages,
                "purpose": target["purpose"],
                "noFillerRule": "Only product, platform, automation, security, data, design, or governance work can move this target.",
            }
        )

    unassigned_languages = sorted(language for language, byte_count in by_language.items() if byte_count > 0 and language not in assigned_languages)
    unassigned_bytes = sum(by_language.get(language, 0) for language in unassigned_languages)
    return {
        "mode": "multi_platform_real_source_balance",
        "status": "within_target" if all(target["status"] == "within_target" for target in targets) else "needs_real_platform_work",
        "noFillerPolicy": "Do not add filler code only to change GitHub language percentages. Every language must serve a real SEIS purpose.",
        "targets": targets,
        "unassigned": {
            "bytes": unassigned_bytes,
            "percent": percent(unassigned_bytes, total_bytes),
            "languages": unassigned_languages,
        },
    }


def runtime_readiness():
    runtimes = []
    for runtime_id, command in RUNTIME_COMMANDS:
        if runtime_id == "swift":
            available = shutil.which(command[0]) is not None
            runtimes.append(
                {
                    "id": runtime_id,
                    "command": " ".join(command),
                    "available": available,
                    "exitCode": None,
                    "version": "detected; package tests handle configured toolchain readiness" if available else None,
                }
            )
            continue
        if shutil.which(command[0]) is None:
            runtimes.append(
                {
                    "id": runtime_id,
                    "command": " ".join(command),
                    "available": False,
                    "exitCode": None,
                    "version": None,
                }
            )
            continue
        result = subprocess.run(command, cwd=ROOT, text=True, capture_output=True)
        output = " ".join((result.stdout + "\n" + result.stderr).strip().split())
        output = sanitize_runtime_output(output)
        runtimes.append(
            {
                "id": runtime_id,
                "command": " ".join(command),
                "available": result.returncode == 0,
                "exitCode": result.returncode,
                "version": output[:300] if output else None,
            }
        )
    return runtimes


def sanitize_runtime_output(output):
    if not output:
        return output
    replacements = {
        str(Path.home()): "$HOME",
        str(ROOT): "$SEIS_ROOT",
    }
    sanitized = output
    for source, replacement in replacements.items():
        sanitized = sanitized.replace(source, replacement)
    return sanitized


def hash_counted_files(files):
    digest = hashlib.sha256()
    for item in sorted(files, key=lambda entry: entry["path"]):
        digest.update(item["path"].encode("utf-8"))
        digest.update(b"\0")
        digest.update(str(item["bytes"]).encode("utf-8"))
        digest.update(b"\0")
        digest.update(item["language"].encode("utf-8"))
        digest.update(b"\n")
    return digest.hexdigest()


def build_markdown(report):
    summary = report["summary"]
    lines = [
        "# SEIS Language Distribution",
        "",
        f"- Mode: `{report['mode']}`",
        f"- Counted files: {summary['countedFileCount']}",
        f"- Counted bytes: {summary['countedBytes']}",
        f"- JavaScript: {summary['javascriptBytes']} bytes ({summary['javascriptPercent']}%)",
        f"- Target JavaScript: {summary['targetJavaScriptPercent']}%",
        f"- Target status: `{summary['targetStatus']}`",
        f"- Additional non-JavaScript bytes needed for strict target: {summary['requiredAdditionalNonJavaScriptBytesForTarget']}",
        "",
        "## GitHub Language Panel Split",
        "",
        "| Panel | Bytes | Percent | Source languages |",
        "| --- | ---: | ---: | --- |",
    ]

    for entry in report["githubLanguagePanelSplit"]:
        source_languages = ", ".join(entry["sourceLanguages"][:12])
        if len(entry["sourceLanguages"]) > 12:
            source_languages += f", +{len(entry['sourceLanguages']) - 12} more"
        lines.append(f"| {entry['language']} | {entry['bytes']} | {entry['percent']}% | {source_languages} |")

    balance = report["languageBalanceTargets"]
    lines.extend([
        "",
        "## GitHub Language Balance Targets",
        "",
        f"- Mode: `{balance['mode']}`",
        f"- Status: `{balance['status']}`",
        f"- No-filler policy: {balance['noFillerPolicy']}",
        "",
        "| Platform family | Current | Target | Status | Source languages |",
        "| --- | ---: | ---: | --- | --- |",
    ])

    for target in balance["targets"]:
        source_languages = ", ".join(target["sourceLanguages"]) or "not yet counted"
        lines.append(
            f"| {target['label']} | {target['percent']}% | "
            f"{target['minPercent']}-{target['maxPercent']}% | `{target['status']}` | {source_languages} |"
        )

    unassigned = balance["unassigned"]
    if unassigned["languages"]:
        source_languages = ", ".join(unassigned["languages"][:12])
        if len(unassigned["languages"]) > 12:
            source_languages += f", +{len(unassigned['languages']) - 12} more"
        lines.extend([
            "",
            f"Unassigned counted languages: {unassigned['percent']}% ({source_languages}).",
        ])

    lines.extend([
        "",
        "## Counted Languages",
        "",
        "| Language | Bytes | Percent |",
        "| --- | ---: | ---: |",
    ])

    for entry in report["languages"][:24]:
        lines.append(f"| {entry['language']} | {entry['bytes']} | {entry['percent']}% |")

    lines.extend([
        "",
        "## Largest JavaScript Files Still Counted",
        "",
        "| Path | Bytes |",
        "| --- | ---: |",
    ])

    for entry in report["largestJavaScriptFiles"]:
        lines.append(f"| `{entry['path']}` | {entry['bytes']} |")

    lines.extend([
        "",
        "## Linguist Controls",
        "",
        "| Pattern | Attribute |",
        "| --- | --- |",
    ])

    for rule in report["requiredLinguistRules"]:
        lines.append(f"| `{rule['pattern']}` | `{rule['attribute']}` |")

    lines.extend([
        "",
        "## Local Runtime Readiness",
        "",
        "| Runtime | Available | Version |",
        "| --- | --- | --- |",
    ])

    for runtime in report["localRuntimeReadiness"]:
        available = "yes" if runtime["available"] else "no"
        version = runtime["version"] or ""
        lines.append(f"| `{runtime['id']}` | {available} | `{version}` |")

    lines.extend([
        "",
        "## Next Migration Order",
        "",
    ])

    for item in report["nextMigrationOrder"]:
        lines.append(f"- {item}")

    lines.append("")
    return "\n".join(lines)


def check_report(report, markdown):
    failures = []
    rules = read_linguist_rules()

    for pattern, attribute in REQUIRED_LINGUIST_RULES:
        if not any(rule["pattern"] == pattern and attribute in rule["attributes"] for rule in rules):
            failures.append(f"missing .gitattributes rule: {pattern} {attribute}")

    balance = report.get("languageBalanceTargets", {})
    target_ids = {target["id"] for target in balance.get("targets", [])}
    for expected in [
        "apple-swift-ecosystem",
        "ai-data-python-sql",
        "typescript-javascript-tooling",
        "android-jvm",
        "rust-c-cpp-systems",
        "go-infrastructure",
        "windows-dotnet",
        "html-css-preview",
    ]:
        if expected not in target_ids:
            failures.append(f"missing language balance target: {expected}")
    if "Do not add filler code" not in balance.get("noFillerPolicy", ""):
        failures.append("language balance report must preserve the no-filler policy")
    if "GitHub Language Balance Targets" not in markdown:
        failures.append("language distribution markdown must include language balance targets")

    if not REPORT_JSON.exists():
        failures.append(f"missing report: {relative(REPORT_JSON)}")
    else:
        on_disk = read_json_report(REPORT_JSON)
        if not is_report_equivalent(on_disk, report):
            failures.append(f"stale report: {relative(REPORT_JSON)}")

    if not REPORT_MD.exists():
        failures.append(f"missing report: {relative(REPORT_MD)}")
    elif normalize_markdown_text(REPORT_MD.read_text(encoding="utf-8")) != normalize_markdown_text(markdown):
        failures.append(f"stale report: {relative(REPORT_MD)}")

    if failures:
        print("SEIS language distribution check failed:", file=sys.stderr)
        for failure in failures:
            print(f"- {failure}", file=sys.stderr)
        print("Run: npm run automation:language-distribution", file=sys.stderr)
        return 1

    print("SEIS language distribution check passed.")
    return 0


def percent(value, total):
    if total <= 0:
        return 0.0
    return round((value / total) * 100, 2)


def stable_json(data):
    return json.dumps(data, indent=2, ensure_ascii=False) + "\n"


def read_json_report(path):
    with open(path, "r", encoding="utf-8") as handle:
        payload = json.load(handle)
    return normalize_runtime_report(payload)


def is_report_equivalent(expected, actual):
    return canonical_report_json(expected) == canonical_report_json(actual)


def canonical_report_json(payload):
    return json.dumps(
        normalize_runtime_report(payload),
        sort_keys=True,
        indent=2,
        ensure_ascii=False,
    )


def normalize_runtime_report(payload):
    normalized = json.loads(json.dumps(payload))
    for runtime_entry in normalized.get("localRuntimeReadiness", []):
        runtime_entry.pop("available", None)
        runtime_entry.pop("exitCode", None)
        runtime_entry.pop("version", None)
    return normalized


def normalize_markdown_text(text):
    lines = []
    in_runtime_block = False
    for line in text.splitlines():
        if line.startswith("## Local Runtime Readiness"):
            in_runtime_block = True
            continue
        if in_runtime_block:
            if line.startswith("## ") and line != "":
                in_runtime_block = False
            else:
                continue
        if not in_runtime_block:
            lines.append(line)
    return "\n".join(lines).rstrip() + "\n"


def write_text(path, text):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")


def relative(path):
    return path.relative_to(ROOT).as_posix()


if __name__ == "__main__":
    raise SystemExit(main())
