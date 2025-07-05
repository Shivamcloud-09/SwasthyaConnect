
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff } from 'lucide-react';

export default function UserSignupForm() {
    const router = useRouter();
    const { toast } = useToast();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const isFirebaseConfigured = !!auth;

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!auth) {
            toast({
                variant: 'destructive',
                title: 'Sign Up Failed',
                description: 'Firebase is not configured. Cannot sign up.',
            });
            return;
        }
        if (password !== confirmPassword) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Passwords do not match.',
            });
            return;
        }
        setIsLoading(true);
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            toast({
                title: 'Account Created!',
                description: 'You have been successfully signed up.',
            });
            router.push('/');
        } catch (error: any) {
            let description = 'An unexpected error occurred. Please try again.';
            if (error.code === 'auth/email-already-in-use') {
                description = 'This email address is already in use.';
            } else if (error.code === 'auth/weak-password') {
                description = 'The password is too weak. It must be at least 6 characters long.';
            }
            toast({
                variant: 'destructive',
                title: 'Sign Up Failed',
                description: description,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md">
            <form onSubmit={handleSignup}>
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-headline">Create a User Account</CardTitle>
                    <CardDescription>Enter your details below to sign up</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email-signup">Email</Label>
                        <Input id="email-signup" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password-signup">Password</Label>
                        <div className="relative">
                             <Input id="password-signup" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required className="pr-10" />
                             <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="confirm-password-signup">Confirm Password</Label>
                        <div className="relative">
                            <Input id="confirm-password-signup" type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="pr-10" />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground"
                                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                            >
                                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <Button type="submit" className="w-full" disabled={isLoading || !isFirebaseConfigured}>
                        {isLoading ? 'Creating Account...' : 'Sign Up'}
                    </Button>
                     {!isFirebaseConfigured && (
                        <p className="mt-4 text-center text-sm text-destructive">
                            Firebase is not configured. Sign up is disabled.
                        </p>
                    )}
                    <div className="text-center text-sm">
                        Already have an account?{" "}
                        <Link href="/login" className="underline">
                            Sign in
                        </Link>
                    </div>
                </CardFooter>
            </form>
        </Card>
    );
}
