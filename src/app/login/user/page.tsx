
'use client';

import LoginBackground from '@/components/LoginBackground';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import UserLoginForm from '@/components/UserLoginForm';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LoaderCircle } from 'lucide-react';

export default function UserLoginPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // If auth state is not loading and a user exists, redirect them away from the login page.
        if (!loading && user) {
            router.push('/');
        }
    }, [user, loading, router]);

    // Show a loading screen while checking for a user or during the redirection process.
    // This prevents the login form from flashing for an already authenticated user.
    if (loading || user) {
        return (
            <LoginBackground>
                 <div className="flex flex-col items-center justify-center gap-4 text-primary-foreground bg-card/50 p-8 rounded-lg">
                    <LoaderCircle className="h-10 w-10 animate-spin" />
                    <p className="font-semibold text-lg">Checking your session...</p>
                </div>
            </LoginBackground>
        );
    }
    
    // Only render the login form if we are not loading and there is no user.
    return (
        <LoginBackground>
            <Card className="w-full max-w-md bg-card/80 backdrop-blur-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-headline">User Login</CardTitle>
                    <CardDescription>
                        Access your health dashboard. 
                        <Link href="/login" className="underline ml-1">Go back</Link>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <UserLoginForm />
                </CardContent>
            </Card>
        </LoginBackground>
    );
}
