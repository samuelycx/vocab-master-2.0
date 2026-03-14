# Dashboard Versions

## Current entry
- `Dashboard.vue`
  - 当前正式使用版本
  - 中文优先的 control center 方案

## Rollback points
- `Dashboard.v1-stitch.vue`
  - 早期 Stitch 风格首页
  - 来源：历史 `Dashboard.vue.backup`

- `Dashboard.v2-control-center.vue`
  - 当前这轮中文优先重构版快照
  - 来源：当前 `Dashboard.vue`

## How to switch
- 如果要回退，不要直接手改大段代码。
- 用目标版本文件覆盖 `Dashboard.vue`，再执行一次 `npm run build:mp-weixin`。
