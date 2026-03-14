# Web Full Online Version Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a fully online web version of Vocab Master with account-password auth, learning flows, progress sync, leaderboard, achievements, and PK on the existing NestJS server.

**Architecture:** Keep `server` as the single online backend and use `client` as the web frontend. Migrate identity from WeChat `openid` to server-side `userId`, then port the validated mini program gameplay into Vue web pages that call NestJS APIs and websocket endpoints.

**Tech Stack:** NestJS, Prisma, Vue 3, Vite, socket.io, existing project database models

---

### Task 1: Audit Existing Server Auth and User Model

**Files:**
- Modify: `/Users/samuelying/程序/02-项目/vocab-master-2.0/server/src/auth/*`
- Modify: `/Users/samuelying/程序/02-项目/vocab-master-2.0/server/prisma/schema.prisma`
- Test: `/Users/samuelying/程序/02-项目/vocab-master-2.0/server/test/*`

**Step 1: Write the failing auth contract test**

Define tests for:
- register with username/password
- login with username/password
- fetch current user by token

**Step 2: Run test to verify it fails**

Run: `npm test -- auth`
Expected: missing or incompatible account-password behavior

**Step 3: Implement minimal auth model**

Add:
- username uniqueness
- password hashing
- token/session issuance
- current user endpoint

**Step 4: Run test to verify it passes**

Run: `npm test -- auth`
Expected: PASS

**Step 5: Commit**

Do not commit yet unless explicitly approved by user.

### Task 2: Migrate Progress and User Identity to userId

**Files:**
- Modify: `/Users/samuelying/程序/02-项目/vocab-master-2.0/server/src/progress/*`
- Modify: `/Users/samuelying/程序/02-项目/vocab-master-2.0/server/src/social/*`
- Modify: `/Users/samuelying/程序/02-项目/vocab-master-2.0/server/src/pk/*`
- Modify: `/Users/samuelying/程序/02-项目/vocab-master-2.0/server/prisma/schema.prisma`

**Step 1: Write failing tests for userId-based progress reads/writes**

Cover:
- sync progress
- get stats
- get reviews
- get mistakes
- get learned words

**Step 2: Run test to verify it fails**

Run: `npm test -- progress`
Expected: old identity assumptions fail

**Step 3: Implement minimal migration**

Replace `openid`-based joins and filters with `userId`-based logic.

**Step 4: Run test to verify it passes**

Run: `npm test -- progress`
Expected: PASS

**Step 5: Commit**

Do not commit yet unless explicitly approved by user.

### Task 3: Expose Stable Web API Surface

**Files:**
- Modify: `/Users/samuelying/程序/02-项目/vocab-master-2.0/server/src/auth/*`
- Modify: `/Users/samuelying/程序/02-项目/vocab-master-2.0/server/src/word/*`
- Modify: `/Users/samuelying/程序/02-项目/vocab-master-2.0/server/src/progress/*`
- Modify: `/Users/samuelying/程序/02-项目/vocab-master-2.0/server/src/social/*`

**Step 1: Write failing integration tests for required routes**

Cover:
- `/auth/register`
- `/auth/login`
- `/auth/me`
- `/words/session`
- `/progress/stats`
- `/progress/reviews`
- `/leaderboard`

**Step 2: Run test to verify it fails**

Run: `npm test -- e2e`
Expected: route mismatch or missing auth flow

**Step 3: Implement minimal web API normalization**

Ensure response shape is consistent and frontend-friendly.

**Step 4: Run test to verify it passes**

Run: `npm test -- e2e`
Expected: PASS

**Step 5: Commit**

Do not commit yet unless explicitly approved by user.

### Task 4: Build Web Auth Pages and Session Store

**Files:**
- Modify: `/Users/samuelying/程序/02-项目/vocab-master-2.0/client/src/*`
- Create: `/Users/samuelying/程序/02-项目/vocab-master-2.0/client/src/pages/Login*.vue`
- Create: `/Users/samuelying/程序/02-项目/vocab-master-2.0/client/src/stores/*`

**Step 1: Write failing frontend auth smoke test**

Cover:
- register
- login
- session persistence
- logout

**Step 2: Run test to verify it fails**

