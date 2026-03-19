---
title: 2026-03-19 复习逻辑对齐专项设计（中文）
aliases:
  - Review Logic Alignment Design 2026-03-19
  - 复习逻辑修复设计
tags:
  - design
  - review
  - srs
  - miniprogram
  - server
status: active
created: 2026-03-19
updated: 2026-03-19
---

# 2026-03-19 复习逻辑对齐专项设计（中文）

> [!abstract]
> 本专项用于把当前已经偏离设计的“单词复习逻辑”重新拉回到既定规则上。修复范围聚焦在 `miniprogram` 主链路和 `server` 残留 bug，不顺手扩成一次全平台大重构。

## 背景

- 复习逻辑的最新设计基准已经明确写在 `[[2026-03-14-review-srs-design]]`。
- 该设计定义了固定阶梯复习、混合复习池、随机顺序、单次 30 词上限，以及 Dashboard 显示总待复习数的语义。
- 当前实现中，`web/server` 已部分靠近该设计，但 `miniprogram` 仍停留在旧逻辑；同时 `server` 自身还保留一个会让复习池长期滞留的错误状态生命周期。

> [!warning]
> 这不是“界面展示错误”或“单个接口取错字段”的问题，而是复习状态模型、候选池筛选、session 入口、计数展示四层同时偏离设计。

## 已确认的设计基准

基于 `docs/plans/2026-03-14-review-srs-design.md:1`，本次修复必须重新对齐以下规则：

1. 复习候选池 = `mistakeCount > 0` + `nextReview <= now`，按词去重。
2. 复习 session 顺序随机，不做优先级排序。
3. 单次复习 session 最多返回 30 个词。
4. Dashboard 展示的是总待复习数，不是当前 session 长度。
5. 固定阶梯复习为：`10min -> 1d -> 3d -> 7d -> 15d -> 30d -> 60d -> 120d`。
6. 学习阶段答错：进入复习池，`reviewStage=0`，`nextReview=now+10min`。
7. 复习阶段答对：推进 `reviewStage`，并按对应阶梯写入下一次复习时间。
8. 复习阶段答错：重置到 `reviewStage=0`，并重新进入 10 分钟后复习。

## 当前问题归因

### 小程序端问题

- 云函数 `progress.syncProgress()` 只维护了 `status / repetition / mistakeCount / lastReviewedAt`，没有实现 `reviewStage / nextReview`，见 `miniprogram/src/static/cloudfunctions/progress/index.js:331`。
- 云函数 `progress.getReviews()` 只是按 `lastReviewedAt` 升序取前 20 条，不是“错题 + 到期复习”的混合复习池，见 `miniprogram/src/static/cloudfunctions/progress/index.js:539`。
- 小程序 Dashboard 直接把 `getReviews()` 返回数组长度当作待复习数，见 `miniprogram/src/components/Dashboard.vue:138`。
- 小程序复习入口直接用 `getReviews()` 开 session，而不是一个“专门返回 30 个随机复习词”的 session 接口，见 `miniprogram/src/api.js:77`、`miniprogram/src/engine.js:78`。

### Server 端问题

- `server` 已具备固定阶梯和 mixed pool 基本能力，但 `mistakeCount` 目前只累加、不回落，见 `server/src/progress/progress.service.ts:42`。
- 同时 mixed pool 条件仍是 `mistakeCount > 0 OR nextReview <= now`，见 `server/src/progress/progress.service.ts:330`。
- 结果是：一个词一旦错过一次，即便后续复习正确，也可能因为 `mistakeCount` 永远大于 0 而长期滞留在复习池中，无法真正“清空待复习”。

> [!info]
> `web` 前端本身已经比较接近设计：Dashboard 已单独取总数，review 入口也已走独立 session 接口。因此本次不把 `web` 当成主要修复对象，只在需要时做契约微调。

## 方案对比

### 方案 A：只修小程序前端调用

- 把 Dashboard 和 Engine 改成新接口形态，但暂时不改小程序云函数状态模型，也不修 `server`。
- 优点：改动小，表面链路能快点通。
- 缺点：根因不解决；小程序仍无法表达 `reviewStage / nextReview`；`server` 的复习池滞留问题继续存在。

### 方案 B：推荐，做“复习逻辑对齐专项”

- 同时修正：
  - 小程序云函数的复习状态模型
  - 小程序的待复习总数接口与 review session 接口
  - 小程序 Dashboard / Engine 对新契约的消费
  - `server` 的 `mistakeCount` 生命周期
  - 对应测试，锁定规则
- 优点：范围收敛，但能真正回到历史设计；后续小程序专项可以继续建立在正确的复习语义上。
- 缺点：涉及 `miniprogram + server` 两侧，需要更严格测试。

### 方案 C：直接做跨端统一 SRS 重构

- 尝试把 `web/server/miniprogram` 的复习逻辑抽成更统一的共享模块或同构规则层。
- 优点：最彻底。
- 缺点：超出当前问题边界，会把云开发和 REST 运行时差异一起拉进来，风险不成比例。

> [!success] 设计结论
> 采用方案 B：做一个收敛范围的“复习逻辑对齐专项”。

