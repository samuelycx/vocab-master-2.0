# TTS tooling

This directory contains repository-tracked TTS helper scripts for local or CI usage.
They are the maintained replacement for ad hoc scripts under the ignored `tts/` folder.

## Goals

- Remove hardcoded proxy settings and local JSON key paths
- Keep scripts syntax-checkable and dry-run friendly without real cloud credentials
- Make the boundary explicit: repo scripts are safe preparation tools, real cloud key rotation is manual follow-up work

## Files

- `generate_audio.py`: generate MP3 audio from a CSV/TSV vocabulary file
- `check_missing.py`: report which words still do not have matching MP3 files

## Input format

The scripts currently support:

- UTF-8 CSV files with a `Word` column
- UTF-8 TSV files with a `Word` column

If your exported vocabulary uses another column name, pass `--word-column`.

## Credentials and proxy configuration

Do not hardcode any values inside the scripts.

- `GOOGLE_APPLICATION_CREDENTIALS`: optional service-account JSON path for Google Cloud TTS
- `HTTP_PROXY` / `HTTPS_PROXY`: optional proxy URL if your runtime needs outbound proxying
- `TTS_VOICE_NAME`: optional default voice name override
- `TTS_LANGUAGE_CODE`: optional default language code override

CLI flags can override environment variables:

- `--credentials-file`
- `--http-proxy`
- `--https-proxy`
- `--voice-name`
- `--language-code`

Example:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="$PWD/secrets/tts-service-account.json"
export HTTPS_PROXY="http://127.0.0.1:7890"
python3 scripts/tts/generate_audio.py ./data/words.csv ./artifacts/audio --dry-run
```

## Dry-run first

Use `--dry-run` before any real generation. In dry-run mode:

- the vocabulary file is parsed
- output file paths are planned
- no cloud SDK call is made
- no real credentials are required

Example:

```bash
python3 scripts/tts/generate_audio.py ./data/words.csv ./artifacts/audio --dry-run
```

## Real generation

Once credentials and dependency installation are ready in the target runtime:

```bash
python3 scripts/tts/generate_audio.py ./data/words.csv ./artifacts/audio
```

If `google-cloud-texttospeech` is not installed, the script exits with a clear message instead of silently failing.

## Check missing audio

```bash
python3 scripts/tts/check_missing.py ./data/words.csv ./artifacts/audio
python3 scripts/tts/check_missing.py ./data/words.csv ./artifacts/audio --quiet
```

Exit codes:

- `0`: no missing audio
- `2`: one or more entries are missing
- `1`: usage or input error

## Verification

At minimum, run:

```bash
python3 -m py_compile scripts/tts/generate_audio.py scripts/tts/check_missing.py
python3 scripts/tts/generate_audio.py --help
python3 scripts/tts/check_missing.py --help
```

## Out of scope for this round

- Real cloud credential rotation
- Committing secrets into the repository
- Direct edits to the ignored `tts/` workspace folder
