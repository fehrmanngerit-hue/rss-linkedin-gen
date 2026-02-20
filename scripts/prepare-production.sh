#!/bin/bash

# Script to prepare Content Scanner for Production (PostgreSQL)

echo "🚀 Preparing for Production Deployment..."

# 1. Update Prisma Schema to use PostgreSQL
echo "📝 Updating prisma/schema.prisma..."
sed -i '' 's/provider = "sqlite"/provider = "postgresql"/g' prisma/schema.prisma

# 2. Update lib/prisma.ts to use standard connection
echo "📝 Updating src/lib/prisma.ts..."
cat <<EOF > src/lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
    return new PrismaClient()
}

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClientSingleton | undefined
}

const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
EOF

# 3. Inform user about next steps
echo "✅ Preparation complete!"
echo ""
echo "Next steps:"
echo "1. Push changes to GitHub."
echo "2. Connect project to Vercel."
echo "3. Add PostgreSQL integration in Vercel."
echo "4. Set NEXTAUTH_SECRET and OPENAI_API_KEY in Vercel Environment Variables."
echo "5. Deploy!"
