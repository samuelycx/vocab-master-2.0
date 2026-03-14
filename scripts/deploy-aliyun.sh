#!/bin/bash

# Vocab Master 2.0 - Aliyun ECS Deploy Script
# (发布脚本 - 阿里云 ECS)

echo "🚀 Starting Deployment..."

# 1. Pull latest code (if repo exists)
echo "📦 Pulling latest changes from GitHub..."
if [ -d .git ]; then
  git pull origin main
else
  echo "ℹ️  No .git directory found, skipping git pull."
fi

# 2. Build Frontend
echo "🎨 Building Frontend..."
cd web
npm install
npm run build
cd ..

# 3. Build Backend
echo "⚙️ Building Backend..."
cd server

# 创建默认 .env 文件 (如果不存在)
if [ ! -f .env ]; then
  echo "📄 Creating default .env file..."
  echo 'DATABASE_URL="file:./prisma/prod.db"' > .env
fi

npm install
# 初始化数据库 (Prisma)
echo "🗄️ Initializing Database..."
npx prisma generate
npx prisma migrate deploy
npx prisma db seed

# 清理旧的编译文件并重新编译
rm -rf dist
npm run build
cd ..

# 4. Start/Restart Service with PM2
echo "🔄 Restarting Service with PM2..."
# 检查 pm2 是否安装
if ! command -v pm2 &> /dev/null; then
  echo "⚠️ PM2 not found, installing..."
  npm install -g pm2
fi

# 确保我们在项目根目录启动 (Ensure we start from root)
cd "$(dirname "$0")/.."

# 使用 pm2 启动/重启 (显式指定工作目录)
pm2 delete "vocab-master-web" 2>/dev/null || true
pm2 start server/ecosystem.config.cjs --only "vocab-master-web"

echo "--------------------------------------------------"
echo "✅ Deployment Complete! (部署完成)"
echo "🚀 Application is running in the background via PM2."
echo "📍 Access your app at: http://your-server-ip:3001"
echo "💡 Use 'pm2 logs vocab-master-web' to see logs if you face issues."
echo "--------------------------------------------------"
