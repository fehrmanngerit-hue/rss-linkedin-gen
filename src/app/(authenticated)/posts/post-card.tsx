'use client';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { CopyButton } from './copy-button';
import { deletePostAction } from '@/app/actions';
import { useState } from 'react';
import Link from 'next/link';

type Article = {
    id: string;
    title: string;
    link: string;
    generatedPost: string | null;
    updatedAt: Date;
    feed: {
        name: string | null;
    };
};

export function PostCard({ article }: { article: Article }) {
    const [expanded, setExpanded] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const postDisplay = (() => {
        if (!article.generatedPost) return 'Kein Beitrag gespeichert.';
        try {
            const parsed = JSON.parse(article.generatedPost);
            return parsed.linkedin?.caption || article.generatedPost;
        } catch (e) {
            return article.generatedPost;
        }
    })();

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await deletePostAction(article.id);
        } catch (error) {
            console.error('Error deleting post:', error);
            alert('Fehler beim Löschen des Beitrags');
            setIsDeleting(false);
        }
    };

    return (
        <Card className="glass-card flex flex-col rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01] border-white/30">
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-2 mb-2">
                    <Badge
                        variant="secondary"
                        className="bg-gradient-to-r from-secondary/20 to-secondary/30 text-secondary hover:from-secondary/30 hover:to-secondary/40 border-0 font-medium px-2.5 py-0.5 backdrop-blur-sm"
                    >
                        {article.feed.name || 'RSS Feed'}
                    </Badge>
                    <span className="text-xs text-muted-foreground font-mono bg-white/40 px-2 py-1 rounded-lg backdrop-blur-sm">
                        {new Date(article.updatedAt).toLocaleDateString('de-DE')}
                    </span>
                </div>
                <CardTitle className="text-lg leading-snug line-clamp-2">
                    {article.title}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 pb-4">
                <div className="bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-white/30 shadow-sm">
                    <p className={`text-sm whitespace-pre-wrap ${expanded ? '' : 'line-clamp-6'}`}>
                        {postDisplay}
                    </p>
                    {article.generatedPost && (
                        <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="mt-2 text-primary hover:text-primary/80 hover:bg-white/40 transition-all duration-300 hover:scale-105"
                        >
                            <Link href={`/generate/${article.id}`}>
                                <ChevronDown className="mr-1 h-4 w-4" />
                                Details & Bearbeiten
                            </Link>
                        </Button>
                    )}
                </div>
            </CardContent>
            <CardFooter className="flex flex-wrap justify-between items-center gap-3 pt-4 border-t border-white/20 bg-white/30 backdrop-blur-sm rounded-b-2xl">
                <div className="flex flex-wrap gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        className="glass-button h-9 w-9 transition-all duration-300 hover:scale-110 rounded-xl"
                        title="Quelle öffnen"
                    >
                        <a href={article.link} target="_blank" rel="noreferrer">
                            <ExternalLink className="h-4 w-4" />
                        </a>
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="glass-button h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10 transition-all duration-300 hover:scale-110 rounded-xl"
                        title={isDeleting ? 'Wird gelöscht...' : 'Löschen'}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
                <CopyButton text={postDisplay === 'Kein Beitrag gespeichert.' ? '' : postDisplay} />
            </CardFooter>
        </Card>
    );
}
