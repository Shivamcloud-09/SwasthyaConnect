
"use client";

import { useEffect, useState }from 'react';
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
import { collection, query, where, getDocs, doc, updateDoc, type DocumentData, getDoc, addDoc, writeBatch } from "firebase/firestore";
import { Skeleton } from './ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { LoaderCircle, Building, Wand2 } from 'lucide-react';
import { hospitals as initialHospitals } from '@/data/hospitals';

type ManagedHospital = Omit<Hospital, 'id'> & { firestoreId: string };

export default function AdminDashboard() {
    const router = useRouter();
    const { toast } = useToast();
    const { user, loading: authLoading } = useAuth();
    const [hospital, setHospital] = useState<ManagedHospital | null>(null);
    const [unclaimedHospitals, setUnclaimedHospitals] = useState<ManagedHospital[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isClaiming, setIsClaiming] = useState<string | null>(null); // Holds the ID of the hospital being claimed
    const isFirebaseConfigured = !!auth && !!db;

    const fetchHospitalData = async () => {
        if (!user || !db) return;
        setIsLoading(true);

        // 1. Check for a hospital already assigned to this user
        const hospitalsRef = collection(db, "hospitals");
        const q = query(hospitalsRef, where("adminUid", "==", user.uid));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const hospitalDoc = querySnapshot.docs[0];
            setHospital({
                ...(hospitalDoc.data() as Omit<Hospital, 'id'>),
                firestoreId: hospitalDoc.id,
            });
        } else {
            // 2. If no hospital is assigned, fetch unclaimed hospitals
            const unclaimedQuery = query(hospitalsRef, where("adminUid", "==", ""));
            const unclaimedSnapshot = await getDocs(unclaimedQuery);
            const unclaimedList = unclaimedSnapshot.docs.map(doc => ({
                ...(doc.data() as Omit<Hospital, 'id'>),
                firestoreId: doc.id,
            }));

            // Seed the database if it's completely empty
            if (unclaimedSnapshot.empty && (await getDocs(hospitalsRef)).empty) {
                await seedDatabase();
                // Re-fetch after seeding
                fetchHospitalData();
                return;
            }
            
            setUnclaimedHospitals(unclaimedList);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        if (!authLoading && user && db) {
            fetchHospitalData();
        } else if (!authLoading && !user) {
            router.push('/admin/login');
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, authLoading, db]);

    const seedDatabase = async () => {
        if (!db) return;
        setIsLoading(true);
        toast({ title: "Setting Up Database", description: "Performing first-time setup..." });
        try {
            const batch = writeBatch(db);
            const hospitalsRef = collection(db, "hospitals");

            // Check if collection is empty before seeding
            const snapshot = await getDocs(hospitalsRef);
            if (!snapshot.empty) {
                toast({ variant: "destructive", title: "Setup Skipped", description: "Database already contains data." });
                return;
            }
            
            initialHospitals.forEach(hospital => {
                const { id, ...hospitalData } = hospital; // Exclude the old numeric id
                const docRef = doc(hospitalsRef); // Firestore generates a new ID
                batch.set(docRef, { ...hospitalData, adminUid: "" }); // Add adminUid field
            });

            await batch.commit();
            toast({ title: "Setup Complete!", description: "Curated hospitals have been added to the database." });
        } catch (error) {
            console.error("Error seeding database:", error);
            toast({ variant: "destructive", title: "Setup Failed" });
        } finally {
            setIsLoading(false);
        }
    };


    const handleClaimHospital = async (hospitalId: string) => {
        if (!user || !db) return;
        setIsClaiming(hospitalId);
        try {
            const hospitalRef = doc(db, "hospitals", hospitalId);
            await updateDoc(hospitalRef, { adminUid: user.uid });
            toast({ title: "Hospital Claimed!", description: "You can now manage this hospital." });
            // Re-fetch data to show the dashboard
            await fetchHospitalData();
        } catch (error) {
            console.error("Error claiming hospital:", error);
            toast({ variant: "destructive", title: "Claiming Failed" });
        } finally {
            setIsClaiming(null);
        }
    };

    const handleLogout = async () => {
        if (!auth) return;
        try {
            await signOut(auth);
            router.push('/admin/login');
            toast({ title: "Logged Out", description: "You have been successfully logged out." });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Logout Failed' });
        }
    };

    const handleUpdate = (field: string, value: any) => {
        if (!hospital) return;
        setHospital(currentHospital => {
            if (!currentHospital) return null;
            const updatedHospital = JSON.parse(JSON.stringify(currentHospital));
            const keys = field.split('.');
            let currentLevel: any = updatedHospital;
            for (let i = 0; i < keys.length - 1; i++) {
                currentLevel = currentLevel[keys[i]] = currentLevel[keys[i]] || {};
            }
            currentLevel[keys[keys.length - 1]] = value;
            return updatedHospital;
        });
    };
      
    const handleSaveChanges = async () => {
        if (!hospital || !hospital.firestoreId || !db) return;
        setIsSaving(true);
        try {
            const hospitalRef = doc(db, "hospitals", hospital.firestoreId);
            const { firestoreId, ...dataToSave } = hospital;
            await updateDoc(hospitalRef, dataToSave as DocumentData);
            toast({ title: "Changes Saved!", description: "Your hospital information has been updated." });
        } catch (error) {
            console.error("Error saving changes:", error);
            toast({ variant: "destructive", title: "Save Failed" });
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
                 <Card><CardHeader><CardTitle>Configuration Error</CardTitle><CardContent><p>Firebase is not configured.</p></CardContent></CardHeader></Card>
            </div>
        )
    }

    // Main Dashboard View
    if (hospital) {
        return (
            <div className="container mx-auto p-4 md:p-8">
                <div className="flex justify-between items-center mb-6">
                     <h1 className="text-3xl font-bold font-headline">Admin Dashboard</h1>
                     <Button variant="outline" onClick={handleLogout}>Logout</Button>
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
    
    // Hospital Claiming View
    return (
        <div className="container mx-auto p-4 md:p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold font-headline">Admin Dashboard</h1>
                <Button variant="outline" onClick={handleLogout}>Logout</Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Claim a Hospital</CardTitle>
                    <CardDescription>Your account is not linked to a hospital. Choose a hospital from the list to manage it.</CardDescription>
                </CardHeader>
                <CardContent>
                    {unclaimedHospitals.length > 0 ? (
                        <div className="space-y-4">
                            {unclaimedHospitals.map(h => (
                                <div key={h.firestoreId} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                        <p className="font-semibold">{h.name}</p>
                                        <p className="text-sm text-muted-foreground">{h.address}</p>
                                    </div>
                                    <Button
                                        onClick={() => handleClaimHospital(h.firestoreId)}
                                        disabled={isClaiming !== null}
                                    >
                                        {isClaiming === h.firestoreId ? <LoaderCircle className="animate-spin" /> : <><Building className="mr-2" /> Manage</>}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10">
                            <Wand2 className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-medium">All Hospitals Claimed</h3>
                            <p className="mt-1 text-sm text-muted-foreground">There are no unclaimed hospitals available. You can add a new one via the signup page.</p>
                            <Button asChild className="mt-4"><a href="/admin/signup">Register a New Hospital</a></Button>
                        </div>
                    )}
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
            <CardContent className="p-8"><Skeleton className="h-24 w-full" /></CardContent>
        </Card>
    </div>
);
