# Miniprogram Git Release Runbook

## Goal

让小程序发布同样基于 Git SHA 留证，而不是只依赖微信开发者工具里的人工记忆。

## Standard flow

1. 确认目标代码已经合并到 `origin/main`
2. 在干净工作区执行 `npm run release:verify`
3. 执行 `npm run release:manifest`
4. 生成/更新 `miniprogram/release-manifest.json`
5. 构建小程序并在微信开发者工具中上传
6. 对本期涉及的云函数执行“上传并部署：云端安装依赖”
7. 记录本次发布对应的 Git SHA、scope、验收结论

## Commands

在 `miniprogram/` 目录中执行：

```bash
npm run release:verify
npm run release:manifest
npm run build:mp-weixin
```

## Manifest fields

- `commit`: 当前 Git SHA
- `scope`: `miniprogram` / `cloudfunctions` / `full`
- `releasedAt`: UTC ISO 时间戳
- `sourceOfTruth`: 当前固定为 `origin/main`
- `cloudFunctions`: 当前项目中需要重新部署的云函数目录列表

## Rules

- 非 dry-run 模式下，如果仓库不是干净工作区，manifest 生成必须失败
- 正式发布后，需把 `release-manifest.json` 中的 `commit` 记录到发版验收单
- 云函数和小程序前端必须对应同一个 Git SHA
