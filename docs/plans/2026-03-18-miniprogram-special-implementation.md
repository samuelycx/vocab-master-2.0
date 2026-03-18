# Miniprogram Special Phase 1 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在不直接复制 `web/server` 实现的前提下，对齐小程序云开发契约，并收口登录、资料保存、排行榜三条核心用户链路。

**Architecture:** 保持小程序现有的云函数 + 云存储 + 云数据库架构不变，在前端和云函数两侧分别引入小而稳定的 canonical user snapshot 与 leaderboard normalization。资料保存仍然遵循“先上传、再持久化”的物理过程，但把上传、失败清理、旧头像清理和最终快照返回收口到一个一致流程里，避免 UI 提交部分成功状态。

**Tech Stack:** uni-app、Vue 3、微信云开发、Cloud Functions、Cloud Database、Node.js 内置 test runner

---

### Task 1: 用户快照契约统一

**Files:**
- Create: `miniprogram/src/utils/user-snapshot.js`
- Create: `miniprogram/src/static/cloudfunctions/auth/user-snapshot.js`
- Create: `miniprogram/tests/user-snapshot.test.mjs`
- Modify: `miniprogram/src/api.js`
- Modify: `miniprogram/src/state.js`
- Modify: `miniprogram/src/pages/index/index.vue`
- Modify: `miniprogram/src/static/cloudfunctions/auth/index.js`

**Ownership:**
- This worker owns only the files above.
- Do not modify profile-save flow, leaderboard files, or PK/watch logic yet.
- You are not alone in the codebase; do not revert others' edits.

**Step 1: Write the failing contract test**
- 新增 `miniprogram/tests/user-snapshot.test.mjs`，覆盖：
  - 占位用户会被规范化为 `isProfileSet: false`
  - 缺失的数值字段会被补成 `0` 或安全默认值
  - 返回快照始终包含 `id`、`openid`、`username`、`avatar`、`role`、`level`、`xp`、`coins`、`streak`、`totalCorrect`、`isProfileSet`
  - 前端 normalizer 与云函数 normalizer 对同一 fixture 产出同语义结构

**Step 2: Run test to verify it fails**
Run: `node --test miniprogram/tests/user-snapshot.test.mjs`
Expected: FAIL，因为用户快照 helper 还不存在。

**Step 3: Write minimal implementation**
- 在 `miniprogram/src/utils/user-snapshot.js` 中实现 `normalizeUserSnapshot(raw)`
- 在 `miniprogram/src/static/cloudfunctions/auth/user-snapshot.js` 中实现等价的 `buildUserSnapshot(raw)`
- helper 必须保持纯数据逻辑，不把云 SDK 调用塞进去

**Step 4: Wire the contract into runtime code**
- 更新 `miniprogram/src/static/cloudfunctions/auth/index.js`，让 `login()` 和 `updateProfile()` 都返回 canonical snapshot
- 更新 `miniprogram/src/api.js`，让 auth 响应在离开 API 层前统一规范化
- 更新 `miniprogram/src/pages/index/index.vue` 与 `miniprogram/src/state.js`，让前端直接存储返回快照，而不是本地重新拼用户字段

**Step 5: Run verification**
Run: `node --test miniprogram/tests/user-snapshot.test.mjs`
Run: `node --check miniprogram/src/static/cloudfunctions/auth/index.js`
Expected: PASS

**Step 6: Commit**
```bash
git add miniprogram/src/utils/user-snapshot.js miniprogram/src/static/cloudfunctions/auth/user-snapshot.js miniprogram/tests/user-snapshot.test.mjs miniprogram/src/api.js miniprogram/src/state.js miniprogram/src/pages/index/index.vue miniprogram/src/static/cloudfunctions/auth/index.js
git commit -m "feat: unify miniprogram user snapshot contract"
```

### Task 2: 资料保存一致性与头像生命周期收口

**Files:**
- Create: `miniprogram/src/utils/profile-save.js`
- Create: `miniprogram/src/static/cloudfunctions/auth/profile-update.js`
- Create: `miniprogram/tests/profile-save.test.mjs`
- Modify: `miniprogram/src/api.js`
- Modify: `miniprogram/src/components/ProfileSetup.vue`
- Modify: `miniprogram/src/components/Settings.vue`
- Modify: `miniprogram/src/static/cloudfunctions/auth/index.js`

**Ownership:**
- This worker owns only the files above.
- Do not modify leaderboard logic or PK/watch files.
- You are not alone in the codebase; do not revert others' edits.

