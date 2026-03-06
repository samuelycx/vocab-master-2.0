#!/bin/bash

echo "🧹 清除所有缓存..."

# 1. 停止编译进程
echo "1. 停止编译进程..."
pkill -f "uni -p mp-weixin" 2>/dev/null
sleep 2

# 2. 删除编译输出
echo "2. 删除编译输出..."
cd /Users/samuelying/程序/02-项目/vocab-master-2.0/client-uni
rm -rf dist/dev/mp-weixin
rm -rf dist/build/mp-weixin
rm -rf node_modules/.cache
rm -rf .hbuilderx

# 3. 清除npm缓存
echo "3. 清除npm缓存..."
npm cache clean --force 2>/dev/null

# 4. 重新编译
echo "4. 重新编译..."
npm run dev:mp-weixin &

echo "✅ 清除完成！"
echo ""
echo "现在请在微信开发者工具中："
echo "1. 关闭项目"
echo "2. 重新打开项目"
echo "3. 导入目录：/Users/samuelying/程序/02-项目/vocab-master-2.0/client-uni/dist/dev/mp-weixin"
echo "4. 点击 '工具' -> '清缓存' -> '清除全部'"
echo "5. 刷新模拟器 (Cmd + R)"
