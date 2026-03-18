---
title: 2026-03-18 项目全位置同步治理设计（中文）
aliases:
  - Project Sync Governance Design 2026-03-18
  - 项目同步治理设计
  - 全位置同步治理设计
tags:
  - design
  - sync
  - deploy
  - github
  - server
  - web
  - miniprogram
status: proposed
created: 2026-03-18
updated: 2026-03-18
---

# 2026-03-18 项目全位置同步治理设计（中文）

> [!abstract]
> 本设计用于把项目的“同步”从临时、人工、目录级拷贝，收口为一条长期稳定的规范化路径：
> `本地 main -> GitHub origin/main -> 各部署目标`。
> 目标覆盖 `server`、`web`、服务器运行态，以及 `miniprogram` 的云开发发布链路，避免以后再次出现“本地是最新、GitHub 是最新、服务器却停在旧版本”的状态漂移。

## 一、当前事实

### 1. 已确认的现状

- 本地源码真相源已经收口到仓库 `main`，并已与 `origin/main` 同步。
- 当前本地最新主线 commit 为 `eb0781d`：`feat: align miniprogram phase 1 user flows`。
- 服务器上的 `/var/www/vocab-master` **不是 Git 仓库**，不存在 `.git`，因此不能用 `git pull` 作为规范发布路径。
- 服务器上 `PM2` 进程 `vocab-master-web` 处于 `online`，但“能跑”不代表“已同步”。
- 服务器关键运行文件与本地 `main` 已出现哈希漂移，说明服务器目录是历史发布副本，而不是当前真相源的直接镜像。
- 小程序当前走 **微信云开发**，发布目标不是 ECS 上的某个目录，而是“开发者工具 + 云函数 + 云数据库/云存储”的组合运行态。

### 2. 当前问题的本质

> [!warning]
> 现在真正缺的不是“再同步一次”，而是“缺少一套所有位置都服从的同步治理模型”。

当前同步问题本质上来自 4 个断点：

1. **服务器目录不是受 Git 管理的发布源**
   - `/var/www/vocab-master` 更像一份手工复制后的运行目录。
   - 目录里混有源码、构建产物、数据库、上传目录、日志和历史文件。

2. **源码与运行态没有分层**
   - 服务器上的代码目录同时承担“源码副本”和“运行目录”角色。
   - 一旦运行态在目录里生成新文件，就会天然偏离源码真相源。

3. **小程序发布链路没有纳入同一治理模型**
   - 小程序虽然源码在 Git 里，但云函数部署、开发者工具构建、云端实际运行版本缺少统一版本证据。
   - 这会导致“Git 最新”与“云端最新”之间缺乏可核对关系。

4. **发布证据缺失**
   - 目前无法快速回答以下问题：
     - 服务器当前运行的是哪个 commit？
     - 小程序云端当前部署的是哪个 commit？
     - 哪些位置已经跟上 `origin/main`，哪些还没有？

## 二、设计目标

### 1. 目标

- 建立 **GitHub `origin/main` 作为唯一可发布真相源** 的规范。
- 将服务器改造为“从 GitHub 获取版本并部署”，不再依赖“从本地目录拷贝到服务器”。
- 将小程序纳入同一治理逻辑：源码从 Git 来，发布与云端运行态必须能反查到 Git 版本。
- 为每个发布目标建立统一的 **版本证据、验收证据、回滚证据**。
- 让今后任何一次同步都能明确回答：
  - 源码是否一致
  - 发布目录是否一致
  - 运行态是否一致
  - 是否存在未发布/未部署改动

### 2. 非目标

- 本轮不强行建设完整 GitHub Actions / 自动上线流水线。
- 本轮不重写小程序云开发架构，不把小程序改造成和 `server` 完全相同的部署模型。
- 本轮不把数据库内容本身纳入 Git，同步治理只覆盖“代码、配置、发布流程、版本证据”。
- 本轮不要求做到零停机发布；优先保证可追踪、可验证、可回滚。

## 三、方案对比

### 方案 A：直接把 `/var/www/vocab-master` 改成 Git 工作副本

**做法**
- 让服务器目录本身变成 `git clone` 出来的工作副本。
- 以后在服务器上执行 `git pull origin main && build && pm2 restart`。

**优点**
- 最容易理解。
- 与“本地 -> GitHub -> 服务器”路径一致。

**缺点**
- 运行态文件（数据库、上传文件、日志、构建产物、node_modules）很容易把工作副本弄脏。
- 长期运行后，`git status` 常会受到非源码文件影响。
- 回滚能力较弱，目录中途失败时容易半更新。

