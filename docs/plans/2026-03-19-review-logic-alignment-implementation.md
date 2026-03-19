# Review Logic Alignment Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 让小程序与 server 的复习逻辑重新对齐到既定设计，修复复习池生成、待复习计数、30 词 session 与 `mistakeCount` 生命周期的偏差。

**Architecture:** 保持现有 `miniprogram` 云开发和 `server` NestJS 架构不变，不做跨端共享代码重构。通过先锁定规则测试、再补小程序云函数状态模型与新接口、再切客户端消费、最后修正 `server` 的状态生命周期，分层收口复习语义。

**Tech Stack:** uni-app、Vue 3、微信云函数、NestJS、Prisma、Node.js test runner、Jest

---

### Task 1: 锁定复习规则与小程序纯逻辑契约

**Files:**
- Create: `miniprogram/src/utils/review-policy.js`
- Create: `miniprogram/tests/review-policy.test.mjs`
- Modify: `server/src/progress/progress.service.spec.ts`

**Step 1: Write the failing test**
- 在 `miniprogram/tests/review-policy.test.mjs` 写失败用例，覆盖：
  - 固定阶梯 `10min -> 1d -> 3d -> 7d -> 15d -> 30d -> 60d -> 120d`
  - 学习阶段答错会回到 `reviewStage=0` 且 `nextReview=now+10min`
  - 复习阶段答对会推进 stage
  - 复习阶段答错会重置 stage
  - mixed pool 判断只依赖“错题语义或到期语义”
- 在 `server/src/progress/progress.service.spec.ts` 补失败用例，覆盖：
  - 复习正确后不会因为 `mistakeCount` 永久滞留在复习池
  - review pool count 与 review session 选择条件保持一致

**Step 2: Run test to verify it fails**
Run: `node --test miniprogram/tests/review-policy.test.mjs`
Run: `cd server && npm test -- --runInBand src/progress/progress.service.spec.ts`
Expected: FAIL，因为 review policy helper 与新生命周期断言尚未落地。

**Step 3: Write minimal implementation**
- 在 `miniprogram/src/utils/review-policy.js` 实现纯函数：
  - `getFixedReviewSteps()`
  - `advanceReviewState(record, { isCorrect, isReview, now })`
  - `isReviewCandidate(record, now)`
  - `limitReviewSession(records, limit)`
- 保持 helper 不依赖 `wx` 或云 SDK，供云函数和前端逻辑共用语义。

**Step 4: Run verification**
Run: `node --test miniprogram/tests/review-policy.test.mjs`
Expected: PASS

**Step 5: Commit**
```bash
git add miniprogram/src/utils/review-policy.js miniprogram/tests/review-policy.test.mjs server/src/progress/progress.service.spec.ts
git commit -m "test: lock review policy alignment rules"
```

### Task 2: 修复小程序云函数的复习状态模型与新接口

**Files:**
- Modify: `miniprogram/src/static/cloudfunctions/progress/index.js`
- Modify: `miniprogram/src/static/cloudfunctions/progress/package.json`
- Create: `miniprogram/src/static/cloudfunctions/progress/review-policy.js`

**Step 1: Write the failing contract check**
- 在本地记录并验证当前云函数还缺少：
  - `reviewStage / nextReview` 写入
  - review count 接口
  - 30 词 review session 接口
- 用现有测试或最小 smoke 断言明确当前行为与设计不符。

**Step 2: Verify current behavior is broken**
Run: `rg -n "getReviews|mistakeCount|lastReviewedAt|reviewStage|nextReview" miniprogram/src/static/cloudfunctions/progress/index.js`
Expected: 能看到缺失 `reviewStage / nextReview` 的旧逻辑，以及 `getReviews()` 仍按 `lastReviewedAt` 排序的实现。

**Step 3: Write minimal implementation**
- 新增 `miniprogram/src/static/cloudfunctions/progress/review-policy.js`，移植 Task 1 的固定阶梯与候选池语义到云函数 CommonJS 环境。
- 修改 `syncProgress()`：
  - 学习阶段答错时写入 `reviewStage=0` 与 `nextReview`
  - 复习阶段答对时推进 stage 并更新 `nextReview`
  - 复习阶段答错时重置 stage
  - 避免 `mistakeCount` 成为永久滞留开关
- 在云函数中拆分能力：
  - `getReviewCount()`
  - `getReviewSession()`
- `getReviewSession()` 必须：
  - 从 mixed pool 取候选
  - 随机化
  - 最多返回 30 条

**Step 4: Wire cloud entry points**
- 在 `exports.main` 的 `switch` 中新增：
  - `getReviewCount`
  - `getReviewSession`
- 暂时保留 `getReviews` 作为兼容入口，但内部转发到新的 session 语义或明确标记待删除。

**Step 5: Run verification**
Run: `node --check miniprogram/src/static/cloudfunctions/progress/index.js`
Run: `node --check miniprogram/src/static/cloudfunctions/progress/review-policy.js`
Expected: PASS

