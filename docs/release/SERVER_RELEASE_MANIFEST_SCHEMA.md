# Server Release Manifest Schema

## Purpose

服务器发布完成后，必须同时留下“当前在线版本证据”和“可回滚历史证据”。

标准落点：

- `current/release-manifest.json`
- `shared/release-history/<timestamp>-<sha>.json`

## Required fields

| Field | Required | Meaning |
| --- | --- | --- |
| `commit` | yes | 已发布的 Git commit SHA |
| `target` | yes | 目标类型，服务器固定为 `server` |
| `scope` | yes | 发布范围，例如 `server-web` |
| `releasedAt` | yes | UTC ISO 时间戳 |
| `sourceOfTruth` | yes | 真相源，当前固定为 `origin/main` |
| `releasePath` | yes | 实际 release 目录，例如 `/var/www/vocab-master/releases/<sha>` |
| `currentPath` | yes | 当前在线软链路径，例如 `/var/www/vocab-master/current` |

## Example

```json
{
  "commit": "266e8e8",
  "target": "server",
  "scope": "server-web",
  "releasedAt": "2026-03-18T15:05:00.000Z",
  "sourceOfTruth": "origin/main",
  "releasePath": "/var/www/vocab-master/releases/266e8e8",
  "currentPath": "/var/www/vocab-master/current"
}
```

## Rollback evidence

- 回滚前先执行 `bash scripts/server/verify-current-release.sh /var/www/vocab-master`
- 从 `shared/release-history/` 中找到目标 SHA 的 manifest
- 使用同一个 SHA 再次执行 `bash scripts/server/deploy-from-git.sh /var/www/vocab-master --sha <sha>`
- 回滚后再次核对 `current/REVISION` 与 `current/release-manifest.json`
