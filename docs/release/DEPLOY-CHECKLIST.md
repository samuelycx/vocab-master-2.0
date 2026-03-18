# 部署与同步防回归清单

本清单用于约束 Git 驱动发布，避免再次出现“源码已更新，但服务器运行态仍停留在旧目录/旧数据”的漂移。

## 1) 发布来源必须锁定到 Git SHA
- 发布前确认本地 `main`、`origin/main` 与目标 SHA 一致。
- 服务器发布必须以明确 SHA 执行，例如：`bash scripts/deploy-aliyun.sh --sha <commit-ish>`。
- 禁止用“当前目录内容”替代发布版本证据。

## 2) 服务器目录必须是 `repo + releases + shared + current`
- `repo/` 只负责获取 Git 源码。
- `releases/<sha>/` 只存不可变 release 快照。
- `current/` 只指向当前在线 release。
- `shared/` 统一承载运行态目录，默认根目录为 `/var/www/vocab-master/shared`。

## 3) 运行态必须彻底外置
- 生产环境变量文件：`/var/www/vocab-master/shared/env/server.env`
- SQLite：`DATABASE_URL="file:/var/www/vocab-master/shared/prisma/dev.db"`
- 上传文件：`/var/www/vocab-master/shared/uploads`
- 日志：`/var/www/vocab-master/shared/logs`
- 禁止在 release 目录中长期存放数据库、上传文件或日志。

## 4) 固定发布顺序（不可跳步）
1. 本地完成改动并推送到 `origin/main`
2. 记录待发布 SHA
3. 服务器执行 `bootstrap-git-release-layout.sh` / `deploy-from-git.sh`
4. 在 `current/` 下完成 build、migrate、seed
5. 通过 PM2 从 `current/server/ecosystem.config.cjs` 重启服务
6. 校验 `current/REVISION`、接口健康状态与静态资源访问

## 5) 验证项必须覆盖“源码 + 运行态”
- 确认 `current/REVISION` 与计划发布 SHA 一致。
- 确认 `DATABASE_URL` 指向 shared Prisma 目录。
- 确认头像上传和 `/uploads/*` 静态访问落在 shared uploads。
- 确认 PM2 日志落在 `shared/logs`，而不是 release 目录。

## 6) 过渡期禁令
- 不再使用“本地目录直接同步到服务器”的方式发布。
- 如需临时兼容旧流程，必须明确说明风险和回退方案。
- 小程序发布虽然仍走云开发，但同样必须记录对应 Git SHA。
