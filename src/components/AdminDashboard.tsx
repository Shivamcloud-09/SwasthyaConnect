
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Hospital } from '@/data/hospitals';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { collection, query, where, getDocs, doc, updateDoc, type DocumentData } from "firebase/firestore";
import { Skeleton } from './ui/skeleton';
import { useAuth } from '@/context/AuthContext';

type ManagedHospital = Omit<Hospital, 'id'> & { firestoreId: string };

export default function AdminDashboard() {
    const router = useRouter();
    const { toast } = useToast();
    const { user, loading: authLoading } = useAuth();
    const [hospital, setHospital] = useState<ManagedHospital | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const isFirebaseConfigured = !!auth && !!db;

    useEffect(() => {
        if (authLoading) {
            return; 
        }
        if (!user) {
            router.push('/admin/login');
            return;
        }
        if (!isFirebaseConfigured) {
            setIsLoading(false);
            return;
        }

        const fetchHospitalData = async () => {
            setIsLoading(true);
            const hospitalsRef = collection(db, "hospitals");
            const q = query(hospitalsRef, where("adminUid", "==", user.uid));
            
            try {
                const querySnapshot = await getDocs(q);
                if (querySnapshot.empty) {
                    toast({
                        variant: 'destructive',
                        title: 'No Hospital Found',
                        description: 'No hospital is associated with your account. You may need to sign up first.',
                    });
                    setHospital(null);
                } else {
                    const hospitalDoc = querySnapshot.docs[0];
                    const hospitalData = hospitalDoc.data();
                    
                    // Explicitly map the data to our type for safety
                    const managedHospital: ManagedHospital = {
                        firestoreId: hospitalDoc.id,
                        adminUid: hospitalData.adminUid,
                        name: hospitalData.name,
                        address: hospitalData.address,
                        imageUrl: hospitalData.imageUrl,
                        location: hospitalData.location,
                        timings: hospitalData.timings,
                        contact: hospitalData.contact,
                        services: hospitalData.services,
                        specialties: hospitalData.specialties,
                        beds: hospitalData.beds,
                        oxygen: hospitalData.oxygen,
                        medicines: hospitalData.medicines,
                        doctors: hospitalData.doctors,
                        hygiene: hospitalData.hygiene,
                        license: hospitalData.license,
                    };
                    setHospital(managedHospital);
                }
            } catch (error) {
                console.error("Error fetching hospital data:", error);
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: 'Could not fetch hospital data.',
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchHospitalData();

    }, [user, authLoading, router, toast, isFirebaseConfigured]);

    const handleLogout = async () => {
        if (!isFirebaseConfigured) return;
        try {
            await signOut(auth!);
            localStorage.removeItem('swasthya-admin-auth'); // Clear legacy flag just in case
            router.push('/admin/login');
            toast({
                title: "Logged Out",
                description: "You have been successfully logged out."
            })
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Logout Failed',
                description: 'An error occurred while logging out.',
            });
        }
    };

    // A more robust handler that safely updates nested state.
    const handleUpdate = (field: string, value: any) => {
        if (!hospital) return;

        setHospital(currentHospital => {
            if (!currentHospital) return null;

            const updatedHospital = JSON.parse(JSON.stringify(currentHospital));
            const keys = field.split('.');
            let currentLevel: any = updatedHospital;

            // Traverse the path, creating objects if they don't exist to prevent crashes
            for (let i = 0; i < keys.length - 1; i++) {
                const key = keys[i];
                if (currentLevel[key] === undefined || typeof currentLevel[key] !== 'object' || currentLevel[key] === null) {
                    currentLevel[key] = {};
                }
                currentLevel = currentLevel[key];
            }
            
            currentLevel[keys[keys.length - 1]] = value;
            
            return updatedHospital;
        });
    };
      
    const handleSaveChanges = async () => {
        if (!hospital || !hospital.firestoreId || !db) {
            toast({ variant: "destructive", title: "Error", description: "No hospital data to save." });
            return;
        }

        setIsSaving(true);
        try {
            const hospitalRef = doc(db, "hospitals", hospital.firestoreId);
            const { firestoreId, ...dataToSave } = hospital;
            await updateDoc(hospitalRef, dataToSave);
            toast({ title: "Changes Saved!", description: "Your hospital information has been updated." });
        } catch (error) {
            console.error("Error saving changes:", error);
            toast({ variant: "destructive", title: "Save Failed", description: "Could not save your changes." });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading || authLoading) {
        return <AdminDashboardSkeleton />;
    }

    if (!isFirebaseConfigured) {
        return (
            <div className="container mx-auto p-4 md:p-8">
                 <h1 className="text-3xl font-bold font-headline mb-4">Admin Dashboard</h1>
                 <Card>
                    <CardHeader><CardTitle>Configuration Error</CardTitle></CardHeader>
                    <CardContent><p>Firebase is not configured. The admin dashboard is unavailable.</p></CardContent>
                 </Card>
            </div>
        )
    }

    if (!hospital) {
        return (
             <div className="container mx-auto p-4 md:p-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold font-headline">Admin Dashboard</h1>
                    <Button variant="outline" onClick={handleLogout}>Logout</Button>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>No Hospital Data</CardTitle>
                        <CardDescription>We couldn't find a hospital associated with your account. If you just signed up, please try refreshing.</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 md:p-8">
            <div className="flex justify-between items-center mb-6">
                 <h1 className="text-3xl font-bold font-headline">Admin Dashboard</h1>
                 <Button variant="outline" onClick={handleLogout} disabled={!isFirebaseConfigured}>Logout</Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>{hospital.name}</CardTitle>
                    <CardDescription>Update live information for your hospital below.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
                        <div className="space-y-2">
                            <Label htmlFor="general-beds">General Beds Available</Label>
                            <Input type="number" id="general-beds" value={hospital.beds?.general?.available || 0} onChange={(e) => handleUpdate('beds.general.available', parseInt(e.target.value) || 0)} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="icu-beds">ICU Beds Available</Label>
                            <Input type="number" id="icu-beds" value={hospital.beds?.icu?.available || 0} onChange={(e) => handleUpdate('beds.icu.available', parseInt(e.target.value) || 0)} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="hygiene-rating">Hygiene Rating</Label>
                            <Input type="number" step="0.1" id="hygiene-rating" value={hospital.hygiene?.rating || 0} onChange={(e) => handleUpdate('hygiene.rating', parseFloat(e.target.value) || 0)} />
                        </div>
                        <div className="flex items-center space-x-2 pt-6">
                            <Switch id="oxygen-available" checked={hospital.oxygen?.available || false} onCheckedChange={(checked) => handleUpdate('oxygen.available', checked)} />
                            <Label htmlFor="oxygen-available">Oxygen Available</Label>
                        </div>
                    </div>
                    <div className="text-right mt-4">
                        <Button onClick={handleSaveChanges} disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

const AdminDashboardSkeleton = () => (
    <div className="container mx-auto p-4 md:p-8">
        <div className="flex justify-between items-center mb-6">
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-10 w-24" />
        </div>
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-5 w-80" />
            </CardHeader>
            <CardContent className="space-y-4 p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                     <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                     <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
);
