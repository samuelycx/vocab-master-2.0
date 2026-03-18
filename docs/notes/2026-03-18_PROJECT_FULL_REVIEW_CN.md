---
title: 2026-03-18 项目全量 Review（中文）
aliases:
  - 项目全量 Review 中文版
  - Full Project Review CN
tags:
  - review
  - project
  - security
  - backend
  - frontend
status: active
created: 2026-03-18
---

# 2026-03-18 项目全量 Review（中文）

> [!abstract]
> 本次 review 覆盖当前仓库整体状态，而不是仅检查当前工作区改动。
> 范围包括 `server`、`web`、`miniprogram`、`scripts`、部署脚本以及仓库密钥卫生。

> [!note] 范围澄清
> 小程序当前采用云开发模式，相关依赖安装与运行环境在云端。
> 同时，`web` 端的部分改动尚未同步到小程序，因此小程序不应被视为本轮修复工作的组成部分。
> 本次修复范围以 `server`、`web`、部署脚本与仓库安全卫生为主；`miniprogram` 作为后续独立项目单独推进。

> [!danger] 结论
> 当前项目 **不适合直接按生产可用状态合并或发布**。
> 若以 **本次修复范围（`server + web + 部署`）** 来看，当前仍 **不适合直接按生产可用状态合并或发布**。
> 主要阻塞点集中在：未鉴权的管理接口、SQL 注入风险、PK 身份伪造、仓库内敏感密钥暴露，以及上传文件安全边界不足。

## Review 范围

- 后端：NestJS + Prisma + SQLite
- Web 前端：Vue 3 + Vite
- 小程序端：uni-app / cloud functions 适配层（本次只做背景记录，不纳入本轮修复）
- 运维与发布：部署脚本、环境变量、静态资源暴露
- 验证链路：单测、构建、e2e 可执行性

## 主要问题

### Critical

#### 1. 管理接口完全未做鉴权，而且用户列表会直接暴露敏感字段

- 文件：`server/src/admin/admin.controller.ts:5`
- 文件：`server/src/admin/admin.service.ts:26`
- 文件：`server/prisma/schema.prisma:13`
- 问题：
  当前 `/admin` 下的建词、导词、删词、封禁用户、切模块等接口没有任何登录校验或管理员权限校验。
  同时 `getUsers()` 直接 `findMany()` 返回完整用户对象，会把 `passwordHash`、`sessionToken`、`sessionExpiresAt` 一并暴露出去。
- 影响：
  任何能访问后端的人都可能直接读取用户敏感信息，甚至执行管理操作，属于高危安全问题。
- 修复方向：
  为整个 `AdminController` 增加认证与管理员角色校验；返回用户列表时只保留安全字段 DTO。

#### 2. `/words/session` 存在 SQL 注入风险

- 文件：`server/src/word/word.service.ts:9`
- 问题：
  `category` 直接通过字符串拼接进入 `$queryRawUnsafe(...)`。
- 影响：
  这是公开 GET 接口，攻击者可以构造恶意查询参数，带来数据泄露或数据库破坏风险。
- 修复方向：
  改为 Prisma `findMany`，或使用参数化查询，禁止拼接原始 SQL。

#### 3. PK 对战仍可在无 token 情况下伪造身份

- 文件：`server/src/pk/pk.service.ts:39`
- 文件：`server/src/pk/pk.service.ts:60`
- 问题：
  如果没有 token，服务端会退回到信任客户端传入的 `id`、`username`、`avatar`。
- 影响：
  自定义客户端可以伪造任意用户进入 PK，对战结果还可能被写回数据库，属于身份冒充问题。
- 修复方向：
  PK 入口统一强制鉴权；未登录玩家只能作为匿名玩家存在，且不得落库。

#### 4. 项目目录中存在真实 Google Service Account 私钥文件

- 文件：`tts/gen-lang-client-0737612402-b4f99deaf42f.json:1`
- 文件：`.gitignore:1`
- 问题：
  仓库目录里存在包含 `private_key` 的服务账号 JSON 文件，而 `.gitignore` 没有明确忽略这类密钥文件。
- 影响：
  即使它当前还没被 git 跟踪，也属于高风险本地泄露面；一旦误提交就是完整凭据泄漏。
