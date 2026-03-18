# Server And Web Security Hardening Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Close the accepted high-risk issues in `server + web + deployment/repo hygiene` without expanding into miniprogram work.

**Architecture:** Keep the current NestJS + Vue structure, but harden the most dangerous paths in place: protect admin routes, remove unsafe SQL interpolation, require authenticated PK identities, make profile updates safer, and align local runtime/e2e assumptions. Prefer localized controller/service changes and narrowly scoped tests over a broad auth-framework rewrite.

**Tech Stack:** NestJS, Prisma, SQLite, Jest, Vue 3, Vitest, Vite, multipart upload, Socket.IO

---

> [!note]
> This plan intentionally excludes `miniprogram`. Any references to miniprogram remain out of scope for this implementation pass.

### Task 1: Protect admin routes and sanitize admin user payloads

**Files:**
- Create: `server/src/admin/admin.controller.spec.ts`
- Modify: `server/src/admin/admin.controller.ts`
- Modify: `server/src/admin/admin.service.ts`
- Modify: `server/src/auth/auth.service.ts`
- Test: `server/src/admin/admin.controller.spec.ts`

**Step 1: Write the failing test**

```ts
it('rejects non-admin callers for admin endpoints', async () => {
  authService.requireUserFromAuthorization.mockResolvedValue({ id: 'user-1', role: 'USER' });
  await expect(controller.getUsers('Bearer token')).rejects.toThrow('Admin access required');
});

it('returns sanitized user rows for admin user listing', async () => {
  authService.requireUserFromAuthorization.mockResolvedValue({ id: 'admin-1', role: 'ADMIN' });
  adminService.getUsers.mockResolvedValue([
    { id: 'user-1', username: 'alice', passwordHash: 'x', sessionToken: 'y', role: 'USER' },
  ]);

  await expect(controller.getUsers('Bearer admin')).resolves.toEqual([
    expect.objectContaining({ id: 'user-1', username: 'alice', role: 'USER' }),
  ]);
});
```

**Step 2: Run test to verify it fails**

Run: `cd server && npm test -- admin.controller.spec.ts`

Expected: FAIL because the spec file does not exist yet and the controller currently has no admin authorization behavior.

**Step 3: Write minimal implementation**

```ts
async requireAdminFromAuthorization(authorization?: string) {
  const user = await this.requireUserFromAuthorization(authorization);
  if (user.role !== 'ADMIN') throw new ForbiddenException('Admin access required');
  return user;
}

@Get('users')
async getUsers(@Headers('authorization') authorization: string) {
  await this.authService.requireAdminFromAuthorization(authorization);
  return this.adminService.getUsers();
}
```

```ts
async getUsers() {
  return this.prisma.user.findMany({
    orderBy: { xp: 'desc' },
    select: {
      id: true,
      username: true,
      nickname: true,
      role: true,
      avatar: true,
      level: true,
      xp: true,
      coins: true,
      streak: true,
      totalCorrect: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}
```

**Step 4: Run test to verify it passes**

Run: `cd server && npm test -- admin.controller.spec.ts`

Expected: PASS with the new controller spec green.

**Step 5: Commit**

```bash
git add server/src/admin/admin.controller.spec.ts server/src/admin/admin.controller.ts server/src/admin/admin.service.ts server/src/auth/auth.service.ts
git commit -m "fix: protect admin routes and sanitize admin users"
```

### Task 2: Remove unsafe SQL interpolation from word session loading

**Files:**
- Modify: `server/src/word/word.service.ts`
- Modify: `server/src/word/word.service.spec.ts`
- Test: `server/src/word/word.service.spec.ts`

**Step 1: Write the failing test**

```ts
it('loads category sessions without using unsafe raw sql', async () => {
  prisma.word.findMany.mockResolvedValue([{ id: 'w1', text: 'alpha', category: 'TOEFL' }]);

  await service.getWordsForSession(10, 'TOEFL');

  expect(prisma.$queryRawUnsafe).not.toHaveBeenCalled();
  expect(prisma.word.findMany).toHaveBeenCalledWith(
    expect.objectContaining({
      where: { category: 'TOEFL' },
      take: 10,
    }),
  );
});
```

**Step 2: Run test to verify it fails**

Run: `cd server && npm test -- word.service.spec.ts`

Expected: FAIL because the current spec only checks `service` existence and the implementation still uses `$queryRawUnsafe(...)`.

**Step 3: Write minimal implementation**

```ts
async getWordsForSession(count = 10, category?: string): Promise<Word[]> {
  if (category && category !== 'GENERAL') {
    const scoped = await this.prisma.word.findMany({
      where: { category },
      take: count,
    });
    if (scoped.length > 0) return this.shuffle(scoped).slice(0, count);
  }

  const words = await this.prisma.word.findMany({ take: Math.max(count, 50) });
  return this.shuffle(words).slice(0, count);
}
```

