# Web Achievement Icons Align Design

**Goal**

让 Web 端成就相关图标与小程序端使用同一套 SVG 资源，不再继续维护一份独立的 emoji 映射。

**Context**

- 小程序当前通过 [client-uni/src/utils/achievement-icons.js](/Users/samuelying/程序/02-项目/vocab-master-2.0/client-uni/src/utils/achievement-icons.js) 读取 `/static/achievements/*.svg`
- Web 当前在 [client/src/components/AchievementWall.vue](/Users/samuelying/程序/02-项目/vocab-master-2.0/client/src/components/AchievementWall.vue) 内部维护 emoji 映射
- 首页成就轨道和成就解锁弹窗也没有复用小程序图标资源

**Chosen Approach**

1. 将 `client-uni/src/static/achievements` 复制到 `client/public/static/achievements`
2. 在 Web 端新增与小程序职责一致的图标工具函数
3. 让成就墙、首页成就轨道、成就解锁弹窗统一改为使用 SVG

**Why This Approach**

- 与小程序图标资源完全一致
- 后续新增/替换成就图标时，Web 与小程序不会继续漂移
- 只改展示层，不影响后端返回结构和解锁逻辑

**Success Criteria**

1. 成就墙卡片图标为 SVG，不再是 emoji
2. 首页成就轨道使用对应成就 SVG
3. 成就解锁弹窗优先显示成就 SVG
4. Web 端缺失图标时回退到 `default.svg`
