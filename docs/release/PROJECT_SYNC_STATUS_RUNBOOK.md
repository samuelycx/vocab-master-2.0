---
title: 项目同步状态检查 Runbook
aliases:
  - Project Sync Status Runbook
  - 项目同步检查
tags:
  - runbook
  - sync
  - release
  - github
  - server
  - miniprogram
status: active
created: 2026-03-18
updated: 2026-03-19
---

# 项目同步状态检查 Runbook

> [!abstract]
> 用于快速回答 4 个问题：
> 1. 本地 `main` 是否已经和 `origin/main` 对齐？
> 2. GitHub Actions 最近一次部署是否成功？
> 3. 服务器 `101.34.65.203` 当前运行的是哪个 Git SHA？
> 4. 小程序本次准备发布的 SHA 是否已经留证？

## 1. 本地 + GitHub 快速检查

在仓库根目录执行：

```bash
bash scripts/sync/collect-project-sync-status.sh
```

当前脚本会输出：

- `project_root`
- `current_branch`
- `local_head`
- `origin_main`
- `working_tree_clean`
- `source_of_truth`

### 判断规则

- `working_tree_clean=true`：本地工作区干净，可以继续做发布比对
- `local_head == origin_main`：本地 `main` 已和 GitHub 对齐
- `local_head != origin_main`：说明还有未 push 或未 pull 的差异，不应继续做正式发布判断

## 2. GitHub Actions 部署链路检查

建议使用 `gh` 查看 `Deploy Server From Main`：

```bash
gh run list --workflow deploy-server-from-main.yml --limit 3
gh run view <run-id>
```

重点核对：

- `status=completed`
- `conclusion=success`
- `headSha` 是否等于目标 `origin/main` SHA

> [!info]
> 2026-03-19 已验证的 run id 为 `23253723406`，对应 SHA：
> `97afd3e5bed2ea02794bcec7c7566b55c9268b04`

## 3. 服务器当前 release 检查

### 3.1 核对当前生效版本

```bash
ssh root@101.34.65.203 '
  set -euo pipefail
  RELEASE_ROOT=/var/www/vocab-master
  echo current_path=$(readlink -f "$RELEASE_ROOT/current")
  echo current_revision=$(cat "$RELEASE_ROOT/current/REVISION")
  python3 -c "import json; print(\"manifest_commit=\" + json.load(open(\"/var/www/vocab-master/current/release-manifest.json\"))[\"commit\"])"
'
```

期望结果：

- `current_path` 指向 `releases/<sha>`
- `current_revision` 与 `manifest_commit` 完全一致

### 3.2 核对 bare origin 是否同步

```bash
ssh root@101.34.65.203 'git --git-dir=/root/vocab-master-origin-main.git rev-parse main'
```

期望结果：

- 输出与本地 `origin/main` 相同的 SHA

### 3.3 核对关键接口

```bash
ssh root@101.34.65.203 'curl -sS http://127.0.0.1:3001/api/config && echo && curl -sS http://127.0.0.1:3001/api/leaderboard && echo'
curl -sS http://101.34.65.203:3001/api/leaderboard
```

当前建议只核对已经存在且稳定的接口：

- `/api/config`
- `/api/leaderboard`

> [!warning]
> 不要把 `/api/health` 当成必要门禁。当前项目没有这个路由，返回 404 不代表部署失败。

## 4. 小程序发布前留证检查

在 `miniprogram/` 目录执行：

```bash
npm run release:verify
npm run release:manifest
```

重点核对 `release-manifest.json` 中的字段：

- `commit`
- `scope`
- `releasedAt`
- `sourceOfTruth`
- `cloudFunctions`

发布前必须满足：

- 仓库工作区干净
- `commit` 来自目标 `origin/main` SHA
- 本次要部署的云函数列表明确

## 5. 小程序云端人工验收

CLI 侧只负责 Git 留证；云端仍需在微信开发者工具中完成：

1. 上传体验版 / 目标版本
2. 对本期涉及的云函数执行“上传并部署：云端安装依赖”
3. 按 `[[MINIPROGRAM_PHASE1_CLOUD_CHECKLIST]]` 逐项验收
4. 记录最终发布的 `commit`、`scope` 与验收结论

## 6. 当前已验证基线（2026-03-19）

- 本地 `main` 与 `origin/main` 已对齐到 `97afd3e5bed2ea02794bcec7c7566b55c9268b04`
- GitHub Actions run `23253723406` 已成功把同一 SHA 发布到服务器
- 服务器 `current/REVISION`、`release-manifest.json`、bare origin `main` 已对齐到同一 SHA
- 小程序仓库侧 `npm run release:verify` 已能输出同一 SHA 的 release manifest
- 小程序云端上传与体验版 / 真机验收仍需单独执行

## 相关笔记

- [[2026-03-18-project-sync-governance-design]]
- [[2026-03-19-sync-closure-and-miniprogram-kickoff-cn]]
- [[MINIPROGRAM_GIT_RELEASE_RUNBOOK]]
- [[MINIPROGRAM_PHASE1_CLOUD_CHECKLIST]]