**Step 4: Run test to verify it passes**

Run: `cd server && npm test -- word.service.spec.ts`

Expected: PASS, and the test proves category loading no longer relies on unsafe SQL interpolation.

**Step 5: Commit**

```bash
git add server/src/word/word.service.ts server/src/word/word.service.spec.ts
git commit -m "fix: remove unsafe word session sql"
```

### Task 3: Require authenticated identities for PK matchmaking

**Files:**
- Modify: `server/src/pk/pk.service.ts`
- Modify: `server/src/pk/pk.service.spec.ts`
- Modify: `server/src/pk/pk.gateway.spec.ts`
- Test: `server/src/pk/pk.service.spec.ts`
- Test: `server/src/pk/pk.gateway.spec.ts`

**Step 1: Write the failing test**

```ts
it('rejects payload-only queue joins without a token', async () => {
  const client = { id: 'socket-1', emit: jest.fn(), handshake: { auth: {}, headers: {} } };

  await service.joinQueue(client as any, { id: 'spoof', username: 'fake' } as any);

  expect(client.emit).toHaveBeenCalledWith('error', expect.objectContaining({ message: expect.stringMatching(/unauthorized/i) }));
});
```

**Step 2: Run test to verify it fails**

Run: `cd server && npm test -- pk.service.spec.ts pk.gateway.spec.ts`

Expected: FAIL because the current service still trusts payload-supplied `id` and `username` when no token exists.

**Step 3: Write minimal implementation**

```ts
private async resolvePlayerIdentity(client: Socket, user: { token?: string }) {
  const authToken = String(user?.token || client.handshake?.auth?.token || '').trim();
  const authHeader = String(client.handshake?.headers?.authorization || '').trim();

  if (!authToken && !authHeader) {
    return null;
  }

  const authorization = authHeader || `Bearer ${authToken}`;
  const currentUser = await this.authService.requireUserFromAuthorization(authorization);
  return { id: currentUser.id, username: currentUser.username, avatar: currentUser.avatar };
}
```

```ts
if (!resolvedUser) {
  client.emit('error', { message: 'Unauthorized player' });
  return;
}
```

**Step 4: Run test to verify it passes**

Run: `cd server && npm test -- pk.service.spec.ts pk.gateway.spec.ts`

Expected: PASS, with token-based flows still green and payload-only identity rejected.

**Step 5: Commit**

```bash
git add server/src/pk/pk.service.ts server/src/pk/pk.service.spec.ts server/src/pk/pk.gateway.spec.ts
git commit -m "fix: require auth for pk matchmaking"
```

### Task 4: Harden avatar upload and make web profile save coherent

**Files:**
- Create: `server/src/auth/auth.controller.spec.ts`
- Modify: `server/src/auth/auth.controller.ts`
- Modify: `server/src/auth/auth.service.ts`
- Modify: `server/src/auth/avatar-upload.ts`
- Modify: `server/src/auth/dto/auth.dto.ts`
- Modify: `web/src/api.js`
- Modify: `web/src/components/ProfileSetup.vue`
- Modify: `web/src/components/ProfileSetup.spec.js`
- Test: `server/src/auth/auth.controller.spec.ts`
- Test: `web/src/components/ProfileSetup.spec.js`
- Test: `web/src/api.spec.js`

**Step 1: Write the failing test**

```ts
it('rejects avatar uploads when no file is present', async () => {
  await expect(controller.uploadAvatar('Bearer token', undefined as any)).rejects.toThrow('Avatar file is required');
});
```

```js
it('stays on profile setup when avatar upload succeeds but profile save fails', async () => {
  mockUploadAvatar.mockResolvedValue({ success: true, user: { avatar: '/uploads/avatars/new.png' } });
  mockUpdateProfile.mockResolvedValue({ success: false, error: 'Nickname must be 1-24 characters' });

  await wrapper.get('.save-btn').trigger('click');

  expect(mockSetView).not.toHaveBeenCalledWith('settings');
});
```

**Step 2: Run test to verify it fails**

Run: `cd server && npm test -- auth.controller.spec.ts`

Run: `cd web && npm test -- components/ProfileSetup.spec.js api.spec.js`

Expected: FAIL because the controller silently falls back to `avatar.png`, and the web flow currently treats a partial success as if the save path succeeded.

**Step 3: Write minimal implementation**

```ts
export function createAvatarUploadOptions() {
  return {
    storage: createAvatarStorage(),
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      const allowed = ['image/png', 'image/jpeg', 'image/webp'];
      cb(null, allowed.includes(file.mimetype));
    },
  };
}
```

```ts
if (!file?.filename) {
  throw new BadRequestException('Avatar file is required');
}
```

```js
if (uploadRes && !uploadRes.success) {
  errorMessage.value = uploadRes.error || uploadRes.message || '头像上传失败';
  return;
}

if (!profileRes?.success) {
  errorMessage.value = profileRes?.error || profileRes?.message || '资料保存失败';
  return;
}
```

