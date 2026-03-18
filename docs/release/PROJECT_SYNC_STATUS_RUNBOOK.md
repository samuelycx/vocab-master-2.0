# Project Sync Status Runbook

## Purpose

Use this runbook to quickly answer whether local source, GitHub, and downstream release targets are aligned.

## Local audit entrypoint

Run from repository root:

```bash
bash scripts/sync/collect-project-sync-status.sh
```

## Current output fields

- `project_root`: resolved Git repository root
- `current_branch`: current local branch name
- `local_head`: local checked-out commit SHA
- `origin_main`: tracked `origin/main` commit SHA
- `working_tree_clean`: whether local working tree is clean
- `source_of_truth`: current publish source of truth, fixed to `origin/main`

## How to interpret

- `working_tree_clean=true` means local source is safe to compare against GitHub.
- `local_head == origin_main` means local `main` is synced with GitHub `origin/main`.
- `local_head != origin_main` means there are local commits not pushed yet, or local branch is behind remote.
- This script currently audits only local/GitHub state.
- Server release status and miniprogram release status will be added in later tasks of the sync governance plan.
