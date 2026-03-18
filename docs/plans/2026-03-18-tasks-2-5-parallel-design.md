---
title: 2026-03-18 任务 2-5 并行执行设计（中文）
aliases:
  - Tasks 2-5 Parallel Design 2026-03-18
  - 任务2到5并行设计
tags:
  - design
  - parallel
  - server
  - web
  - data
  - security
status: proposed
created: 2026-03-18
updated: 2026-03-18
---

# 2026-03-18 任务 2-5 并行执行设计（中文）

> [!abstract]
> 本设计用于把 `follow-up task list` 中的任务 2-5 收敛为四条可并行推进的工作流。
> 目标是在保持风险可控的前提下，最大化利用并行 agent 的效率。

## 设计目标

- 一次性写清任务 2-5 的执行边界与交付物
- 让 4 个 agent 可以并行工作而不互相修改同一批文件
- 让高风险动作（线上数据删除、云端密钥轮换）从“并行开发阶段”中拆出
- 保证每条工作流都能在本地留下可验证成果：代码、脚本、测试、文档或 runbook

## 非目标

- 本阶段不直接执行真实线上排行榜清理
- 本阶段不直接轮换真实云端 TTS 服务账号密钥
- 不把 `miniprogram` 混入本轮执行
- 不为了并行而强行共享写入同一组文件

## 并行方案对比

### 方案 A：4 个任务全部直接并行到底
- 优点：看起来最快
- 缺点：`任务 3` 与 `任务 4` 会牵涉线上/云端操作，风险不可控；同时任务定义容易从“开发”滑向“运维执行”

### 方案 B：先串行完成高风险任务，再并行剩余任务
- 优点：更稳
- 缺点：会浪费大量可并行的仓库内工作时间

### 方案 C：推荐方案 —— 并行完成“仓库内可验证成果”，高风险执行统一后置
- 优点：兼顾速度与安全；agent 可以并行推进脚本、测试、文档和实现；真正的线上/云端动作由主线程最后统一收口
- 缺点：`任务 3`、`任务 4` 在并行阶段完成的是“可执行准备”，不是最终线上执行本身

> [!success] 推荐结论
> 采用 **方案 C**。
> 四个 agent 并行完成各自任务的仓库内实现、脚本、测试和操作文档；所有真实线上数据清理和云端凭据轮换，由主线程在最后统一执行。

## 工作流拆分

### 工作流 A：任务 2 —— 词库乱码审计后的数据修复

**目标**
- 从“只有审计设计”推进到“本地可执行的数据修复工具链”

**并行阶段交付物**
- 乱码规则实现
- 审计脚本
- 修复脚本
- 本地验证测试
- 修复结果文档 / runbook

**文件写入范围**
- `server/src/worddata/**`
- `server/scripts/audit-worddata.ts`
- `server/scripts/repair-worddata.ts`
- `docs/release/WORDDATA_ENCODING_AUDIT.md`
- `docs/release/WORDDATA_REPAIR_RUNBOOK.md`

### 工作流 B：任务 3 —— 排行榜虚拟账号清理

**目标**
- 从“想清理”推进到“可审计、可备份、可回滚、可安全执行的清理工具链”

**并行阶段交付物**
- 虚拟账号判定规则
- 导出脚本
- 备份脚本
- 清理脚本（支持 dry-run / manifest）
- runbook 与人工复核流程

**后置执行**
- 真正删除线上账号与数据，需要在主线程最后单独执行

**文件写入范围**
- `server/src/progress/leaderboard-cleanup.*`
- `server/scripts/export-leaderboard-cleanup.ts`
- `server/scripts/apply-leaderboard-cleanup.ts`
- `docs/release/LEADERBOARD_CLEANUP_RUNBOOK.md`

### 工作流 C：任务 4 —— TTS 方案升级与凭据治理

**目标**
- 把当前硬编码脚本、本地目录和凭据风险收口成可维护方案

**并行阶段交付物**
- TTS 方案评估文档
- 参数化后的生成/核对脚本
- 环境变量化的凭据说明
- 本地目录与仓库边界说明

**后置执行**
- 真正云端密钥轮换，由主线程最后单独执行

**文件写入范围**
- `scripts/tts/**`
- `docs/release/2026-03-18-tts-options.md`
- `docs/release/TTS_CREDENTIALS_RUNBOOK.md`

### 工作流 D：任务 5 —— 头像上传安全增强与资料保存原子化

**目标**
- 彻底解决资料保存“部分成功”的一致性问题，并收口头像上传安全边界

**并行阶段交付物**
- 单入口资料保存接口
- 头像 MIME / 扩展名 / 大小校验
- 数据库失败回滚与旧头像清理逻辑
- 前端单请求保存逻辑
- 后端 + 前端回归测试

**文件写入范围**
- `server/src/auth/**`
- `server/src/web-api.contract.spec.ts`
- `web/src/api.js`
- `web/src/components/ProfileSetup.vue`
- `web/src/components/ProfileSetup.spec.js`

## 共享约束

> [!warning]
> 下面这些约束适用于四条工作流，避免并行执行时互相踩线。

- 不允许多个 agent 同时修改同一个文件
- 不在并行阶段直接修改生产数据库或执行真实清理
- 不在并行阶段直接使用真实云端凭据做不可回滚操作
- 每条工作流必须自带验证路径
- 除 `任务 5` 外，其余任务优先通过脚本、fixtures、dry-run、文档来形成可验证成果

## 验证策略

### 任务 2
- 单元测试验证乱码规则与修复规则
- 本地 fixture 验证脚本输出

### 任务 3
- 单元测试验证判定规则与 manifest 应用逻辑
- dry-run 验证导出、备份和清理脚本

### 任务 4
- `python3 -m py_compile` 验证 Python 脚本语法
- 文档核对环境变量、输入输出目录与风险说明

### 任务 5
- `server` 单测验证上传校验、回滚、旧头像清理
- `web` 单测验证单请求保存与错误处理

## 最终收口顺序

1. 四个 agent 并行完成仓库内成果
2. 主线程整合结果并跑统一验证
3. 如果 `任务 3` 的清理规则和备份脚本通过审查，再执行真实账号清理
4. 如果 `任务 4` 的凭据治理方案通过审查，再执行真实密钥轮换
5. 最后再开启 `miniprogram` 专项

## 相关笔记

- [[2026-03-18 后续任务清单（中文）]]
- [[2026-03-18 项目全量 Review（中文）]]
- [[2026-03-18-server-web-release-notes-cn]]
