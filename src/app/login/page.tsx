
'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Hospital } from 'lucide-react';
import LoginBackground from '@/components/LoginBackground';

export default function RoleSelectionPage() {
    return (
        <LoginBackground>
            <Card className="w-full max-w-md bg-card/80 backdrop-blur-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-headline">Welcome to SwasthyaConnect</CardTitle>
                    <CardDescription>Please select your role to continue.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-4">
                    <Button asChild size="lg" className="h-16 text-lg">
                        <Link href="/login/user">
                            <User className="mr-4" /> I'm a User
                        </Link>
                    </Button>
                    <Button asChild size="lg" variant="secondary" className="h-16 text-lg">
                        <Link href="/login/admin">
                             <Hospital className="mr-4" /> I'm a Hospital Admin
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </LoginBackground>
    );
}
