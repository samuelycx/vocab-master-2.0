---
title: 2026-03-18 Server + Web 修复发布说明（中文）
aliases:
  - 2026-03-18 发布说明
  - Server Web Release Notes 2026-03-18
tags:
  - release
  - server
  - web
  - security
  - deploy
status: shipped
created: 2026-03-18
updated: 2026-03-18
---

# 2026-03-18 Server + Web 修复发布说明（中文）

> [!success]
> 2026 年 3 月 18 日这批 `server + web + deploy/repo hygiene` 修复已完成、已验证，并已推送到 `origin/main`。
> `miniprogram` 明确不在本轮发布范围内。

## 发布范围

- 后端：`server`
- Web 前端：`web`
- 部署与运行配置：PM2、部署脚本、文档对齐
- 仓库卫生：本地私有文件忽略策略
- 相关说明文档与审计笔记

## 主要变更

### 1. 安全与权限加固

- 为管理接口补齐认证/权限边界，避免未鉴权访问后台能力。
- 去掉 `/words/session` 的不安全 SQL 拼接，收口 SQL 注入风险。
- 阻断 PK 对战里无 token 冒充用户身份的入口。
- Web 端管理接口调用补齐认证头，避免前后端权限模型不一致。

### 2. 用户资料与媒体链路收口

- 纳入并验证本地头像上传、资料编辑、媒体播放相关变更。
- Web 端资料流与状态管理、头像处理逻辑、相关单测已同步进当前版本。

### 3. 本地运行与部署一致性修复

- 修复本地 HTTP / WebSocket / e2e 启动链路不一致的问题。
- 为后端 e2e 测试补齐独立 SQLite 引导，确保回归链路可执行。
- 统一阿里云部署脚本、PM2 默认回退和发布文档中的数据库路径。

### 4. 仓库卫生与误提交防护

- 忽略 `.obsidian/workspace.json`，避免提交本地编辑器会话状态。
- 忽略整个 `tts/` 目录，降低音频生成产物与本地密钥误提交风险。
- 忽略 `需求文档.md`，避免把个人临时任务清单带入正式历史。

## 提交清单

1. `20faa05` `chore: ignore local workspace artifacts`
2. `241bdc7` `chore: align deploy database defaults`
3. `b4db63d` `chore: align local runtime and record verification evidence`
4. `f7d4940` `fix: harden admin and gameplay auth flows`
5. `43ca70c` `feat: add local profile editing and media playback`
6. `159b14e` `docs: add worddata audit design`

## 验证结果

> [!info]
> 以下结果为本次推送前重新执行的本地验证，不是历史缓存结果。

- `cd server && npm test`：通过（14 个 suite，45 个测试）
- `cd web && npm test`：通过（15 个文件，55 个测试）
- `cd server && npm run build`：通过
- `cd web && npm run build`：通过
- `git status -sb`：工作区干净，且已与 `origin/main` 同步

## 部署提醒

> [!warning]
> 当前部署默认数据库文件以 `server/prisma/dev.db` 为准，请不要再混用旧的 `prod.db` 默认值。

- `scripts/deploy-aliyun.sh` 默认会写入：
  `DATABASE_URL="file:/var/www/vocab-master/server/prisma/dev.db"`
- `server/ecosystem.config.cjs` 会优先读取环境变量；若未设置，则回退到同一份 `dev.db`
- 发布前仍建议核对 `server/.env`、PM2 配置和服务器目录写权限

## 本轮明确未包含

> [!note]
> 下面这些事项没有被混入本轮发布，后续可以单独建任务推进。

- `miniprogram` 相关改动与云开发适配
- 词库乱码审计后的数据修复
- 排行榜虚拟账号清理
- 更拟人化的 TTS 方案选型与云端凭据轮换
- 头像上传白名单/转码与资料保存原子化等后续增强项

## 相关笔记

- [[2026-03-18 项目全量 Review（中文）]]
- [[2026-03-18-server-web-security-hardening-design]]
- [[2026-03-18-server-web-security-hardening-plan]]
- [[DEPLOY-CHECKLIST]]