## 目标与边界

### 本次必须完成

1. 小程序 `progress` 云函数补齐 `reviewStage / nextReview` 数据语义。
2. 小程序复习链路拆成两个独立能力：
   - `reviewCount`：返回总待复习数
   - `reviewSession`：返回最多 30 个随机复习词
3. 小程序 Dashboard 改为显示总待复习数。
4. 小程序 Engine 改为使用 review session 接口。
5. `server` 修复 `mistakeCount` 生命周期，避免词条永久滞留复习池。
6. 为 fixed-step 规则、mixed pool 规则、session 上限与客户端契约补自动化测试。

### 本次不做

- 不顺手重构整个小程序学习模式或错题本模式。
- 不重做 `web` UI。
- 不把小程序改造成直接调用 `server` REST API。
- 不处理微信登录长期分化项；该边界已在 `[[2026-03-19-miniprogram-wechat-identity-boundary-design]]` 中单独定义。

## 目标架构

### 1. 复习状态模型

- `studyRecord / progress` 继续作为单词级进度唯一事实来源。
- 在小程序云数据库记录中补齐：
  - `reviewStage`
  - `nextReview`
- 保留现有字段以兼容旧数据：
  - `status`
  - `mistakeCount`
  - `repetition`
  - `lastReviewedAt`

### 2. 候选池语义

- 候选池筛选条件统一为：
  - `mistakeCount > 0`
  - 或 `nextReview <= now`
- 同一词只出现一次。
- session 生成逻辑先取完整候选池，再随机打乱，最后截断到 30。

### 3. 计数与 session 分离

- “待复习数量”与“开始复习 session”是两个不同接口，不共享同一返回载荷。
- Dashboard 只依赖 count 接口。
- Arena / Engine 只依赖 session 接口。

### 4. 错误答案的状态回写

- 学习阶段答错：
  - `mistakeCount` 进入待复习语义
  - `reviewStage=0`
  - `nextReview=now+10min`
- 复习阶段答对：
  - 推进 `reviewStage`
  - 如果该词不再需要作为“错题滞留”，则 `mistakeCount` 应回落，避免永久卡在池里
- 复习阶段答错：
  - `reviewStage=0`
  - `nextReview=now+10min`
  - `mistakeCount` 保持待复习语义

> [!note]
> 本设计不要求把 `mistakeCount` 完全改造成统计字段；但它至少不能继续承担“永远把词留在池里”的副作用。

## 兼容策略

### 旧数据兼容

- 对于没有 `reviewStage` 的旧记录，默认视为 `0`。
- 对于没有 `nextReview` 的旧记录：
  - 若 `mistakeCount > 0`，视为待复习并在首次状态回写时补齐 `nextReview`
  - 若只是旧学习记录但无待复习语义，不强制立即迁移

### 客户端兼容

- 保留旧 `getReviews()` 名称会继续制造歧义，因此推荐在小程序 API 层显式拆成：
  - `getReviewCount()`
  - `getReviewSession()`
- 如需平滑迁移，可先让旧方法内部转发到新语义，再逐步清理调用点。

## 测试与验证

### 自动化测试

- 小程序纯逻辑测试：
  - 固定阶梯推进
  - mixed pool 判定
  - 随机 session 截断到 30
  - Dashboard count 与 review session 分离契约
- Server 单测：
  - `mistakeCount` 在复习正确后不再导致永久滞留
  - `getReviewPoolCount()` 与 `getReviewSessionWords()` 的候选池条件一致

### 手工验证

1. 新学单词答错后，10 分钟后进入待复习。
2. Dashboard 待复习数可以大于 30，但一次进入 session 最多 30 个词。
3. 某词在复习中连续答对若干次后，可以逐步退出当前待复习池。
4. 小程序和 web 的“待复习数 / 开始复习”语义一致。

## 风险与取舍

- **风险 1：云数据库旧数据缺字段。**
  - 通过默认值与懒迁移处理，而不是一次性全量迁移。
- **风险 2：小程序云函数与前端同时改接口，容易出现半更新。**
  - 通过先加新接口、再切前端调用、最后删旧路径来降低风险。
- **风险 3：server 改 `mistakeCount` 可能影响既有错题本语义。**
  - 通过测试明确“错题统计”和“待复习滞留”要分开看；必要时保留错题本单独统计入口。

## 推荐执行顺序

1. 先补测试，锁定固定阶梯与 mixed pool 语义。
2. 再修小程序云函数的状态写入与 session / count 接口。
3. 接着切小程序 Dashboard / Engine 到新契约。
4. 最后修 server 的 `mistakeCount` 生命周期，并跑回归测试。

## 与已有文档的关系

- 设计基准来源：[[2026-03-14-review-srs-design]]
- 历史产品背景：`miniprogram/PRODUCT_DESIGN_DOC.md`
- 小程序长期边界：[[2026-03-19-miniprogram-wechat-identity-boundary-design]]

> [!tip]
> 下一步直接进入 implementation plan，把修复拆成可并行但边界清晰的 4 个任务：规则与测试、小程序云函数、小程序客户端、server 生命周期修复。
