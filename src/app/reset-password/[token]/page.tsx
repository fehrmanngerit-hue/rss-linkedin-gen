'use client';

import { useState, use } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { resetPasswordAction } from '@/app/actions';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function ResetPasswordPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = use(params);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (formData: FormData) => {
        setIsLoading(true);
        setError(null);

        const password = formData.get('password') as string;
        const confirm = formData.get('confirm') as string;

        if (password !== confirm) {
            setError("Passwörter stimmen nicht überein");
            setIsLoading(false);
            return;
        }

        const result = await resetPasswordAction(token, formData);

        setIsLoading(false);
        if (result?.error) {
            setError(result.error);
        } else {
            setIsSubmitted(true);
        }
    };

    if (isSubmitted) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Card className="max-w-md w-full bg-card border-border shadow-sm rounded-3xl overflow-hidden">
                    <CardContent className="pt-12 pb-12 flex flex-col items-center text-center space-y-4">
                        <div className="p-3 bg-green-100 rounded-full">
                            <CheckCircle2 className="h-12 w-12 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold">Passwort zurückgesetzt</h2>
                        <p className="text-muted-foreground">
                            Ihr Passwort wurde erfolgreich geändert. Sie können sich jetzt mit Ihrem neuen Passwort anmelden.
                        </p>
                        <Button asChild className="mt-6 rounded-xl bg-primary">
                            <Link href="/login">Zum Login</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="max-w-md w-full bg-card border-border shadow-sm rounded-3xl overflow-hidden">
                <CardHeader className="pt-10 pb-6 text-center">
                    <CardTitle className="text-3xl font-black tracking-tight">Neues Passwort</CardTitle>
                    <CardDescription className="text-gray-600 font-medium">
                        Vergeben Sie jetzt ein neues Passwort für Ihr Konto.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-xl flex items-center gap-2 border border-destructive/20">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="password">Neues Passwort</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="h-12 rounded-xl bg-card border-border text-foreground"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirm">Passwort bestätigen</Label>
                            <Input
                                id="confirm"
                                name="confirm"
                                type="password"
                                required
                                className="h-12 rounded-xl bg-card border-border text-foreground"
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-12 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg transition-all duration-300"
                        >
                            {isLoading ? 'Wird gespeichert...' : 'Passwort speichern'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