Run: `npm -C client run test`
Expected: auth UI/store missing

**Step 3: Implement minimal auth UI**

Add:
- login page
- register page
- auth store
- token persistence

**Step 4: Run test to verify it passes**

Run: `npm -C client run test`
Expected: PASS

**Step 5: Commit**

Do not commit yet unless explicitly approved by user.

### Task 5: Port Dashboard and Core Learn Flow

**Files:**
- Modify: `/Users/samuelying/程序/02-项目/vocab-master-2.0/client/src/*`
- Reference: `/Users/samuelying/程序/02-项目/vocab-master-2.0/client-uni/src/components/Dashboard.vue`
- Reference: `/Users/samuelying/程序/02-项目/vocab-master-2.0/client-uni/src/components/GameArena.vue`
- Reference: `/Users/samuelying/程序/02-项目/vocab-master-2.0/client-uni/src/engine.js`

**Step 1: Write failing learning flow test**

Cover:
- start 30-word session
- answer a question
- sync rewards
- finish session

**Step 2: Run test to verify it fails**

Run: `npm -C client run test`
Expected: learning pages absent

**Step 3: Implement minimal dashboard and learn arena**

Port validated game flow, but replace `uni` APIs with browser APIs.

**Step 4: Run test to verify it passes**

Run: `npm -C client run test`
Expected: PASS

**Step 5: Commit**

Do not commit yet unless explicitly approved by user.

### Task 6: Port Review, Mistakes, Vocabulary, Achievements, Leaderboard

**Files:**
- Modify: `/Users/samuelying/程序/02-项目/vocab-master-2.0/client/src/*`
- Reference: `/Users/samuelying/程序/02-项目/vocab-master-2.0/client-uni/src/components/VocabularyList.vue`
- Reference: `/Users/samuelying/程序/02-项目/vocab-master-2.0/client-uni/src/components/AchievementWall.vue`

**Step 1: Write failing view tests**

Cover:
- review queue renders
- mistake queue renders
- vocabulary list loads
- achievements render
- leaderboard renders

**Step 2: Run test to verify it fails**

Run: `npm -C client run test`
Expected: missing pages/data hooks

**Step 3: Implement minimal read-only and sync pages**

**Step 4: Run test to verify it passes**

Run: `npm -C client run test`
Expected: PASS

**Step 5: Commit**

Do not commit yet unless explicitly approved by user.

### Task 7: Port PK and Online Matchmaking

**Files:**
- Modify: `/Users/samuelying/程序/02-项目/vocab-master-2.0/client/src/*`
- Modify: `/Users/samuelying/程序/02-项目/vocab-master-2.0/server/src/pk/*`
- Reference: `/Users/samuelying/程序/02-项目/vocab-master-2.0/client-uni/src/components/PKArena.vue`

**Step 1: Write failing websocket and PK tests**

Cover:
- join queue
- match found
- score sync
- game over
- disconnect handling

**Step 2: Run test to verify it fails**

Run: `npm test -- pk`
Expected: web client integration missing

**Step 3: Implement minimal PK client and gateway adjustments**

**Step 4: Run test to verify it passes**

Run: `npm test -- pk`
Expected: PASS

**Step 5: Commit**

Do not commit yet unless explicitly approved by user.

### Task 8: Deployment, Static Hosting, and Acceptance

**Files:**
- Modify: `/Users/samuelying/程序/02-项目/vocab-master-2.0/server/src/app.module.ts`
- Modify: `/Users/samuelying/程序/02-项目/vocab-master-2.0/README.md`
- Create: `/Users/samuelying/程序/02-项目/vocab-master-2.0/docs/plans/2026-03-13-web-deploy-checklist.md`

**Step 1: Write failing deployment checklist**

Document:
- build client
- build server
- environment variables
- database migration
- reverse proxy
- websocket forwarding

**Step 2: Run local production build**

Run:
- `npm -C client run build`
- `npm -C server run build`

Expected: build succeeds

**Step 3: Verify integrated startup**

Run server locally against built client and validate:
- login
- learn
- review
- leaderboard
- PK

**Step 4: Record final acceptance checklist**

**Step 5: Commit**

Do not commit yet unless explicitly approved by user.
