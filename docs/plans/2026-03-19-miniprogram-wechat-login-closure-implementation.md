# Miniprogram WeChat Login Closure Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在不改变 `web/server` 身份模型的前提下，把小程序微信身份链路收口为一条可验证、可发布、可留证的独立闭环。

**Architecture:** 保持现有 `wx.cloud.callFunction -> auth.login -> canonical user snapshot` 架构不变，不做跨端身份统一。实现重点放在三个层面：统一所有登录入口的登录后状态写入、收口首登资料补全回流、把微信开发者工具 / 真机验收与 Git SHA 留证写进 runbook 和专项验收单。

**Tech Stack:** uni-app、Vue 3、微信云开发、Cloud Functions、Node.js 内置 test runner、微信开发者工具

---

### Task 1: 收口所有登录入口的登录后状态写入

**Files:**
- Create: `miniprogram/src/utils/login-session.js`
- Create: `miniprogram/tests/wechat-login-session.test.mjs`
- Modify: `miniprogram/src/pages/index/index.vue`
- Modify: `miniprogram/src/components/Settings.vue`
- Modify: `miniprogram/src/components/Welcome.vue`

**Step 1: Write the failing session test**

- 新增 `miniprogram/tests/wechat-login-session.test.mjs`，覆盖：
  - 登录成功后统一返回 `isLoggedIn: true`
  - `isProfileSet === false` 时目标页面固定为 `profile-setup`
  - 其余成功登录场景目标页面固定为 `dashboard`
  - 成功登录后会要求清除 `vocab_skip_auto_login`
  - 所有入口都消费同一份登录后 patch，而不是各自拼逻辑

**Step 2: Run test to verify it fails**

Run: `node --test miniprogram/tests/wechat-login-session.test.mjs`
Expected: FAIL，因为 `login-session.js` 还不存在。

**Step 3: Write minimal implementation**

- 在 `miniprogram/src/utils/login-session.js` 中实现纯 helper，例如：
  - `buildLoginSessionPatch(userSnapshot)`
  - `resolvePostLoginView(userSnapshot)`
- helper 只负责产出登录成功后的统一 patch，不直接调用 `uni` 或 `Actions`

**Step 4: Wire all login entry points**

- 更新 `miniprogram/src/pages/index/index.vue`，让自动登录只消费统一 helper
- 更新 `miniprogram/src/components/Settings.vue`，让手动登录成功后的状态写入、缓存更新、页面跳转与自动登录一致
- 更新 `miniprogram/src/components/Welcome.vue`，让欢迎页登录按钮复用同一套行为

**Step 5: Run verification**

Run: `node --test miniprogram/tests/wechat-login-session.test.mjs`
Run: `node --check miniprogram/src/pages/index/index.vue miniprogram/src/components/Settings.vue miniprogram/src/components/Welcome.vue`
Expected: PASS

**Step 6: Commit**

```bash
git add miniprogram/src/utils/login-session.js miniprogram/tests/wechat-login-session.test.mjs miniprogram/src/pages/index/index.vue miniprogram/src/components/Settings.vue miniprogram/src/components/Welcome.vue
git commit -m "feat: unify miniprogram login session handling"
```

### Task 2: 收口首登资料补全后的身份回流

**Files:**
- Modify: `miniprogram/src/components/ProfileSetup.vue`
- Modify: `miniprogram/src/components/Settings.vue`
- Modify: `miniprogram/src/api.js`
- Modify: `miniprogram/tests/profile-save.test.mjs`

**Step 1: Extend the failing profile-flow test**

- 在 `miniprogram/tests/profile-save.test.mjs` 中补充覆盖：
  - 资料补全成功后必须以云函数返回的 canonical snapshot 作为唯一成功结果
  - 保留默认资料时不得误判为已补全
  - 头像上传失败或资料保存失败时，不应生成前端“局部成功”结果

**Step 2: Run test to verify it fails**

Run: `node --test miniprogram/tests/profile-save.test.mjs`
Expected: FAIL，因为当前专项所需的闭环约束尚未完全编码进测试。

**Step 3: Write minimal implementation**

- 更新 `miniprogram/src/api.js`，确保 `updateProfile(...)` 的成功出口只返回 canonical snapshot
- 更新 `miniprogram/src/components/ProfileSetup.vue`：
  - 成功时只根据返回快照更新用户状态
  - `isProfileSet` 已完成后离开 `profile-setup`
- 更新 `miniprogram/src/components/Settings.vue`：
  - 同步微信资料成功后，保持与首次资料补全同一套回流语义

**Step 4: Run verification**

Run: `node --test miniprogram/tests/profile-save.test.mjs`
Run: `node --check miniprogram/src/api.js miniprogram/src/components/ProfileSetup.vue miniprogram/src/components/Settings.vue`
Expected: PASS

**Step 5: Commit**

```bash
git add miniprogram/src/components/ProfileSetup.vue miniprogram/src/components/Settings.vue miniprogram/src/api.js miniprogram/tests/profile-save.test.mjs
git commit -m "fix: close miniprogram profile completion loop"
```

### Task 3: 把微信身份闭环写进发布 runbook 与专项验收单

**Files:**
- Modify: `docs/release/MINIPROGRAM_GIT_RELEASE_RUNBOOK.md`
- Modify: `docs/release/MINIPROGRAM_PHASE1_CLOUD_CHECKLIST.md`
- Modify: `docs/release/2026-03-19-sync-closure-and-miniprogram-kickoff-cn.md`
- Create: `docs/release/2026-03-19-miniprogram-wechat-login-closure-acceptance-cn.md`

