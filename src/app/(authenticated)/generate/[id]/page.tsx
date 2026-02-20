import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { PostEditor } from './post-editor'; // Need to duplicate/move post-editor too

async function getArticle(id: string) {
    const session = await getServerSession();
    if (!session?.user?.email) return null;

    const article = await prisma.article.findUnique({
        where: { id },
        include: { feed: true }
    });

    // Verify ownership via feed
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!article || !user || article.feed.userId !== user.id) return null;

    return article;
}

export default async function GeneratePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const article = await getArticle(id);

    if (!article) {
        redirect('/dashboard');
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <PostEditor article={article} />
        </div>
    );
}
