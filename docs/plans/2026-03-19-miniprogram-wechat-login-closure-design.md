---
title: 2026-03-19 小程序微信身份登录闭环专项设计（中文）
aliases:
  - Miniprogram WeChat Login Closure Design 2026-03-19
  - 小程序微信登录闭环专项设计
tags:
  - design
  - miniprogram
  - wechat
  - auth
  - release
status: active
created: 2026-03-19
updated: 2026-03-19
---

# 2026-03-19 小程序微信身份登录闭环专项设计（中文）

> [!abstract]
> 本设计把 `miniprogram` 的下一阶段工作收敛为“微信身份登录闭环专项”。
> 它不再追求和 `web/server` 的身份入口一致，而是围绕小程序自己的微信云开发链路，完成 `openid` 获取、首次建档、资料补全、真机 / 体验版验收与 Git 留证的完整闭环。

## 背景与前提

- `miniprogram` 的微信身份体系已被正式定义为长期分化项，详见：[[2026-03-19-miniprogram-wechat-identity-boundary-design]]
- 一期大范围设计已经存在，详见：[[2026-03-18-miniprogram-special-design]]
- 当前仓库中与登录闭环直接相关的主链路已经具备基础代码：
  - 前端入口：`miniprogram/src/api.js`
  - 页面初始化：`miniprogram/src/pages/index/index.vue`
  - 设置页登录入口：`miniprogram/src/components/Settings.vue`
  - 首登资料补全：`miniprogram/src/components/ProfileSetup.vue`
  - 云函数身份入口：`miniprogram/src/static/cloudfunctions/auth/index.js`

> [!info]
> 当前真正缺失的，不是“完全没有做微信登录”，而是“没有把这条微信身份链路做成一个已经被专门验收、可重复发布、可明确留证的独立闭环”。

## 当前问题定义

### 1. 代码已有基础，但闭环责任还不够集中

- 自动登录、设置页手动登录、欢迎页登录分别存在入口，但登录后的状态写入、跳转和本地留存还没有被定义为同一条专项链路。
- 首次登录后是否进入 `profile-setup`、资料保存后如何回流到稳定状态，虽然已有实现，但还没有被单独当成“微信身份闭环验收项”。

### 2. 真正依赖微信运行时的能力尚未形成专项留证

- `openid` 是否稳定来自真实微信上下文，不能只靠 CLI 推断。
- 微信开发者工具、体验版、真机上的行为差异，必须进手工验收清单，而不是继续混在普通代码修复里。

### 3. 发布与同步语义仍需进一步收口

- 后续不应再把“Web 没有微信登录”视为同步失败。
- 小程序需要有自己独立的身份验收记录、发布步骤和结果留证。

## 方案对比

### 方案 A：只做“微信身份登录闭环专项”（推荐）

- 聚焦：
  - `openid` 获取
  - 首登建档
  - 二次登录恢复
  - 资料补全回流
  - 微信开发者工具 / 真机验收
  - Git SHA 留证
- 优点：
  - 范围最小，直接命中当前真实缺口
  - 与“身份层长期分化，业务层持续对齐”的边界一致
  - 不会把排行榜、PK、后台等非阻塞问题再混进来

### 方案 B：重开小程序一期 1-4 的全部内容

- 会重新覆盖用户快照、资料保存、排行榜字段、旧服务端假设清理。
- 缺点：
  - 当前仓库里这部分基础能力已经有相当比例落地
  - 容易重复劳动，也会稀释本次专项的主目标

### 方案 C：直接做微信开发者工具上传与云端验收，不补专项设计

- 优点是快。
- 缺点：
  - 后续仍然容易把“身份边界”和“同步缺口”混为一谈
  - 验收结论难沉淀成团队可复用的 runbook

> [!success] 设计结论
> 采用 **方案 A**：把当前阶段明确收敛为“小程序微信身份登录闭环专项”。

## 专项范围

### 本次纳入范围

- 登录入口统一视角：
  - 自动登录
  - 设置页手动登录
  - 欢迎页登录按钮
- `auth.login` 在真实微信上下文下的 `openid` 获取与用户建档
- 登录后 canonical user snapshot 的状态写入与页面跳转
- 首次资料补全与后续资料更新的身份闭环
- 微信开发者工具 / 体验版 / 真机的专项验收步骤
- Git SHA、云函数范围、验收结论的留证方式

