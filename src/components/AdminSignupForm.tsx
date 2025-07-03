
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { collection, addDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';

export default function AdminSignupForm() {
    const router = useRouter();
    const { toast } = useToast();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [hospitalName, setHospitalName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const isFirebaseConfigured = !!auth && !!db;

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
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
            const userCredential = await createUserWithEmailAndPassword(auth!, email, password);
            const user = userCredential.user;

            // Create a corresponding hospital document in Firestore
            await addDoc(collection(db!, "hospitals"), {
                adminUid: user.uid,
                name: hospitalName,
                address: "Please update in dashboard",
                imageUrl: "",
                location: { lat: 0, lng: 0 },
                timings: "Not set",
                contact: "",
                services: [],
                specialties: [],
                beds: {
                    general: { total: 0, available: 0 },
                    icu: { total: 0, available: 0 },
                },
                oxygen: { available: false, lastChecked: "" },
                medicines: [],
                doctors: [],
                hygiene: { rating: 0, lastSanitized: "" },
                license: "",
            });

            toast({
                title: 'Admin Account Created!',
                description: `Your hospital "${hospitalName}" is registered. Please log in to update its details.`,
            });
            router.push('/admin/login');
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
                    <CardTitle className="text-2xl font-headline">Create Hospital Admin Account</CardTitle>
                    <CardDescription>Enter details to register your hospital</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="hospital-name-signup">Hospital Name</Label>
                        <Input id="hospital-name-signup" type="text" value={hospitalName} onChange={(e) => setHospitalName(e.target.value)} placeholder="City General Hospital" required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email-signup-admin">Email</Label>
                        <Input id="email-signup-admin" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@example.com" required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password-signup-admin">Password</Label>
                        <Input id="password-signup-admin" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="confirm-password-signup-admin">Confirm Password</Label>
                        <Input id="confirm-password-signup-admin" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <Button type="submit" className="w-full" disabled={isLoading || !isFirebaseConfigured}>
                        {isLoading ? 'Creating Account...' : 'Sign Up'}
                    </Button>
                    {!isFirebaseConfigured && (
                        <p className="mt-4 text-center text-sm text-destructive">
                            Firebase is not configured. Admin sign up is disabled.
                        </p>
                    )}
                    <div className="text-center text-sm">
                        Already have an account?{" "}
                        <Link href="/admin/login" className="underline">
                            Sign in
                        </Link>
                    </div>
                </CardFooter>
            </form>
        </Card>
    );
}
