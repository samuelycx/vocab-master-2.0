# Web 部署命令版（2026-03-13）

## 目标
在一台 Linux 服务器上部署当前 Web 版：
- 前端静态资源由 NestJS 后端直接托管
- 后端监听 `3000`
- Nginx 反向代理到站点域名
- 使用 PM2 守护进程

## 服务器前置要求
- Node.js 18+
- npm
- PM2
- Nginx
- Git

安装 PM2：
```bash
npm install -g pm2
```

## 一次性初始化
```bash
cd /var/www
git clone <你的仓库地址> vocab-master
cd vocab-master
```

## 后续更新命令
```bash
cd /var/www/vocab-master
git pull
```

## 安装依赖
```bash
cd /var/www/vocab-master/server
npm install

cd /var/www/vocab-master/client
npm install
```

## 配置环境变量
```bash
cd /var/www/vocab-master/server
cp .env.example .env
```

编辑 `server/.env`：
```env
DATABASE_URL="file:./prisma/prod.db"
PORT=3000
```

## 构建前端
```bash
cd /var/www/vocab-master/client
npm run build
```

也可以在项目根目录执行发版前自检：
```bash
cd /var/www/vocab-master
bash scripts/web-preflight.sh
```

## 准备数据库
首次部署：
```bash
cd /var/www/vocab-master/server
npx prisma migrate deploy
```

如需初始化词库/成就数据：
```bash
cd /var/www/vocab-master/server
npx ts-node prisma/seed.ts
```

## 构建后端
```bash
cd /var/www/vocab-master/server
npm run build
```

如需直接以生产模式本地启动：
```bash
cd /var/www/vocab-master/server
bash scripts/start-prod.sh
```

## PM2 启动
```bash
cd /var/www/vocab-master/server
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

查看状态：
```bash
pm2 status
pm2 logs vocab-master-web --lines 100
```

重启：
```bash
cd /var/www/vocab-master/server
pm2 restart vocab-master-web
```

## Nginx 配置
站点配置示例：
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

  location /socket.io/ {
    proxy_pass http://127.0.0.1:3000/socket.io/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
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

加载配置：
```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 上线后健康检查
```bash
curl -sS http://127.0.0.1:3000/api/config
curl -sS http://127.0.0.1:3000/api/leaderboard
curl -I http://127.0.0.1:3000/
```

## 一次完整发版流程
```bash
cd /var/www/vocab-master
git pull

cd client
npm install
npm run build

cd ../server
npm install
npx prisma migrate deploy
npm run build
pm2 restart vocab-master-web
pm2 logs vocab-master-web --lines 50
```

## 回滚思路
如果新版本异常：
1. 回到上一个 git commit
2. 重新执行前端 build
3. 重新执行后端 build
4. `pm2 restart vocab-master-web`
