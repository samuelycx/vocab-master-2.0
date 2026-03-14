# Vocab Master Web 完整在线版设计

**目标**

基于当前小程序版本，建设一个可部署在自有服务器上的完整在线网页版，覆盖账号密码登录、学习、复习、错题、词表、排行榜、成就、人机对战和在线 PK，并将后端能力统一收口到现有 `server` 服务中。

**现状**

- 小程序前端位于 `client-uni`，大量依赖 `uni` API、微信云函数和小程序运行时。
- 现有服务端位于 `server`，使用 NestJS，已经具备认证、进度、单词、社交、PK、管理等模块。
- 现有 Web 前端位于 `client`，使用 Vue 3 + Vite，适合作为网页版主入口。
- `server` 已经具备托管 `client/dist` 的静态资源能力。

**设计结论**

采用“`client` 作为 Web 前端主工程，`server` 作为唯一在线后端”的方案。小程序云函数链路不再作为 Web 主链路，后续若继续维护小程序，也应逐步迁移到同一套服务端接口。

## 一、架构设计

**前端**

- 使用 `client` 作为网页版主应用。
- 技术栈保持 `Vue 3 + Vite + socket.io-client`。
- 不直接复用 `client-uni` 的运行时 API，但复用其玩法逻辑、状态结构、文案和页面信息架构。

**后端**

- 使用 `server` 作为统一后端。
- 认证从“微信 openid”切换为“账号密码 + token/session”。
- 学习、复习、错题、排行榜、成就、PK 统一通过 NestJS API 和 WebSocket 提供。

**部署**

- 服务器只需要运行一个 NestJS 服务。
- 前端打包结果输出到 `client/dist`，由 `server` 静态托管。
- 数据存储统一使用服务器数据库，不再依赖微信云开发。

## 二、账号体系设计

**首发登录方式**

- 账号密码登录
- 注册
- 退出登录
- 获取当前用户

**用户模型**

建议统一为数据库主键 `id` 驱动：

- `id`
- `username`
- `passwordHash`
- `avatar`
- `level`
- `xp`
- `coins`
- `streak`
- `totalCorrect`
- `totalLearned`
- `maxCombo`
- `role`
- `createdAt`
- `updatedAt`

`openid` 不再作为 Web 端的身份主键。若未来需要支持微信扫码登录，可作为可选绑定字段追加。

## 三、业务模块设计

**1. 学习模块**

- 首页发起 30 词学习挑战
- 拉取随机题目
- 题目展示单词、例句挖空、选项
- 提交结果后同步经验、金币、掌握状态

**2. 复习 / 错题**

- 根据用户历史进度拉取复习队列
- 错题模式按错误次数或学习状态聚合

**3. 成就系统**

- 保留现有成就体系
- 成就与用户通过 `userId` 关联
- 隐藏成就未解锁时不展示

**4. 排行榜**

- 根据 XP、词汇量或总正确数输出榜单

**5. PK 模式**

- 人机对战沿用前端本地会话逻辑
- 在线 PK 由 `server` 的 websocket 网关负责匹配、下发题目和同步比分

## 四、前端页面设计

首发页面建议：

- `/login`
- `/register`
- `/dashboard`
- `/learn`
- `/review`
- `/mistakes`
- `/vocabulary`
- `/achievements`
- `/leaderboard`
- `/pk`
- `/settings`

页面信息结构尽量延续小程序版本，降低迁移成本和认知差异。

## 五、前后端接口设计

建议的后端模块边界：

- `AuthModule`
  - `POST /auth/register`
  - `POST /auth/login`
  - `GET /auth/me`
  - `POST /auth/logout`

- `WordModule`
  - `GET /words/session`
  - `GET /words/search`
  - `GET /words/:id`

- `ProgressModule`
  - `POST /progress/sync`
  - `GET /progress/stats`
  - `GET /progress/reviews`
  - `GET /progress/mistakes`
  - `GET /progress/learned`
  - `POST /progress/reset`

- `SocialModule`
  - `GET /leaderboard`
  - `GET /social/feed`

- `PkModule`
  - websocket 匹配
  - websocket 发题
  - websocket 分数同步
  - websocket 断线与结算

## 六、迁移策略

推荐采用“后端先稳定、前端分阶段接入”的策略：

**阶段 1**

- 补齐账号密码认证
- 把基于 openid 的用户与进度逻辑迁移为 `userId`
- 提供 Web 可用 API

**阶段 2**

- 在 `client` 中搭建登录、首页、学习、复习、词表主链路

**阶段 3**

- 接入排行榜、成就、设置页

**阶段 4**

- 接入 PK 页面和在线匹配

## 七、风险与约束

**主要风险**

- 现有小程序逻辑有部分耦合 `uni` 和微信云函数，需要在迁移时做边界剥离。
- 用户标识从 `openid` 切换为 `userId` 后，历史数据要做兼容或迁移。
- 在线 PK 需要验证 WebSocket 房间、重连和掉线结算逻辑。

**控制策略**

- 不复用小程序运行时 API，只复用玩法逻辑和文案。
- 后端先建立稳定的 Web API，再接前端。
- 每个模块先完成最小闭环，再继续扩展。

## 八、首发成功标准

满足以下条件即可认为 Web 首发可上线：

- 用户可以注册、登录、退出
- 用户可以正常开始学习、复习、错题回顾
- 用户经验、金币、等级、成就正确持久化
- 词表、排行榜可查看
- 人机对战可玩
- 在线 PK 可匹配并完成对局
- 服务端可以在自有服务器稳定运行并托管前端页面
