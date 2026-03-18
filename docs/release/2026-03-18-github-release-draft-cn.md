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
> 这是一份可直接整理后粘贴到 GitHub Releases 的中文文案草稿，对应本次 `server + web + deploy` 修复批次。

## 建议标题

`2026-03-18 Server + Web 安全加固与部署对齐`

## Release 文案

### 概要

本次发布聚焦 `server`、`web`、部署链路与仓库卫生，不包含 `miniprogram`。

本轮重点完成了几类关键修复：
- 收口管理接口鉴权、SQL 注入风险和 PK 身份伪造问题
- 纳入并验证本地头像上传、资料编辑和媒体播放相关能力
- 对齐本地运行、e2e、PM2 和部署脚本中的数据库/运行配置
- 隔离本地工作区产物，降低误提交风险

### 主要变更

#### 安全与权限
- 为后台管理接口补齐认证/权限边界
- 移除 `/words/session` 的不安全 SQL 拼接
- 阻断无 token 场景下的 PK 身份冒充和落库风险
- Web 管理接口调用补齐认证头

#### 用户资料与媒体
- 合入并验证本地头像上传与资料编辑链路
- 纳入头像处理、资料状态管理和相关前端测试
- 保持音频播放链路可用，并兼容当前本地资源方案

#### 运行与部署一致性
- 对齐本地 HTTP / WebSocket / e2e 的运行行为
- 为后端 e2e 测试补齐独立 SQLite 引导
- 统一部署脚本、PM2 默认回退值和发布文档中的数据库路径

#### 仓库卫生
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

## 发布时可选短版摘要

> 本次更新完成了 `server + web + deploy` 范围内的关键安全修复、资料链路补齐、运行/部署配置对齐和仓库卫生收口；`miniprogram` 与数据治理类工作不在本轮发布范围内。

## 相关笔记

- [[2026-03-18-server-web-release-notes-cn]]
- [[2026-03-18 项目全量 Review（中文）]]
