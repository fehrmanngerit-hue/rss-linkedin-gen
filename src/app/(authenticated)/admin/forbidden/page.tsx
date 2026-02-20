import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';

export default function ForbiddenPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
            <div className="p-4 bg-destructive/10 rounded-full">
                <ShieldAlert className="h-12 w-12 text-destructive" />
            </div>
            <div className="space-y-2">
                <h1 className="text-2xl font-bold">Zugriff verweigert</h1>
                <p className="text-muted-foreground">Sie haben keine Berechtigung, auf diese Seite zuzugreifen.</p>
            </div>
            <Button asChild>
                <Link href="/dashboard">Zurück zum Dashboard</Link>
            </Button>
        </div>
    );
}
