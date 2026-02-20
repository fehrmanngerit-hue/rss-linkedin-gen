import { PrismaClient } from '@prisma/client';

async function main() {
    const prisma = new PrismaClient();
    const user = await prisma.user.findFirst();
    console.log('User preferences in DB:', {
        email: user?.email,
        bio: user?.bio,
        tone: user?.tone,
        targetLength: user?.targetLength,
        emojiLevel: user?.emojiLevel
    });
    await prisma.$disconnect();
}

main();
