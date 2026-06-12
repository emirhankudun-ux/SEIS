#!/usr/bin/env python3

import fnmatch
import hashlib
import json
import os
import subprocess
import sys
from pathlib import Path


ROOT = Path.cwd()
REPORT_JSON = ROOT / "reports" / "language-distribution.json"
REPORT_MD = ROOT / "reports" / "language-distribution.md"
GITATTRIBUTES = ROOT / ".gitattributes"
CHECK_MODE = "--check" in sys.argv
TARGET_JAVASCRIPT_PERCENT = 10.0
FOCUS_LANGUAGE_SPLIT = ("JavaScript", "TypeScript", "Objective-C")

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
counted source-language surface, and records the phased JavaScript 10% target.
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
            "Keep browser runtime JavaScript focused on interaction code; put contracts in typed or domain-specific languages.",
        ],
        "sourceSnapshot": {
            "hash": snapshot_hash,
            "algorithm": "sha256",
        },
    }


def iter_files():
    for current_root, dirs, files in os.walk(ROOT):
        dirs[:] = sorted(
            dirname
            for dirname in dirs
            if dirname not in SKIP_DIRS
            and not dirname.endswith(".app")
            and not dirname.endswith(".xcarchive")
        )
        for name in sorted(files):
            path = Path(current_root) / name
            if path.is_file():
                yield path


def exclusion_reason(rel_path, file_path, rules):
    path_parts = set(rel_path.split("/"))
    if path_parts & SKIP_DIRS:
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
        return rel_path == prefix or rel_path.startswith(prefix + "/")
    return False


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


def runtime_readiness():
    runtimes = []
    for runtime_id, command in RUNTIME_COMMANDS:
        result = subprocess.run(command, cwd=ROOT, text=True, capture_output=True)
        output = " ".join((result.stdout + "\n" + result.stderr).strip().split())
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

    if not REPORT_JSON.exists():
        failures.append(f"missing report: {relative(REPORT_JSON)}")
    elif REPORT_JSON.read_text(encoding="utf-8") != stable_json(report):
        failures.append(f"stale report: {relative(REPORT_JSON)}")

    if not REPORT_MD.exists():
        failures.append(f"missing report: {relative(REPORT_MD)}")
    elif REPORT_MD.read_text(encoding="utf-8") != markdown:
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


def write_text(path, text):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")


def relative(path):
    return path.relative_to(ROOT).as_posix()


if __name__ == "__main__":
    raise SystemExit(main())