**Step 4: Run test to verify it passes**

Run: `cd server && npm test -- auth.controller.spec.ts`

Run: `cd web && npm test -- components/ProfileSetup.spec.js api.spec.js`

Expected: PASS, with invalid uploads rejected and the profile screen no longer leaving on a partial failure.

**Step 5: Commit**

```bash
git add server/src/auth/auth.controller.spec.ts server/src/auth/auth.controller.ts server/src/auth/auth.service.ts server/src/auth/avatar-upload.ts server/src/auth/dto/auth.dto.ts web/src/api.js web/src/components/ProfileSetup.vue web/src/components/ProfileSetup.spec.js
git commit -m "fix: harden avatar uploads and profile save flow"
```

### Task 5: Align local runtime defaults, repair e2e bootstrap, and harden repo hygiene

**Files:**
- Create: `server/test/setup-e2e.ts`
- Modify: `server/test/jest-e2e.json`
- Modify: `server/test/app.e2e-spec.ts`
- Modify: `server/src/prisma/prisma.service.ts`
- Modify: `web/src/socket.js`
- Modify: `web/src/socket.spec.js`
- Modify: `web/vite.config.js`
- Modify: `README.md`
- Modify: `.gitignore`
- Test: `server/test/app.e2e-spec.ts`
- Test: `web/src/socket.spec.js`

**Step 1: Write the failing test**

```js
it('uses the same local backend base for pk sockets as the http proxy', async () => {
  const { SocketManager } = await import('./socket.js');
  SocketManager.connect();
  expect(ioMock).toHaveBeenCalledWith('http://localhost:3002/pk', expect.any(Object));
});
```

Additionally, keep the current e2e failure as the red state:

Run: `cd server && npm run test:e2e`

Expected: FAIL with `Environment variable not found: DATABASE_URL`.

**Step 2: Run test to verify it fails**

Run: `cd web && npm test -- socket.spec.js`

Run: `cd server && npm run test:e2e`

Expected: FAIL because socket defaults still point to `3000` while Vite proxies `3002`, and e2e has no test database bootstrap.

**Step 3: Write minimal implementation**

```ts
// server/test/setup-e2e.ts
process.env.DATABASE_URL ||= `file:${join(__dirname, 'e2e.db')}`;
```

```json
{
  "setupFiles": ["<rootDir>/setup-e2e.ts"]
}
```

```js
const localBackend = import.meta.env.VITE_LOCAL_BACKEND_URL || 'http://localhost:3002';
const url = import.meta.env.VITE_SOCKET_URL || (window.location.hostname === 'localhost' && window.location.port === '5173'
  ? `${localBackend}/pk`
  : '/pk');
```

```gitignore
server/uploads/
tts/*.json
```

**Step 4: Run test to verify it passes**

Run: `cd web && npm test -- socket.spec.js`

Run: `cd server && npm run test:e2e`

Expected: PASS, with socket defaults aligned and e2e able to boot Prisma against a dedicated SQLite test database.

**Step 5: Commit**

```bash
git add server/test/setup-e2e.ts server/test/jest-e2e.json server/test/app.e2e-spec.ts server/src/prisma/prisma.service.ts web/src/socket.js web/src/socket.spec.js web/vite.config.js README.md .gitignore
git commit -m "fix: align local runtime and restore e2e verification"
```

### Task 6: Run full verification for the accepted scope

**Files:**
- Modify: `docs/notes/2026-03-18_PROJECT_FULL_REVIEW_CN.md`
- Test: `server`
- Test: `web`

**Step 1: Write the verification checklist before changing docs**

```md
- [ ] server unit tests
- [ ] server e2e
- [ ] server build
- [ ] web tests
- [ ] web build
- [ ] review note updated with actual verification evidence
```

**Step 2: Run verification to capture the real state**

Run: `cd server && npm test`

Run: `cd server && npm run test:e2e`

Run: `cd server && npm run build`

Run: `cd web && npm test`

Run: `cd web && npm run build`

Expected: PASS on all commands with fresh output and zero failing suites.

**Step 3: Write minimal documentation updates**

```md
## Verification Evidence

- `cd server && npm test` -> pass
- `cd server && npm run test:e2e` -> pass
- `cd server && npm run build` -> pass
- `cd web && npm test` -> pass
- `cd web && npm run build` -> pass
```

**Step 4: Re-run the full verification after the docs change**

Run: `cd server && npm test && npm run test:e2e && npm run build`

Run: `cd web && npm test && npm run build`

Expected: PASS again after the final tree state.

**Step 5: Commit**

```bash
git add docs/notes/2026-03-18_PROJECT_FULL_REVIEW_CN.md
git commit -m "docs: record security hardening verification"
```
