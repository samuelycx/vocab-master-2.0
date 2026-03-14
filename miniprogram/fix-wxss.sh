#!/bin/bash
# ============================================================
# WXSS 修复脚本 - 解决微信小程序 CSS 兼容性问题
# 创建时间: 2026-02-12
# 使用方法: ./fix-wxss.sh
# ============================================================

APP_WXSS="dist/build/mp-weixin/app.wxss"

echo "🔧 开始修复 WXSS 兼容性问题..."

# 1. 移除 :where() 伪类（微信小程序不支持）
echo "  修复 :where() 伪类..."
perl -i -pe 's/:where\([^)]*\)//g' "$APP_WXSS"

# 2. 移除 :not() 伪类
echo "  修复 :not() 伪类..."
perl -i -pe 's/:not\([^)]*\)//g' "$APP_WXSS"

# 3. 修复 .divide-x> 等类选择器（> 后必须有元素）
echo "  修复 divide- 类选择器..."
perl -i -pe 's/\.divide-([a-z0-9-]+)>/\.divide-$1 /g' "$APP_WXSS"

# 4. 修复 .dark> 选择器
echo "  修复 .dark> 选择器..."
perl -i -pe 's/\.dark>/\.dark /g' "$APP_WXSS"

# 5. 修复转义类名 .\! 和类似模式
perl -i -pe 's/\\\.!/./g' "$APP_WXSS"
perl -i -pe 's/\\\!//g' "$APP_WXSS"
perl -i -pe 's/\\\.\\//g' "$APP_WXSS"
perl -i -pe 's/\\\[//g' "$APP_WXSS"
perl -i -pe 's/\\\]//g' "$APP_WXSS"
perl -i -pe 's/\\://g' "$APP_WXSS"
perl -i -pe 's/\\\././g' "$APP_WXSS"
perl -i -pe 's/\\\///g' "$APP_WXSS"
perl -i -pe 's/\\#/#/g' "$APP_WXSS"

# 6. 修复任意值方括号 [40px], [90vh] 等
echo "  修复任意值方括号..."
perl -i -pe 's/\\\[([^\\]+)\\\]/$1/g' "$APP_WXSS"

# 7. 修复 ~ 组合器
echo "  修复 ~ 组合器..."
perl -i -pe 's/ ~ / /g' "$APP_WXSS"
perl -i -pe 's/~\{/ {/g' "$APP_WXSS"
perl -i -pe 's/> *\{/ {/g' "$APP_WXSS"

# 8. 修复 >not[hidden] 等组合
echo "  修复组合器..."
perl -i -pe 's/>not\[hidden\]/>/g' "$APP_WXSS"

# 9. 移除 TypeScript 类型标记
echo "  移除类型标记..."
perl -i -pe 's/\\\[agentkeepalive[^\\]*\\\]//g' "$APP_WXSS"
perl -i -pe 's/\\\[options[^\\]*\\\]//g' "$APP_WXSS"
perl -i -pe 's/\\\[root[^\\]*\\\]//g' "$APP_WXSS"

# 10. 修复 relativeimportant 拼写错误
echo "  修复拼写错误..."
perl -i -pe 's/relativeimportant/relative !important/g' "$APP_WXSS"

echo "✅ WXSS 修复完成！"
echo ""
echo "📋 修复的问题清单:"
echo "   1. :where() 伪类 → 移除"
echo "   2. :not() 伪类 → 移除"
echo "   3. .divide-x> → .divide-x "
echo "   4. .dark> → .dark "
echo "   5. 转义类名 → 修复"
echo "   6. [40px], [90vh] 等 → 移除方括号"
echo "   7. ~ 组合器 → 移除"
echo "   8. >not[hidden] → >"
echo "   9. 类型标记 → 移除"
echo "  10. relativeimportant → 修复"
