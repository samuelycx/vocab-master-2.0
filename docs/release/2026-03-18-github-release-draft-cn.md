---
title: 2026-03-18 GitHub Release Draft（中文）
aliases:
  - GitHub Release Draft 2026-03-18
  - 2026-03-18 GitHub 发布文案
tags:
  - release
  - github
  - server
  - web
status: ready
created: 2026-03-18
updated: 2026-03-18
---

# 2026-03-18 GitHub Release Draft（中文）

> [!success]
> 这是一份更适合公开发布的 GitHub Releases 短版文案，对应本次 `server + web + deploy` 修复批次。

## 建议标题

`2026-03-18 Server + Web 安全加固与部署对齐`

## Release 文案

本次更新聚焦 `server`、`web`、部署链路与仓库卫生，不包含 `miniprogram`。

- 为后台管理接口补齐认证/权限边界
- 移除 `/words/session` 的不安全 SQL 拼接
- 阻断无 token 场景下的 PK 身份冒充和落库风险
- Web 管理接口调用补齐认证头
- 合入并验证本地头像上传与资料编辑链路
- 对齐本地 HTTP / WebSocket / e2e 的运行行为
- 为后端 e2e 测试补齐独立 SQLite 引导
- 统一部署脚本、PM2 默认回退值和发布文档中的数据库路径
- 忽略 `.obsidian/workspace.json`
- 忽略 `tts/` 本地目录
- 忽略 `需求文档.md`

### 验证结果

- `cd server && npm test`：通过（14 个 suite，45 个测试）
- `cd web && npm test`：通过（15 个文件，55 个测试）
- `cd server && npm run build`：通过
- `cd web && npm run build`：通过

### 提交清单

- `7270811` `docs: add release notes and archive review`
- `20faa05` `chore: ignore local workspace artifacts`
- `241bdc7` `chore: align deploy database defaults`
- `b4db63d` `chore: align local runtime and record verification evidence`
- `f7d4940` `fix: harden admin and gameplay auth flows`
- `43ca70c` `feat: add local profile editing and media playback`
- `159b14e` `docs: add worddata audit design`

### 已知未包含项

- `miniprogram` 云开发整合与和 Web 功能对齐
- 词库乱码审计后的数据修复
- 排行榜虚拟账号清理
- 更拟人化 TTS 方案与云端凭据轮换
- 头像上传安全增强与资料保存原子化

## 可直接复制的更短版本

本次更新聚焦 `server + web + deploy` 范围内的关键修复与对齐，不包含 `miniprogram`。

- 修复后台管理接口权限边界、`/words/session` 查询安全问题和 PK 身份伪造风险
- 纳入并验证本地头像上传、资料编辑与媒体播放相关能力
- 对齐本地运行、e2e、PM2 和部署脚本中的数据库/运行配置
- 收口本地工作区产物，降低误提交风险

验证结果：
- `cd server && npm test`：通过（14 个 suite，45 个测试）
- `cd web && npm test`：通过（15 个文件，55 个测试）
- `cd server && npm run build`：通过
- `cd web && npm run build`：通过

本轮未包含：
- `miniprogram` 云开发整合
- 词库数据修复
- 排行榜虚拟账号清理
- TTS 方案升级与凭据轮换
- 头像上传进一步安全增强与资料保存原子化

## 相关笔记

- [[2026-03-18-server-web-release-notes-cn]]
- [[2026-03-18 项目全量 Review（中文）]]
