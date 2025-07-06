
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
import { collection, query, where, getDocs, doc, updateDoc, writeBatch } from "firebase/firestore";
import { Skeleton } from './ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { LoaderCircle, Building, Wand2 } from 'lucide-react';
import { hospitals as initialHospitals } from '@/data/hospitals';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import RegisterHospitalForm from './RegisterHospitalForm';


type ManagedHospital = Omit<Hospital, 'id'> & { firestoreId: string };

export default function AdminDashboard() {
    const router = useRouter();
    const { toast } = useToast();
    const { user, loading: authLoading } = useAuth();
    const [hospital, setHospital] = useState<ManagedHospital | null>(null);
    const [unclaimedHospitals, setUnclaimedHospitals] = useState<ManagedHospital[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isClaiming, setIsClaiming] = useState<string | null>(null);
    const [needsSeeding, setNeedsSeeding] = useState(false);
    const [isSeeding, setIsSeeding] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);
    const isFirebaseConfigured = !!auth && !!db;
    
    const fetchHospitalData = async () => {
        if (!user || !db) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        setNeedsSeeding(false); // Reset on each fetch

        const hospitalsRef = collection(db, "hospitals");

        // 1. Check for assigned hospital for the current user
        const assignedQuery = query(hospitalsRef, where("adminUid", "==", user.uid));
        const assignedSnapshot = await getDocs(assignedQuery);

        if (!assignedSnapshot.empty) {
            const hospitalDoc = assignedSnapshot.docs[0];
            setHospital({
                ...(hospitalDoc.data() as Omit<Hospital, 'id'>),
                firestoreId: hospitalDoc.id,
            });
            setUnclaimedHospitals([]);
            setIsLoading(false);
            return;
        }

        // 2. No assigned hospital, check all hospitals
        setHospital(null);
        const allHospitalsSnapshot = await getDocs(hospitalsRef);

        if (allHospitalsSnapshot.empty) {
            // The database has no hospitals at all, so it needs to be seeded.
            setNeedsSeeding(true);
            setUnclaimedHospitals([]);
        } else {
            // Find hospitals that are not yet claimed by any admin
            const unclaimedList = allHospitalsSnapshot.docs
                .map(doc => ({
                    ...(doc.data() as Omit<Hospital, 'id'>),
                    firestoreId: doc.id,
                }))
                .filter(h => !h.adminUid);
            setUnclaimedHospitals(unclaimedList);
        }

        setIsLoading(false);
    };
    
    const handleSeedDatabase = async () => {
        if (!db) return;
        setIsSeeding(true);
        toast({ title: "Setting Up Database", description: "This may take a moment..." });
        try {
            const batch = writeBatch(db);
            const hospitalsRef = collection(db, "hospitals");
            
            initialHospitals.forEach(hospital => {
                const { id, ...hospitalData } = hospital;
                const docRef = doc(hospitalsRef);
                batch.set(docRef, { ...hospitalData, adminUid: "" });
            });

            await batch.commit();
            toast({ title: "Setup Complete!", description: "Curated hospitals have been added." });
            await fetchHospitalData(); // Refetch data to show the new list
        } catch (error) {
            console.error("Error seeding database:", error);
            toast({ variant: "destructive", title: "Setup Failed", description: "Could not seed the database." });
        } finally {
            setIsSeeding(false);
        }
    };

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login/admin');
        } else if (!authLoading && user) {
            fetchHospitalData();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, authLoading]);


    const handleClaimHospital = async (hospitalId: string) => {
        if (!user || !db) return;
        setIsClaiming(hospitalId);
        try {
            const hospitalRef = doc(db, "hospitals", hospitalId);
            await updateDoc(hospitalRef, { adminUid: user.uid });
            toast({ title: "Hospital Claimed!", description: "You can now manage this hospital." });
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
            router.push('/login/admin');
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
            const dataToUpdate = {
                "beds.general.available": hospital.beds?.general?.available ?? 0,
                "beds.icu.available": hospital.beds?.icu?.available ?? 0,
                "hygiene.rating": hospital.hygiene?.rating ?? 0,
                "oxygen.available": hospital.oxygen?.available ?? false,
            };
            await updateDoc(hospitalRef, dataToUpdate);
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
                                {isSaving ? <LoaderCircle className="animate-spin" /> : 'Save Changes'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    return (
        <div className="container mx-auto p-4 md:p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold font-headline">Admin Dashboard</h1>
                <Button variant="outline" onClick={handleLogout}>Logout</Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Claim or Register a Hospital</CardTitle>
                    <CardDescription>
                         {needsSeeding 
                            ? "The hospital database is empty. Add the initial set of hospitals to begin."
                            : "Your account is not linked to a hospital. Choose a hospital from the list to manage it, or register a new one."}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {needsSeeding ? (
                         <div className="text-center py-10">
                            <Wand2 className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-medium">Initial Database Setup</h3>
                            <p className="mt-1 text-sm text-muted-foreground">Add the default list of curated hospitals to get started.</p>
                            <Button onClick={handleSeedDatabase} disabled={isSeeding} className="mt-4">
                                {isSeeding ? <LoaderCircle className="animate-spin" /> : "Seed Database"}
                            </Button>
                        </div>
                    ) : (
                        <div>
                            {unclaimedHospitals.length > 0 && (
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg">Unclaimed Hospitals</h3>
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
                                                {isClaiming === h.firestoreId ? <LoaderCircle className="animate-spin" /> : <><Building className="mr-2" /> Claim & Manage</>}
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="text-center py-10 border-t mt-6">
                                <Wand2 className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-4 text-lg font-medium">Is your hospital not listed?</h3>
                                <p className="mt-1 text-sm text-muted-foreground">Add your hospital to the SwasthyaConnect network.</p>
                                
                                <Dialog open={isRegistering} onOpenChange={setIsRegistering}>
                                    <DialogTrigger asChild>
                                        <Button className="mt-4">Register a New Hospital</Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Register Your Hospital</DialogTitle>
                                            <DialogDescription>Enter your hospital's name to add it to the network.</DialogDescription>
                                        </DialogHeader>
                                        <RegisterHospitalForm onSuccess={() => {
                                            setIsRegistering(false);
                                            fetchHospitalData();
                                        }} />
                                    </DialogContent>
                                </Dialog>
                            </div>
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
