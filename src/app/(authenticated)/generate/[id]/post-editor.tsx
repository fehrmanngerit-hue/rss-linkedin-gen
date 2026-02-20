'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { generatePostAction, markAsPostedAction } from '@/app/actions';
import { Loader2, Copy, Check, ArrowLeft, Sparkles, Image as ImageIcon, BarChart3, Quote, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Define Article type properly or import from prisma generated types if possible, 
// using any for quick mvp
export function PostEditor({ article }: { article: any }) {
    const [content, setContent] = useState(() => {
        if (article.generatedPost) {
            try {
                const parsed = JSON.parse(article.generatedPost);
                return parsed.linkedin?.caption || article.generatedPost;
            } catch (e) {
                return article.generatedPost;
            }
        }
        return '';
    });
    const [postData, setPostData] = useState<any>(() => {
        if (article.generatedPost) {
            try {
                return JSON.parse(article.generatedPost);
            } catch (e) {
                return null;
            }
        }
        return null;
    });
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const router = useRouter();

    const handleGenerate = async () => {
        setIsLoading(true);
        try {
            const result = await generatePostAction(article.id);
            if (result) {
                try {
                    const parsed = JSON.parse(result);
                    setPostData(parsed);
                    setContent(parsed.linkedin.caption);
                } catch (e) {
                    console.error("Failed to parse AI response as JSON", e);
                    setContent(result); // Fallback to raw result if not JSON
                }
            }
        } catch (error) {
            console.error(error);
            alert('Fehler beim Erstellen des Beitrags. Bitte prüfen Sie den API-Key.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleMarkPosted = async () => {
        if (!content) {
            alert('Bitte generieren Sie zuerst einen Beitrag.');
            return;
        }
        // Update the caption in postData before saving
        const dataToSave = postData ? {
            ...postData,
            linkedin: {
                ...postData.linkedin,
                caption: content
            }
        } : content;

        await markAsPostedAction(article.id, typeof dataToSave === 'string' ? dataToSave : JSON.stringify(dataToSave));
    };

    return (
        <div className="grid gap-6">
            <Card className="bg-card rounded-2xl shadow-sm border-border">
                <CardHeader>
                    <CardTitle className="text-xl">Quellartikel: {article.title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground mb-4">{article.summary}</p>
                    <a href={article.link} target="_blank" rel="noreferrer" className="text-primary hover:underline text-sm transition-all duration-300 hover:scale-105 inline-block">
                        Originalartikel lesen &rarr;
                    </a>
                </CardContent>
                <CardFooter>
                    {!content && (
                        <Button onClick={handleGenerate} disabled={isLoading} className="w-full bg-primary text-primary-foreground shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 font-bold">
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Entwurf wird erstellt...
                                </>
                            ) : (
                                'LinkedIn-Entwurf erstellen'
                            )}
                        </Button>
                    )}
                </CardFooter>
            </Card>

            {postData && (
                <div className="grid gap-6 lg:grid-cols-3">
                    <Card className="lg:col-span-2 bg-card rounded-3xl shadow-md border-border ring-1 ring-primary/10 overflow-hidden flex flex-col">
                        <CardHeader className="bg-muted/50 border-b border-border pt-4 pb-3">
                            <div className="flex justify-between items-center">
                                <CardTitle className="flex items-center gap-2">
                                    <Quote className="h-5 w-5 text-primary" />
                                    LinkedIn-Beitrag
                                </CardTitle>
                                <Badge variant="outline" className="bg-card border-border font-mono text-xs text-muted-foreground">
                                    {content.length} Zeichen
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 pt-3">
                            <Textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="min-h-[450px] font-sans text-base bg-card border-border focus-visible:ring-primary focus-visible:ring-offset-0 resize-none rounded-2xl text-foreground"
                                placeholder="Ihr Beitrag erscheint hier..."
                            />
                            {postData.linkedin.hashtags && (
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {postData.linkedin.hashtags.map((tag: string) => (
                                        <Badge key={tag} className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 cursor-default transition-colors">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                            {postData.linkedin.call_to_action && (
                                <div className="mt-4 p-3 bg-secondary/5 rounded-xl border border-secondary/10 flex items-start gap-3">
                                    <Info className="h-4 w-4 text-secondary mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-xs font-bold text-secondary uppercase tracking-wider mb-1">Empfohlener Call to Action</p>
                                        <p className="text-sm text-foreground">{postData.linkedin.call_to_action}</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="flex justify-between border-t border-border py-4 px-6">
                            <Button variant="ghost" onClick={() => { setPostData(null); setContent(''); }} className="text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-300">
                                Neu starten
                            </Button>
                            <div className="flex gap-3">
                                <Button variant="secondary" onClick={handleCopy} className="shadow-sm hover:shadow-md transition-all duration-300">
                                    {copied ? <Check className="mr-2 h-4 w-4 text-green-600" /> : <Copy className="mr-2 h-4 w-4" />}
                                    {copied ? 'Kopiert!' : 'Kopieren'}
                                </Button>
                                <Button onClick={handleMarkPosted} className="bg-primary text-primary-foreground font-bold shadow-sm hover:shadow-md transition-all duration-300">
                                    Entwurf speichern
                                </Button>
                            </div>
                        </CardFooter>
                    </Card>

                    <div className="space-y-6">
                        {/* Analysis Card */}
                        <Card className="bg-card rounded-3xl shadow-sm border-border overflow-hidden text-foreground">
                            <CardHeader className="bg-muted/50 border-b border-border pt-4 pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <BarChart3 className="h-4 w-4 text-primary" />
                                    Analyse & Strategie
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-3 space-y-3">
                                <div className="grid grid-cols-1 gap-3">
                                    <div className="bg-muted p-3 rounded-2xl border border-border">
                                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Handlungsfeld</p>
                                        <p className="text-sm font-semibold">{postData.article_analysis.handlungsfeld}</p>
                                    </div>
                                    <div className="bg-muted p-3 rounded-2xl border border-border">
                                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Relevanz</p>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-1.5 bg-muted-foreground/20 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary"
                                                    style={{ width: `${postData.article_analysis.relevance_score * 10}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-bold text-foreground">{postData.article_analysis.relevance_score}/10</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-muted p-3 rounded-2xl border border-border">
                                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Emotion</p>
                                    <p className="text-sm italic">"{postData.article_analysis.emotion}"</p>
                                </div>
                                <div className="bg-muted p-3 rounded-2xl border border-border">
                                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Kernbotschaft</p>
                                    <p className="text-sm leading-snug">{postData.article_analysis.key_message}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Image Suggestion Card */}
                        <Card className="bg-card rounded-3xl shadow-sm border-border overflow-hidden text-foreground">
                            <CardHeader className="bg-muted/50 border-b border-border pt-4 pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <ImageIcon className="h-4 w-4 text-secondary" />
                                    Bild-Empfehlung
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-3 space-y-3">
                                <div className="bg-muted p-3 rounded-2xl border border-border">
                                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Motiv-Beschreibung</p>
                                    <p className="text-sm leading-relaxed">{postData.sharepic_suggestion.description}</p>
                                </div>
                                {postData.sharepic_suggestion.text_overlay && (
                                    <div className="bg-muted p-3 rounded-2xl border border-border">
                                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Text im Bild (Overlay)</p>
                                        <div className="p-2 bg-gray-900 text-white rounded-lg text-xs font-mono text-center">
                                            {postData.sharepic_suggestion.text_overlay}
                                        </div>
                                    </div>
                                )}
                                <div className="bg-muted p-3 rounded-2xl border border-border">
                                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Farbstimmung</p>
                                    <div className="flex items-center gap-2">
                                        <div
                                            className={cn(
                                                "w-3 h-3 rounded-full",
                                                postData.sharepic_suggestion.color_mood.toLowerCase().includes('warm') ? "bg-orange-400" :
                                                    postData.sharepic_suggestion.color_mood.toLowerCase().includes('ruhig') ? "bg-blue-400" : "bg-green-400"
                                            )}
                                        />
                                        <p className="text-sm">{postData.sharepic_suggestion.color_mood}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            <div className="flex justify-start">
                <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-300">
                    <Link href="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" /> Zurück zum Dashboard</Link>
                </Button>
            </div>
        </div>
    );
}
