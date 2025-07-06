
"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle } from 'lucide-react';
import { DialogFooter } from './ui/dialog';

type RegisterHospitalFormProps = {
    onSuccess: () => void;
};

export default function RegisterHospitalForm({ onSuccess }: RegisterHospitalFormProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [hospitalName, setHospitalName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !db || !hospitalName.trim()) return;

        setIsLoading(true);
        try {
            // Create the new hospital record and link it to the admin.
            const hospitalsCollectionRef = collection(db, "hospitals");
            const hospitalDocRef = await addDoc(hospitalsCollectionRef, {
                adminUid: user.uid,
                name: hospitalName,
                address: "Default Address - Please Update from Dashboard",
                imageUrl: "https://placehold.co/600x400.png",
                location: { lat: 0, lng: 0 },
                timings: "9am - 5pm",
                contact: "000-000-0000",
                services: [],
                specialties: [],
                beds: { general: { total: 100, available: 50 }, icu: { total: 20, available: 10 } },
                oxygen: { available: true, lastChecked: new Date().toISOString() },
                medicines: [],
                doctors: [],
                hygiene: { rating: 4.0, lastSanitized: new Date().toISOString() },
                license: "Not Set",
                timeSlots: [],
            });

            // Also update the admin user's doc to include the hospital name they manage
            const adminDocRef = doc(db, "hospitalAdmins", user.uid);
            await updateDoc(adminDocRef, {
                hospitalName: hospitalName,
                hospitalId: hospitalDocRef.id,
            });

            toast({ title: 'Hospital Registered!', description: 'You can now manage your hospital from this dashboard.' });
            onSuccess(); // This will trigger a refetch in the dashboard
        } catch (error) {
            console.error("Error registering hospital:", error);
            toast({ variant: 'destructive', title: 'Registration Failed' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleRegister}>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="hospital-name" className="text-right">Hospital Name</Label>
                    <Input id="hospital-name" value={hospitalName} onChange={(e) => setHospitalName(e.target.value)} className="col-span-3" required />
                </div>
            </div>
            <DialogFooter>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? <LoaderCircle className="animate-spin mr-2" /> : null}
                    Register Hospital
                </Button>
            </DialogFooter>
        </form>
    );
}
