
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from '@/hooks/use-toast';

export default function AdminLoginForm() {
    const router = useRouter();
    const { toast } = useToast();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const isFirebaseConfigured = !!auth;

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!auth) {
            toast({
                variant: 'destructive',
                title: 'Login Failed',
                description: 'Firebase is not configured. Cannot log in.',
            });
            return;
        }
        setIsLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            // This flag is checked by the dashboard to protect the route.
            localStorage.setItem('swasthya-admin-auth', 'true');
            toast({
                title: 'Login Successful',
                description: 'Redirecting to dashboard...',
            });
            router.push('/admin/dashboard');
        } catch (error: any) {
             console.error("Admin Login Error:", error);
             let description = 'An unexpected error occurred. Please try again.';
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                description = 'Invalid email or password. Please try again.';
            } else {
                description = `An unexpected error occurred: ${error.message}`;
            }
             toast({
                variant: 'destructive',
                title: 'Login Failed',
                description: description,
            });
        } finally {
            setIsLoading(false);
        }
    };

  return (
    <div className="pt-6">
        <form onSubmit={handleLogin}>
            <div className="grid gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="email-admin">Email</Label>
                    <Input id="email-admin" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="admin@example.com" />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="password-admin">Password</Label>
                    <Input id="password-admin" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
            </div>
            <Button type="submit" className="w-full mt-6" disabled={isLoading || !isFirebaseConfigured}>
                {isLoading ? 'Signing In...' : 'Sign in'}
            </Button>
        </form>
         {!isFirebaseConfigured && (
            <p className="mt-4 text-center text-sm text-destructive">
                Firebase is not configured. Admin login is disabled.
            </p>
        )}
         <div className="mt-4 text-center text-sm">
            Don&apos;t have an admin account?{" "}
            <Link href="/admin/signup" className="underline">
                Create one
            </Link>
        </div>
    </div>
  )
}
