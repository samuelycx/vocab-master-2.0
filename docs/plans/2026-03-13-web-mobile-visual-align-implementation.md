# Web Mobile Visual Align Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 让网页版在手机端的首页、学习页、设置页快速贴近微信小程序当前视觉，同时保持现有功能主链路稳定。

**Architecture:** 以现有 Vue 单页结构为基础，不重写状态流和接口层。实现方式以组件模板微调和样式 token 调整为主，配合少量前端烟雾测试，确保登录、开始学习、设置动作不回归。

**Tech Stack:** Vue 3、Vite、Vitest、现有 `client/src/style.css` 主题变量体系

---

### Task 1: 补充手机端壳层测试

**Files:**
- Modify: `client/src/App.spec.js`
- Test: `client/src/App.spec.js`

**Step 1: 写失败测试**

补一条断言，确认登录态下 `App` 仍然会渲染主页面容器和底部导航开关逻辑，不因视觉调整破坏壳层。

**Step 2: 运行测试确认失败或覆盖不足**

Run:

```bash
cd /Users/samuelying/程序/02-项目/vocab-master-2.0/client
npm test -- src/App.spec.js
```

**Step 3: 最小实现**

如果测试确实暴露问题，再对 `App.vue` 做最小修复；否则保持实现不动。

**Step 4: 再跑测试**

Run:

```bash
npm test -- src/App.spec.js
```

**Step 5: 暂不提交**

按用户要求，本轮不做 git 提交。

### Task 2: 首页手机端视觉还原

**Files:**
- Modify: `client/src/components/Dashboard.vue`
- Modify: `client/src/style.css`
- Test: `client/src/components/Dashboard.spec.js`

**Step 1: 写或扩充失败测试**

在 `Dashboard.spec.js` 中补充断言，锁住：
- `开始学习` 入口仍可点击
- `getStats()` / `getReviews()` 仍在挂载时调用

**Step 2: 运行测试确认基线**

Run:

```bash
npm test -- src/components/Dashboard.spec.js
```

**Step 3: 写最小实现**

在 `Dashboard.vue` 中：
- 改为更接近小程序的单列手机布局
- 调整 Hero 卡、统计卡、主按钮、次级卡片和成就入口
- 控制移动端宽度、留白、圆角、阴影

在 `style.css` 中：
- 抽出首页所需的手机端卡片 token 和按钮样式

**Step 4: 运行测试**

Run:

```bash
npm test -- src/components/Dashboard.spec.js
```

**Step 5: 本地手动预览**

通过 Vite 预览首页手机宽度效果。

### Task 3: 学习页手机端视觉还原

**Files:**
- Modify: `client/src/components/GameArena.vue`
- Modify: `client/src/style.css`
- Test: `client/src/engine-web-api.spec.js`

**Step 1: 写失败测试**

确认：
- 学习页启动后仍进入 `arena`
- 当前单词和选项仍正常展示逻辑

**Step 2: 运行测试确认基线**

Run:

```bash
npm test -- src/engine-web-api.spec.js
```

**Step 3: 写最小实现**

在 `GameArena.vue` 中：
- 重构顶部进度区为小程序式布局
- 调整单词卡比例、选项按钮样式、底部操作区节奏
- 降低桌面 hover 感，强化手机端按压感
- 保持音频、答题、自动推进逻辑不变

在 `style.css` 中补充学习页共用样式。

**Step 4: 再跑测试**

Run:

```bash
npm test -- src/engine-web-api.spec.js
```

**Step 5: 本地手动预览**

用手机宽度看学习页视觉和可读性。

### Task 4: 设置页手机端视觉还原

**Files:**
- Modify: `client/src/components/Settings.vue`
- Modify: `client/src/style.css`
- Test: `client/src/components/Settings.spec.js`

**Step 1: 写失败测试**

锁住：
- `退出登录`
- `重置学习进度`
- 返回首页

**Step 2: 运行测试确认基线**

Run:

```bash
npm test -- src/components/Settings.spec.js
```

**Step 3: 写最小实现**

在 `Settings.vue` 中：
- 还原更接近小程序的标题区、用户卡、设置列表和危险区
- 让布局更适合手机纵向滚动
- 保留后台入口，但降低其视觉权重

**Step 4: 再跑测试**

Run:

```bash
npm test -- src/components/Settings.spec.js
```

**Step 5: 本地手动预览**

检查手机宽度下设置页的分组和滚动节奏。

### Task 5: 统一手机端视觉 token

**Files:**
- Modify: `client/src/style.css`
- Modify: `client/src/App.vue`

**Step 1: 先检查现有变量**

梳理：
- 背景色
- 表面色
- 主按钮色
- 阴影
- 圆角
- 页面最大宽度

**Step 2: 写最小实现**

在 `style.css` 中：
- 增加手机端页面容器规则
- 增加小程序式卡片和按钮类
- 统一三个页面使用的留白与圆角尺度

在 `App.vue` 中：
- 如有必要，收紧底部导航与页面容器间距

**Step 3: 运行全量前端测试**

Run:

```bash
npm test -- src/App.spec.js src/auth-session.spec.js src/components/AuthView.spec.js src/engine-web-api.spec.js src/components/Dashboard.spec.js src/socket.spec.js src/components/Settings.spec.js src/components/VocabularyList.spec.js src/components/SocialView.spec.js src/api.spec.js
```

**Step 4: 运行 build**

Run:

```bash
npm run build
```

### Task 6: 手动烟雾验证

**Files:**
- No code change expected

**Step 1: 本地打开页面**

检查：
- 登录页
- 首页
- 学习页
- 设置页

**Step 2: 验证关键操作**

验证：
- 登录成功进入首页
- 首页点击开始学习可进入学习页
- 学习页答题不报错
- 设置页退出登录有效
- 设置页重置进度按钮仍可触发

**Step 3: 记录剩余视觉差异**

整理第二轮候选项：
- PK 页还原
- 成就墙还原
- 词表页还原

**Step 4: 暂不提交**

按用户要求，本轮仍不做 git 提交或推送。

