# Hidden Achievements Display Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Hide `spec_night` and `spec_morning` achievements until unlocked, while keeping all other locked achievements visible in grey.

**Architecture:** Add a front-end filter in `AchievementWall.vue` to exclude the two hidden achievement IDs when locked. Use the filtered list for category rendering and counts.

**Tech Stack:** Uni-app (Vue 3), JavaScript.

---

### Task 1: Add hidden achievements filter

**Files:**
- Modify: `/Users/samuelying/程序/02-项目/vocab-master-2.0/client-uni/src/components/AchievementWall.vue`

**Step 1: Write the failing test**

No test runner configured; skip automated test creation.

**Step 2: Run test to verify it fails**

Skip.

**Step 3: Write minimal implementation**

- Add a constant set: `HIDDEN_ACHIEVEMENTS = new Set(['spec_night', 'spec_morning'])`.
- Add `visibleAchievements` computed:
  - Base list = `GameState.system.achievements`.
  - Filter out hidden achievements when `!isUnlocked(id)`.
- Replace all `achievements` usages in template with `visibleAchievements` for category sections and counts.

**Step 4: Run test to verify it passes**

Skip.

**Step 5: Commit**

```bash
git add client-uni/src/components/AchievementWall.vue
git commit -m "feat: hide special achievements until unlocked"
```

### Task 2: Build and verify

**Files:**
- Modify: none

**Step 1: Build mp-weixin**

Run:
```bash
cd /Users/samuelying/程序/02-项目/vocab-master-2.0/client-uni
env PATH=/usr/local/bin:$PATH npm run -s build:mp-weixin
```
Expected: Build complete.

**Step 2: Manual verification**

- Locked `spec_night/spec_morning` not shown.
- Unlocked ones appear under SPECIAL.
- Other locked achievements still grey.

**Step 3: Commit**

No commit for build output.

---
