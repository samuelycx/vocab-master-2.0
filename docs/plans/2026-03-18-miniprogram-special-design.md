---
title: 2026-03-18 小程序专项设计（中文）
aliases:
  - Miniprogram Special Design 2026-03-18
  - 小程序专项一期设计
tags:
  - design
  - miniprogram
  - cloud
  - auth
  - leaderboard
status: active
created: 2026-03-18
updated: 2026-03-19
---

# 2026-03-18 小程序专项设计（中文）

> [!abstract]
> 本设计用于把 `miniprogram` 从“本轮发布中暂不处理的遗留子系统”收口为一个可单独推进的小程序专项。
> 一期不直接同步 `web/server` 实现，而是围绕微信云开发架构完成四条主线的契约对齐与用户链路收口：登录 / 用户快照统一、资料保存与头像一致性、排行榜字段与展示语义统一、清理残留旧服务端假设。

## 背景与边界

- `server + web` 的任务 2-5 已在本仓库主线完成并推送，但当时已明确 **小程序不纳入同一批修复**。
- 小程序当前采用 **微信云开发**：前端通过 `wx.cloud.callFunction` 访问云函数，而不是直接复用 `server` 的 REST API。
- 小程序依赖存在双层环境：
  - 前端构建依赖位于 `miniprogram/package.json`
  - 云函数依赖位于 `miniprogram/src/static/cloudfunctions/*/package.json`，部署方式与 `web/server` 不同
- 本专项只处理一期主线，不把 PK / 实时对战重构、社交系统补完、后台管理补完混进来。

> [!info]
> 一期目标不是把小程序“做成和 Web 一模一样”，而是先让小程序自己的核心用户链路在云开发语境下稳定、可验证、可继续迭代。

> [!success]
> 2026-03-19 边界补充：`miniprogram` 的微信身份登录被正式定义为长期分化项。
> 也就是说，小程序允许以 `openid / 微信上下文` 作为主身份来源，而 `web/server` 不要求同步实现同一套登录入口。
> 需要持续对齐的是业务语义，不是平台身份方式。详见：[[2026-03-19-miniprogram-wechat-identity-boundary-design]]

## 当前事实

### 架构事实

- 小程序 API 入口已经是云函数模式：`miniprogram/src/api.js`
- PK 目前使用云数据库 `watch`，不是外部 WebSocket：`miniprogram/src/socket.js`
- 云函数 `auth.login` / `auth.updateProfile` 与 `progress.getLeaderboard` 已经各自独立维护用户视图数据：`miniprogram/src/static/cloudfunctions/auth/index.js`、`miniprogram/src/static/cloudfunctions/progress/index.js`

### 当前问题

1. **登录成功后拿到的是一份用户对象，但后续刷新和资料保存没有统一的用户快照契约**
   - `pages/index/index.vue` 登录后直接写 `Actions.setUser(res.data)`
   - `Settings.vue` 和 `ProfileSetup.vue` 又会手工拼接部分字段写回本地状态

2. **资料保存仍然存在“头像上传成功、资料写入失败、前端局部成功”的半成功风险**
   - `ProfileSetup.vue` 先上传头像，再调用 `API.updateProfile()`
   - `auth.updateProfile` 当前只返回 `{ success: true }`，没有返回最终用户快照，也没有显式处理旧头像和失败清理

3. **排行榜字段和展示语义没有完全收口**
   - `Leaderboard.vue` 期待 `avatar / username / level / xp / totalCorrect` 这一类展示字段
   - `progress.getLeaderboard` 当前只返回 `id / username / avatar / level / xp / rank`，语义不完整

4. **仍有残留的旧服务端假设**
   - 一些 API 保留了旧 REST 时代的形态或注释
   - 某些调用还沿用“前端自己拼用户对象”的做法，而不是以云函数返回的 canonical snapshot 为准
   - 依赖层面仍残留过时的 websocket 客户端包痕迹，但当前 PK 已不再依赖它们

## 为什么不直接同步 `web/server`

### 原因 1：接口边界不同

- `web/server` 走的是浏览器 multipart 上传 + NestJS + 本地文件系统 / 服务端事务回滚
- 小程序走的是 `wx.chooseAvatar` / `wx.cloud.uploadFile` / `wx.cloud.callFunction` / 云数据库
- 同样的问题（资料保存一致性）在两端的实现边界不同，不能直接复制代码

### 原因 2：运行时和部署模型不同

- `server` 可以依赖 Node 服务进程、数据库事务和本地磁盘清理
- 小程序云函数要考虑云存储 fileID、云数据库、云端依赖单独部署
- 强行物理复用 `web/server` 逻辑会把两边都变复杂

### 原因 3：共享代码成本高于收益

- 小程序前端是 ESM / uni-app，云函数是独立 CommonJS 包
- 为了少量契约字段去做跨运行时共享模块，会引入额外打包和部署复杂度
- 一期更合适的做法是：**保证契约一致，但不强求物理共享同一个 helper 文件**

> [!success] 设计结论
> 一期采用“**语义对齐，不做代码硬同步**”的方案：吸收 `web/server` 已验证的约束思想，但在小程序云开发边界内重新落实现。

## 一期主线设计

### 1. 登录 / 用户快照统一

**目标**
- 所有会改变用户状态的入口都返回同一语义的用户快照
- 前端只消费 canonical user snapshot，不再手工拼局部用户对象

