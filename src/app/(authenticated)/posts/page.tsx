import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PostCard } from './post-card';

async function getPostedArticles() {
    const session = await getServerSession();
    if (!session?.user?.email) return [];

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    });

    if (!user) return [];

    return await prisma.article.findMany({
        where: {
            status: 'POSTED',
            feed: {
                userId: user.id
            }
        },
        orderBy: { updatedAt: 'desc' },
        include: { feed: true }
    });
}

export default async function PostsPage() {
    const session = await getServerSession();
    if (!session) {
        redirect('/login');
    }

    const articles = await getPostedArticles();

    return (
        <div className="space-y-6">
            <div className="glass-card p-6 rounded-2xl shadow-lg">
                <h2 className="text-3xl font-extrabold tracking-tight text-gray-950">
                    Generierte Beiträge
                </h2>
                <p className="text-gray-800 font-medium mt-1">Ihre veröffentlichten LinkedIn-Beiträge im Überblick.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {articles.length === 0 ? (
                    <div className="col-span-full glass-card flex flex-col items-center justify-center p-12 rounded-2xl text-center">
                        <h3 className="text-lg font-bold text-gray-900">Noch keine Beiträge</h3>
                        <p className="text-gray-700 font-medium max-w-sm mt-2 mb-6">
                            Generieren Sie Ihren ersten LinkedIn-Beitrag aus den Vorschlägen.
                        </p>
                        <Button asChild variant="outline" className="glass-button hover:scale-105 transition-all duration-300">
                            <Link href="/dashboard">Zu den Vorschlägen</Link>
                        </Button>
                    </div>
                ) : (
                    articles.map((article) => (
                        <PostCard key={article.id} article={article} />
                    ))
                )}
            </div>
        </div>
    );
}
