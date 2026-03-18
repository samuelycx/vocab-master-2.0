# Local Avatar And Audio Design

**Scope**
- Repair local-only avatar upload and display flow in the main workspace.
- Keep word audio playback on local `mp3` files and avoid falling back to browser TTS when autoplay is blocked.
- Do not sync server avatar data into local.

## Avatar

Local web currently lacks the profile-edit route, avatar helper, upload API helpers, and backend upload endpoints that already existed in the worktree. The fix is to sync the proven local-only pieces into main:

- Add `ProfileSetup.vue` and register `profile-setup` in `App.vue`.
- Add a shared `avatar.js` helper so `/uploads/avatars/...` is treated as a valid image URL.
- Update core avatar surfaces (`Settings`, `Dashboard`, `Leaderboard`, `PKArena`) to use the helper.
- Add `/api/auth/profile` and `/api/auth/avatar` to the local backend, storing files under `server/uploads/avatars`.

## Audio

Local `mp3` files are present and correctly served. The wrong voice happens because failed automatic `audio.play()` falls back to browser TTS. The fix is:

- Prime HTML audio playback during explicit user gestures (`startSession`, `startReview`, `startMistake`, `startPKSession`) using a silent clip.
- Wait for priming before playing a word clip.
- If playback fails due to autoplay permission (`NotAllowedError` / gesture block), do not fall back to TTS.
- Keep TTS fallback only for real file/load failures.

## Verification

- Frontend tests for avatar helper, profile setup flow, app route registration, and engine autoplay fallback behavior.
- Backend contract tests for the new auth profile/avatar routes.
- Local manual verification on `http://127.0.0.1:4174/` with backend `http://127.0.0.1:3002/api`.
