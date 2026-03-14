# Web Achievement Icons Align Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Align Web achievement visuals with the mini-program by reusing the same SVG icon set.

**Architecture:** Copy the mini-program achievement SVG assets into the Web public directory, add a shared icon helper on the Web side, and replace emoji-based achievement rendering in the key mobile UI surfaces. Keep business logic unchanged.

**Tech Stack:** Vue 3, Vite, Vitest

---

### Task 1: Add failing tests for Web achievement SVG rendering

**Files:**
- Create: `client/src/utils/achievement-icons.spec.js`
- Create: `client/src/components/AchievementWall.spec.js`
- Create: `client/src/components/AchievementUnlockModal.spec.js`
- Modify: `client/src/components/Dashboard.spec.js`

### Task 2: Add Web achievement icon helper and static assets

**Files:**
- Create: `client/src/utils/achievement-icons.js`
- Copy: `client-uni/src/static/achievements/*` -> `client/public/static/achievements/*`

### Task 3: Switch key Web surfaces from emoji to SVG

**Files:**
- Modify: `client/src/components/AchievementWall.vue`
- Modify: `client/src/components/Dashboard.vue`
- Modify: `client/src/components/AchievementUnlockModal.vue`

### Task 4: Verify

**Files:**
- Verify: `client/src/utils/achievement-icons.spec.js`
- Verify: `client/src/components/AchievementWall.spec.js`
- Verify: `client/src/components/AchievementUnlockModal.spec.js`
- Verify: `client/src/components/Dashboard.spec.js`

**Run**

```bash
cd /Users/samuelying/程序/02-项目/vocab-master-2.0/client
npm test -- src/utils/achievement-icons.spec.js src/components/AchievementWall.spec.js src/components/AchievementUnlockModal.spec.js src/components/Dashboard.spec.js
npm run build
```
