#!/usr/bin/env python3
"""Prepare conversation JSONL for OpenAI fine-tune jobs."""

from __future__ import annotations

import argparse
import json
from pathlib import Path


def _extract_messages(payload: dict) -> list[dict]:
    if "messages" in payload and isinstance(payload["messages"], list):
        return payload["messages"]
    if "messages" in payload and isinstance(payload["messages"], str):
        return json.loads(payload["messages"])
    return []


def prepare(input_path: Path, output_path: Path) -> int:
    count = 0
    with input_path.open("r", encoding="utf-8") as inp, output_path.open("w", encoding="utf-8") as out:
        for line in inp:
            line = line.strip()
            if not line:
                continue
            try:
                payload = json.loads(line)
            except json.JSONDecodeError:
                continue

            messages = _extract_messages(payload)
            if not messages:
                continue

            out.write(json.dumps({"messages": messages}, ensure_ascii=False) + "\n")
            count += 1
    return count


def main() -> None:  # pragma: no cover
    parser = argparse.ArgumentParser()
    parser.add_argument("input", type=Path, help="Input JSONL file (conversations)")
    parser.add_argument("output", type=Path, help="Output JSONL for fine-tune")
    args = parser.parse_args()

    count = prepare(args.input, args.output)
    print(f"Converted {count} conversations -> {args.output}")


if __name__ == "__main__":
    main()
