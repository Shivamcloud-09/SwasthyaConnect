
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, signInWithRedirect, getRedirectResult, GoogleAuthProvider } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff } from 'lucide-react';

const GoogleIcon = () => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4"><title>Google</title><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.62 1.9-4.73 1.9-5.27 0-9.28-4.29-9.28-9.48s4.01-9.48 9.28-9.48c2.92 0 4.88 1.25 6.39 2.7l2.1-2.08C18.96.96 16.27 0 12.48 0 5.88 0 0 5.58 0 12s5.88 12 12.48 12c6.92 0 11.83-4.79 11.83-12.03 0-.79-.08-1.54-.2-2.28H12.48z"/></svg>
);

export default function UserLoginForm() {
    const router = useRouter();
    const { toast } = useToast();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const isFirebaseConfigured = !!auth;

    // This effect handles the result of a Google Sign-In redirect
    useEffect(() => {
        if (!auth) return;
        
        // When the page loads, check if we're coming back from a Google redirect.
        getRedirectResult(auth)
            .then((result) => {
                if (result) {
                    // This means a user has successfully signed in via redirect.
                    // The onAuthStateChanged listener in AuthContext will handle the user state update.
                    // We can just show a success toast and redirect to home.
                    toast({
                        title: 'Login Successful',
                        description: 'Welcome back!',
                    });
                    router.push('/');
                }
            })
            .catch((error) => {
                // Handle any errors that occurred during the redirect sign-in.
                console.error("Google Redirect Result Error:", error);
                let description = 'Could not complete sign-in with Google. Please try again.';
                if (error.code === 'auth/account-exists-with-different-credential') {
                    description = 'An account already exists with this email. Please sign in using the original method.';
                }
                toast({
                    variant: 'destructive',
                    title: 'Login Failed',
                    description: description,
                });
            });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run only once on component mount


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
        if (!auth || !googleProvider) {
            toast({
                variant: 'destructive',
                title: 'Login Failed',
                description: 'Firebase is not configured for Google Sign-In.',
            });
            return;
        }
        setIsLoading(true);
        try {
            await signInWithRedirect(auth, googleProvider);
            // The user is redirected, so page logic pauses here. 
            // The useEffect hook above will handle the result when they return.
        } catch (error: any) {
            console.error("Google Sign-In Error:", error);
            let description = 'Could not sign in with Google. Please try again.';
            if (error.code === 'auth/account-exists-with-different-credential') {
                description = 'An account already exists with this email. Please sign in using the original method.';
            } else if (error.code === 'auth/operation-not-allowed') {
                description = 'Google Sign-In is not enabled for this project. This must be configured in the Firebase console.';
            } else {
                description = `An unexpected error occurred: ${error.message}`;
            }
            toast({
                variant: 'destructive',
                title: 'Login Failed',
                description: description,
            });
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
                    <div className="relative">
                        <Input id="password-user" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required className="pr-10" />
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
            </div>
            <Button type="submit" className="w-full mt-6" disabled={isLoading || !isFirebaseConfigured}>
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
        <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading || !isFirebaseConfigured}>
           {isLoading ? 'Please wait...' : <><GoogleIcon /><span className="ml-2">Sign in with Google</span></>}
        </Button>

        {!isFirebaseConfigured && (
            <p className="mt-4 text-center text-sm text-destructive">
                Firebase is not configured. Authentication is disabled.
            </p>
        )}
        
        <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="underline">
                Sign up
            </Link>
        </div>
    </div>
  )
}
