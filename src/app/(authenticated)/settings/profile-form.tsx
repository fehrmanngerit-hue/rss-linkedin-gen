'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateUserPreferencesAction } from '@/app/actions';
import { CheckCircle2 } from 'lucide-react';

type UserPreferences = {
    bio: string | null;
    tone: string | null;
    targetLength: number | null;
    emojiLevel: string | null;
};

export function ProfileForm({ initialData }: { initialData: UserPreferences }) {
    const [isPending, startTransition] = useTransition();
    const [success, setSuccess] = useState(false);

    // We use local state for the emoji level to avoid the "jumping" behavior
    const [emojiLevel, setEmojiLevel] = useState(initialData.emojiLevel || 'keine');

    async function action(formData: FormData) {
        setSuccess(false);
        startTransition(async () => {
            try {
                await updateUserPreferencesAction(formData);
                setSuccess(true);
                // Hide success message after 3 seconds
                setTimeout(() => setSuccess(false), 3000);
            } catch (error) {
                console.error("Failed to update preferences:", error);
            }
        });
    }

    return (
        <form action={action} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="bio" className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Über mich & meine Position</Label>
                    <textarea
                        id="bio"
                        name="bio"
                        defaultValue={initialData.bio || ''}
                        placeholder="Beschreiben Sie sich und Ihre Arbeit (z.B. KI-Beauftragter bei der Caritas...)"
                        className="w-full min-h-[120px] rounded-xl border border-border bg-card p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all text-foreground"
                    />
                    <p className="text-xs text-muted-foreground">Diese Information hilft der KI, den richtigen Kontext für Ihre Beiträge zu finden.</p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="tone" className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Tonalität</Label>
                    <Input
                        id="tone"
                        name="tone"
                        defaultValue={initialData.tone || 'authentisch, nahbar'}
                        className="bg-card border-border text-foreground"
                        placeholder="z.B. professionell, locker, expertenhaft"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="targetLength" className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Ziel-Länge (Zeichen)</Label>
                    <Input
                        id="targetLength"
                        name="targetLength"
                        type="number"
                        defaultValue={initialData.targetLength || 1500}
                        className="bg-card border-border text-foreground"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="emojiLevel" className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Emoji-Nutzung</Label>
                    <select
                        id="emojiLevel"
                        name="emojiLevel"
                        value={emojiLevel}
                        onChange={(e) => setEmojiLevel(e.target.value)}
                        className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                    >
                        <option value="viel">Viel (Interaktionsstark)</option>
                        <option value="wenig">Wenig (Punktuell)</option>
                        <option value="keine">Keine (Puristisch)</option>
                    </select>
                </div>
            </div>
            <div className="flex items-center justify-end gap-4 pt-2">
                {success && (
                    <div className="flex items-center gap-2 text-green-600 font-medium animate-in fade-in slide-in-from-right-2">
                        <CheckCircle2 className="h-5 w-5" />
                        <span>Änderungen erfolgreich gespeichert!</span>
                    </div>
                )}
                <Button
                    type="submit"
                    disabled={isPending}
                    className="bg-primary text-white hover:bg-primary/90 shadow-md transition-all hover:scale-105 active:scale-95 px-8"
                >
                    {isPending ? 'Wird gespeichert...' : 'Profil speichern'}
                </Button>
            </div>
        </form>
    );
}
