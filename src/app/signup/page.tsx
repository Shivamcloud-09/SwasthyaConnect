
'use client';

import UserSignupForm from "@/components/UserSignupForm";

export default function SignupPage() {
    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)] bg-muted/30 py-12">
            <UserSignupForm />
        </div>
    );
}
