'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Home, Settings, LogOut, FileText } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';
import Image from 'next/image';

export function DashboardNav() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const isAdmin = session?.user?.role === 'ADMIN';

    const links = [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/settings', label: 'Settings', icon: Settings },
    ];

    return (
        <nav className="glass-nav w-64 h-screen p-4 flex flex-col fixed left-0 top-0">
            <div className="mb-8 pl-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-white flex items-center justify-center shadow-sm p-1">
                        <Image src="/Logo.png" alt="CS" width={28} height={28} className="object-contain" />
                    </div>
                    <h1 className="text-xl font-black text-gray-950 tracking-tight">
                        Content Scanner
                    </h1>
                </div>
            </div>
            <div className="space-y-2 flex-1">
                {/* Replaced the links.map with hardcoded Link components */}
                <Link
                    href="/dashboard"
                    className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-300",
                        pathname === "/dashboard"
                            ? "bg-primary/10 text-primary shadow-md scale-[1.02]"
                            : "text-gray-700 font-medium hover:bg-white/40 hover:scale-[1.02] hover:shadow-sm"
                    )}
                >
                    <Home className="h-4 w-4" />
                    Dashboard
                </Link>
                <Link
                    href="/posts"
                    className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-300",
                        pathname === "/posts"
                            ? "bg-secondary/10 text-secondary shadow-md scale-[1.02]"
                            : "text-gray-700 font-medium hover:bg-white/40 hover:scale-[1.02] hover:shadow-sm"
                    )}
                >
                    <FileText className="h-4 w-4" />
                    Beiträge
                </Link>
                <Link
                    href="/settings"
                    className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-300",
                        pathname === "/settings"
                            ? "bg-accent/10 text-accent shadow-md scale-[1.02]"
                            : "text-gray-700 font-medium hover:bg-white/40 hover:scale-[1.02] hover:shadow-sm"
                    )}
                >
                    <Settings className="h-4 w-4" />
                    Einstellungen
                </Link>
                {isAdmin && (
                    <Link
                        href="/admin"
                        className={cn(
                            "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-300",
                            pathname === "/admin"
                                ? "bg-gray-900/10 text-gray-950 shadow-md scale-[1.02]"
                                : "text-gray-700 font-medium hover:bg-white/40 hover:scale-[1.02] hover:shadow-sm"
                        )}
                    >
                        <ShieldAlert className="h-4 w-4" />
                        Administration
                    </Link>
                )}
            </div>
            <div className="p-4 border-t border-white/20">
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all duration-300 hover:scale-[1.02]"
                    onClick={() => signOut()}
                >
                    <LogOut size={18} />
                    Abmelden
                </Button>
            </div>
        </nav>
    );
}