**推荐做法**
- 在前端定义一份 `normalizeUserSnapshot(...)` 逻辑
- 在云函数 `auth` 内也定义一份等价的 `buildUserSnapshot(...)` 逻辑
- `auth.login`、`auth.updateProfile`、必要时 `progress.getStats` 返回的用户字段保持同一语义：
  - `id`
  - `openid`
  - `username`
  - `avatar`
  - `role`
  - `level`
  - `xp`
  - `coins`
  - `streak`
  - `totalCorrect`
  - `isProfileSet`

**约束**
- 前端状态更新以云函数返回值为准
- 不再在 `ProfileSetup.vue` / `Settings.vue` 中手工拼出“看起来像成功”的本地用户对象

### 2. 资料保存与头像上传一致性

**目标**
- 让用户视角上的“保存资料”成为一次完整事务式动作
- 即使底层仍然先上传文件、再写数据库，也要把失败清理和最终返回收口起来

**推荐做法**
- 保留小程序端先上传文件再调用云函数的物理事实，但把它封装进统一的 `API.updateProfile(...)` 流程
- `API.updateProfile(...)` 负责：
  1. 判断头像是本地临时路径、已存在的 `cloud://` 文件，还是默认头像
  2. 仅在必要时上传新头像
  3. 调用 `auth.updateProfile` 传递 `username`、新头像 fileID、旧头像引用
- `auth.updateProfile` 负责：
  1. 校验昵称
  2. 校验可接受的头像来源
  3. 数据库更新失败时删除刚上传的新头像
  4. 更新成功后删除旧的受管头像（仅限受管路径）
  5. 返回最终用户快照，而不是只返回 `success`

**设计取舍**
- 这不是数据库层面的严格原子事务，但对小程序当前架构已经足够接近“用户感知原子化”
- 比起把 `web/server` 的 multipart 接口硬搬过来，这条路径风险更低、实现更自然

### 3. 排行榜字段与头像展示语义统一

**目标**
- 排行榜始终消费同一套展示字段
- 头像支持 `cloud://` 与 `https://`，并且对默认头像 / 空头像有稳定回退

**推荐做法**
- `progress.getLeaderboard` 统一返回展示层真正需要的字段：
  - `id`
  - `displayName`（或 `username`，二选一后固定）
  - `avatar`
  - `level`
  - `xp`
  - `totalCorrect`
  - `rank`
  - `isProfileSet`
- `Leaderboard.vue` 只做展示，不再承担读字段修补逻辑
- 默认头像判断同时接受：
  - 空值
  - 默认占位 URL
  - 仅本地临时路径但未完成保存的值

**额外约束**
- 不在这一期顺手改积分算法
- 不把“排行榜清理虚拟账号”的 `server` 脚本直接搬进小程序；这里只做字段语义对齐

### 4. 清理残留旧服务端假设

**目标**
- 让小程序活在“云开发事实”里，而不是继续挂着一些旧 REST / websocket 时代的壳

**推荐做法**
- 清理 `api.js` 中仍带旧服务端语义的注释、参数和本地拼装逻辑
- 移除当前已不再使用的 websocket 客户端依赖痕迹
- 对暂时仍是 stub 的能力明确标注“未纳入本期”，避免假装已经对齐
- 保持 `socket.js` 的云数据库 `watch` 路线不变，不引入 `server` 的 socket 鉴权方案

> [!warning]
> 这里的“清理旧假设”只覆盖本期主线相关路径，不代表一次性把小程序所有 stub 能力都补完。

## 非目标

- 不把 `web` 端修复直接复制成小程序实现
- 不先动 PK / 实时对战鉴权重构
- 不补完 `searchUsers`、`followUser`、后台管理等所有 stub 功能
- 不重做小程序 UI 风格
- 不把云函数依赖部署流程重写成和 `server` 一样

## 验证策略

### 代码验证

- 为 canonical user snapshot、profile save 输入归一化、leaderboard row 归一化补纯逻辑测试
- 对 `auth/index.js`、`progress/index.js` 做语法级检查
- 对关键用户路径做一次本地 smoke checklist：
  1. 首次登录
  2. 首次设置昵称与头像
  3. 二次修改头像
  4. 设置页同步微信资料
  5. 排行榜显示头像与统计

### 手工验证

- 使用微信开发者工具验证 `cloud://` 头像的展示
- 验证资料保存失败时不会留下错误的本地成功状态
- 验证旧头像在成功替换后被清理（仅限受管路径）

## 与任务 2-5 和 release notes 的关系

- 本专项 **不重开** `server/web` 的任务 2-5，而是吸收其中已经被验证的设计原则：
  - 统一用户快照
  - 降低部分成功风险
  - 把旧环境假设清理干净
- 本专项应作为 **独立 release note** 记录，不混入 `[[2026-03-18-server-web-release-notes-cn]]`
- 与现有设计/计划文档的关系：
  - 上游来源：[[2026-03-18 后续任务清单（中文）]]
  - 并行修复背景：[[2026-03-18 任务 2-5 并行执行设计（中文）]]
  - 本文负责小程序一期的设计边界，后续实现步骤单独写 implementation plan

## 推荐执行方式

> [!tip]
> 推荐下一步直接进入 `subagent-driven-development` 风格执行：
> 先把 implementation plan 落成，再按“用户快照 / 资料保存 / 排行榜 / 旧假设清理”四条写入范围拆给独立 agent，并由主线程统一验收。
