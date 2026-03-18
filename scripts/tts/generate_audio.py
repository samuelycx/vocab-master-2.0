#!/usr/bin/env python3
"""Generate MP3 files for vocabulary entries with optional dry-run support."""

from __future__ import annotations

import argparse
import csv
import os
import re
import sys
from pathlib import Path
from typing import Iterable, List


DEFAULT_VOICE = "en-US-Chirp3-HD-Aoede"
DEFAULT_LANGUAGE_CODE = "en-US"
DEFAULT_AUDIO_ENCODING = "MP3"
SUPPORTED_SUFFIXES = {".csv", ".tsv"}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Generate audio files from a vocabulary CSV/TSV file. "
            "Credentials and proxies must come from CLI flags or environment variables."
        )
    )
    parser.add_argument("input_file", help="Path to the CSV/TSV vocabulary file.")
    parser.add_argument("output_dir", help="Directory to write generated audio files into.")
    parser.add_argument(
        "--word-column",
        default="Word",
        help="Column name containing the vocabulary text. Default: %(default)s",
    )
    parser.add_argument(
        "--voice-name",
        default=os.getenv("TTS_VOICE_NAME", DEFAULT_VOICE),
        help="Google Cloud TTS voice name. Default: %(default)s",
    )
    parser.add_argument(
        "--language-code",
        default=os.getenv("TTS_LANGUAGE_CODE", DEFAULT_LANGUAGE_CODE),
        help="Language code for synthesis. Default: %(default)s",
    )
    parser.add_argument(
        "--credentials-file",
        default=os.getenv("GOOGLE_APPLICATION_CREDENTIALS"),
        help="Optional path to a service-account JSON file. Defaults to env var.",
    )
    parser.add_argument(
        "--http-proxy",
        default=os.getenv("HTTP_PROXY") or os.getenv("http_proxy"),
        help="Optional HTTP proxy URL. Defaults to env var.",
    )
    parser.add_argument(
        "--https-proxy",
        default=os.getenv("HTTPS_PROXY") or os.getenv("https_proxy"),
        help="Optional HTTPS proxy URL. Defaults to env var.",
    )
    parser.add_argument(
        "--overwrite",
        action="store_true",
        help="Overwrite existing files instead of skipping them.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print the planned work without calling Google Cloud TTS.",
    )
    return parser.parse_args()


def apply_runtime_environment(args: argparse.Namespace) -> None:
    if args.credentials_file:
        os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = args.credentials_file
    if args.http_proxy:
        os.environ["HTTP_PROXY"] = args.http_proxy
        os.environ["http_proxy"] = args.http_proxy
    if args.https_proxy:
        os.environ["HTTPS_PROXY"] = args.https_proxy
        os.environ["https_proxy"] = args.https_proxy


def detect_delimiter(path: Path) -> str:
    if path.suffix.lower() == ".tsv":
        return "\t"
    return ","


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


def safe_stem(text: str) -> str:
    normalized = re.sub(r"\s+", " ", text.strip())
    sanitized = re.sub(r"[^A-Za-z0-9._-]+", "_", normalized)
    sanitized = sanitized.strip("._") or "item"
    return sanitized


def build_output_path(output_dir: Path, word: str) -> Path:
    return output_dir / f"{safe_stem(word)}.mp3"


def ensure_credentials_ready(dry_run: bool) -> None:
    if dry_run:
        return
    credentials_file = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    if not credentials_file:
        raise RuntimeError(
            "Missing credentials. Set GOOGLE_APPLICATION_CREDENTIALS or pass --credentials-file."
        )
    if not Path(credentials_file).is_file():
        raise RuntimeError(f"Credentials file does not exist: {credentials_file}")


def create_tts_client():
    try:
        from google.cloud import texttospeech  # type: ignore
    except ImportError as exc:
        raise RuntimeError(
            "google-cloud-texttospeech is not installed. "
            "Install it in the target runtime before non-dry-run usage."
        ) from exc

    client = texttospeech.TextToSpeechClient(transport="rest")
    return client, texttospeech


def synthesize_word(
    client,
    texttospeech,
    word: str,
    output_path: Path,
    language_code: str,
    voice_name: str,
) -> None:
    synthesis_input = texttospeech.SynthesisInput(text=word)
    voice = texttospeech.VoiceSelectionParams(
        language_code=language_code,
        name=voice_name,
    )
    audio_config = texttospeech.AudioConfig(
        audio_encoding=getattr(texttospeech.AudioEncoding, DEFAULT_AUDIO_ENCODING)
    )
    response = client.synthesize_speech(
        input=synthesis_input,
        voice=voice,
        audio_config=audio_config,
    )
    output_path.write_bytes(response.audio_content)


def iter_planned_outputs(words: Iterable[str], output_dir: Path) -> Iterable[tuple[str, Path]]:
    for word in words:
        yield word, build_output_path(output_dir, word)


def main() -> int:
    args = parse_args()
    apply_runtime_environment(args)

    input_path = Path(args.input_file)
    output_dir = Path(args.output_dir)

    if not input_path.is_file():
        print(f"Input file not found: {input_path}", file=sys.stderr)
        return 1

    try:
        words = load_words(input_path, args.word_column)
    except Exception as exc:  # pragma: no cover - CLI error path
        print(f"Failed to read vocabulary file: {exc}", file=sys.stderr)
        return 1

    output_dir.mkdir(parents=True, exist_ok=True)

    try:
        ensure_credentials_ready(args.dry_run)
    except Exception as exc:
        print(str(exc), file=sys.stderr)
        return 1

    client = None
    texttospeech = None
    if not args.dry_run:
        try:
            client, texttospeech = create_tts_client()
        except Exception as exc:
            print(str(exc), file=sys.stderr)
            return 1

    generated = 0
    skipped = 0
    for word, output_path in iter_planned_outputs(words, output_dir):
        if output_path.exists() and not args.overwrite:
            skipped += 1
            print(f"SKIP {word} -> {output_path}")
            continue

        if args.dry_run:
            generated += 1
            print(f"DRY-RUN {word} -> {output_path}")
            continue

        try:
            synthesize_word(
                client,
                texttospeech,
                word,
                output_path,
                args.language_code,
                args.voice_name,
            )
            generated += 1
            print(f"OK {word} -> {output_path}")
        except Exception as exc:  # pragma: no cover - remote API error path
            print(f"ERROR {word}: {exc}", file=sys.stderr)

    print(
        f"Completed. total={len(words)} generated={generated} skipped={skipped} dry_run={args.dry_run}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
