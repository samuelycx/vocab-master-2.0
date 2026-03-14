# UI Polish Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 按用户确认的 P1/P2/P3 清单，直接优化小程序核心页面的 UI 层级、间距、字重和状态表达。

**Architecture:** 仅修改现有 Vue 组件的模板与样式，不改动核心业务流。优先收紧布局、提升信息层级、统一头部节奏，并修正容易造成误解的状态文案与空态表达。

**Tech Stack:** Vue 3 SFC, uni-app, scoped CSS

---

### Task 1: Dashboard / Achievement / PK 结构优化

**Files:**
- Modify: `/Users/samuelying/程序/02-项目/vocab-master-2.0/client-uni/src/components/Dashboard.vue`
- Modify: `/Users/samuelying/程序/02-项目/vocab-master-2.0/client-uni/src/components/AchievementWall.vue`
- Modify: `/Users/samuelying/程序/02-项目/vocab-master-2.0/client-uni/src/components/PKArena.vue`
- Modify: `/Users/samuelying/程序/02-项目/vocab-master-2.0/client-uni/src/components/GameArena.vue`

**Step 1:** 调整 Dashboard 顶部任务卡右侧重心和成就墙层级。
**Step 2:** 调整 AchievementWall 的卡片明暗层级、节奏差和中英混排权重。
**Step 3:** 收紧 PKArena / PKBattle / GameArena 的头部与上半区留白，统一基线。

### Task 2: Vocabulary / Settings / Social 质感优化

**Files:**
- Modify: `/Users/samuelying/程序/02-项目/vocab-master-2.0/client-uni/src/components/VocabularyList.vue`
- Modify: `/Users/samuelying/程序/02-项目/vocab-master-2.0/client-uni/src/components/Settings.vue`
- Modify: `/Users/samuelying/程序/02-项目/vocab-master-2.0/client-uni/src/components/SocialView.vue`

**Step 1:** 降低词卡重复感，优化标签、分隔线和掌握度条。
**Step 2:** 强化 Settings 顶部身份卡与底部危险操作层级。
**Step 3:** 修复排行榜 `?` 状态，统一 tab 与次级文字字重。

### Task 3: 构建验证

**Files:**
- Verify: `/Users/samuelying/程序/02-项目/vocab-master-2.0/client-uni/dist/build/mp-weixin`

**Step 1:** 运行微信小程序构建。
**Step 2:** 核对构建成功且产物刷新。
