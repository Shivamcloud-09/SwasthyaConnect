
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';

const GoogleIcon = () => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4"><title>Google</title><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.62 1.9-4.73 1.9-5.27 0-9.28-4.29-9.28-9.48s4.01-9.48 9.28-9.48c2.92 0 4.88 1.25 6.39 2.7l2.1-2.08C18.96.96 16.27 0 12.48 0 5.88 0 0 5.58 0 12s5.88 12 12.48 12c6.92 0 11.83-4.79 11.83-12.03 0-.79-.08-1.54-.2-2.28H12.48z"/></svg>
);

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
            console.error("Email/Password Login Error:", error);
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

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        try {
            await signInWithPopup(auth, googleProvider);
            toast({
                title: 'Login Successful',
                description: 'Welcome back!',
            });
            router.push('/');
        } catch (error: any) {
            console.error("Google Sign-In Error:", error);
            let description = 'Could not sign in with Google. Please try again.';
            if (error.code === 'auth/popup-closed-by-user') {
                description = 'The sign-in popup was closed before completing. Please try again.';
            } else if (error.code === 'auth/account-exists-with-different-credential') {
                description = 'An account already exists with the same email address but different sign-in credentials.';
            } else if (error.code === 'auth/operation-not-allowed') {
                description = 'Google Sign-In is not enabled for this project. Please enable it in your Firebase console.';
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
    }

  return (
    <div className="pt-6">
        <form onSubmit={handleLogin}>
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
        </form>

        <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
            </div>
        </div>
        <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading}>
           {isLoading ? 'Please wait...' : <><GoogleIcon /><span className="ml-2">Sign in with Google</span></>}
        </Button>
        
        <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="underline">
                Sign up
            </Link>
        </div>
    </div>
  )
}
