---
title: 2026-03-19 同步闭环回填与小程序专项启动（中文）
aliases:
  - Sync Closure and Miniprogram Kickoff 2026-03-19
  - 同步闭环回填
  - 小程序专项启动
tags:
  - release
  - sync
  - github
  - server
  - miniprogram
status: active
created: 2026-03-19
updated: 2026-03-19
---

# 2026-03-19 同步闭环回填与小程序专项启动（中文）

> [!abstract]
> 这份笔记用于完成两件事：
> 1. 回填“本地 `main` -> GitHub `origin/main` -> 服务器 `101.34.65.203`”已经打通的事实证据；
> 2. 在服务器同步治理收口后，正式把下一步重心切到 `miniprogram` 的云端发布与验收。

## 一、已完成的同步闭环

### 1. GitHub Actions 服务器部署已打通

- 工作流：`.github/workflows/deploy-server-from-main.yml`
- 首次闭环验证运行：`23253723406`
- 运行结论：`success`
- 对应 SHA：`97afd3e5bed2ea02794bcec7c7566b55c9268b04`

### 2. 服务器已迁移到 Git 驱动发布结构

当前服务器 release root：

```text
/var/www/vocab-master/
  repo/
  releases/
  shared/
  current -> releases/97afd3e5bed2ea02794bcec7c7566b55c9268b04
```

运行态已外置到 `shared/`：

- SQLite：`/var/www/vocab-master/shared/prisma/dev.db`
- 上传：`/var/www/vocab-master/shared/uploads/avatars`
- 日志：`/var/www/vocab-master/shared/logs`

### 3. 首次闭环一致性证据

- 本地 `main` = `origin/main` = `97afd3e5bed2ea02794bcec7c7566b55c9268b04`
- 服务器 `current/REVISION` = `97afd3e5bed2ea02794bcec7c7566b55c9268b04`
- 服务器 `release-manifest.json.commit` = `97afd3e5bed2ea02794bcec7c7566b55c9268b04`
- 服务器 bare origin `main` = `97afd3e5bed2ea02794bcec7c7566b55c9268b04`

### 4. 已验证接口

- 服务器内网：
  - `http://127.0.0.1:3001/api/config`
  - `http://127.0.0.1:3001/api/leaderboard`
- 公网：
  - `http://101.34.65.203:3001/api/leaderboard`

> [!success]
> 到这里为止，服务器端已经不再依赖“从本地手工同步目录”的路径。
> 后续标准路径就是：`本地 main -> GitHub origin/main -> GitHub Actions -> 101.34.65.203`

## 二、这意味着什么

- 以后回答“服务器同步了吗？”时，应该先看 Git SHA 和 release manifest，而不是看目录时间戳
- 服务器端已经进入规范化治理阶段，后续重点不再是“先把服务器补齐”，而是“把小程序也纳入同一证据模型”
- 当前真正剩下的跨位置差异，主要在 `miniprogram` 云端这一跳，以及小程序专属的微信身份体系边界

## 三、小程序专项当前基线

### 1. 仓库侧已经具备的内容

- 设计与实现计划：
  - [[2026-03-18-miniprogram-special-design]]
  - [[2026-03-18-miniprogram-special-implementation]]
  - [[2026-03-19-miniprogram-wechat-identity-boundary-design]]
- 发布说明 / runbook：
  - [[2026-03-18-miniprogram-phase1-release-notes-cn]]
  - [[MINIPROGRAM_GIT_RELEASE_RUNBOOK]]
  - [[MINIPROGRAM_PHASE1_CLOUD_CHECKLIST]]
- 已落库能力：
  - canonical user snapshot
  - 资料保存一致性编排
  - 排行榜展示契约归一化
  - release manifest 生成与 dry-run 校验

### 2. 本地已验证证据

已重新执行通过：

- `node --test miniprogram/tests/user-snapshot.test.mjs miniprogram/tests/profile-save.test.mjs miniprogram/tests/leaderboard-contract.test.mjs`
  - 结果：16 个测试全部通过
- `node --check miniprogram/src/api.js miniprogram/src/socket.js miniprogram/src/static/cloudfunctions/auth/index.js miniprogram/src/static/cloudfunctions/progress/index.js`
  - 结果：通过
- `cd miniprogram && npm run release:verify`
  - 结果：可输出当前 `origin/main` SHA 的 release manifest

本次 `release:verify` 输出的核心字段为：

- `commit`: `97afd3e5bed2ea02794bcec7c7566b55c9268b04`
- `scope`: `full`
- `cloudFunctions`:
  - `admin`
  - `auth`
  - `initDatabase`
  - `progress`
  - `words`

### 3. 还没有完成的部分

- 微信开发者工具中的正式上传 / 体验版上传
- 上述云函数的“上传并部署：云端安装依赖”
- 依据 `[[MINIPROGRAM_PHASE1_CLOUD_CHECKLIST]]` 的真机 / 体验版验收
- 微信身份登录闭环是否真实可用的专项验收
- 把最终云端发布的 `commit / scope / 验收结论` 回填到 release 记录

> [!warning]
> 也就是说：小程序专项现在不是“没开始”，而是“仓库侧一期已完成，云端最后一跳待执行”。

## 四、建议下一步直接做什么

### 现在就按这个顺序推进

1. 在干净工作区执行：
   - `cd miniprogram && npm run release:manifest`
2. 在微信开发者工具中：
   - 上传小程序目标版本
   - 对 `auth / progress / words / admin / initDatabase` 执行云端安装依赖并部署
3. 按 `[[MINIPROGRAM_PHASE1_CLOUD_CHECKLIST]]` 做体验版 / 真机验收
4. 验收完成后，把本次 `commit`、`scope`、验收结论回填到 release 记录

### 这一步明确不混做的内容

- 不在本轮云端验收里顺手重做 PK 鉴权模型
- 不把小程序强行改成复用 `server` REST API
- 不再把“微信登录没有 Web 对应实现”视为同步缺口
- 不在验收前清理 `src_backup_*` 历史目录
- 不把二期范围和一期云端发布混成一次大改

## 五、当前建议的分界线

> [!tip]
> 从现在开始，可以把项目理解为两条并行但服从同一真相源的发布链：
>
> - `server/web`：已经完成 Git 驱动闭环
> - `miniprogram`：仓库侧已完成一期，接下来只差云端发布与验收闭环

## 相关笔记

- [[2026-03-18-project-sync-governance-design]]
- [[PROJECT_SYNC_STATUS_RUNBOOK]]
- [[2026-03-18-follow-up-task-list-cn]]
- [[2026-03-18-miniprogram-special-design]]
- [[2026-03-18-miniprogram-special-implementation]]