### 方案 B：服务器采用“Git 仓库 + releases + shared + current”分层发布（推荐）

**做法**
- 服务器上保留一个 Git 仓库副本作为“版本来源”。
- 每次从指定 commit 生成独立 `release` 目录。
- `.env`、数据库、上传目录、日志统一放到 `shared/`。
- `current` 软链接指向当前生效版本。

**优点**
- 既满足“本地 -> GitHub -> 服务器”的治理路径，又把运行态与源码隔离。
- 能保留多个历史 release，回滚简单。
- 不会因为上传文件、SQLite、日志把源码目录搞脏。
- 更适合同时承载 `server + web` 的构建与运行。

**缺点**
- 初次改造比方案 A 多一步迁移。
- 需要补充部署脚本、目录约定和 runbook。

### 方案 C：坚持非 Git 服务器目录，但通过本地打包产物发布

**做法**
- 本地打包，上传 tar 包到服务器，再解压替换运行目录。

**优点**
- 能工作。
- 不要求服务器具备完整 Git 工作流。

**缺点**
- 真相源仍然依赖“本地操作正确”。
- 很难长期保证“发布的一定是 GitHub 上那份”。
- 仍然不够规范，也不利于团队化或多机器协作。

> [!success]
> 结论：推荐采用 **方案 B**。
> 它同时满足你提出的“以后不再从本地直接同步，而是走本地 -> Git -> 服务器”的要求，并且比“服务器直接工作副本”更稳。

## 四、推荐架构

## 4.1 真相源与发布规则

### 唯一真相源

- 开发真相源：本地 `main`
- 可发布真相源：GitHub `origin/main`
- 发布输入：`origin/main` 上的 commit SHA（必要时可扩展到 tag）

### 规则

- **禁止从本地未提交目录直接发布到服务器。**
- **禁止以服务器目录内容反向认定“这就是最新源码”。**
- **禁止部署 dirty working tree。**
- 所有部署都必须对应一个明确的 commit SHA。

## 4.2 服务器目录重构

推荐把服务器目录改造成如下结构：

```text
/var/www/vocab-master/
  repo/                 # Git clone，仅作为发布源
  releases/
    <commit-sha>/       # 每次发布的独立目录
  current -> releases/<commit-sha>/
  shared/
    env/
      server.env
    prisma/
      dev.db
    uploads/
    logs/
    release-history/
  backups/
    pre-git-migration-<timestamp>/
```

### 设计含义

- `repo/`：只负责从 GitHub 获取源码，不直接承担运行。
- `releases/<sha>/`：每个 release 都是不可变快照。
- `current/`：PM2 / Nginx / 运维脚本只面向 `current`。
- `shared/`：所有可变运行态数据统一外置。
- `backups/`：第一次迁移前保留旧平铺目录备份，降低改造风险。

## 4.3 服务器发布流

推荐的服务器发布路径为：

```text
本地 main
  -> push 到 origin/main
  -> 服务器 repo fetch / checkout 指定 SHA
  -> 生成 releases/<sha>
  -> 链接 shared 环境与运行态目录
  -> build / migrate / restart PM2
  -> 写入 REVISION / manifest / release history
```

### 关键要求

- 发布脚本必须接受 **明确的 SHA**，而不是模糊的“当前目录”。
- 发布后必须落地至少三份证据：
  1. `current/REVISION`
  2. `current/release-manifest.json`
  3. `shared/release-history/<timestamp>-<sha>.json`

## 4.4 服务器运行态隔离

### 必须外置的运行态

- `server/.env` 或等价生产环境变量
- SQLite 数据库文件
- 用户上传头像 / 媒体资源
- 日志

### 设计原则

- release 目录可以删掉重建。
- shared 目录不能跟随 release 一起覆盖。
- `server` 代码必须通过环境变量或统一路径读取 shared 目录，而不是依赖 release 内的相对路径。

> [!warning]
> 如果这一点不改，服务器就算变成 Git 管理，运行时也仍然会把源码目录“污染回去”。

## 4.5 小程序 Git 化发布治理

小程序虽然没有“服务器代码目录”这一层，但同样要纳入 Git 驱动的发布规范。

### 小程序的规范发布路径

```text
本地 main
  -> push 到 origin/main
  -> 在干净工作区 checkout 指定 SHA
  -> 生成 release manifest
  -> 微信开发者工具构建 / 上传
  -> 云函数按该 SHA 对应源码重新部署
  -> 记录云端已发布版本与验收结果
```

