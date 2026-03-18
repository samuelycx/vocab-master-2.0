# Project Sync Governance Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 建立一套以 GitHub `origin/main` 为唯一可发布真相源的同步治理体系，让 `server + web` 的服务器发布与 `miniprogram` 的云开发发布都不再依赖本地目录直传，而是统一走“本地 main -> GitHub -> 部署目标”的路径。

**Architecture:** 服务器采用“`repo + releases + shared + current`”分层发布结构，发布动作从 Git SHA 出发，运行态数据与 release 目录彻底分离。小程序保持云开发架构不变，但引入 Git 驱动的 release manifest、发布 runbook 与版本证据，确保云函数与前端发布都能追溯到同一个 Git 版本。

**Tech Stack:** Git, Bash, Node.js, PM2, SQLite, WeChat Cloud Development, Markdown runbooks

---

### Task 1: 建立统一 release metadata 与同步审计基础

**Files:**
- Create: `scripts/sync/release-metadata.mjs`
- Create: `scripts/sync/release-metadata.test.mjs`
- Create: `scripts/sync/collect-project-sync-status.sh`
- Create: `docs/release/PROJECT_SYNC_STATUS_RUNBOOK.md`
- Modify: `README.md`

**Step 1: Write the failing metadata test**
- 在 `scripts/sync/release-metadata.test.mjs` 中新增测试，覆盖：
  - 输入 `commit / target / scope / releasedAt` 时，会生成稳定字段结构
  - metadata 必须包含 `commit`, `target`, `scope`, `releasedAt`, `sourceOfTruth`
  - 非法空 commit 会被拒绝

**Step 2: Run test to verify it fails**
Run: `node --test scripts/sync/release-metadata.test.mjs`
Expected: FAIL，因为 metadata helper 还不存在。

**Step 3: Write minimal implementation**
- 在 `scripts/sync/release-metadata.mjs` 中实现：
  - `buildReleaseMetadata(...)`
  - `validateReleaseMetadata(...)`
- 输出结构统一为 server / miniprogram 都可复用的 release manifest 基础格式。

**Step 4: Add the local sync audit entrypoint**
- 新建 `scripts/sync/collect-project-sync-status.sh`，最少输出：
  - 本地 `HEAD`
  - `origin/main`
  - working tree 是否干净
  - 可选的服务器 / 小程序检查入口占位
- 新建 `docs/release/PROJECT_SYNC_STATUS_RUNBOOK.md`，说明如何解释审计输出。

**Step 5: Run verification**
Run: `node --test scripts/sync/release-metadata.test.mjs`
Run: `bash scripts/sync/collect-project-sync-status.sh`
Expected: PASS，且脚本能输出本地与 origin 的状态摘要。

**Step 6: Commit**
```bash
git add scripts/sync/release-metadata.mjs scripts/sync/release-metadata.test.mjs scripts/sync/collect-project-sync-status.sh docs/release/PROJECT_SYNC_STATUS_RUNBOOK.md README.md
git commit -m "chore: add release metadata foundation"
```

### Task 2: 为服务器建立 Git 驱动的发布目录结构与迁移脚本

**Files:**
- Create: `scripts/server/bootstrap-git-release-layout.sh`
- Create: `scripts/server/deploy-from-git.sh`
- Create: `scripts/server/verify-current-release.sh`
- Create: `docs/release/SERVER_GIT_RELEASE_RUNBOOK.md`
- Create: `docs/release/SERVER_GIT_MIGRATION_CHECKLIST.md`

**Step 1: Write the failing dry-run check**
- 为 `bootstrap-git-release-layout.sh` 和 `deploy-from-git.sh` 先定义 `--dry-run` 输出格式：
  - 目标根目录
  - repo / releases / shared / current 路径
  - 待部署 SHA
  - 待链接的 shared 目录
- 在 runbook 中先写出期望 dry-run 输出样例。

**Step 2: Run dry-run command to verify it fails**
Run: `bash scripts/server/bootstrap-git-release-layout.sh --dry-run /tmp/vocab-master-release-root`
Expected: FAIL，因为脚本还不存在。

**Step 3: Write minimal implementation**
- `bootstrap-git-release-layout.sh` 负责：
  - 备份旧目录
  - 创建 `repo/`, `releases/`, `shared/`, `backups/`
  - 创建 `shared/env`, `shared/prisma`, `shared/uploads`, `shared/logs`
