# Pencil Compare Boards Design

## Goal
在 `pencil-new.pen` 中为 9 个核心页面制作“现有版本 / 规划版本”上下对比画板。

## Source of Truth
现有版本严格以当前小程序 UI 文件的实际渲染结构为准，而不是旧概念稿或历史对比稿。

## Scope
- Dashboard
- Vocabulary
- Settings
- GameArena
- Result
- Leaderboard
- PKArena
- PK Battle
- AchievementWall

## Chosen Approach
采用接近 1:1 复刻：
- 保留当前 UI 的真实版式、文案层级、卡片关系、留白与顶部安全区
- 在 Pencil 中重画现有版本
- 规划版本保留现有 Concept V2/V3 作为优化方向

## Layout Rule
- 每个页面一个独立 Compare 画板
- 上半部分：现有版本（当前小程序）
- 下半部分：规划版本（下一轮优化）
- 底部增加一行规划重点说明
