# GitHub Actions Server Deploy Setup

## Goal

让服务器后续发布走：

```text
local main -> GitHub origin/main -> GitHub Actions -> 101.34.65.203
```

当前服务器对 `github.com:443` 的直连不稳定，因此采用 **GitHub Actions 推送 bundle 到服务器** 的方式，仍然保持 GitHub `main` 为唯一真相源。

## Workflow file

- `.github/workflows/deploy-server-from-main.yml`

该 workflow 会：

1. 在 GitHub Actions 中 checkout `main`
2. 生成当前主线的 Git bundle
3. 把 `bundle + receive-github-bundle.sh` 上传到服务器 `/tmp`
4. 在服务器上更新本地 bare origin 与 bootstrap checkout
5. 调用 `scripts/deploy-aliyun.sh --sha <github_sha>` 完成正式发布

## Required repository secrets

| Secret | Example | Notes |
| --- | --- | --- |
| `SERVER_HOST` | `101.34.65.203` | 服务器地址 |
| `SERVER_PORT` | `22` | 可选，默认 22 |
| `SERVER_USER` | `root` | 建议后续替换为专用 deploy 用户 |
| `SERVER_SSH_KEY` | `-----BEGIN OPENSSH PRIVATE KEY-----` | GitHub Actions 用于登录服务器的私钥 |
| `SERVER_KNOWN_HOSTS` | `101.34.65.203 ssh-ed25519 AAAA...` | 建议用 `ssh-keyscan` 生成 |
| `SERVER_RELEASE_ROOT` | `/var/www/vocab-master` | 可选 |
| `SERVER_ORIGIN_PATH` | `/root/vocab-master-origin-main.git` | 可选 |
| `SERVER_BOOTSTRAP_PATH` | `/root/vocab-master-bootstrap-main` | 可选 |

## Recommended setup steps

### 1. Generate a dedicated deploy key locally

```bash
ssh-keygen -t ed25519 -f ~/.ssh/vocab-master-actions -C "github-actions-deploy"
```

### 2. Add the public key to the server

```bash
cat ~/.ssh/vocab-master-actions.pub | ssh root@101.34.65.203 'umask 077 && mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys'
```

### 3. Capture known hosts

```bash
ssh-keyscan -H 101.34.65.203
```

### 4. Add the secrets in GitHub

把上面的私钥、公钥指纹和服务器参数写入仓库 secrets。

## Manual dry-run from local shell

在本地可以先验证接收脚本链路：

```bash
bash scripts/server/receive-github-bundle.test.sh
```

## Current server state

迁移后服务器已经具备以下固定路径：

- release root: `/var/www/vocab-master`
- server-local bare origin: `/root/vocab-master-origin-main.git`
- bootstrap checkout: `/root/vocab-master-bootstrap-main`

如果后续服务器恢复了稳定的 GitHub 外网访问，可以再把本地 bare origin 替换成直接指向 GitHub 的 remote。
