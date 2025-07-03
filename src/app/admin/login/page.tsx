
'use client';

import UnifiedLoginForm from "@/components/UnifiedLoginForm";

export default function AdminLoginPage() {
    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)] bg-muted/30 py-12">
            <UnifiedLoginForm defaultTab="hospital" />
        </div>
    );
}
