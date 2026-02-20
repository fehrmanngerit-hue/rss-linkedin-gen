'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';
import Image from 'next/image';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const res = await signIn('credentials', {
            email,
            password,
            redirect: false,
        });

        if (res?.error) {
            setError('Invalid email or password');
            setIsLoading(false);
        } else {
            router.push('/dashboard');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="bg-card w-full max-w-[400px] shadow-sm rounded-2xl border-border animate-in fade-in zoom-in duration-500">
                <CardHeader className="text-center pb-8">
                    <div className="mx-auto w-16 h-16 rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-border overflow-hidden bg-white p-2">
                        <Image src="/Logo.png" alt="Caritas Logo" width={64} height={64} className="object-contain" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-center text-foreground mb-2 tracking-tight">
                        Content Scanner
                    </h2>
                    <p className="text-center text-muted-foreground font-medium">
                        Melden Sie sich an, um fortzufahren
                    </p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium text-foreground">
                                E-Mail
                            </Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="ihre.email@caritas.de"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="h-11 bg-card border-border text-foreground"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label htmlFor="password" className="text-sm font-medium text-foreground">
                                    Passwort
                                </Label>
                                <Link href="/forgot-password" title="Passwort vergessen?" className="text-xs text-muted-foreground hover:text-primary transition-colors font-medium">
                                    Passwort vergessen?
                                </Link>
                            </div>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="h-11 bg-card border-border text-foreground"
                            />
                        </div>

                        {error && (
                            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-xl border border-destructive/20">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-11 bg-primary text-primary-foreground font-bold border-0 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Wird angemeldet...' : 'Anmelden'}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="justify-center text-sm text-muted-foreground font-medium border-t border-border rounded-b-2xl">
                    © 2026 Gerit Fehrmann
                </CardFooter>
            </Card>
        </div>
    );
}
