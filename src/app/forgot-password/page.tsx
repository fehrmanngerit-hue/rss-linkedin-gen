'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { requestPasswordResetAction } from '@/app/actions';
import { CheckCircle2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (formData: FormData) => {
        setIsLoading(true);
        await requestPasswordResetAction(formData);
        setIsLoading(false);
        setIsSubmitted(true);
    };

    if (isSubmitted) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Card className="max-w-md w-full bg-card border-border shadow-sm rounded-3xl overflow-hidden">
                    <CardContent className="pt-12 pb-12 flex flex-col items-center text-center space-y-4">
                        <div className="p-3 bg-green-100 rounded-full">
                            <CheckCircle2 className="h-12 w-12 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold">E-Mail gesendet</h2>
                        <p className="text-muted-foreground">
                            Wenn ein Konto mit dieser E-Mail existiert, haben wir Anweisungen zum Zurücksetzen des Passworts gesendet.
                        </p>
                        <Button asChild variant="outline" className="mt-6 rounded-xl">
                            <Link href="/login">Zurück zum Login</Link>
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
                    <CardTitle className="text-3xl font-black tracking-tight">Passwort vergessen?</CardTitle>
                    <CardDescription className="text-gray-600 font-medium">
                        Geben Sie Ihre E-Mail ein, um einen Reset-Link zu erhalten.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="font-bold text-xs uppercase tracking-wider text-gray-700">E-Mail Adresse</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                required
                                placeholder="ihre.email@caritas.de"
                                className="h-12 rounded-xl bg-card border-border focus:ring-primary text-foreground"
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-12 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            {isLoading ? 'Wird verarbeitet...' : 'Reset-Link senden'}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="pb-10 pt-2 flex justify-center">
                    <Link href="/login" className="text-sm font-semibold text-gray-600 hover:text-primary flex items-center gap-2">
                        <ArrowLeft size={16} /> Zurück zur Anmeldung
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}
