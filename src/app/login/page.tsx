
'use client';

import UnifiedLoginForm from "@/components/UnifiedLoginForm";

export default function LoginPage() {
    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)] bg-muted/30 py-12">
            <UnifiedLoginForm defaultTab="user" />
        </div>
    );
}
