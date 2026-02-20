'use client';

import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

export function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Button
            size="icon"
            variant="secondary"
            onClick={handleCopy}
            className="glass-button h-9 w-9 transition-all duration-300 hover:scale-110 rounded-xl"
            title={copied ? 'Kopiert!' : 'In Zwischenablage kopieren'}
        >
            {copied ? (
                <Check className="h-4 w-4" />
            ) : (
                <Copy className="h-4 w-4" />
            )}
        </Button>
    );
}
