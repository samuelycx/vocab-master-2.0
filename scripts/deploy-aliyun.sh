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
npm install
# 初始化数据库 (Prisma)
echo "🗄️ Initializing Database..."
npx prisma generate
npx prisma migrate deploy
npm run build
cd ..

# 4. Start/Restart Service with PM2
echo "🔄 Restarting Service with PM2..."
# If process not exists, start it. If exists, restart.
pm2 start server/dist/main.js --name "vocab-master" || pm2 restart "vocab-master"

echo "✅ Deployment Complete!"
echo "📍 Access your app at: http://your-server-ip:3000"
