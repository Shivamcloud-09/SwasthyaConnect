
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, getDocs, writeBatch, doc } from "firebase/firestore";
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
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [hospitalName, setHospitalName] = useState('');
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
        if (!username.match(/^[a-zA-Z0-9_]{3,20}$/)) {
            toast({ variant: 'destructive', title: 'Invalid Username', description: 'Username must be 3-20 characters long and can only contain letters, numbers, and underscores.' });
            return;
        }

        setIsLoading(true);
        try {
            // Check if username is unique
            const lowercasedUsername = username.toLowerCase();
            const adminsRef = collection(db, "hospitalAdmins");
            const q = query(adminsRef, where("username", "==", lowercasedUsername));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                toast({ variant: 'destructive', title: 'Sign Up Failed', description: 'This username is already taken. Please choose another.' });
                setIsLoading(false);
                return;
            }

            // Create user in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Use a batch write to ensure all or nothing
            const batch = writeBatch(db);

            // 1. Create the admin document in the hospitalAdmins collection
            const adminDocRef = doc(collection(db, "hospitalAdmins"));
            batch.set(adminDocRef, {
                uid: user.uid,
                email: user.email,
                username: lowercasedUsername,
                hospitalName: hospitalName,
                createdAt: new Date(),
            });

            // 2. Create the hospital document in the hospitals collection and link it to the admin
            const hospitalDocRef = doc(collection(db, "hospitals"));
            batch.set(hospitalDocRef, {
                adminUid: user.uid,
                name: hospitalName,
                address: "Not yet specified",
                imageUrl: "https://placehold.co/600x400.png",
                location: { lat: 0, lng: 0 },
                timings: "Not yet specified",
                contact: "Not yet specified",
                services: [],
                specialties: [],
                beds: {
                    general: { total: 0, available: 0 },
                    icu: { total: 0, available: 0 },
                },
                oxygen: { available: false, lastChecked: "N/A" },
                medicines: [],
                doctors: [],
                hygiene: { rating: 0, lastSanitized: "N/A" },
                license: "Not yet specified",
            });

            await batch.commit();

            toast({
                title: 'Admin Account Created!',
                description: `Welcome, ${username}! Redirecting to your dashboard.`,
            });
            // Redirect to the dashboard directly since the hospital is now assigned.
            router.push('/admin/dashboard');

        } catch (error: any) {
            console.error("Admin Signup Error:", error);
            let description = 'An unexpected error occurred. Please try again.';
            if (error.code === 'auth/email-already-in-use') {
                description = 'This email address is already registered.';
            } else if (error.code === 'auth/weak-password') {
                description = 'The password is too weak. It must be at least 6 characters long.';
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
                    <CardDescription>Register your hospital and create an admin profile.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="hospital-name-signup">Hospital Name</Label>
                        <Input id="hospital-name-signup" type="text" value={hospitalName} onChange={(e) => setHospitalName(e.target.value)} placeholder="e.g., City General Hospital" required />
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="username-signup-admin">Username</Label>
                        <Input id="username-signup-admin" type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g., city_general_admin" required />
                    </div>
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
                        {isLoading ? 'Creating Account...' : 'Sign Up'}
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
