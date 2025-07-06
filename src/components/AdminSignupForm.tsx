
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff } from 'lucide-react';

export default function AdminSignupForm() {
    const router = useRouter();
    const { toast } = useToast();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const isFirebaseConfigured = !!auth && !!db;

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFirebaseConfigured) {
           toast({
               variant: 'destructive',
               title: 'Sign Up Failed',
               description: 'Firebase is not configured. Cannot sign up.',
           });
           return;
       }
        if (password !== confirmPassword) {
            toast({ variant: 'destructive', title: 'Error', description: 'Passwords do not match.' });
            return;
        }

        setIsLoading(true);
        try {
            // Create user in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // ONLY create the admin user's profile.
            // Hospital registration will be handled from the dashboard.
            const adminDocRef = doc(db, "hospitalAdmins", user.uid);
            await setDoc(adminDocRef, {
                uid: user.uid,
                email: user.email,
                createdAt: serverTimestamp(),
            });

            toast({
                title: 'Admin Account Created!',
                description: `Welcome! Redirecting to your dashboard to complete hospital setup.`,
            });
            
            router.push('/admin/dashboard');

        } catch (error: any) {
            console.error("Admin Signup Error:", error);
            let description = 'An unexpected error occurred. Please try again.';
            if (error.code === 'auth/email-already-in-use') {
                description = 'This email address is already registered.';
            } else if (error.code === 'auth/weak-password') {
                description = 'The password is too weak. It must be at least 6 characters long.';
            } else if (error.code === 'permission-denied' || error.code === 'PERMISSION_DENIED') {
                description = 'You do not have permission to perform this action. Please check Firestore security rules.'
            }
            toast({ variant: 'destructive', title: 'Sign Up Failed', description });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md bg-card/80 backdrop-blur-md">
            <form onSubmit={handleSignup}>
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-headline">Create Admin Account</CardTitle>
                    <CardDescription>Step 1: Create your admin login credentials. You will register your hospital on the next screen.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email-signup-admin">Admin Email</Label>
                        <Input id="email-signup-admin" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@example.com" required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password-signup-admin">Password</Label>
                        <div className="relative">
                            <Input 
                                id="password-signup-admin" 
                                type={showPassword ? "text" : "password"} 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                required 
                                className="pr-10"
                            />
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
                        <Label htmlFor="confirm-password-signup-admin">Confirm Password</Label>
                        <div className="relative">
                            <Input 
                                id="confirm-password-signup-admin" 
                                type={showConfirmPassword ? "text" : "password"} 
                                value={confirmPassword} 
                                onChange={(e) => setConfirmPassword(e.target.value)} 
                                required 
                                className="pr-10"
                            />
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
                        {isLoading ? 'Creating Account...' : 'Create Admin Account'}
                    </Button>
                    {!isFirebaseConfigured && (
                        <p className="mt-4 text-center text-sm text-destructive">
                            Firebase is not configured. Admin sign up is disabled.
                        </p>
                    )}
                    <div className="text-center text-sm">
                        Already have an account?{" "}
                        <Link href="/login/admin" className="underline">
                            Sign in
                        </Link>
                    </div>
                </CardFooter>
            </form>
        </Card>
    );
}
