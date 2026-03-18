# 2026-03-18 TTS options and recommendation

## Context

The current local-only TTS workflow depends on ignored scripts, hardcoded proxy values, and a hardcoded service-account JSON path.
This document compares upgrade paths for the repository-tracked part of the workflow only.

## Option A: Keep Google Cloud TTS, but move to parameterized repo scripts

### What it means

- Keep Google Cloud Text-to-Speech as the synthesis provider
- Replace hardcoded local script settings with CLI flags and environment variables
- Add dry-run support so the scripts can be verified without real credentials
- Document credential handling and manual rotation steps outside the code path

### Pros

- Lowest migration cost because it stays close to the existing workflow
- Voice quality and language coverage remain familiar
- Easy to adopt incrementally for local usage, CI preparation, or ops handoff

### Cons

- Still depends on cloud credentials and outbound network access for real generation
- Local runtime still needs Python package installation before real synthesis

## Option B: Switch to edge or browser-native TTS for all web use cases

### What it means

- Move audio generation away from the current Python tooling
- Depend on browser speech APIs or an edge/runtime-specific TTS provider

### Pros

- Reduces Python script ownership in the repository
- May simplify some web-only preview scenarios

### Cons

- Hard to guarantee consistent downloadable MP3 assets
- Browser support and voice quality vary
- Does not directly solve the existing batch-generation workflow

## Option C: Move to another third-party batch TTS provider

### What it means

- Replace Google Cloud TTS with another API provider
- Rebuild credential, rate-limit, and output handling around the new provider

### Pros

- Could improve pricing or voice choice depending on vendor
- May fit future product requirements better

### Cons

- Highest migration and validation cost in the short term
- Requires new credentials, SDK integration, and operational runbooks
- Not necessary to solve the current hardcoding and governance risks

## Recommendation

Recommend **Option A** for this round.

Reasoning:

- It directly fixes the current repository-level risks: hardcoded proxy settings, hardcoded credential path assumptions, and missing dry-run verification.
- It keeps the change surface small while other follow-up tasks are moving in parallel.
- It creates a clean handoff point for later decisions about provider migration if product needs change.

## This round's decision boundary

This repository update covers:

- tracked helper scripts under `scripts/tts/`
- usage documentation
- credential handling runbook

This repository update does not cover:

- rotating the real cloud key
- deleting or replacing the currently active cloud service account
- migrating the application to a new TTS provider immediately