**Step 6: Commit**
```bash
git add miniprogram/src/static/cloudfunctions/progress/index.js miniprogram/src/static/cloudfunctions/progress/package.json miniprogram/src/static/cloudfunctions/progress/review-policy.js
git commit -m "feat: align miniprogram review cloud logic"
```

### Task 3: 切换小程序 Dashboard 与 Engine 到新复习契约

**Files:**
- Modify: `miniprogram/src/api.js`
- Modify: `miniprogram/src/engine.js`
- Modify: `miniprogram/src/components/Dashboard.vue`
- Modify: `miniprogram/src/components/Dashboard.v2-control-center.vue`

**Step 1: Write the failing client contract test**
- 如果现有纯逻辑测试足够，就补 API contract 断言；否则新增最小断言，覆盖：
  - `getReviewCount()` 返回数字总数
  - `getReviewSession()` 返回数组 session
  - Dashboard 不再把 session 长度当待复习总数
  - `startReview()` 只消费 review session 接口

**Step 2: Verify current client usage is wrong**
Run: `rg -n "getReviews\\(|reviewCount|startReview" miniprogram/src/api.js miniprogram/src/engine.js miniprogram/src/components/Dashboard.vue miniprogram/src/components/Dashboard.v2-control-center.vue`
Expected: 能看到旧链路仍直接复用 `getReviews()`。

**Step 3: Write minimal implementation**
- 在 `miniprogram/src/api.js` 中显式新增：
  - `getReviewCount()`
  - `getReviewSession()`
- 保留旧 `getReviews()` 仅作兼容转发，避免半更新期间前端直接失效。
- 修改 `miniprogram/src/engine.js` 的 `startReview()`，改用 `getReviewSession()`。
- 修改 `miniprogram/src/components/Dashboard.vue` 与 `miniprogram/src/components/Dashboard.v2-control-center.vue`：
  - 加载总待复习数时调用 `getReviewCount()`
  - 只把 count 展示到 Dashboard，不再复用 session 数组长度

**Step 4: Run verification**
Run: `node --check miniprogram/src/api.js`
Run: `node --check miniprogram/src/engine.js`
Expected: PASS

**Step 5: Commit**
```bash
git add miniprogram/src/api.js miniprogram/src/engine.js miniprogram/src/components/Dashboard.vue miniprogram/src/components/Dashboard.v2-control-center.vue
git commit -m "fix: align miniprogram review client flow"
```

### Task 4: 修复 server 的 `mistakeCount` 生命周期

**Files:**
- Modify: `server/src/progress/progress.service.ts`
- Modify: `server/src/progress/progress.service.spec.ts`

**Step 1: Write the failing server test**
- 在 `server/src/progress/progress.service.spec.ts` 新增失败用例，覆盖：
  - 学习阶段答错后进入复习池
  - 复习阶段答对后，`mistakeCount` 不再让记录永久停留在 pool 中
  - `getReviewSessionWords()` 仍随机并截断到 30

**Step 2: Run test to verify it fails**
Run: `cd server && npm test -- --runInBand src/progress/progress.service.spec.ts`
Expected: FAIL，因为当前 `syncProgress()` 仍是“只增不减”的 `mistakeCount` 生命周期。

**Step 3: Write minimal implementation**
- 修改 `server/src/progress/progress.service.ts`：
  - 区分“当前回答是否错误”和“历史错题统计”
  - 至少保证复习正确后不会继续把词永久留在 mixed pool
  - 保持 `/progress/reviews` 与 `/word/review` 的 mixed pool 条件一致
- 若现有 SM-2 兼容字段仍保留，避免在本任务中顺手删掉整条旧逻辑；只收口复习池语义。

**Step 4: Run verification**
Run: `cd server && npm test -- --runInBand src/progress/progress.service.spec.ts`
Expected: PASS

**Step 5: Commit**
```bash
git add server/src/progress/progress.service.ts server/src/progress/progress.service.spec.ts
git commit -m "fix: prevent server review pool from sticking forever"
```

### Final Integration Task

**Files:**
- Modify only if integration issues require it

**Step 1: Reconcile compatibility edges**
- 检查小程序旧 `getReviews()` 是否仍有调用残留。
- 确认 `web` 侧现有 `/progress/reviews` 与 `/word/review` 契约未被破坏。

**Step 2: Run unified verification**
Run: `node --test miniprogram/tests/review-policy.test.mjs`
Run: `node --check miniprogram/src/static/cloudfunctions/progress/index.js`
Run: `node --check miniprogram/src/api.js miniprogram/src/engine.js`
Run: `cd server && npm test -- --runInBand src/progress/progress.service.spec.ts`
Expected: PASS

**Step 3: Manual smoke checklist**
- 小程序学习阶段答错后，10 分钟后计入待复习。
- Dashboard 待复习总数可大于 30。
- 点击开始复习时，session 最多 30 个词，且顺序随机。
- 复习若干次正确后，词条能够退出当前待复习池。
- `web` 侧已有复习入口不回归。

**Step 4: Final commit if needed**
```bash
git add -A
git commit -m "chore: integrate review logic alignment" || true
```
