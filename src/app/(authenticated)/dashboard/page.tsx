import prisma from '@/lib/prisma';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ExternalLink, Sparkles } from 'lucide-react';
import { processAllFeeds } from '@/lib/rss';

async function getArticles() {
    return await prisma.article.findMany({
        where: { status: 'NEW' },
        orderBy: { publishedAt: 'desc' },
        include: { feed: true }
    });
}

export default async function DashboardPage() {
    const articles = await getArticles();

    return (
        <div className="space-y-6">
            <div className="bg-card border border-border flex justify-between p-6 rounded-2xl shadow-sm">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
                        Vorschläge
                    </h2>
                    <p className="text-muted-foreground font-medium mt-1">Die neuesten Artikel passend zu Ihren Stichwörtern.</p>
                </div>
                <form action={async () => {
                    'use server';
                    await processAllFeeds();
                }}>
                    <Button
                        size="lg"
                        className="bg-primary text-primary-foreground shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-300 font-bold"
                    >
                        Feeds jetzt scannen
                    </Button>
                </form>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {articles.length === 0 ? (
                    <div className="col-span-full bg-card border border-border flex flex-col items-center justify-center p-12 rounded-2xl text-center shadow-sm">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                            <Sparkles className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground">Keine neuen Artikel gefunden</h3>
                        <p className="text-muted-foreground font-medium max-w-sm mt-2 mb-6">
                            Versuchen Sie, Ihre Feeds zu scannen oder weitere Stichwörter in den Einstellungen hinzuzufügen.
                        </p>
                        <Button asChild variant="outline" className="border-border text-foreground hover:bg-muted transition-all duration-300">
                            <Link href="/settings">Zu den Einstellungen</Link>
                        </Button>
                    </div>
                ) : (
                    articles.map((article) => (
                        <Card
                            key={article.id}
                            className="bg-card group flex flex-col rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border-border"
                        >
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start gap-2 mb-2">
                                    <Badge
                                        variant="secondary"
                                        className="bg-secondary text-secondary-foreground border-0 font-medium px-2.5 py-0.5"
                                    >
                                        {article.feed.name || 'RSS Feed'}
                                    </Badge>
                                    <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded-lg">
                                        {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('de-DE') : 'Neu'}
                                    </span>
                                </div>
                                <CardTitle className="text-lg leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-300 text-foreground font-bold">
                                    <a
                                        href={article.link}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="hover:underline decoration-primary/30 underline-offset-4"
                                    >
                                        {article.title}
                                    </a>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 pb-4">
                                <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed font-medium">
                                    {article.summary || "Keine Zusammenfassung verfügbar."}
                                </p>
                            </CardContent>
                            <CardFooter className="flex justify-between pt-4 border-t border-border rounded-b-2xl">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    asChild
                                    className="text-muted-foreground hover:text-primary hover:bg-muted transition-all duration-300 rounded-xl"
                                    title="Originalartikel lesen"
                                >
                                    <a href={article.link} target="_blank" rel="noreferrer">
                                        <ExternalLink className="h-5 w-5" />
                                    </a>
                                </Button>
                                <Button
                                    size="sm"
                                    className="bg-primary text-primary-foreground shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 font-bold"
                                    asChild
                                >
                                    <Link href={`/generate/${article.id}`}>
                                        <Sparkles className="mr-2 h-3.5 w-3.5" />
                                        Generieren
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