### 关键原则

- 小程序发布必须来自 **已推送到 GitHub 的 commit**。
- 不允许“本地有未提交改动就直接上传开发者工具/云函数”。
- 云函数与前端必须共享同一个 release 标识（至少同一个 SHA 或 release version）。
- 小程序云端运行态必须能追溯到 Git 版本，而不是只靠人工记忆。

### 推荐证据

- `miniprogram/release-manifest.json`
- 微信开发者工具构建记录（截图或 release note）
- 云函数部署记录
- `docs/release/MINIPROGRAM_GIT_RELEASE_RUNBOOK.md` 中的验收条目

## 五、统一版本证据模型

为避免以后再次出现“到底哪里是最新”的争议，推荐统一以下证据模型：

### 1. 本地 / GitHub
- 当前 commit SHA
- working tree 是否干净
- 是否已 push 到 `origin/main`

### 2. 服务器发布目录
- 当前生效 SHA
- 上次发布时间
- 发布脚本版本
- 健康检查结果

### 3. 服务器运行态
- `pm2 status`
- `pm2 describe vocab-master-web`
- `/api/health`、`/api/config` 结果
- 静态资源访问检查

### 4. 小程序云端
- release manifest SHA
- 云函数部署时间
- 云函数 smoke 成功记录
- 真机 / 开发者工具 smoke 成功记录

## 六、治理规则

### 6.1 发布门禁

- 只有 `main` 上已 push 的 commit 才允许进入发布。
- 每次发布前必须确认本次范围：`server` / `web` / `miniprogram` / 文档 / 脚本。
- 未纳入本次范围的目录禁止顺手带入。

### 6.2 文档门禁

- 每条发布链都必须有 runbook：
  - Server Git 发布 runbook
  - Miniprogram Git 发布 runbook
  - 项目全位置同步检查 runbook
- 每次完成发布后，至少留一条 release 记录或验收记录。

### 6.3 回滚门禁

- 服务器必须支持“按 SHA 回滚到上一个 release 目录”。
- 小程序至少要支持“按上一个已验证 Git SHA 重新构建并重新部署云函数”。

## 七、迁移策略

### Phase 1：建立规范，不立刻冒险改动线上目录结构

- 先把规范设计、implementation plan、runbook 草案写清。
- 明确目录、脚本、证据格式。
- 先建立“发布必须来自 GitHub SHA”的规则。

### Phase 2：服务器改造为 Git 驱动发布

- 备份当前 `/var/www/vocab-master`。
- 建立 `repo/`、`releases/`、`shared/`、`current/` 结构。
- 写部署脚本，把现有 ECS 发布切到“从 Git 拉指定 SHA”。

### Phase 3：小程序纳入统一版本治理

- 增加 release manifest 与发布记录。
- 确保云函数与小程序前端使用同一发布标识。
- 建立小程序独立 runbook 和发布检查项。

### Phase 4：统一同步审计

- 增加脚本，一次输出本地 / GitHub / 服务器 / 小程序云端的版本状态。
- 以后任何“服务器同步了吗？”的问题，都通过脚本和 manifest 回答，而不是手工猜测。

## 八、验收标准

完成本设计后，最终应满足：

- 可以明确回答“当前服务器运行的是哪个 Git SHA”。
- 可以明确回答“当前小程序云端运行的是哪个 Git SHA”。
- 以后不再需要“本地目录直接同步到服务器”的发布方式。
- 发布流程从“目录拷贝”变为“Git 版本驱动”。
- `server/web` 与 `miniprogram` 虽然发布方式不同，但都服从同一套真相源与证据模型。

## 九、与现有文档的关系

- 现有部署防回归清单：[[DEPLOY-CHECKLIST]]
- 现有 `server + web` 发布说明：[[2026-03-18-server-web-release-notes-cn]]
- 现有小程序一期云端验收：[[MINIPROGRAM_PHASE1_CLOUD_CHECKLIST]]
- 本设计是它们的上层治理文档，用于定义“以后所有位置如何同步”。

## 十、推荐下一步

> [!tip]
> 下一步不应直接开始手工改服务器，而应先落地 implementation plan，拆成：
> 1. 服务器 Git 驱动发布改造
> 2. 服务器运行态外置
> 3. 小程序 Git 版本证据与发布 runbook
> 4. 统一同步审计脚本
>
> 这样后续每一步都能独立验收，不会把“规范设计”和“线上改造”混成一次高风险操作。