**Step 1: Write the failing flow test**
- 新增 `miniprogram/tests/profile-save.test.mjs`，覆盖：
  - 本地临时头像路径必须先上传再持久化
  - 已存在的 `cloud://` 头像不应被重复上传
  - 空昵称或非法昵称会在云写入前被拒绝
  - 更新失败时会产出“删除新上传头像”的清理计划
  - 替换成功时会标记旧的受管头像可删除

**Step 2: Run test to verify it fails**
Run: `node --test miniprogram/tests/profile-save.test.mjs`
Expected: FAIL，因为资料保存 helper 还不存在。

**Step 3: Write minimal implementation**
- 在 `miniprogram/src/utils/profile-save.js` 中实现前端 helper：
  - 识别本地临时头像路径
  - 规范化资料保存输入
  - 判断是否需要上传
- 在 `miniprogram/src/static/cloudfunctions/auth/profile-update.js` 中实现云函数 helper：
  - 校验昵称与头像引用
  - 决定数据库失败时是否删除新上传头像
  - 决定成功替换后是否删除旧受管头像

**Step 4: Integrate the unified save flow**
- 更新 `miniprogram/src/api.js`，让 `API.updateProfile(...)` 成为唯一编排入口：
  - 只在必要时上传本地头像
  - 把 `username`、`avatar`、`previousAvatar` 传给云函数
  - 返回云函数给出的 canonical snapshot
- 更新 `miniprogram/src/components/ProfileSetup.vue` 与 `miniprogram/src/components/Settings.vue`：
  - 停止用手工拼接的局部对象调用 `Actions.setUser(...)`
  - 只以返回快照作为成功后的状态来源
  - 失败时提示错误，但不提交部分成功的本地状态
- 更新 `miniprogram/src/static/cloudfunctions/auth/index.js`，让 `updateProfile()`：
  - 数据库写入失败时清理新上传头像
  - 成功替换后再删除旧受管头像
  - 返回最终 canonical snapshot

**Step 5: Run verification**
Run: `node --test miniprogram/tests/profile-save.test.mjs`
Run: `node --check miniprogram/src/static/cloudfunctions/auth/index.js`
Expected: PASS

**Step 6: Commit**
```bash
git add miniprogram/src/utils/profile-save.js miniprogram/src/static/cloudfunctions/auth/profile-update.js miniprogram/tests/profile-save.test.mjs miniprogram/src/api.js miniprogram/src/components/ProfileSetup.vue miniprogram/src/components/Settings.vue miniprogram/src/static/cloudfunctions/auth/index.js
git commit -m "fix: harden miniprogram profile save flow"
```

### Task 3: 排行榜字段与头像语义对齐

**Files:**
- Create: `miniprogram/src/utils/leaderboard.js`
- Create: `miniprogram/src/static/cloudfunctions/progress/leaderboard-view.js`
- Create: `miniprogram/tests/leaderboard-contract.test.mjs`
- Modify: `miniprogram/src/api.js`
- Modify: `miniprogram/src/components/Leaderboard.vue`
- Modify: `miniprogram/src/static/cloudfunctions/progress/index.js`

**Ownership:**
- This worker owns only the files above.
- Do not modify auth/profile flow or PK/watch files.
- You are not alone in the codebase; do not revert others' edits.

**Step 1: Write the failing leaderboard test**
- 新增 `miniprogram/tests/leaderboard-contract.test.mjs`，覆盖：
  - 排行榜行数据始终包含 `id`、`displayName`、`avatar`、`level`、`xp`、`totalCorrect`、`rank`、`isProfileSet`
  - 空头像会回退到默认头像语义
  - `cloud://` 头像会被视为有效展示数据
  - 空用户名会回退到安全展示名

**Step 2: Run test to verify it fails**
Run: `node --test miniprogram/tests/leaderboard-contract.test.mjs`
Expected: FAIL，因为排行榜 normalizer 还不存在。

**Step 3: Write minimal implementation**
- 在 `miniprogram/src/utils/leaderboard.js` 中实现前端 `normalizeLeaderboardEntry(row)`
- 在 `miniprogram/src/static/cloudfunctions/progress/leaderboard-view.js` 中实现云函数侧 `toLeaderboardEntry(user, rank)`
- 更新 `progress.getLeaderboard()`，返回完整展示结构，包括 `totalCorrect` 与稳定的展示名字段

**Step 4: Integrate into runtime code**
- 更新 `miniprogram/src/api.js`，让排行榜响应在 API 层只规范化一次
- 更新 `miniprogram/src/components/Leaderboard.vue`，让组件退回到“纯展示层”，不再在模板里临时补字段
- 本任务保持按 `xp` 排序，不顺手改积分算法

