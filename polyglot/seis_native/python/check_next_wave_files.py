from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]

EXPECTED = {
    "Lean": "polyglot/seis_native/lean/SeisNativeKernel.lean",
    "Coq": "polyglot/seis_native/coq/SeisNativeKernel.v",
    "Racket": "polyglot/seis_native/racket/seis_native_kernel.rkt",
    "Scheme": "polyglot/seis_native/scheme/seis-native-kernel.scm",
    "Smalltalk": "polyglot/seis_native/smalltalk/SeisNativeKernel.st",
    "Pascal": "polyglot/seis_native/pascal/seis_native_kernel.pas",
    "COBOL": "polyglot/seis_native/cobol/SEISNATIVEKERNEL.cob",
    "Assembly": "polyglot/seis_native/assembly/seis_native_kernel.asm",
    "Solidity": "polyglot/seis_native/solidity/SeisNativeKernel.sol",
    "Move": "polyglot/seis_native/move/seis_native_kernel.move",
    "Starlark": "polyglot/seis_native/starlark/seis_native_kernel.bzl",
    "PowerShell": "polyglot/seis_native/powershell/SeisNativeKernel.ps1",
    "Protobuf": "polyglot/seis_native/protobuf/seis_native_kernel.proto",
    "GraphQL": "polyglot/seis_native/graphql/seis_native_kernel.graphql",
    "Terraform": "polyglot/seis_native/terraform/seis_native_kernel.tf",
    "TOML": "polyglot/seis_native/toml/seis_native_kernel.toml",
}

LANES = ["Apple First", "Data AI", "Systems", "Android", "Windows", "Infrastructure"]

errors = []

for language, relative_path in EXPECTED.items():
    path = ROOT / relative_path
    if not path.exists():
        errors.append(f"{language}: missing {relative_path}")
        continue
    text = path.read_text(encoding="utf-8", errors="ignore")
    for lane in LANES:
        lane_variant = lane.lower().replace(" ", "-")
        if lane not in text and lane_variant not in text.lower():
            errors.append(f"{language}: missing lane {lane}")

if errors:
    print("SEIS next-wave polyglot check failed:")
    for error in errors:
        print(f"- {error}")
    raise SystemExit(1)

print("SEIS next-wave polyglot check passed.")
