# Web 首发清单（2026-03-13）

## 当前部署形态
- 前端：`client`（Vue 3 + Vite）
- 后端：`server`（NestJS + Prisma）
- 数据库：SQLite（`DATABASE_URL` 指向本地文件）
- 托管方式：后端 `server` 直接托管 `client/dist`
- 接口前缀：`/api`
- WebSocket：`/pk`

## 已完成验证
- 账号密码注册
- 账号密码登录
- `GET /api/auth/me`
- `GET /api/words/session`
- `GET /api/progress/stats`
- `GET /api/progress/reviews`
- `GET /api/leaderboard`
- `GET /api/social/search`
- `POST /api/progress/sync`
- 学习进度写回后，XP / Coin / 成就返回正常
- 前端单测通过：`11` 个文件，`25` 个测试
- 前端构建通过
- 后端关键测试通过

## 已知当前状态
- Web 手机端 UI 已按 `client-uni` 最新页面基准重建主要页面
- `BookSelection` 已收口，不再作为独立主链路页面
- 首页、学习页、设置页、PK 页、结果页、词表页、成就墙、排行页、登录页已统一到同一视觉方向

## 上线前必须确认
1. 服务器已安装 Node.js 18+ 与 npm
2. 服务器已安装 PM2 或 systemd（二选一）
3. `server/.env` 已配置 `DATABASE_URL="file:/var/www/vocab-master/server/prisma/dev.db"`
4. SQLite 数据库文件目录（`server/prisma/dev.db`）有写权限
5. 服务器已开放站点端口（例如 3000）或已配置 Nginx 反代
6. 如需 HTTPS，域名证书已准备好

## 推荐上线步骤

### 1. 安装依赖
```bash
cd server && npm install
cd ../client && npm install
```

### 2. 构建前端
```bash
cd client
npm run build
```

### 3. 准备数据库
```bash
cd server
npx prisma migrate deploy
npm run build
```

如需首批数据：
```bash
cd server
npx ts-node prisma/seed.ts
```

## 4. 启动后端
开发验证：
```bash
cd server
npm run start:dev
```

生产建议：
```bash
cd server
npm run build
node dist/main
```

## 5. PM2 启动示例
```bash
cd server
pm2 start dist/main.js --name vocab-master-web
pm2 save
pm2 startup
```

## 6. Nginx 反向代理示例
```nginx
server {
  listen 80;
  server_name your-domain.com;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  location /pk/ {
    proxy_pass http://127.0.0.1:3000/pk/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
  }
}
```

## 上线后回归顺序
1. 打开首页
2. 注册新账号
3. 登录已有账号
4. 开始学习 30 词
5. 完成 1 题后确认 XP / Coin / 成就弹窗
6. 查看词表页
7. 查看排行页
8. 查看成就墙
9. 进入 PK 人机模式
10. 设置页退出登录

## 当前建议
- 第一版单机部署可以继续使用 SQLite
- 如果后面要支持更稳定的多人在线 PK 和更高并发，再迁移 PostgreSQL
- 首发阶段优先保证账号、学习、排行、成就闭环稳定
