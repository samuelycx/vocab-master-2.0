---
title: 2026-03-18 项目全量 Review（中文）
aliases:
  - 项目全量 Review 中文版
  - Full Project Review CN
tags:
  - review
  - archive
  - project
  - security
  - backend
  - frontend
status: archived
created: 2026-03-18
updated: 2026-03-18
---

# 2026-03-18 项目全量 Review（中文）

> [!abstract]
> 这份笔记用于归档 2026 年 3 月 18 日对仓库的全量 review 结果，以及后续范围收敛后的处理结论。
> 它既保留“首次 review 时为什么判定不可直接发布”，也记录“哪些问题已在本轮修复，哪些问题被明确延期”。

> [!note] 范围最终澄清
> 小程序当前采用云开发，依赖安装与运行环境在云端；同时 `web` 端的一些改动并未同步到小程序。
> 因此本轮真正执行的修复范围是：`server`、`web`、部署链路和仓库卫生。
> `miniprogram` 被明确拆分为后续独立项目，本笔记仅保留背景记录。

> [!success] 归档结论
> - **按“全仓库视角”看**：2026-03-18 首次 review 的“不适合直接按生产可用状态发布”判断是成立的。
> - **按“本轮确认范围（`server + web + deploy`）”看**：关键阻塞项已收口、已验证、已合并并推送到 `origin/main`。
> - **仍未纳入本轮的事项**：小程序整合、词库数据治理、排行榜数据清理、TTS 方案升级，以及资料流的进一步安全增强。

## 归档用途

- 记录首次全量 review 的风险判断
- 记录本轮已处理 / 未处理的边界，避免日后误解为“整仓都已完成”
- 为后续独立项目（尤其是 `miniprogram` 和词库/TTS 数据治理）提供上下文

## 首次 Review 时的核心结论

首次 review 时，项目不适合直接发布，主要原因集中在以下几类：

1. `admin` 接口未鉴权，且存在敏感字段暴露风险
2. `/words/session` 存在 SQL 注入风险
3. PK 对战链路允许无 token 身份冒充
4. 仓库目录存在本地 TTS 服务账号密钥文件，具备误提交和泄露风险
5. 头像上传与资料流仍存在后续安全增强空间
6. 本地开发、e2e 和部署默认值曾出现不一致，容易掩盖真实回归问题

## 问题处置清单

| 问题 | 初始级别 | 当前状态 | 处理说明 |
| --- | --- | --- | --- |
| `admin` 未鉴权 / 敏感字段暴露 | Critical | 已修复 | 已在 `f7d4940` 中补齐认证与权限边界 |
| `/words/session` SQL 注入风险 | Critical | 已修复 | 已在 `f7d4940` 中移除不安全查询路径 |
| PK 无 token 身份冒充 | Critical | 已修复 | 已在 `f7d4940` 中阻断伪造身份落库 |
| TTS 本地密钥误提交风险 | Critical | 部分收口 | 已在 `20faa05` 中忽略 `tts/`，但真实云端凭据轮换不在本次会话执行范围 |
| 头像上传白名单 / 限流 / 转码不足 | Important | 待后续 | 本轮未继续做上传安全增强 |
| 资料保存非原子，可能出现部分成功 | Important | 待后续 | 本轮纳入了资料编辑功能，但未把头像与昵称更新收敛为单事务接口 |
| 本地 HTTP / WS / e2e / 文档不一致 | Important | 已修复 | 已在 `b4db63d` 与 `241bdc7` 中完成运行与部署对齐 |
| 本地编辑器状态与临时文件混入仓库 | Medium | 已修复 | 已在 `20faa05` 中忽略 `.obsidian/workspace.json`、`tts/`、`需求文档.md` |

## 本轮已落地的修复结果

### 安全修复

- `admin` 控制器、模块与服务已完成认证/权限收口
- `/words/session` 已改为安全查询路径
- PK 对战服务与相关测试已阻断身份伪造
- Web 管理接口调用已补齐认证头

### 工程与部署修复

- 本地 HTTP / WebSocket / e2e 验证链路已对齐
- 后端 e2e 现可使用独立 SQLite 测试库稳定执行
- 阿里云部署脚本、PM2 默认回退值、发布文档中的数据库路径已统一到 `dev.db`
- 本地私有工作区文件已从正式版本控制中隔离

### 已并入版本历史的提交

1. `20faa05` `chore: ignore local workspace artifacts`
2. `241bdc7` `chore: align deploy database defaults`
3. `b4db63d` `chore: align local runtime and record verification evidence`
4. `f7d4940` `fix: harden admin and gameplay auth flows`
5. `43ca70c` `feat: add local profile editing and media playback`
6. `159b14e` `docs: add worddata audit design`

## 最终验证记录

> [!info]
> 下面是本轮收尾阶段重新执行的验证结果，用于给归档结论提供证据。

- `cd server && npm test`：通过（14 个 suite，45 个测试）
- `cd web && npm test`：通过（15 个文件，55 个测试）
- `cd server && npm run build`：通过
- `cd web && npm run build`：通过
- `git push origin main`：成功，最新提交已同步到远端

## 明确延期 / 不在本轮范围的事项

> [!warning]
> 这些事项仍然重要，但没有被混入这轮 `server + web + deploy` 修复里。

- `miniprogram` 与 `web` 的功能对齐、云开发依赖与真实后端打通
- 词库乱码审计后的数据修复动作
- 排行榜虚拟账号清理
- 更拟人化 TTS 方案、批量音频再生成与云端凭据轮换
- 头像上传 MIME 白名单、大小限制、统一转码与资料保存原子化

## 后续建议

1. 以小程序为单独项目再开一轮设计与验收，不与当前 Web/Server 发布混做。
2. 把词库审计、排行榜清理、TTS 升级拆成数据治理类任务，而不是夹在业务修复里处理。
3. 如果继续完善资料系统，优先补头像上传安全边界和资料保存原子性。

## 相关笔记

- [[2026-03-18-server-web-release-notes-cn]]
- [[2026-03-18-server-web-security-hardening-design]]
- [[2026-03-18-server-web-security-hardening-plan]]
- [[TECHNICAL_REVIEW]]
- [[TESTING_GUIDE]]
- [[DEPLOY-CHECKLIST]]
