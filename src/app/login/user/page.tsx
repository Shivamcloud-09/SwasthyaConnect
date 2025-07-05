
'use client';

import LoginBackground from '@/components/LoginBackground';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import UserLoginForm from '@/components/UserLoginForm';
import Link from 'next/link';

export default function UserLoginPage() {
    return (
        <LoginBackground>
            <Card className="w-full max-w-md bg-card/80 backdrop-blur-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-headline">User Login</CardTitle>
                    <CardDescription>
                        Access your health dashboard. Not an admin? 
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
