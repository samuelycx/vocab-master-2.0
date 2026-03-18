# Server And Web Security Hardening Design

> [!abstract]
> This design narrows the agreed repair scope to `server`, `web`, deployment/runtime consistency, and repository hygiene. It explicitly excludes `miniprogram`, which will be handled as a separate follow-up project.

Related review: [[2026-03-18_PROJECT_FULL_REVIEW_CN]]

## Scope

- Protect server-side privileged surfaces from unauthenticated access.
- Remove high-risk data handling patterns in public APIs.
- Prevent identity spoofing in PK matchmaking.
- Harden avatar upload and profile save consistency for the web app.
- Align local development/runtime defaults and restore a working server e2e path.
- Improve repository hygiene for secrets and generated upload artifacts.

## Non-Goals

- Do not migrate the miniprogram implementation or synchronize web changes into it.
- Do not redesign the entire auth stack into a new global guard/decorator architecture.
- Do not rotate the leaked Google service-account key from inside this session; only clean repository-side handling and document the required offline rotation.
- Do not expand feature scope beyond the defects already accepted in the review.

## Chosen Approach

We will use a focused hardening pass instead of a broad architecture rewrite. The implementation keeps the current NestJS + Vue structure, but closes the highest-risk gaps with the smallest reliable set of changes:

1. Add explicit authorization checks to admin operations and sanitize all admin user payloads.
2. Replace unsafe SQL string interpolation in word session loading.
3. Require authenticated identity for PK entrypoints and remove the fallback that trusts caller-provided user fields.
4. Make profile saving coherent across backend and web by validating uploads, constraining file types, and avoiding half-success flows.
5. Unify local port assumptions, add an explicit e2e database setup path, and ignore local secrets/uploads in git.

This keeps the current product behavior largely intact while eliminating the issues that block safe iteration.

## Design Details

### 1. Admin Protection

The admin surface currently behaves like a public API. The smallest safe fix is to centralize two checks inside the controller layer:

- Resolve the current user from the `Authorization` header.
- Reject requests unless `user.role === 'ADMIN'`.

We will also stop returning raw Prisma `User` rows from admin endpoints. Admin views only need safe operational fields such as `id`, `username`, `nickname`, `role`, `avatar`, `level`, `xp`, `coins`, `streak`, `totalCorrect`, and timestamps if needed.

This is enough to close the immediate privilege-escalation hole without forcing a larger guard/decorator refactor.

### 2. Safe Word Session Querying

`WordService.getWordsForSession()` should stop using `$queryRawUnsafe(...)` for category filtering. The replacement should stay within Prisma query builders:

- `findMany({ where: { category }, take: count })` for non-`GENERAL` categories.
- A normal randomized fallback path for general sessions.

If true SQL randomization remains necessary for SQLite, it must use parameterized queries only. The default preference is to remove raw SQL entirely from this path.

### 3. PK Identity Hardening

PK entrypoints should only accept server-verified identities. The current fallback that trusts `id`, `username`, and `avatar` from the socket payload will be removed.

Expected behavior after the change:

- Queue join / private room create / private room join require a valid token.
- Missing or invalid token results in a rejected join attempt instead of creating a spoofable player.
- Persisted match records always map to authenticated users only.

This keeps the existing event model intact while closing the impersonation path.

### 4. Avatar Upload And Profile Save Consistency

The current web flow saves avatar and nickname as two independent backend mutations. We want a reliable outcome with minimal churn, so the backend will harden the upload endpoint and the web flow will stop pretending a partial success is a full success.

Backend changes:

- Restrict avatar uploads by MIME/extension and size.
- Reject missing uploads instead of silently defaulting to `avatar.png`.
- Keep serving uploads from `/uploads`, but only after narrowing what can reach that directory.

Web changes:

- Profile save should surface failure if either avatar upload or nickname update fails.
- UI state should only switch back to settings after the final persisted state is known.
- Tests should cover the half-success case so it does not regress.

If the backend shape can support it cheaply, we prefer a single profile-save request contract over two loosely coupled requests. If that creates excessive churn, the fallback is strict client-side sequencing with explicit failure handling.

### 5. Runtime Alignment And Verification

The local developer experience is currently split across conflicting ports and an unusable e2e setup.

We will align these by:

- Defining one local backend port source for HTTP and socket clients.
- Updating docs and Vite proxy/socket defaults to match that source.
- Giving e2e tests an explicit `DATABASE_URL` bootstrap path so they can run in a clean SQLite test database.

This does not need a full config system; a small, explicit convention is enough as long as all entrypoints agree.

### 6. Repository Hygiene

This pass will not rotate cloud credentials directly, but it will make accidental exposure less likely:

- Ignore local upload directories.
- Ignore service-account JSON credentials and similar secret material.
- Add a note in docs/review output that the Google key must be rotated offline.

## Testing Strategy

> [!note]
> The implementation will follow TDD. Every production change should be preceded by a failing test or an intentionally failing verification case.

Server:

- Add controller/service tests for admin authorization and safe user payloads.
- Add service tests proving category filtering no longer depends on unsafe raw SQL.
- Add PK tests proving unauthenticated payload-only joins are rejected.
- Add auth/profile tests for avatar validation behavior.
- Repair and run the existing e2e path with a dedicated test database.

Web:

- Add or extend tests for profile save failure handling.
- Add socket configuration tests so HTTP/socket local targets cannot drift again.

## Risks And Trade-Offs

- Adding admin authorization inside the controller is not as elegant as a full guard-based architecture, but it is safer for a focused hardening pass.
- Tightening PK auth may reject older local/manual clients that relied on payload-only identity, but that behavior is intentionally unsafe and should be removed.
- Upload validation may block some previously accepted files; this is a desired tightening, not a regression.

## Completion Criteria

- Admin endpoints reject anonymous and non-admin callers.
- Word session loading no longer uses unsafe SQL interpolation.
- PK entrypoints cannot create a player from caller-supplied identity fields alone.
- Avatar upload rejects invalid files and profile save no longer reports success on partial failure.
- Web HTTP/socket local defaults are consistent with backend docs/runtime.
- `server` unit tests, `web` tests, `server` build, `web` build, and `server` e2e all run successfully with fresh evidence.