- `deploy-from-git.sh` 负责：
  - 接收 `--sha <commit>`
  - 从 `repo/` fetch 指定 SHA
  - 生成 `releases/<sha>`
  - 预留 shared 链接位
- `verify-current-release.sh` 负责：
  - 读取 `current/REVISION`
  - 输出当前 SHA、目录与 manifest 路径

**Step 4: Document the migration and rollback flow**
- 在 `docs/release/SERVER_GIT_RELEASE_RUNBOOK.md` 中写出标准发布流程。
- 在 `docs/release/SERVER_GIT_MIGRATION_CHECKLIST.md` 中写出首次迁移前后的检查项与回滚动作。

**Step 5: Run verification**
Run: `bash scripts/server/bootstrap-git-release-layout.sh --dry-run /tmp/vocab-master-release-root`
Run: `bash scripts/server/deploy-from-git.sh --dry-run /tmp/vocab-master-release-root --sha HEAD`
Expected: PASS，dry-run 输出完整路径与动作说明。

**Step 6: Commit**
```bash
git add scripts/server/bootstrap-git-release-layout.sh scripts/server/deploy-from-git.sh scripts/server/verify-current-release.sh docs/release/SERVER_GIT_RELEASE_RUNBOOK.md docs/release/SERVER_GIT_MIGRATION_CHECKLIST.md
git commit -m "feat: add server git-driven release scripts"
```

### Task 3: 把服务器运行态从 release 目录中剥离

**Files:**
- Modify: `server/ecosystem.config.cjs`
- Modify: `server/src/auth/avatar-upload.ts`
- Create: `server/src/auth/avatar-upload.spec.ts`
- Modify: `scripts/deploy-aliyun.sh`
- Modify: `docs/release/DEPLOY-CHECKLIST.md`

**Step 1: Write the failing runtime path test**
- 在 `server/src/auth/avatar-upload.spec.ts` 中新增测试，覆盖：
  - 上传目录优先读取环境变量指定路径
  - 未指定时才回退默认路径
  - 不再把 release 目录内的临时相对路径当成长期运行目录

**Step 2: Run test to verify it fails**
Run: `cd server && npm test -- avatar-upload.spec.ts`
Expected: FAIL，因为 shared runtime 路径能力还不存在。

**Step 3: Write minimal implementation**
- 修改 `server/src/auth/avatar-upload.ts`：
  - 引入明确的 shared uploads 路径环境变量
- 修改 `server/ecosystem.config.cjs`：
  - 支持从 shared env / uploads / logs 路径读取运行态配置
- 修改 `scripts/deploy-aliyun.sh`：
  - 不再假设“服务器当前目录就是源码 + 运行态混合目录”
  - 改为调用 `deploy-from-git.sh` 或兼容过渡入口

**Step 4: Update deploy checklist**
- 在 `docs/release/DEPLOY-CHECKLIST.md` 中明确：
  - 运行态目录与源码 release 目录必须分离
  - 禁止在 release 目录中长期存放 SQLite、上传文件、日志

**Step 5: Run verification**
Run: `cd server && npm test -- avatar-upload.spec.ts`
Run: `node --check server/ecosystem.config.cjs`
Expected: PASS

**Step 6: Commit**
```bash
git add server/ecosystem.config.cjs server/src/auth/avatar-upload.ts server/src/auth/avatar-upload.spec.ts scripts/deploy-aliyun.sh docs/release/DEPLOY-CHECKLIST.md
git commit -m "fix: externalize server runtime state from releases"
```

### Task 4: 为服务器发布链加入版本证据与回滚证据

**Files:**
- Modify: `scripts/server/deploy-from-git.sh`
- Modify: `scripts/server/verify-current-release.sh`
- Create: `docs/release/SERVER_RELEASE_MANIFEST_SCHEMA.md`

**Step 1: Write the failing manifest test**
- 为 `release-metadata.mjs` 新增测试，覆盖：
  - server manifest 必须包含 `commit`, `releasedAt`, `releasePath`, `currentPath`, `scope`
  - 缺任一关键字段应视为非法

**Step 2: Run test to verify it fails**
Run: `node --test scripts/sync/release-metadata.test.mjs`
Expected: FAIL，因为 server manifest 字段还未补齐。

**Step 3: Write minimal implementation**
- `deploy-from-git.sh` 发布完成后写入：
  - `current/REVISION`
  - `current/release-manifest.json`
  - `shared/release-history/<timestamp>-<sha>.json`