### 本次不纳入范围

- `web/server` 身份模型改造
- PK / 实时对战鉴权重构
- 排行榜算法调整
- 社交系统与后台管理补完
- 把小程序做成和 Web 完全一致

## 设计原则

### 原则 1：身份层分化，业务层对齐

- 小程序继续以 `openid / 微信上下文` 为主身份来源。
- `web/server` 不要求补一套对应微信登录入口。
- 需要持续对齐的是用户资料、学习进度、排行榜语义等业务数据，而不是平台登录方式。

### 原则 2：先收口验收链路，再扩大功能范围

- 先证明这条链路在真实微信环境里可用。
- 再考虑是否需要进一步重构认证边界或扩展其他小程序能力。

### 原则 3：CLI 负责代码与留证，微信运行时负责最终真验收

- 本地 CLI 负责：
  - 代码改动
  - 本地测试 / 语法检查 / 构建
  - 文档、runbook、验收单
- 微信开发者工具 / 真机负责：
  - `openid` 真获取
  - 云函数真实调用
  - 体验版 / 真机完整用户路径验证

## 目标闭环

### 目标用户路径

1. 用户打开小程序
2. 前端触发 `API.login()`
3. 云函数 `auth.login` 从微信上下文读取 `OPENID`
4. 若首次登录：
   - 创建默认用户记录
   - 返回 canonical user snapshot
5. 前端统一写入登录状态、本地缓存和目标页面
6. 若 `isProfileSet === false`：
   - 进入 `profile-setup`
   - 用户完成昵称 / 头像设置
   - 再次得到 canonical user snapshot
7. 若是已存在用户：
   - 直接恢复用户状态
   - 进入主页面
8. 本次发布记录中写明：
   - Git SHA
   - 云函数范围
   - 微信开发者工具 / 真机验收结果

## 验收标准

### 本地预检

- `node --test miniprogram/tests/user-snapshot.test.mjs miniprogram/tests/profile-save.test.mjs miniprogram/tests/leaderboard-contract.test.mjs`
- `node --check miniprogram/src/api.js miniprogram/src/pages/index/index.vue miniprogram/src/components/Settings.vue miniprogram/src/components/ProfileSetup.vue`
- `node --check miniprogram/src/static/cloudfunctions/auth/index.js`
- `cd miniprogram && npm run release:verify`
- `cd miniprogram && npm run build:mp-weixin`

### 微信开发者工具 / 真机验收

- 首次登录可以真实获取 `openid`
- 首次登录可以创建用户记录，并返回用户快照
- 未补全资料的用户会稳定进入 `profile-setup`
- 资料补全成功后，状态会回流到已登录的稳定用户态
- 二次登录能够恢复已有用户，而不是重复建档
- 若出现 `MISSING_OPENID`、`DEVICE_MISMATCH` 等错误，提示与留证路径明确

### 发布留证

- 本次专项有独立验收单
- 验收单中记录目标 Git SHA
- 验收单中记录本次涉及的云函数部署范围
- 验收单中记录开发者工具 / 真机结论与阻塞项

## 风险与控制

### 风险 1：本地代码通过，但微信运行时仍失败

- 控制方式：把真机 / 体验版验收写成专项必过项，不用本地通过代替真实结论

### 风险 2：登录入口行为不一致

- 控制方式：把自动登录、设置页登录、欢迎页登录视为同一专项的一部分，统一状态写入和页面跳转语义

### 风险 3：发布后无法确认云端到底跑的是哪一版

- 控制方式：继续沿用 `release-manifest` + Git SHA 留证，并在专项验收单中记录云函数范围

## 交付物

- 新设计文档：`[[2026-03-19-miniprogram-wechat-login-closure-design]]`
- 新实现计划：`[[2026-03-19-miniprogram-wechat-login-closure-implementation]]`
- 更新后的运行说明与验收文档：
  - [[MINIPROGRAM_GIT_RELEASE_RUNBOOK]]
  - [[MINIPROGRAM_PHASE1_CLOUD_CHECKLIST]]
  - [[2026-03-19-sync-closure-and-miniprogram-kickoff-cn]]

> [!success]
> 这次专项的成功标准，不是“让小程序和 Web 身份完全一致”，而是“让小程序自己的微信身份链路成为一个可验证、可发布、可留证的独立产品闭环”。
