from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
KERNEL_ROOT = ROOT / "polyglot" / "seis_native"
MANIFEST = KERNEL_ROOT / "seis_native_manifest.yaml"
LANES = ["Apple First", "Data AI", "Systems", "Android", "Windows", "Infrastructure"]

errors = []


def parse_manifest_files(text: str) -> list[str]:
    files: list[str] = []
    for raw_line in text.splitlines():
        line = raw_line.strip()
        if line.startswith("file: "):
            files.append(line.split("file: ", 1)[1].strip().strip('"'))
    return files


def ensure(condition: bool, message: str) -> None:
    if not condition:
        errors.append(message)


ensure(MANIFEST.exists(), "Missing native polyglot manifest.")

manifest_text = MANIFEST.read_text(encoding="utf-8") if MANIFEST.exists() else ""
for lane in LANES:
    ensure(lane in manifest_text, f"Manifest missing lane: {lane}")

manifest_files = parse_manifest_files(manifest_text)
ensure(manifest_files, "Manifest does not declare any files.")

for relative in manifest_files:
    path = KERNEL_ROOT / relative
    ensure(path.exists(), f"Manifest file does not exist: {relative}")
    if not path.exists():
        continue
    text = path.read_text(encoding="utf-8", errors="ignore")
    lane_hits = 0
    for lane in LANES:
        normalized = lane.lower().replace(" ", "-")
        underscored = lane.lower().replace(" ", "_")
        if lane in text or normalized in text.lower() or underscored in text.lower():
            lane_hits += 1
    ensure(lane_hits >= 1, f"File has no SEIS lane marker: {relative}")

if errors:
    print("SEIS native manifest consistency check failed:")
    for error in errors:
        print(f"- {error}")
    raise SystemExit(1)

print(f"SEIS native manifest consistency check passed for {len(manifest_files)} files.")
