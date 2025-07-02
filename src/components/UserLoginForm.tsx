
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';

export default function UserLoginForm() {
    const router = useRouter();
    const { toast } = useToast();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            toast({
                title: 'Login Successful',
                description: 'Welcome back!',
            });
            router.push('/');
        } catch (error: any) {
            let description = 'An unexpected error occurred. Please try again.';
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                description = 'Invalid email or password. Please try again.';
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
    <form onSubmit={handleLogin} className="pt-6">
        <div className="grid gap-4">
            <div className="grid gap-2">
                <Label htmlFor="email-user">Email</Label>
                <Input id="email-user" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" required />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="password-user">Password</Label>
                <Input id="password-user" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
        </div>
        <Button type="submit" className="w-full mt-6" disabled={isLoading}>
            {isLoading ? 'Signing In...' : 'Sign in'}
        </Button>
        <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="underline">
                Sign up
            </Link>
        </div>
    </form>
  )
}
