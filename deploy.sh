#!/bin/bash
set -e

echo "🚀 JifyLife 一键部署脚本"
echo "========================"

# 检查 Node.js 版本
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
  echo "❌ 需要 Node.js >= 20，当前版本: $(node -v)"
  exit 1
fi

# 检查 pnpm
if ! command -v pnpm &> /dev/null; then
  echo "📦 正在安装 pnpm..."
  npm install -g pnpm
fi

echo "📦 安装依赖..."
pnpm install

echo "🔧 生成 Prisma Client..."
cd apps/server && npx prisma generate && cd ../..

echo "🏗️  构建项目..."
pnpm build:prod

echo "🗄️  初始化数据库..."
cd apps/server && npx prisma db push --accept-data-loss && cd ../..

# 检查是否有 .env 文件
if [ ! -f apps/server/.env ]; then
  echo "⚠️  未找到 apps/server/.env，正在从模板创建..."
  cp .env.example apps/server/.env
  # 生成随机 JWT secret
  JWT_SECRET=$(openssl rand -hex 32)
  JWT_REFRESH_SECRET=$(openssl rand -hex 32)
  sed -i.bak "s/your-jwt-secret-change-this/$JWT_SECRET/" apps/server/.env
  sed -i.bak "s/your-refresh-secret-change-this/$JWT_REFRESH_SECRET/" apps/server/.env
  rm -f apps/server/.env.bak
  echo "✅ 已生成 .env 文件，请编辑 apps/server/.env 填入 OPENAI_API_KEY"
fi

echo ""
echo "✅ 部署完成！"
echo ""
echo "启动方式："
echo "  NODE_ENV=production node apps/server/dist/index.js"
echo ""
echo "或使用 pm2 守护进程运行（推荐）："
echo "  pm2 start apps/server/dist/index.js --name jifylife --env NODE_ENV=production"
echo ""
echo "默认访问地址: http://你的服务器IP:3001"
echo "修改端口请编辑 apps/server/.env 中的 PORT"
