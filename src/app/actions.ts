'use server';

import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]/route';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

async function getUserId() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
        throw new Error("Unauthorized");
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    });

    if (!user) throw new Error("User not found");
    return user.id;
}

export async function addFeed(formData: FormData) {
    const url = formData.get('url') as string;
    const name = formData.get('name') as string;
    const userId = await getUserId();

    if (!url) return;

    await prisma.feed.create({
        data: {
            url,
            name: name || url,
            userId
        }
    });

    revalidatePath('/settings');
}

export async function deleteFeed(feedId: string) {
    const userId = await getUserId();

    // Verify ownership
    const feed = await prisma.feed.findUnique({ where: { id: feedId } });
    if (feed?.userId !== userId) return;

    await prisma.feed.delete({ where: { id: feedId } });
    revalidatePath('/settings');
}

export async function addKeyword(formData: FormData) {
    const term = formData.get('term') as string;
    const userId = await getUserId();

    if (!term) return;

    await prisma.keyword.create({
        data: {
            term,
            userId
        }
    });

    revalidatePath('/settings');
}

export async function deleteKeyword(keywordId: string) {
    const userId = await getUserId();

    // Verify ownership
    const keyword = await prisma.keyword.findUnique({ where: { id: keywordId } });
    if (keyword?.userId !== userId) return;

    await prisma.keyword.delete({ where: { id: keywordId } });
    revalidatePath('/settings');
}

export async function generatePostAction(articleId: string) {
    const userId = await getUserId();
    // We should verify article belongs to a feed owned by user?
    // prisma.article -> feed -> userId
    const article = await prisma.article.findUnique({
        where: { id: articleId },
        include: { feed: true }
    });

    if (!article || article.feed.userId !== userId) {
        throw new Error("Unauthorized or not found");
    }

    // Import dynamically to avoid circular deps if any? No, import from lib/ai is fine.
    const { generateLinkedInPost } = await import('@/lib/ai');
    const postContent = await generateLinkedInPost(articleId);
    return postContent;
}

export async function markAsPostedAction(articleId: string, generatedPost: string) {
    const userId = await getUserId();
    const article = await prisma.article.findUnique({
        where: { id: articleId },
        include: { feed: true }
    });

    if (!article || article.feed.userId !== userId) {
        throw new Error("Unauthorized");
    }

    await prisma.article.update({
        where: { id: articleId },
        data: {
            status: 'POSTED',
            generatedPost: generatedPost // This will now be the stringified JSON from PostEditor
        }
    });

    revalidatePath('/dashboard');
    revalidatePath('/posts');
    redirect('/dashboard');
}

export async function deletePostAction(articleId: string) {
    const userId = await getUserId();
    const article = await prisma.article.findUnique({
        where: { id: articleId },
        include: { feed: true }
    });

    if (!article || article.feed.userId !== userId) {
        throw new Error("Unauthorized");
    }

    await prisma.article.update({
        where: { id: articleId },
        data: {
            status: 'NEW',
            generatedPost: null
        }
    });

    revalidatePath('/posts');
    revalidatePath('/dashboard');
}

// User Management Actions
export async function getUsersAction() {
    const session = await getServerSession();
    if (session?.user?.role !== 'ADMIN') {
        throw new Error('Not authorized');
    }

    return await prisma.user.findMany({
        orderBy: { createdAt: 'desc' }
    });
}

export async function createUserAction(formData: FormData) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'ADMIN') {
        throw new Error('Not authorized');
    }

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const role = formData.get('role') as string || 'USER';

    if (!email || !password) return;

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            role
        }
    });

    revalidatePath('/admin');
}

export async function deleteUserAction(userId: string) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'ADMIN') {
        throw new Error('Not authorized');
    }
    // Prevent deleting self
    if (session?.user?.email === (await prisma.user.findUnique({ where: { id: userId } }))?.email) {
        throw new Error('Cannot delete yourself');
    }

    await prisma.user.delete({
        where: { id: userId }
    });

    revalidatePath('/admin');
}

export async function updateUserRoleAction(userId: string, role: string) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'ADMIN') {
        throw new Error('Not authorized');
    }

    await prisma.user.update({
        where: { id: userId },
        data: { role }
    });

    revalidatePath('/admin');
}

// Password Reset Actions
export async function requestPasswordResetAction(formData: FormData) {
    const email = formData.get('email') as string;
    if (!email) return { error: "Email ist erforderlich" };

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        // Return success even if user doesn't exist to prevent enumeration
        return { success: true };
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour

    await prisma.passwordResetToken.create({
        data: {
            email,
            token,
            expiresAt
        }
    });

    // MOCK EMAIL LOG
    console.log(`[PASSWORD RESET] Token for ${email}: ${token}`);
    console.log(`Link: http://localhost:3000/reset-password/${token}`);

    return { success: true };
}

export async function resetPasswordAction(token: string, formData: FormData) {
    const password = formData.get('password') as string;
    if (!password) return { error: "Passwort ist erforderlich" };

    const resetToken = await prisma.passwordResetToken.findUnique({
        where: { token }
    });

    if (!resetToken || resetToken.expiresAt < new Date()) {
        return { error: "Token ungültig oder abgelaufen" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
        where: { email: resetToken.email },
        data: { password: hashedPassword }
    });

    await prisma.passwordResetToken.delete({
        where: { token }
    });

    return { success: true };
}

export async function updateUserPreferencesAction(formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
        throw new Error("Unauthorized");
    }

    const bio = formData.get('bio') as string;
    const tone = formData.get('tone') as string;
    const targetLengthStr = formData.get('targetLength') as string;
    const targetLength = targetLengthStr ? parseInt(targetLengthStr) : 1500;
    const emojiLevel = formData.get('emojiLevel') as string;

    const email = session.user.email.toLowerCase();
    console.log(`[ACTION] Updating preferences for ${email}:`, { bio, tone, targetLength, emojiLevel });

    await prisma.user.update({
        where: { email },
        data: {
            bio,
            tone,
            targetLength: isNaN(targetLength) ? 1500 : targetLength,
            emojiLevel: emojiLevel || 'keine'
        }
    });

    revalidatePath('/settings');
}