**Step 1: Write the failing doc check**

- 记录专项必须出现的关键词：
  - `微信身份登录闭环`
  - `openid`
  - `首次登录建档`
  - `二次登录恢复`
  - `体验版 / 真机验收`
  - `Git SHA`

**Step 2: Verify current docs are incomplete**

Run: `rg -n "微信身份登录闭环|首次登录建档|二次登录恢复|体验版|真机|Git SHA" docs/release/MINIPROGRAM_GIT_RELEASE_RUNBOOK.md docs/release/MINIPROGRAM_PHASE1_CLOUD_CHECKLIST.md docs/release/2026-03-19-sync-closure-and-miniprogram-kickoff-cn.md`
Expected: 至少部分关键词缺失，说明专项 runbook 还未完全收口。

**Step 3: Write minimal documentation**

- 更新 `docs/release/MINIPROGRAM_GIT_RELEASE_RUNBOOK.md`，补上微信身份闭环的标准发布步骤
- 更新 `docs/release/MINIPROGRAM_PHASE1_CLOUD_CHECKLIST.md`，补上：
  - 首登建档
  - 二登恢复
  - `profile-setup` 跳转
  - 资料补全回流
  - 真机 / 体验版检查点
- 更新 `docs/release/2026-03-19-sync-closure-and-miniprogram-kickoff-cn.md`，把下一步主任务明确为微信身份专项
- 新增 `docs/release/2026-03-19-miniprogram-wechat-login-closure-acceptance-cn.md`，作为本专项发版验收单

**Step 4: Run verification**

Run: `rg -n "微信身份登录闭环|openid|首次登录建档|二次登录恢复|体验版|真机|Git SHA" docs/release/MINIPROGRAM_GIT_RELEASE_RUNBOOK.md docs/release/MINIPROGRAM_PHASE1_CLOUD_CHECKLIST.md docs/release/2026-03-19-sync-closure-and-miniprogram-kickoff-cn.md docs/release/2026-03-19-miniprogram-wechat-login-closure-acceptance-cn.md`
Expected: PASS，所有专项关键词均可命中。

**Step 5: Commit**

```bash
git add docs/release/MINIPROGRAM_GIT_RELEASE_RUNBOOK.md docs/release/MINIPROGRAM_PHASE1_CLOUD_CHECKLIST.md docs/release/2026-03-19-sync-closure-and-miniprogram-kickoff-cn.md docs/release/2026-03-19-miniprogram-wechat-login-closure-acceptance-cn.md
git commit -m "docs: add miniprogram wechat login closure runbook"
```

### Task 4: 执行本地预检并完成微信运行时验收留证

**Files:**
- Modify: `docs/release/2026-03-19-miniprogram-wechat-login-closure-acceptance-cn.md`

**Step 1: Run local preflight checks**

Run: `node --test miniprogram/tests/user-snapshot.test.mjs miniprogram/tests/profile-save.test.mjs miniprogram/tests/leaderboard-contract.test.mjs miniprogram/tests/wechat-login-session.test.mjs`
Run: `node --check miniprogram/src/api.js miniprogram/src/pages/index/index.vue miniprogram/src/components/Settings.vue miniprogram/src/components/ProfileSetup.vue miniprogram/src/static/cloudfunctions/auth/index.js`
Run: `cd miniprogram && npm run release:verify`
Run: `cd miniprogram && npm run build:mp-weixin`
Expected: PASS

**Step 2: Perform WeChat runtime acceptance**

- 在微信开发者工具中使用正确环境打开项目
- 执行一次首次登录，确认获取真实 `openid`，并记录是否成功建档
- 执行一次二次登录，确认恢复同一用户而不是重复建档
- 对未补全资料用户验证自动进入 `profile-setup`
- 完成一次资料补全，确认回到稳定已登录状态
- 在体验版或真机上至少重复一次完整路径

**Step 3: Record evidence**

- 在 `docs/release/2026-03-19-miniprogram-wechat-login-closure-acceptance-cn.md` 中记录：
  - Git SHA
  - 云函数部署范围
  - 微信开发者工具结论
  - 真机 / 体验版结论
  - 阻塞项与后续动作

**Step 4: Commit**

```bash
git add docs/release/2026-03-19-miniprogram-wechat-login-closure-acceptance-cn.md
git commit -m "docs: record miniprogram wechat login closure acceptance"
```

### Final Integration Task

**Files:**
- Modify only if integration issues require it

**Step 1: Reconcile code and docs carefully**

- 保持 Task 1-3 的写入边界
- 如果 `Settings.vue` 与 `index/index.vue` 在登录后行为上仍有分歧，只做最小收口

**Step 2: Run final verification**

Run: `git status --short`
Run: `node --test miniprogram/tests/user-snapshot.test.mjs miniprogram/tests/profile-save.test.mjs miniprogram/tests/leaderboard-contract.test.mjs miniprogram/tests/wechat-login-session.test.mjs`
Run: `cd miniprogram && npm run release:verify`
Expected: 工作区只剩预期改动，测试与预检通过。

**Step 3: Final commit if needed**

```bash
git add -A
git commit -m "chore: integrate miniprogram wechat login closure" || true
```
