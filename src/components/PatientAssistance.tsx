"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import type { Hospital } from '@/data/hospitals';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle, CalendarPlus, Home, Stethoscope, Search, ArrowLeft, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';

type ServiceType = 'Appointment' | 'Home Service';
type Step = 'initial' | 'form' | 'results';

// A version of the Hospital type that includes the Firestore document ID
type HospitalWithId = Hospital & { firestoreId: string };

export default function PatientAssistance() {
    const { user } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const [step, setStep] = useState<Step>('initial');
    const [serviceType, setServiceType] = useState<ServiceType | null>(null);
    const [hospitalName, setHospitalName] = useState('');
    const [symptoms, setSymptoms] = useState('');
    const [searchResults, setSearchResults] = useState<HospitalWithId[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isBooking, setIsBooking] = useState<string | null>(null); // holds hospitalId being booked

    const handleServiceSelect = (type: ServiceType) => {
        if (!user) {
            toast({
                variant: 'destructive',
                title: 'Authentication Required',
                description: 'Please log in to book a service.',
            });
            router.push('/login');
            return;
        }
        setServiceType(type);
        setStep('form');
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!hospitalName.trim() || !symptoms.trim()) {
            toast({ variant: 'destructive', title: 'Missing Information', description: 'Please enter a hospital name and symptoms.' });
            return;
        }

        setIsLoading(true);
        setSearchResults([]);

        try {
            const hospitalsRef = collection(db, 'hospitals');
            // Firestore doesn't support case-insensitive or partial text search natively.
            // This query is a common workaround that finds documents where the 'name' field starts with the search term.
            const q = query(
                hospitalsRef,
                where('name', '>=', hospitalName),
                where('name', '<=', hospitalName + '\uf8ff')
            );

            const querySnapshot = await getDocs(q);
            const results: HospitalWithId[] = [];
            querySnapshot.forEach((doc) => {
                results.push({ ...(doc.data() as Hospital), firestoreId: doc.id });
            });
            
            const lowercasedSymptoms = symptoms.toLowerCase();
            const filteredResults = results.filter(h => 
                h.specialties?.some(s => lowercasedSymptoms.includes(s.toLowerCase())) ||
                h.services?.some(s => lowercasedSymptoms.includes(s.toLowerCase()))
            );

            // If specialty filter yields no results, fall back to just name search
            setSearchResults(filteredResults.length > 0 ? filteredResults : results);
            setStep('results');

        } catch (error) {
            console.error("Error searching hospitals:", error);
            toast({ variant: 'destructive', title: 'Search Failed', description: 'Could not perform the search. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirmBooking = async (hospital: HospitalWithId) => {
        if (!user || !serviceType || !db) return;

        setIsBooking(hospital.firestoreId);
        try {
            const bookingsRef = collection(db, 'bookings');
            await addDoc(bookingsRef, {
                userId: user.uid,
                userEmail: user.email,
                hospitalId: hospital.firestoreId,
                hospitalName: hospital.name,
                symptoms: symptoms,
                serviceType: serviceType,
                status: 'pending',
                createdAt: serverTimestamp(),
            });

            toast({
                title: 'Request Sent!',
                description: `Your request for a ${serviceType} has been sent to ${hospital.name}. They will contact you shortly.`,
            });
            
            // Reset flow
            resetFlow();

        } catch (error) {
            console.error("Error confirming booking:", error);
            toast({ variant: 'destructive', title: 'Booking Failed', description: 'Could not complete your request. Please try again. You may need to update Firestore security rules.' });
        } finally {
            setIsBooking(null);
        }
    };

    const resetFlow = () => {
        setStep('initial');
        setServiceType(null);
        setHospitalName('');
        setSymptoms('');
        setSearchResults([]);
    }

    // Step 1: Initial Selection
    if (step === 'initial') {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <Card onClick={() => handleServiceSelect('Appointment')} className="text-center p-8 cursor-pointer hover:bg-card/90 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <CalendarPlus className="h-16 w-16 mx-auto text-primary mb-4" />
                    <CardTitle className="text-2xl font-headline">Book Appointment</CardTitle>
                    <CardDescription className="mt-2">Schedule a visit to the hospital.</CardDescription>
                </Card>
                <Card onClick={() => handleServiceSelect('Home Service')} className="text-center p-8 cursor-pointer hover:bg-card/90 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <Home className="h-16 w-16 mx-auto text-primary mb-4" />
                    <CardTitle className="text-2xl font-headline">Need Home Services</CardTitle>
                    <CardDescription className="mt-2">Request a doctor or nurse to visit you at home.</CardDescription>
                </Card>
            </div>
        );
    }

    // Step 2: Form Input
    if (step === 'form') {
        return (
            <Card className="max-w-2xl mx-auto w-full">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={resetFlow}><ArrowLeft /></Button>
                        <div>
                           <CardTitle className="font-headline">Request a {serviceType}</CardTitle>
                           <CardDescription>Enter details to find a suitable hospital.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSearch} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="hospital-name">Hospital Name</Label>
                            <Input id="hospital-name" placeholder="e.g., City General Hospital" value={hospitalName} onChange={e => setHospitalName(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="symptoms">Symptoms or Service Needed</Label>
                            <Textarea id="symptoms" placeholder="e.g., 'Fever and headache' or 'cardiology check-up'" value={symptoms} onChange={e => setSymptoms(e.target.value)} required />
                        </div>
                        <Button type="submit" disabled={isLoading} className="w-full">
                            {isLoading ? <LoaderCircle className="animate-spin" /> : <><Search className="mr-2"/>Search Hospitals</>}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        );
    }
    
    // Step 3: Display Results
    if (step === 'results') {
        return (
            <div className="max-w-4xl mx-auto w-full">
                <div className="flex items-center gap-4 mb-6">
                    <Button variant="outline" onClick={() => setStep('form')}><ArrowLeft className="mr-2"/>Back to Search</Button>
                    <h2 className="text-2xl font-bold font-headline">Search Results</h2>
                </div>

                {searchResults.length > 0 ? (
                    <div className="space-y-4">
                        {searchResults.map(hospital => (
                            <Card key={hospital.firestoreId} className="flex flex-col sm:flex-row items-center justify-between p-4">
                                <div>
                                    <h3 className="font-bold text-lg">{hospital.name}</h3>
                                    <p className="text-sm text-muted-foreground">{hospital.address}</p>
                                </div>
                                <Button 
                                    onClick={() => handleConfirmBooking(hospital)} 
                                    disabled={isBooking !== null}
                                    className="mt-4 sm:mt-0 w-full sm:w-auto"
                                >
                                    {isBooking === hospital.firestoreId ? <LoaderCircle className="animate-spin" /> : <><Send className="mr-2"/>Confirm {serviceType}</>}
                                </Button>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="text-center p-12">
                         <Stethoscope className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-xl font-bold font-headline">No Matching Hospitals Found</h3>
                        <p className="text-muted-foreground mt-2">
                            We couldn't find any hospitals matching your search for "{hospitalName}".
                            <br/>
                            Try a broader search or check your spelling.
                        </p>
                    </Card>
                )}
            </div>
        );
    }

    return null; // Should not be reached
}
