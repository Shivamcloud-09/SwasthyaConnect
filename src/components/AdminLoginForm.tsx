
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, getDocs } from "firebase/firestore";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from '@/hooks/use-toast';

export default function AdminLoginForm() {
    const router = useRouter();
    const { toast } = useToast();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const isFirebaseConfigured = !!auth && !!db;

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFirebaseConfigured) {
            toast({
                variant: 'destructive',
                title: 'Login Failed',
                description: 'Firebase is not configured. Cannot log in.',
            });
            return;
        }
        setIsLoading(true);
        try {
            // 1. Find the user document by username to get their email
            const adminsRef = collection(db!, "hospitalAdmins");
            const q = query(adminsRef, where("username", "==", username.toLowerCase()));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                throw new Error("Invalid credentials");
            }
            
            const adminDoc = querySnapshot.docs[0].data();
            const email = adminDoc.email;

            // 2. Sign in with the retrieved email and provided password
            await signInWithEmailAndPassword(auth!, email, password);
            
            toast({
                title: 'Login Successful',
                description: 'Redirecting to dashboard...',
            });
            router.push('/admin/dashboard');
        } catch (error: any) {
             console.error("Admin Login Error:", error);
             // Generic error for security
             toast({
                variant: 'destructive',
                title: 'Login Failed',
                description: 'Invalid username or password. Please try again.',
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
                    <Label htmlFor="username-admin">Username</Label>
                    <Input id="username-admin" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required placeholder="your_username" />
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
