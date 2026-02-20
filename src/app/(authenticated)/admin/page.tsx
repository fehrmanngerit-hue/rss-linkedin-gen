import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, UserPlus, Shield, User } from 'lucide-react';
import { createUserAction, deleteUserAction, updateUserRoleAction } from '@/app/actions';
import { Badge } from '@/components/ui/badge';

async function getUsers() {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== 'ADMIN') return null;
    return await prisma.user.findMany({
        orderBy: { createdAt: 'desc' }
    });
}

export default async function AdminPage() {
    const session = await getServerSession(authOptions);
    const users = await getUsers();

    if (!users) {
        redirect('/dashboard');
    }

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="glass-card p-6 rounded-2xl shadow-lg">
                <h2 className="text-3xl font-extrabold tracking-tight text-gray-950">Nutzerverwaltung</h2>
                <p className="text-gray-800 font-medium">Verwalten Sie Benutzerkonten und Zugriffsrechte.</p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
                {/* Create User Section */}
                <Card className="glass-card rounded-2xl shadow-lg border-white/30 overflow-hidden h-fit">
                    <CardHeader className="bg-primary/10 backdrop-blur-sm border-b border-white/20">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <UserPlus className="h-5 w-5 text-primary" />
                            Neuer Nutzer
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <form action={createUserAction} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">E-Mail</Label>
                                <Input id="email" name="email" type="email" required placeholder="name@caritas.de" className="bg-white/50" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Passwort</Label>
                                <Input id="password" name="password" type="password" required className="bg-white/50" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role">Rolle</Label>
                                <select
                                    id="role"
                                    name="role"
                                    className="w-full rounded-md border border-input bg-white/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value="USER">Standard-Nutzer</option>
                                    <option value="ADMIN">Administrator</option>
                                </select>
                            </div>
                            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                                Nutzer anlegen
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Users List Section */}
                <div className="md:col-span-2 space-y-4">
                    {users.map((user) => (
                        <Card key={user.id} className="glass-card rounded-xl border-white/30 shadow-md group">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-full ${user.role === 'ADMIN' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                                        {user.role === 'ADMIN' ? <Shield className="h-5 w-5" /> : <User className="h-5 w-5" />}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">{user.email}</p>
                                        <p className="text-xs text-muted-foreground">Erstellt am {new Date(user.createdAt).toLocaleDateString('de-DE')}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'} className="mr-2">
                                        {user.role}
                                    </Badge>

                                    {session?.user?.id !== user.id && (
                                        <form action={deleteUserAction.bind(null, user.id)}>
                                            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-destructive hover:bg-destructive/10">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </form>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
