
'use client';

import LoginBackground from '@/components/LoginBackground';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AdminLoginForm from '@/components/AdminLoginForm';
import Link from 'next/link';

export default function HospitalAdminLoginPage() {
    return (
        <LoginBackground>
            <Card className="w-full max-w-md bg-card/80 backdrop-blur-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-headline">Admin Login</CardTitle>
                    <CardDescription>
                        Log in with your email and password.
                        <Link href="/login" className="underline ml-1">Not an admin?</Link>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <AdminLoginForm />
                </CardContent>
            </Card>
        </LoginBackground>
    );
}