- 修复方向：
  立即轮换该密钥；把凭据移出仓库；补充 `.gitignore` 规则忽略密钥、上传目录和音频生成凭据。

### Important

#### 5. 头像上传允许任意文件，并通过同源 `/uploads` 对外公开

- 文件：`server/src/auth/auth.controller.ts:40`
- 文件：`server/src/auth/avatar-upload.ts:20`
- 文件：`server/src/static-assets.ts:35`
- 问题：
  头像上传只配置了存储，没有 MIME 校验、扩展名限制、大小限制，也没有对上传失败做严格处理。
  上传目录随后被整个映射到 `/uploads`。
- 影响：
  登录用户可以上传非图片文件、超大文件，甚至利用同源资源访问边界制造额外风险。
- 修复方向：
  增加 `fileFilter`、大小限制、白名单扩展名，最好统一转码为安全图片格式。

#### 6. 资料保存不是原子操作，容易出现“部分成功、界面却失败”的状态

- 文件：`web/src/components/ProfileSetup.vue:30`
- 问题：
  前端先传头像，再更新昵称。若头像成功、昵称失败，后端数据会部分变更，但前端状态不会同步，且会回收本地预览。
- 影响：
  用户感知上会出现“保存失败但头像其实已经改了”的不一致，还会留下无用上传文件。
- 修复方向：
  合并为单接口事务式更新，或者前端显式处理部分成功状态并提供回滚/重试。

#### 7. 开发与验证链路不一致，导致真实回归容易被掩盖

- 文件：`web/vite.config.js:11`
- 文件：`web/src/socket.js:16`
- 文件：`server/src/main.ts:12`
- 文件：`README.md:60`
- 文件：`server/test/app.e2e-spec.ts:9`
- 文件：`server/test/jest-e2e.json:1`
- 问题：
  Web HTTP 代理走 `3002`，WebSocket 本地却写死连 `3000`，README 也仍然写后端默认在 `3000`。
  此外，`npm run test:e2e` 现在会因为缺少 `DATABASE_URL` 直接失败，e2e 形同失效。
- 影响：
  本地联调和自动化验证都不稳定，容易让真实问题漏过。
- 修复方向：
  统一 dev 端口配置；补测试专用 env/bootstrap，让 e2e 至少能稳定执行。

## 验证结果

> [!info]
> 我本次实际执行了仓库内可运行的一部分验证，而不是只读代码。

- `server` 单元测试：通过
- `cd server && npm test`：通过（13 个 suite，42 个测试）
- `server` e2e：通过
- `cd server && npm run test:e2e`：通过（1 个 suite，1 个测试）
  说明：当前 e2e 会先初始化独立 SQLite 测试库，再启动 `AppModule`，并验证注册 → 登录 → `me` → 登出的完整认证链路
- `server` build：通过
- `cd server && npm run build`：通过
- `web` 测试：通过
- `cd web && npm test`：通过（15 个文件，55 个测试）
- `web` build：通过
- `cd web && npm run build`：通过
- `miniprogram`：依赖与运行环境在云端，本地未做构建/类型检查；本次仅作背景审阅，不作为当前修复阻塞项

## 建议修复优先级

> [!todo]
> 建议按下面顺序推进，而不是并行随意修。

1. 先封住高危安全面：`admin` 鉴权、`/words/session` SQL 注入、PK 身份伪造、私钥移除与轮换。
2. 再处理上传与资料流：头像上传白名单、安全存储、资料更新原子化。
3. 最后补齐工程稳定性：统一端口、修复 e2e，并补齐 `server + web` 的验证链路。

## 额外观察

- `miniprogram/src/api.js` 中若干社交能力目前还是空实现或假成功返回，例如 `searchUsers()`、`getFriends()`、`followUser()`、`unfollowUser()`。
  这类代码不会立刻炸，但会让 UI 呈现“看起来有功能，实际上没有真正接后端”的假象。
  由于你已经明确说明小程序要后续单独推进，这一项目前只保留为背景记录，不纳入本轮修复清单。 ^miniprogram-social-stub

> [!warning]
> 这类“伪成功”实现比直接报错更危险，因为它会掩盖集成缺口，直到上线后才暴露真实行为偏差。

## 相关笔记

- [[TECHNICAL_REVIEW]]
- [[TESTING_GUIDE]]
- [[DEPLOY-CHECKLIST]]
