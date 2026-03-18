#!/usr/bin/env python3
"""Report vocabulary entries that do not yet have generated audio files."""

from __future__ import annotations

import argparse
import csv
import re
import sys
from pathlib import Path
from typing import Iterable, List, Tuple


SUPPORTED_SUFFIXES = {".csv", ".tsv"}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Check which vocabulary entries are missing MP3 files."
    )
    parser.add_argument("input_file", help="Path to the CSV/TSV vocabulary file.")
    parser.add_argument("output_dir", help="Directory that should contain MP3 files.")
    parser.add_argument(
        "--word-column",
        default="Word",
        help="Column name containing the vocabulary text. Default: %(default)s",
    )
    parser.add_argument(
        "--quiet",
        action="store_true",
        help="Only print the missing words, one per line.",
    )
    return parser.parse_args()


def detect_delimiter(path: Path) -> str:
    if path.suffix.lower() == ".tsv":
        return "\t"
    return ","


def safe_stem(text: str) -> str:
    normalized = re.sub(r"\s+", " ", text.strip())
    sanitized = re.sub(r"[^A-Za-z0-9._-]+", "_", normalized)
    sanitized = sanitized.strip("._") or "item"
    return sanitized


def build_output_path(output_dir: Path, word: str) -> Path:
    return output_dir / f"{safe_stem(word)}.mp3"


def load_words(path: Path, word_column: str) -> List[str]:
    if path.suffix.lower() not in SUPPORTED_SUFFIXES:
        raise ValueError(
            f"Unsupported input format: {path.suffix or '<none>'}. Use CSV or TSV."
        )

    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle, delimiter=detect_delimiter(path))
        if not reader.fieldnames or word_column not in reader.fieldnames:
            raise ValueError(
                f"Missing required column '{word_column}'. Found: {reader.fieldnames or []}"
            )

        words: List[str] = []
        for row in reader:
            raw = (row.get(word_column) or "").strip()
            if raw:
                words.append(raw)
        return words


def find_missing(words: Iterable[str], output_dir: Path) -> List[Tuple[str, Path]]:
    missing: List[Tuple[str, Path]] = []
    for word in words:
        output_path = build_output_path(output_dir, word)
        if not output_path.exists():
            missing.append((word, output_path))
    return missing


def main() -> int:
    args = parse_args()
    input_path = Path(args.input_file)
    output_dir = Path(args.output_dir)

    if not input_path.is_file():
        print(f"Input file not found: {input_path}", file=sys.stderr)
        return 1

    try:
        words = load_words(input_path, args.word_column)
        missing = find_missing(words, output_dir)
    except Exception as exc:
        print(f"Failed to check missing audio: {exc}", file=sys.stderr)
        return 1

    if args.quiet:
        for word, _ in missing:
            print(word)
    else:
        print(f"Vocabulary entries: {len(words)}")
        print(f"Missing audio files: {len(missing)}")
        for word, output_path in missing:
            print(f"MISSING {word} -> {output_path}")

    return 0 if not missing else 2


if __name__ == "__main__":
    raise SystemExit(main())
