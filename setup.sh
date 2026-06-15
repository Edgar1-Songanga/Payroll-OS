PATH: setup.sh (ROOT)

#!/bin/bash

echo "🚀 Setting up Payroll OS..."

# 1. Start Docker services
echo "📦 Starting Docker services..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# 2. Install dependencies
echo "📥 Installing dependencies..."
pnpm install

# 3. Setup database
echo "🗄️ Setting up database..."
pnpm db:push
pnpm db:seed

# 4. Build
echo "🔨 Building..."
pnpm build

# 5. Start development servers
echo "✅ Setup complete! Starting servers..."
echo ""
echo "🌐 Magestade: http://localhost:3000"
echo "💰 Payroll OS: http://localhost:3001"
echo ""

# Start both servers (requires tmux or similar)
# For now, just print instructions
echo "Run in separate terminals:"
echo "  Terminal 1: cd apps/web && pnpm dev"
echo "  Terminal 2: cd apps/payroll && pnpm dev"