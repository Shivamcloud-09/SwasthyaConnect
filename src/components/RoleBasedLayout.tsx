
'use client';

import { useAuth } from '@/context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LoaderCircle } from 'lucide-react';

export default function RoleBasedLayout({ children }: { children: React.ReactNode }) {
    const { role, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup') || pathname.startsWith('/admin/login') || pathname.startsWith('/admin/signup');

    useEffect(() => {
        if (loading || !role || isAuthPage) {
            // Don't do anything while loading, if user is not logged in, or on auth pages.
            return;
        }

        const isAdminPath = pathname.startsWith('/admin');

        // Rule 1: Admin should only be on admin pages.
        if (role === 'admin' && !isAdminPath) {
            router.replace('/admin/dashboard');
        }
        
        // Rule 2: User should not be on admin pages.
        if (role === 'user' && isAdminPath) {
            router.replace('/');
        }
    }, [role, loading, pathname, router, isAuthPage]);
    
    // To prevent content flicker during redirection, we can check the condition before rendering children
    if (!loading && role && !isAuthPage) {
        const isAdminPath = pathname.startsWith('/admin');
        if ((role === 'admin' && !isAdminPath) || (role === 'user' && isAdminPath)) {
            // While redirecting, show a loader
             return (
                <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
                    <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
                </div>
            );
        }
    }

    return <>{children}</>;
}
