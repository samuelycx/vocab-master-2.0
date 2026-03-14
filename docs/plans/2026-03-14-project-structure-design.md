# 项目目录结构整理设计

**目标**
在不影响程序运行的前提下，完成物理重构：统一顶层结构命名（web/miniprogram/legacy/server/docs/scripts），并将散落文档统一归档到 docs 子目录，降低维护成本与认知负担。

**范围**
- 顶层目录重命名：`client`→`web`，`client-uni`→`miniprogram`，`client_legacy`→`legacy`
- 文档归档：根目录散落文档、UI 参考、pencil 设计文件、reference 目录统一归入 `docs/`
- 保持运行与部署不受影响，必要时同步更新引用路径

**不在范围**
- 不改变业务逻辑与代码实现
- 不移动隐藏/工具目录（`.env`、`.worktrees`、`.vscode`、`.obsidian`、`.cursor`、`.arts`、`.tmp_video_frames`）
- 不做深层 monorepo 重构

**目标结构（顶层）**
- `web/`（原 `client/`）
- `miniprogram/`（原 `client-uni/`）
- `legacy/`（原 `client_legacy/`）
- `server/`（保持）
- `docs/`
  - `docs/design/`（UI REF、reference、pencil、UI_UPGRADE_PLAN 等）
  - `docs/release/`（发布/验收/检查清单）
  - `docs/notes/`（报告、技术评审、优化记录、修复指南等）
- `scripts/`（保持）

**归档规则（A 方案）**
- `docs/design/`：`UI REF/`、`reference/`、`pencil-*.pen`、`UI_UPGRADE_PLAN.md`
- `docs/release/`：`WECHAT_MINIPROGRAM_RELEASE_*`、`docs/release/*`
- `docs/notes/`：`BUG_FIX_REPORT.md`、`TECHNICAL_REVIEW.md`、`WECHAT_MINIPROGRAM_OPTIMIZATION*.md`、`FINAL_*`、`QUICK_FIX_GUIDE.md`、`TESTING_GUIDE.md` 等

**兼容与风险控制**
- 需要更新所有脚本/文档内的路径引用（README、release 文档、脚本）
- 不改代码内部 import 结构，避免引入构建风险
- 保留 `.env` 与数据库文件位置，避免环境失效

**验收标准**
- 现有启动命令与部署步骤仍可执行（仅路径更新）
- 运行 web、miniprogram、server 不报路径错误
- 根目录仅保留必要工具/配置文件与核心顶层目录

