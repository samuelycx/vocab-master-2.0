# Leaderboard Cleanup Runbook

## 目的

本 runbook 用于清理排行榜中的虚拟账号/演示账号，同时满足下面几个约束：

- 不能根据启发式规则直接删库
- 必须先导出候选名单并人工复核
- 必须先做数据库备份，再执行真实删除
- 必须保留 manifest、备份路径、执行时间和影响范围，便于回滚与审计

## 工具文件

- 导出候选：`server/scripts/export-leaderboard-cleanup.ts`
- dry-run / 执行：`server/scripts/apply-leaderboard-cleanup.ts`
- 核心规则：`server/src/progress/leaderboard-cleanup.ts`

## 执行原则

1. 候选账号只能来自导出报告，不能现场拍脑袋输入用户 ID。
2. 真正删除只能依据人工批准过的 manifest。
3. 没有备份文件，不允许执行 `--apply`。
4. 默认使用 `--dry-run`，只有在人工复核和备份完成后才允许 `--apply`。

## 第 1 步：导出候选名单

在 `server/` 目录执行：

```bash
npx ts-node scripts/export-leaderboard-cleanup.ts \
  --database ./prisma/dev.db \
  --output ./artifacts/leaderboard-cleanup/report.json \
  --manifest-output ./artifacts/leaderboard-cleanup/manifest-template.json \
  --limit 200
```

导出结果包含两部分：

- `report.json`：候选账号、命中原因、分数、推荐备份命令
- `manifest-template.json`：待人工复核的模板文件，默认是 `PENDING`

## 第 2 步：人工复核 manifest

打开 `manifest-template.json`，逐条复核候选账号：

- 确认是否为虚拟账号、演示账号或测试账号
- 不确定的账号改为 `KEEP`
- 确认需要删除的账号改为 `DELETE`
- 填写 `note`
- 在 `approvals` 中补充复核人和批准时间

执行前 manifest 至少要满足：

- `backupReference.path` 已填写
- `backupReference.createdAt` 已填写
- `approvals` 至少 1 条
- 至少 1 条 `DELETE`

建议把人工批准后的文件另存为：

- `./artifacts/leaderboard-cleanup/manifest-approved.json`

## 第 3 步：先做数据库备份

先执行导出报告里的推荐命令，或手动执行：

```bash
sqlite3 "./prisma/dev.db" ".backup './artifacts/leaderboard-cleanup/leaderboard-cleanup-backup.sqlite'"
```

然后做两项确认：

1. 备份文件存在，且大小明显大于 0
2. 在 manifest 中填入同一个备份文件路径和创建时间

## 第 4 步：先跑 dry-run

```bash
npx ts-node scripts/apply-leaderboard-cleanup.ts \
  --database ./prisma/dev.db \
  --manifest ./artifacts/leaderboard-cleanup/manifest-approved.json \
  --dry-run
```

重点检查输出里的三部分：

- `summary.users`：待删除账号列表是否正确
- `summary.totals`：关联 `StudyRecord` / `UserAchievement` / `Follow` / `MatchParticipant` 数量是否符合预期
- `plan.operations`：删除顺序是否正确，最后一步才是 `User`

如果 dry-run 有任何异常，不要执行 `--apply`。

## 第 5 步：执行真实清理

仅在下面条件都满足时执行：

- manifest 已人工批准
- 数据库备份已完成并核对
- dry-run 输出已人工确认

执行命令：

```bash
npx ts-node scripts/apply-leaderboard-cleanup.ts \
  --database ./prisma/dev.db \
  --manifest ./artifacts/leaderboard-cleanup/manifest-approved.json \
  --apply
```

脚本会先检查 manifest，再检查备份文件是否存在，然后按固定顺序删除：

1. `UserAchievement`
2. `StudyRecord`
3. `Follow`
4. `MatchParticipant`
5. `User`

## 第 6 步：执行后复核

执行后建议立刻做以下复核：

1. 再次请求排行榜接口，确认虚拟账号已消失
2. 抽样检查保留用户是否未被误删
3. 保存本次执行输出，连同 manifest 一起归档

建议至少归档以下文件：

- `report.json`
- `manifest-approved.json`
- 备份文件路径
- `--dry-run` 输出
- `--apply` 输出

## 回滚流程

如果发现误删或影响超出预期，不要继续二次操作，直接按备份回滚：

1. 停止当前服务写入
2. 保留事故现场的当前数据库副本
3. 用清理前备份覆盖当前数据库
4. 重启服务
5. 再次核对排行榜和相关用户数据

示例：

```bash
cp ./artifacts/leaderboard-cleanup/leaderboard-cleanup-backup.sqlite ./prisma/dev.db
```

如果生产环境不是单机 SQLite，而是别的部署形式，则把同样的思路迁移到对应数据库备份/恢复机制里；不要直接照搬本地命令。

## 风险提醒

- 启发式规则只能用于“提名候选”，不能用于“直接删除”
- manifest 是唯一允许驱动真实删除的输入
- 真实线上清理建议由主线程统一执行，不在并行开发阶段直接操作