- `verify-current-release.sh` 输出 manifest 核心字段。

**Step 4: Document rollback evidence**
- 在 `docs/release/SERVER_RELEASE_MANIFEST_SCHEMA.md` 中说明 manifest 字段。
- 在 runbook 中补充“按 SHA 回滚”的标准步骤。

**Step 5: Run verification**
Run: `node --test scripts/sync/release-metadata.test.mjs`
Run: `bash scripts/server/verify-current-release.sh --help`
Expected: PASS

**Step 6: Commit**
```bash
git add scripts/server/deploy-from-git.sh scripts/server/verify-current-release.sh docs/release/SERVER_RELEASE_MANIFEST_SCHEMA.md scripts/sync/release-metadata.mjs scripts/sync/release-metadata.test.mjs
git commit -m "feat: add server release evidence and rollback metadata"
```

### Task 5: 为小程序发布链加入 Git 版本证据

**Files:**
- Create: `scripts/miniprogram/write-release-manifest.mjs`
- Create: `scripts/miniprogram/write-release-manifest.test.mjs`
- Create: `miniprogram/release-manifest.json`
- Modify: `miniprogram/package.json`
- Create: `docs/release/MINIPROGRAM_GIT_RELEASE_RUNBOOK.md`
- Modify: `docs/release/MINIPROGRAM_PHASE1_CLOUD_CHECKLIST.md`

**Step 1: Write the failing miniprogram manifest test**
- 在 `scripts/miniprogram/write-release-manifest.test.mjs` 中新增测试，覆盖：
  - manifest 包含 `commit`, `scope`, `cloudFunctions`, `releasedAt`
  - dirty working tree 时拒绝生成生产发布 manifest
  - scope 至少支持 `miniprogram`, `cloudfunctions`, `full`

**Step 2: Run test to verify it fails**
Run: `node --test scripts/miniprogram/write-release-manifest.test.mjs`
Expected: FAIL，因为 manifest writer 还不存在。

**Step 3: Write minimal implementation**
- `write-release-manifest.mjs` 负责生成小程序 release manifest。
- 在 `miniprogram/package.json` 新增：
  - `release:manifest`
  - `release:verify`
- 默认从 Git SHA 与 clean working tree 生成版本证据。

**Step 4: Document the Git-centered miniprogram release flow**
- 在 `docs/release/MINIPROGRAM_GIT_RELEASE_RUNBOOK.md` 中明确：
  - 小程序发布必须来自 GitHub 已存在的 SHA
  - 云函数必须按同一版本重新部署
  - 发布后要记录验收结果
- 在 `docs/release/MINIPROGRAM_PHASE1_CLOUD_CHECKLIST.md` 中补“记录已发布 SHA”检查项。

**Step 5: Run verification**
Run: `node --test scripts/miniprogram/write-release-manifest.test.mjs`
Run: `node scripts/miniprogram/write-release-manifest.mjs --dry-run`
Expected: PASS

**Step 6: Commit**
```bash
git add scripts/miniprogram/write-release-manifest.mjs scripts/miniprogram/write-release-manifest.test.mjs miniprogram/package.json miniprogram/release-manifest.json docs/release/MINIPROGRAM_GIT_RELEASE_RUNBOOK.md docs/release/MINIPROGRAM_PHASE1_CLOUD_CHECKLIST.md
git commit -m "feat: add git-based miniprogram release metadata"
```

### Task 6: 打通统一同步审计输出

**Files:**
- Modify: `scripts/sync/collect-project-sync-status.sh`
- Create: `scripts/sync/check-server-release.sh`
- Create: `scripts/sync/check-miniprogram-release.sh`
- Create: `docs/release/PROJECT_SYNC_AUDIT_RUNBOOK.md`

**Step 1: Write the failing audit expectation**
- 在 runbook 中先定义统一输出字段：
  - `local_head`
  - `origin_main`
  - `server_release_sha`
  - `server_runtime_status`
  - `miniprogram_release_sha`
  - `miniprogram_release_status`

**Step 2: Run command to verify missing pieces**
Run: `bash scripts/sync/collect-project-sync-status.sh`
Expected: FAIL 或输出缺项，因为 server / miniprogram 子检查器还不存在。

**Step 3: Write minimal implementation**
- `check-server-release.sh` 负责读取服务器 `REVISION` / manifest。
- `check-miniprogram-release.sh` 负责读取 release manifest 与最近一次云端验收记录。
- `collect-project-sync-status.sh` 汇总输出统一状态。

