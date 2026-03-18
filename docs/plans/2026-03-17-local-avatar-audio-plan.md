# Local Avatar And Audio Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Restore local avatar upload/display and ensure local word audio prefers `mp3` without falling back to browser TTS on autoplay-block errors.

**Architecture:** Reuse the previously validated worktree avatar flow in the main workspace, while keeping all data local. For audio, keep the existing `/uploads/word-audio/*.mp3` strategy and harden playback by priming audio during explicit user gestures and suppressing TTS fallback on permission-blocked playback.

**Tech Stack:** Vue 3, Vitest, NestJS, Prisma, local SQLite, ServeStatic, multipart upload

---

### Task 1: Lock the expected behavior with failing tests
- Add frontend tests for:
  - avatar URL resolution
  - profile setup route registration
  - profile setup file selection + save flow
  - audio autoplay blocked errors not falling back to TTS
- Add backend contract coverage for:
  - `PATCH /auth/profile`
  - `POST /auth/avatar`

### Task 2: Sync local avatar flow into main
- Add avatar helper and profile setup component.
- Register `profile-setup` view in app shell.
- Extend API client for multipart avatar upload and profile update.
- Update visible avatar surfaces to use the helper.

### Task 3: Sync local backend avatar endpoints into main
- Add upload DTO/update DTO support.
- Add avatar storage helper and auth controller endpoints.
- Extend auth service with nickname/avatar updates.

### Task 4: Harden local audio playback
- Add audio priming state and a silent primer clip.
- Prime audio during explicit session-start user actions.
- Avoid TTS fallback for autoplay permission failures.

### Task 5: Verify locally
- Run focused frontend/backend tests.
- Rebuild if needed.
- Verify local endpoints and local UI behavior on `4174/3002`.
