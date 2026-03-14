# Pencil Compare Boards Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在 `pencil-new.pen` 中将 9 个核心页面的对比画板修正为“现有版本基于当前 UI 实际渲染、规划版本基于现有 Concept V2/V3”。

**Architecture:** 直接复用现有 Compare 画板作为容器，保留下半部分规划版本，重绘上半部分现有版本。布局统一为上下对比，并保留每页规划重点说明。所有修改只发生在 `pencil-new.pen` 中。

**Tech Stack:** Pencil MCP, `.pen` design document

---

### Task 1: 校验现有真实页面来源

**Files:**
- Modify: `/Users/samuelying/程序/02-项目/vocab-master-2.0/pencil-new.pen`
- Reference: `/Users/samuelying/程序/02-项目/vocab-master-2.0/client-uni/src/components/Dashboard.vue`
- Reference: `/Users/samuelying/程序/02-项目/vocab-master-2.0/client-uni/src/components/VocabularyList.vue`
- Reference: `/Users/samuelying/程序/02-项目/vocab-master-2.0/client-uni/src/components/Settings.vue`
- Reference: `/Users/samuelying/程序/02-项目/vocab-master-2.0/client-uni/src/components/GameArena.vue`
- Reference: `/Users/samuelying/程序/02-项目/vocab-master-2.0/client-uni/src/components/Result.vue`
- Reference: `/Users/samuelying/程序/02-项目/vocab-master-2.0/client-uni/src/components/SocialView.vue`
- Reference: `/Users/samuelying/程序/02-项目/vocab-master-2.0/client-uni/src/components/PKArena.vue`
- Reference: `/Users/samuelying/程序/02-项目/vocab-master-2.0/client-uni/src/components/AchievementWall.vue`

**Step 1: 读取组件模板与主要样式**
Run: `sed -n '1,340p' <component>`
Expected: 能识别头部、卡片、按钮、列表、状态区。

**Step 2: 映射到 Compare 画板**
Run: Pencil MCP `batch_get`
Expected: 明确每个 Compare 画板的上半部分现有版本容器。

### Task 2: 重绘现有版本

**Files:**
- Modify: `/Users/samuelying/程序/02-项目/vocab-master-2.0/pencil-new.pen`

**Step 1: 保留 Compare 容器与下半部分规划版本**
Expected: 不影响已存在规划版本。

**Step 2: 逐页重绘上半部分现有版本**
Expected: 9 张 Compare 画板的上半部分接近 1:1 反映当前小程序 UI。

**Step 3: 统一标签文字**
Expected: 上半部分为“现有版本（当前小程序）”，下半部分为“规划版本（下一轮优化）”。

### Task 3: 复核与截图校验

**Files:**
- Modify: `/Users/samuelying/程序/02-项目/vocab-master-2.0/pencil-new.pen`

**Step 1: 检查布局排布**
Run: Pencil MCP `snapshot_layout`
Expected: 9 张 Compare 画板整齐分布，无重叠。

**Step 2: 抽查关键画板内容**
Run: Pencil MCP `batch_get`
Expected: 现有版本与 UI 文件结构一致。
