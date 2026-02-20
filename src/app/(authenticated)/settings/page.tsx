import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, ArrowLeft } from 'lucide-react';
import { ProfileForm } from './profile-form';
import { addFeed, deleteFeed, addKeyword, deleteKeyword } from '@/app/actions';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Link from 'next/link';

async function getUserSettings() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
        return null;
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email.toLowerCase() },
        include: {
            feeds: true,
            keywords: true
        }
    });

    console.log(`[PAGE] Settings loaded for ${session.user.email}:`, { emojiLevel: user?.emojiLevel });
    return user;
}

export default async function SettingsPage() {
    const user = await getUserSettings();

    if (!user) {
        redirect('/login');
    }

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="bg-card p-6 rounded-2xl shadow-sm border border-border flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild className="md:hidden hover:scale-110 transition-all duration-300">
                    <Link href="/dashboard"><ArrowLeft className="h-5 w-5" /></Link>
                </Button>
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-foreground">Einstellungen</h2>
                    <p className="text-muted-foreground font-medium">Verwalten Sie Ihre Inhaltsquellen und Präferenzen.</p>
                </div>
            </div>

            <div className="flex justify-start">
                <Button variant="outline" asChild className="border-border text-foreground hover:bg-muted transition-all duration-300">
                    <Link href="/dashboard"><ArrowLeft className="h-4 w-4" /> Zurück zum Dashboard</Link>
                </Button>
            </div>

            {/* Profile & AI Personality Section */}
            <Card className="bg-card rounded-2xl shadow-sm border-border overflow-hidden">
                <CardHeader className="border-b border-border pb-4">
                    <CardTitle className="flex items-center gap-2 text-foreground">
                        <span className="bg-primary text-primary-foreground w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold shadow-sm">0</span>
                        Profil & KI-Persönlichkeit
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">Personalisieren Sie, wie die KI Beiträge für Sie schreibt.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <ProfileForm initialData={{
                        bio: user.bio,
                        tone: user.tone,
                        targetLength: user.targetLength,
                        emojiLevel: user.emojiLevel
                    }} />
                </CardContent>
            </Card>

            <div className="grid gap-8 md:grid-cols-2">
                {/* Feeds Section */}
                <Card className="bg-card rounded-2xl shadow-sm border-border overflow-hidden">
                    <CardHeader className="border-b border-border pb-4">
                        <CardTitle className="flex items-center gap-2 text-foreground">
                            <span className="bg-secondary text-secondary-foreground w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold shadow-sm">1</span>
                            RSS-Feeds
                        </CardTitle>
                        <CardDescription className="text-muted-foreground">Fügen Sie URLs vertrauenswürdiger Nachrichtenquellen hinzu.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <form action={addFeed} className="flex gap-2 items-end">
                            <div className="grid w-full items-center gap-1.5">
                                <Label htmlFor="url" className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Feed-URL</Label>
                                <Input type="url" id="url" name="url" placeholder="https://..." required className="bg-card border-border text-foreground focus-visible:ring-secondary" />
                            </div>
                            <div className="grid w-full items-center gap-1.5">
                                <Label htmlFor="name" className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Name (Optional)</Label>
                                <Input type="text" id="name" name="name" placeholder="TechCrunch" className="bg-card border-border text-foreground focus-visible:ring-secondary" />
                            </div>
                            <Button type="submit" size="icon" className="bg-secondary text-secondary-foreground hover:shadow-lg shrink-0 transition-all duration-300 hover:scale-105">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </form>

                        <div className="space-y-2 p-1 max-h-[400px] overflow-y-auto border-t border-border pt-4">
                            {user.feeds.map((feed) => (
                                <div key={feed.id} className="flex items-center justify-between p-3 border border-border rounded-xl bg-card shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.01] group">
                                    <div className="overflow-hidden">
                                        <p className="font-semibold text-gray-900 truncate">{feed.name || feed.url}</p>
                                        <p className="text-xs text-muted-foreground truncate font-mono bg-muted px-1.5 py-0.5 rounded w-fit mt-1">{feed.url}</p>
                                    </div>
                                    <form action={deleteFeed.bind(null, feed.id)}>
                                        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-destructive hover:bg-destructive/10">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </form>
                                </div>
                            ))}
                            {user.feeds.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    <p className="text-sm">Noch keine Feeds hinzugefügt.</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Keywords Section */}
                <Card className="bg-card rounded-2xl shadow-sm border-border overflow-hidden">
                    <CardHeader className="border-b border-border pb-4">
                        <CardTitle className="flex items-center gap-2 text-foreground">
                            <span className="bg-accent text-accent-foreground w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold shadow-sm">2</span>
                            Stichwörter
                        </CardTitle>
                        <CardDescription className="text-muted-foreground">Filtern Sie Artikel nach Themen.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <form action={addKeyword} className="flex gap-2 items-end">
                            <div className="grid w-full items-center gap-1.5">
                                <Label htmlFor="term" className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Stichwort</Label>
                                <Input type="text" id="term" name="term" placeholder="z.B. KI, Klimawandel..." required className="bg-card border-border text-foreground focus-visible:ring-accent" />
                            </div>
                            <Button type="submit" size="icon" className="bg-accent text-accent-foreground hover:shadow-lg shrink-0 transition-all duration-300 hover:scale-105">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </form>

                        <div className="p-1 border-t border-border pt-4">
                            <div className="flex flex-wrap gap-2">
                                {user.keywords.map((keyword) => (
                                    <Badge key={keyword.id} variant="secondary" className="pl-3 pr-1 py-1.5 gap-1.5 flex items-center text-sm bg-card border border-border shadow-sm text-foreground hover:bg-muted transition-all duration-300 hover:scale-105">
                                        {keyword.term}
                                        <form action={deleteKeyword.bind(null, keyword.id)}>
                                            <button type="submit" className="ml-1 text-gray-400 hover:text-destructive transition-colors p-0.5 rounded-full hover:bg-muted">
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </form>
                                    </Badge>
                                ))}
                                {user.keywords.length === 0 && (
                                    <p className="text-sm text-muted-foreground text-center py-8 w-full">Keine Stichwörter hinzugefügt.</p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

        </div>
    );
}
