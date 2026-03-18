# Miniprogram WeChat Identity Boundary Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 把“微信身份登录属于小程序长期分化项，而非 Web 待同步缺口”正式写进现有设计、发布和验收文档，并把后续动作改成小程序独立验收路径。

**Architecture:** 本计划只收口文档和验收口径，不直接改动小程序登录实现。核心做法是新增一份身份边界设计文档，再把现有小程序专项设计、kickoff 说明、follow-up 清单和 release/runbook 文档统一引用同一口径，避免后续再次把平台身份差异误判成同步问题。

**Tech Stack:** Markdown、Obsidian wikilinks、ripgrep、git

---

### Task 1: 落库身份边界设计文档

**Files:**
- Create: `docs/plans/2026-03-19-miniprogram-wechat-identity-boundary-design.md`

**Step 1: Write the failing wording check**

Run:

```bash
rg -n "长期分化|身份分化|微信身份登录" docs/plans/2026-03-19-miniprogram-wechat-identity-boundary-design.md
```

Expected: FAIL or no matches, because the design document does not exist yet.

**Step 2: Create the minimal design document**

- 新建文档并写清：
  - 什么叫“长期分化”
  - 为什么微信身份属于小程序边界
  - 哪些部分允许分化，哪些部分必须对齐
  - 验收口径如何变化

**Step 3: Run verification**

Run:

```bash
rg -n "长期分化|openid|业务层对齐|web/server" docs/plans/2026-03-19-miniprogram-wechat-identity-boundary-design.md
```

Expected: PASS and match all core boundary terms.

**Step 4: Commit**

```bash
git add docs/plans/2026-03-19-miniprogram-wechat-identity-boundary-design.md
git commit -m "docs: define miniprogram wechat identity boundary"
```

### Task 2: 对齐现有小程序专项设计与 follow-up 清单

**Files:**
- Modify: `docs/plans/2026-03-18-miniprogram-special-design.md`
- Modify: `docs/plans/2026-03-18-follow-up-task-list-cn.md`

**Step 1: Find stale wording**

Run:

```bash
rg -n "做成和 Web 一模一样|功能差异|待执行" docs/plans/2026-03-18-miniprogram-special-design.md docs/plans/2026-03-18-follow-up-task-list-cn.md
```

Expected: PASS with matches that still describe the mini program/web relationship in a generic way.

**Step 2: Update the wording**

- 在专项设计中补充“微信身份登录为长期分化项”
- 在 follow-up 清单中把任务 1 的验收标准改成包含“身份边界定义”和“微信身份登录专项验收”

**Step 3: Run verification**

Run:

```bash
rg -n "长期分化|微信身份登录|身份边界" docs/plans/2026-03-18-miniprogram-special-design.md docs/plans/2026-03-18-follow-up-task-list-cn.md
```

Expected: PASS with clear matches in both files.

**Step 4: Commit**

```bash
git add docs/plans/2026-03-18-miniprogram-special-design.md docs/plans/2026-03-18-follow-up-task-list-cn.md
git commit -m "docs: align miniprogram plans with identity boundary"
```

### Task 3: 对齐 kickoff / release / runbook 口径

**Files:**
- Modify: `docs/release/2026-03-19-sync-closure-and-miniprogram-kickoff-cn.md`
- Modify: `docs/release/2026-03-18-miniprogram-phase1-release-notes-cn.md`
- Modify: `docs/release/MINIPROGRAM_GIT_RELEASE_RUNBOOK.md`
- Modify: `docs/release/MINIPROGRAM_PHASE1_CLOUD_CHECKLIST.md`

**Step 1: Find stale release wording**

Run:

```bash
rg -n "云端这一跳|后续动作|验收|微信身份" docs/release/2026-03-19-sync-closure-and-miniprogram-kickoff-cn.md docs/release/2026-03-18-miniprogram-phase1-release-notes-cn.md docs/release/MINIPROGRAM_GIT_RELEASE_RUNBOOK.md docs/release/MINIPROGRAM_PHASE1_CLOUD_CHECKLIST.md
```

Expected: PASS with current release wording, but no explicit "identity boundary" acceptance item in all files.

**Step 2: Update release-facing docs**

- kickoff 文档中加入“微信身份体系边界”
- release notes 中明确“Web 不要求同步微信登录”
- runbook 和 checklist 中补充“微信身份登录闭环专项验收”

**Step 3: Run verification**

Run:

```bash
rg -n "微信身份|openid|长期分化|专项验收" docs/release/2026-03-19-sync-closure-and-miniprogram-kickoff-cn.md docs/release/2026-03-18-miniprogram-phase1-release-notes-cn.md docs/release/MINIPROGRAM_GIT_RELEASE_RUNBOOK.md docs/release/MINIPROGRAM_PHASE1_CLOUD_CHECKLIST.md
```

Expected: PASS with matches in the updated release-facing files.

**Step 4: Commit**

```bash
git add docs/release/2026-03-19-sync-closure-and-miniprogram-kickoff-cn.md docs/release/2026-03-18-miniprogram-phase1-release-notes-cn.md docs/release/MINIPROGRAM_GIT_RELEASE_RUNBOOK.md docs/release/MINIPROGRAM_PHASE1_CLOUD_CHECKLIST.md
git commit -m "docs: align miniprogram release acceptance with wechat identity boundary"
```

### Final Integration Task

**Files:**
- Modify only if integration wording requires small follow-up edits

**Step 1: Run full wording audit**

Run:

```bash
rg -n "长期分化|微信身份登录|身份边界|openid" docs/plans docs/release | sed -n '1,200p'
```

Expected: Updated design, plan, release, and checklist docs all reference the same boundary language.

**Step 2: Run repository hygiene checks**

Run:

```bash
git diff --check
git status --short
```

Expected: No whitespace/check errors; only intended documentation files changed.

**Step 3: Final commit if needed**

```bash
git add -A
git commit -m "docs: codify miniprogram wechat identity boundary" || true
```
