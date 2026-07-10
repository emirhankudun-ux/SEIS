from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[3]
KERNEL_ROOT = ROOT / "polyglot" / "seis_native"
README = KERNEL_ROOT / "README.md"
MANIFEST = KERNEL_ROOT / "seis_native_manifest.yaml"

errors: list[str] = []


def ensure(condition: bool, message: str) -> None:
    if not condition:
        errors.append(message)


def parse_manifest_names(text: str) -> list[str]:
    names: list[str] = []
    for raw_line in text.splitlines():
        line = raw_line.strip()
        if line.startswith("- name: "):
            names.append(line.split("- name: ", 1)[1].strip().strip('"'))
    return names


def normalize_name(name: str) -> str:
    aliases = {
        "CSharp": "C#",
        "Cpp": "C++",
        "ObjectiveC": "Objective-C",
        "FSharp": "F#",
        "Ada Body": "Ada",
        "Python Summary": "Python",
    }
    return aliases.get(name, name)


ensure(README.exists(), "Missing README.md")
ensure(MANIFEST.exists(), "Missing seis_native_manifest.yaml")

readme_text = README.read_text(encoding="utf-8") if README.exists() else ""
manifest_text = MANIFEST.read_text(encoding="utf-8") if MANIFEST.exists() else ""
manifest_names = parse_manifest_names(manifest_text)

for manifest_name in manifest_names:
    display_name = normalize_name(manifest_name)
    ensure(display_name in readme_text, f"README missing manifest language: {manifest_name}")

for required_doc in ["LANGUAGE_FAMILIES.md", "QUALITY_GATES.md", "REVIEW_PACKET.md"]:
    ensure(required_doc in readme_text, f"README must reference {required_doc}")

readme_language_rows = re.findall(r"^\|\s*([^|]+?)\s*\|\s*`", readme_text, flags=re.MULTILINE)
ensure(len(readme_language_rows) >= 40, "README should expose at least 40 language rows.")

if errors:
    print("SEIS README/manifest sync check failed:")
    for error in errors:
        print(f"- {error}")
    raise SystemExit(1)

print(f"SEIS README/manifest sync check passed for {len(manifest_names)} manifest entries.")
