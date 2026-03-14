# 项目目录结构整理 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在不影响运行的前提下完成顶层目录重命名与文档归档。

**Architecture:** 仅物理移动文件夹与文档归档，更新路径引用，保持运行命令与部署脚本可用。

**Tech Stack:** shell + git

---

### Task 1: 目录与文档归档清单确认

**Files:**
- Modify: `/Users/samuelying/程序/02-项目/vocab-master-2.0/docs/plans/2026-03-14-project-structure-design.md`

**Step 1: Write failing test**

不适用（纯文件结构调整）。

**Step 2: Collect move list**

列出将移动的目录与文件：
- `client/` → `web/`
- `client-uni/` → `miniprogram/`
- `client_legacy/` → `legacy/`
- `UI REF/` → `docs/design/UI_REF/`
- `reference/` → `docs/design/reference/`
- `pencil-compare.pen`、`pencil-new.pen` → `docs/design/`
- 根目录各类文档 → `docs/notes/` 或 `docs/release/`

**Step 3: Commit**

无提交，进入下一任务。

---

### Task 2: 执行目录重命名

**Files:**
- Modify: `/Users/samuelying/程序/02-项目/vocab-master-2.0/*`

**Step 1: Move directories**

```bash
mv client web
mv client-uni miniprogram
mv client_legacy legacy
```

**Step 2: Verify**

```bash
ls -la
```

**Step 3: Commit**

```bash
git add web miniprogram legacy

git commit -m "chore: rename top-level app directories"
```

---

### Task 3: 文档归档到 docs/

**Files:**
- Modify: `/Users/samuelying/程序/02-项目/vocab-master-2.0/docs/**`

**Step 1: Create folders**

```bash
mkdir -p docs/design docs/release docs/notes
```

**Step 2: Move design assets**

```bash
mv "UI REF" docs/design/UI_REF
mv reference docs/design/reference
mv pencil-compare.pen docs/design/
mv pencil-new.pen docs/design/
mv UI_UPGRADE_PLAN.md docs/design/
```

**Step 3: Move release docs**

```bash
mv WECHAT_MINIPROGRAM_RELEASE_* docs/release/
```

**Step 4: Move notes**

```bash
mv BUG_FIX_REPORT.md docs/notes/
mv EMERGENCY_FIX_GUIDE.md docs/notes/
mv FINAL_COMPLETE_FIX.md docs/notes/
mv FINAL_FIX_REPORT.md docs/notes/
mv OPTIMIZATION_PRIORITY.md docs/notes/
mv QUICK_FIX_GUIDE.md docs/notes/
mv TECHNICAL_REVIEW.md docs/notes/
mv TESTING_GUIDE.md docs/notes/
mv WECHAT_MINIPROGRAM_OPTIMIZATION*.md docs/notes/
```

**Step 5: Commit**

```bash
git add docs

git commit -m "chore: organize documentation folders"
```

---

### Task 4: 更新路径引用

**Files:**
- Modify: `/Users/samuelying/程序/02-项目/vocab-master-2.0/README.md`
- Modify: `/Users/samuelying/程序/02-项目/vocab-master-2.0/docs/release/2026-03-13-web-deploy-commands.md`
- Modify: `/Users/samuelying/程序/02-项目/vocab-master-2.0/scripts/*`
- Modify: any docs referencing old paths

**Step 1: Find references**

```bash
rg -n "\bclient-uni\b|\bclient_legacy\b|\bclient\b|UI REF|reference/|pencil-" -g'*.md' -g'*.sh'
```

**Step 2: Update references**

Replace:
- `client/` → `web/`
- `client-uni/` → `miniprogram/`
- `client_legacy/` → `legacy/`
- `UI REF` → `docs/design/UI_REF`
- `reference/` → `docs/design/reference/`
- `pencil-*.pen` → `docs/design/pencil-*.pen`

**Step 3: Commit**

```bash
git add README.md docs scripts

git commit -m "chore: update docs paths after restructure"
```

---

### Task 5: 验证基本运行

**Step 1: Verify web build**

```bash
npm -C web install
npm -C web run build
```

**Step 2: Verify server build**

```bash
npm -C server install
npm -C server run build
```

**Step 3: Commit**

无代码变更则无需提交。

---

Plan complete and ready for execution.
