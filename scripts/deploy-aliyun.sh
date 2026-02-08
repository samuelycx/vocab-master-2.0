#!/bin/bash

# Vocab Master 2.0 - Aliyun ECS Deploy Script
# (发布脚本 - 阿里云 ECS)

echo "🚀 Starting Deployment..."

# 1. Pull latest code
echo "📦 Pulling latest changes from GitHub..."
git pull origin main

# 2. Build Frontend
echo "🎨 Building Frontend..."
cd client
npm install
npm run build
cd ..

# 3. Build Backend
echo "⚙️ Building Backend..."
cd server

# 创建默认 .env 文件 (如果不存在)
if [ ! -f .env ]; then
  echo "📄 Creating default .env file..."
  echo 'DATABASE_URL="file:./dev.db"' > .env
fi

npm install
# 初始化数据库 (Prisma)
echo "🗄️ Initializing Database..."
npx prisma generate
npx prisma migrate deploy
npm run build
cd ..

# 4. Start/Restart Service with PM2
echo "🔄 Restarting Service with PM2..."
# 检查 pm2 是否安装
if ! command -v pm2 &> /dev/null; then
  echo "⚠️ PM2 not found, installing..."
  npm install -g pm2
fi

# 使用 pm2 启动/重启
pm2 start server/dist/main.js --name "vocab-master" || pm2 restart "vocab-master"

echo "✅ Deployment Complete!"
echo "📍 Access your app at: http://your-server-ip:3000"