**Step 4: Document interpretation rules**
- 在 `docs/release/PROJECT_SYNC_AUDIT_RUNBOOK.md` 中说明：
  - 哪些状态代表“已同步”
  - 哪些状态代表“源码一致但未部署”
  - 哪些状态代表“服务器在线但版本漂移”

**Step 5: Run verification**
Run: `bash scripts/sync/collect-project-sync-status.sh`
Expected: PASS，且输出完整状态字段。

**Step 6: Commit**
```bash
git add scripts/sync/collect-project-sync-status.sh scripts/sync/check-server-release.sh scripts/sync/check-miniprogram-release.sh docs/release/PROJECT_SYNC_AUDIT_RUNBOOK.md
git commit -m "feat: add unified project sync audit"
```

### Task 7: 执行服务器迁移并完成首次规范化验收

**Files:**
- Modify only if migration reveals integration issues

**Step 1: Backup current server directory**
Run on server: `cp -a /var/www/vocab-master /var/www/vocab-master-pre-git-$(date +%Y%m%d-%H%M%S)`
Expected: 形成完整回滚备份。

**Step 2: Bootstrap the release layout**
Run on server: `bash scripts/server/bootstrap-git-release-layout.sh /var/www/vocab-master`
Expected: `repo/`, `releases/`, `shared/`, `backups/` 创建完成。

**Step 3: Deploy from a known Git SHA**
Run on server: `bash scripts/server/deploy-from-git.sh /var/www/vocab-master --sha <origin-main-sha>`
Expected: `current/REVISION` 与指定 SHA 一致，PM2 重启成功。

**Step 4: Verify runtime and health**
Run on server:
- `bash scripts/server/verify-current-release.sh /var/www/vocab-master`
- `pm2 status`
- `curl -sS http://127.0.0.1:3000/api/health`
Expected: 全部通过。

**Step 5: Record release evidence**
- 把首次迁移后的 SHA、路径、健康检查结果写入 release history。
- 在相关 runbook 中记录“第一次规范化迁移完成”。

**Step 6: Commit follow-up fixes if needed**
```bash
git add -A
git commit -m "chore: finalize server git-driven release migration" || true
```

### Task 8: 建立小程序正式发布门禁并完成第一次版本记录

**Files:**
- Modify only if release recording reveals gaps

**Step 1: Generate manifest from the release SHA**
Run: `node scripts/miniprogram/write-release-manifest.mjs --commit <origin-main-sha>`
Expected: 生成可用 manifest。

**Step 2: Deploy from the clean Git version**
Run via WeChat DevTools / cloud release process:
- 上传并部署前端
- 上传并部署云函数（云端安装依赖）
Expected: 前端与云函数均来自同一 SHA。

**Step 3: Verify with cloud checklist**
Run: 按 `docs/release/MINIPROGRAM_GIT_RELEASE_RUNBOOK.md` 与 `docs/release/MINIPROGRAM_PHASE1_CLOUD_CHECKLIST.md` 完成 smoke。
Expected: 登录、资料保存、排行榜、PK/watch 至少完成一次有效验收。

**Step 4: Record the deployed SHA**
- 把本次小程序发布 SHA、环境、验收结果写入 release 记录。

**Step 5: Commit follow-up fixes if needed**
```bash
git add -A
git commit -m "chore: record first git-based miniprogram release" || true
```

### Final Integration Task

**Files:**
- Modify only if integration issues require it

**Step 1: Reconcile runbooks and scripts**
- 确保 server / miniprogram / sync audit 三条文档口径一致。
- 删除任何仍然鼓励“本地目录直接同步到服务器”的旧描述。

**Step 2: Run unified verification**
Run:
- `bash scripts/sync/collect-project-sync-status.sh`
- `node --test scripts/sync/release-metadata.test.mjs scripts/miniprogram/write-release-manifest.test.mjs`
- `cd server && npm test -- avatar-upload.spec.ts`
Expected: 所有规范化基础检查通过。

**Step 3: Manual governance checklist**
- 能明确说出本地 / GitHub / server / miniprogram 当前各自 SHA
- server 目录不再依赖手工本地拷贝
- miniprogram 发布不再依赖“未提交本地改动”
- 任一发布都能留下 manifest 与验收证据

**Step 4: Final commit if needed**
```bash
git add -A
git commit -m "chore: integrate project sync governance workflow" || true
```
