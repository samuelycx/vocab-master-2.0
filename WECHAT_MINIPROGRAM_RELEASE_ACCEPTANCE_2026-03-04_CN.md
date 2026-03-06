# 微信小程序上线验收报告

- 项目：`vocab-master-2.0 / client-uni`
- 报告时间：`2026-03-04 18:37:07 CST`
- 验收范围：小程序端代码 + 云函数静态核验

## 1）自动化核验结果

### 1.1 语法检查
- 通过：`node --check client-uni/src/api.js`
- 通过：`node --check client-uni/src/socket.js`
- 通过：`node --check client-uni/src/static/cloudfunctions/auth/index.js`
- 通过：`node --check client-uni/src/static/cloudfunctions/words/index.js`
- 通过：`node --check client-uni/src/static/cloudfunctions/progress/index.js`
- 通过：`node --check client-uni/src/static/cloudfunctions/admin/index.js`

### 1.2 错误码统一
- 通过：关键错误码已覆盖：
  - `MISSING_OPENID`（auth/progress）
  - `UNKNOWN_TYPE`（auth/words/admin/progress）
  - `UNAUTHORIZED`（admin/progress）
  - `INVALID_WORD_ID`（progress）
  - `USER_BANNED`、`DEVICE_MISMATCH`（auth）
- 通过：前端 `callCloud` 已统一返回 `{ success, code, msg, data }`。

### 1.3 安全与数据鲁棒性（代码级）
- 通过：`auth.login` 拦截封禁用户。
- 通过：`progress.main` 拦截封禁用户。
- 通过：排行榜排除封禁用户。
- 通过：动态流排除封禁用户，且同用户同成就做去重。
- 通过：`words.searchWords` 已做正则转义与数量限制。
- 通过：`admin.toggleModule` 使用白名单键校验。
- 通过：成就写入前做 `openid + achievementId` 预检查，降低并发重复写入风险。

### 1.4 PK 稳定性（代码级）
- 通过：已实现过期房间清理（`waiting` 与 `ended`）。
- 通过：入队前自动执行清理。
- 通过：房间监听可处理“房间失效/不存在”场景。
- 通过：关键路径统一使用 `id || _id || openid` 兜底。

## 2）需人工确认项（云控制台/运行态）

以下项无法仅靠本地静态代码完全确认，发布前必须完成：

- 待确认：生产环境云函数已部署最新版：
  - `auth`、`words`、`progress`、`admin`、`initDatabase`
- 待确认：数据库索引已配置：
  - `progress(openid, wordId)`
  - `progress(openid, status, lastReviewedAt)`
  - `user_achievements(openid, achievementId)`
  - `user_achievements(unlockedAt)`
  - `pk_rooms(status, createdAt)`
  - `users(openid)`、`users(xp)`
- 待确认：微信云资源配额与告警：
  - 云函数调用配额
  - 数据库存储/查询配额
  - 错误率监控告警
- 待确认：真机冒烟回归：
  - 登录/新用户初始化
  - 学习/复习/错题流程
  - 在线 PK 全链路
  - 社交排行榜/动态展示

## 3）上线结论

- 结论：**有条件上线（Conditional GO）**
- 说明：
  - 代码层面已通过验收。
  - 当前剩余风险主要来自部署与运行态配置项。
- 发布闸门：
  - 完成第 2 节全部“待确认”项后，即可转为最终 `GO` 并上线。