**Step 5: Run verification**
Run: `node --test miniprogram/tests/leaderboard-contract.test.mjs`
Run: `node --check miniprogram/src/static/cloudfunctions/progress/index.js`
Expected: PASS

**Step 6: Commit**
```bash
git add miniprogram/src/utils/leaderboard.js miniprogram/src/static/cloudfunctions/progress/leaderboard-view.js miniprogram/tests/leaderboard-contract.test.mjs miniprogram/src/api.js miniprogram/src/components/Leaderboard.vue miniprogram/src/static/cloudfunctions/progress/index.js
git commit -m "fix: align miniprogram leaderboard contract"
```

### Task 4: 清理旧服务端假设并补交付文档

**Files:**
- Modify: `miniprogram/package.json`
- Modify: `miniprogram/src/api.js`
- Modify: `miniprogram/src/pages/index/index.vue`
- Modify: `miniprogram/src/socket.js`
- Create: `docs/release/2026-03-18-miniprogram-phase1-release-notes-cn.md`
- Create: `docs/release/MINIPROGRAM_PHASE1_CLOUD_CHECKLIST.md`

**Ownership:**
- This worker owns only the files above.
- Do not reopen auth/profile or leaderboard internals unless integration requires it.
- You are not alone in the codebase; do not revert others' edits.

**Step 1: Write the failing cleanup check**
- 记录本任务要移除的旧假设，并用轻量校验追踪它们：
  - `miniprogram/src/api.js` 中残留的 REST 风格注释
  - `miniprogram/src/socket.js` 已不匹配的 websocket 客户端依赖
  - 页面级登录链路仍然手工 patch 用户状态，而不是信任 canonical snapshot

**Step 2: Verify current stale assumptions exist**
Run: `rg -n "REST-based api\.js|socket\.io-client|weapp\.socket\.io|Actions\.setUser\(\{.*isProfileSet" miniprogram/src miniprogram/package.json`
Expected: 能找到仍待清理的旧假设或过期依赖。

**Step 3: Write minimal implementation**
- 如果 `miniprogram/package.json` 中 websocket 客户端依赖已无引用，则移除它们
- 清理 `miniprogram/src/api.js` 中的旧注释和旧参数语义
- 保持 `miniprogram/src/socket.js` 继续走云数据库 `watch`，并明确注明 PK 鉴权重构不在一期范围内
- 更新 `miniprogram/src/pages/index/index.vue`，让登录链路只消费 canonical snapshot
- 新增：
  - `docs/release/2026-03-18-miniprogram-phase1-release-notes-cn.md`
  - `docs/release/MINIPROGRAM_PHASE1_CLOUD_CHECKLIST.md`

**Step 4: Run verification**
Run: `rg -n "socket\.io-client|weapp\.socket\.io" miniprogram/package.json`
Run: `node --check miniprogram/src/api.js miniprogram/src/socket.js`
Expected: `package.json` 中不再命中过期 websocket 依赖；语法检查 PASS。

**Step 5: Commit**
```bash
git add miniprogram/package.json miniprogram/src/api.js miniprogram/src/pages/index/index.vue miniprogram/src/socket.js docs/release/2026-03-18-miniprogram-phase1-release-notes-cn.md docs/release/MINIPROGRAM_PHASE1_CLOUD_CHECKLIST.md
git commit -m "chore: clean miniprogram legacy server assumptions"
```

### Final Integration Task

**Files:**
- Modify only if integration issues require it

**Step 1: Reconcile worker outputs carefully**
- 保持上面定义的写入边界
- 只解决真正的冲突，尤其是 `miniprogram/src/api.js` 与共享页面状态路径

**Step 2: Run unified verification**
Run: `node --test miniprogram/tests/user-snapshot.test.mjs miniprogram/tests/profile-save.test.mjs miniprogram/tests/leaderboard-contract.test.mjs`
Run: `node --check miniprogram/src/static/cloudfunctions/auth/index.js`
Run: `node --check miniprogram/src/static/cloudfunctions/progress/index.js`
Run: `cd miniprogram && npm run build:mp-weixin`
Expected: 测试 PASS、语法检查 PASS，且在本地前端依赖可用时小程序构建成功。

**Step 3: Manual smoke checklist**
- 首次登录能创建或恢复一致的用户快照
- 首次资料设置在失败时不会留下部分成功的本地状态
- 设置页同步资料会返回新快照并正确更新头像
- 排行榜能稳定显示头像回退、等级、XP 与答对数语义
- PK/watch 行为保持不变

**Step 4: Final commit if needed**
```bash
git add -A
git commit -m "chore: integrate miniprogram phase 1 flow alignment" || true
```
