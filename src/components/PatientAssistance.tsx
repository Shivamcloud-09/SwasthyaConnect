
"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import type { Hospital, NearbyHospital } from '@/data/hospitals';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle, CalendarPlus, Home, Stethoscope, Search, ArrowLeft, Send, BedDouble, Droplet, UserCheck, MapPin, ArrowRight, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from '@/components/ui/badge';
import { getDistance } from '@/lib/utils';
import { findNearbyHospitals } from '@/lib/actions/hospitalActions';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from './ui/separator';


type ServiceType = 'Appointment' | 'Home Service';
type Step = 'initial' | 'form' | 'results';

// A version of the Hospital type that includes the Firestore document ID and optional distance
type HospitalWithId = Hospital & { firestoreId: string };
type HospitalWithIdAndDistance = HospitalWithId & { distance?: number };
type NearbyHospitalWithDistance = NearbyHospital & { distance?: number };

const defaultTimeSlots = ["09:00 AM", "10:00 AM", "11:00 AM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"];

export default function PatientAssistance() {
    const { user } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const [step, setStep] = useState<Step>('initial');
    const [serviceType, setServiceType] = useState<ServiceType | null>(null);
    const [hospitalName, setHospitalName] = useState('');
    const [symptoms, setSymptoms] = useState('');
    const [searchResults, setSearchResults] = useState<(HospitalWithIdAndDistance | NearbyHospitalWithDistance)[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFindingNearby, setIsFindingNearby] = useState(false);
    const [isBooking, setIsBooking] = useState<string | null>(null); // holds hospitalId being booked
    const [selectedTimeSlots, setSelectedTimeSlots] = useState<Record<string, string>>({});


    const handleServiceSelect = (type: ServiceType) => {
        if (!user) {
            toast({
                variant: 'destructive',
                title: 'Authentication Required',
                description: 'Please log in to book a service.',
            });
            router.push('/login/user');
            return;
        }
        setServiceType(type);
        setStep('form');
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!hospitalName.trim() && !symptoms.trim()) {
            toast({ variant: 'destructive', title: 'Missing Information', description: 'Please enter a hospital name or symptoms.' });
            return;
        }
        if (!db) {
            toast({ variant: 'destructive', title: 'Database Error', description: 'Firebase is not configured.' });
            return;
        }

        setIsLoading(true);
        setSearchResults([]);

        try {
            const hospitalsRef = collection(db, 'hospitals');
            // This query is a common workaround that finds documents where the 'name' field starts with the search term.
            const q = hospitalName.trim() 
                ? query(
                    hospitalsRef,
                    where('name', '>=', hospitalName),
                    where('name', '<=', hospitalName + '\uf8ff')
                )
                : query(hospitalsRef);


            const querySnapshot = await getDocs(q);
            const results: HospitalWithId[] = [];
            querySnapshot.forEach((doc) => {
                results.push({ ...(doc.data() as Hospital), firestoreId: doc.id });
            });
            
            if (symptoms.trim()) {
                const lowercasedSymptoms = symptoms.toLowerCase();
                const filteredResults = results.filter(h => 
                    h.specialties?.some(s => lowercasedSymptoms.includes(s.toLowerCase())) ||
                    h.services?.some(s => lowercasedSymptoms.includes(s.toLowerCase()))
                );

                // If specialty filter yields no results, fall back to just name search
                if (filteredResults.length > 0 || !hospitalName.trim()) {
                    setSearchResults(filteredResults);
                } else {
                    setSearchResults(results);
                }
            } else {
                setSearchResults(results);
            }
            setStep('results');

        } catch (error) {
            console.error("Error searching hospitals:", error);
            toast({ variant: 'destructive', title: 'Search Failed', description: 'Could not perform the search. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleFindNearby = async () => {
        if (!navigator.geolocation) {
            toast({ variant: 'destructive', title: 'Geolocation Not Supported' });
            return;
        }
    
        setIsFindingNearby(true);
        setSearchResults([]);
        toast({ title: 'Getting your location...' });
    
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };

                if (!db) {
                    toast({ variant: 'destructive', title: 'Database Error', description: 'Firebase is not configured.' });
                    setIsFindingNearby(false);
                    return;
                }
    
                try {
                    // First, get all curated hospitals from our DB
                    const hospitalsRef = collection(db, "hospitals");
                    const querySnapshot = await getDocs(hospitalsRef);
                    const curatedHospitals: HospitalWithIdAndDistance[] = [];
                    querySnapshot.forEach(doc => {
                        const hospitalData = doc.data() as Hospital;
                        const distance = getDistance(userLocation, hospitalData.location);
                        curatedHospitals.push({
                          ...hospitalData,
                          firestoreId: doc.id,
                          distance: distance,
                        });
                    });
                    
                    // Sort them by distance
                    const sortedCurated = curatedHospitals.sort((a,b) => (a.distance ?? 0) - (b.distance ?? 0));

                    setSearchResults(sortedCurated);
                    setStep('results');
                    toast({
                        title: 'Search Complete',
                        description: `Showing all hospitals in our network, sorted by distance.`
                    });
    
                } catch (error) {
                    console.error("Error finding nearby hospitals:", error);
                    toast({ variant: 'destructive', title: 'Search Failed', description: 'Could not fetch hospital data.' });
                } finally {
                    setIsFindingNearby(false);
                }
            },
            () => {
                toast({ variant: 'destructive', title: 'Location Error', description: 'Could not get your location. Please enable location services.' });
                setIsFindingNearby(false);
            }
        );
    };

    const handleConfirmBooking = async (hospital: HospitalWithId) => {
        if (!user || !serviceType || !db) return;
        
        const selectedSlot = selectedTimeSlots[hospital.firestoreId];

        if (!selectedSlot) {
            toast({
                variant: 'destructive',
                title: 'Time Slot Required',
                description: 'Please select a time slot before confirming your booking.',
            });
            return;
        }

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
                createdAt: new Date(),
                timeSlot: selectedSlot,
            });

            toast({
                title: 'Request Sent!',
                description: `Your ${serviceType} request for ${selectedSlot} at ${hospital.name} has been sent. They will contact you shortly.`,
            });
            
            // Reset flow
            resetFlow();

        } catch (error) {
            console.error("Error confirming booking:", error);
            const errorMessage = (error as any)?.message || 'Could not complete your request. Please check Firestore security rules.';
            toast({ variant: 'destructive', title: 'Booking Failed', description: errorMessage });
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
        setSelectedTimeSlots({});
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
                            <Label htmlFor="hospital-name">Hospital Name (optional)</Label>
                            <Input id="hospital-name" placeholder="e.g., City General Hospital" value={hospitalName} onChange={e => setHospitalName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="symptoms">Symptoms or Service Needed</Label>
                            <Textarea id="symptoms" placeholder="e.g., 'Fever and headache' or 'cardiology check-up'" value={symptoms} onChange={e => setSymptoms(e.target.value)} required />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2">
                            <Button type="submit" disabled={isLoading || isFindingNearby} className="w-full">
                                {isLoading ? <LoaderCircle className="animate-spin" /> : <><Search className="mr-2"/>Search by Name</>}
                            </Button>
                            <Button type="button" variant="secondary" onClick={handleFindNearby} disabled={isLoading || isFindingNearby} className="w-full">
                                {isFindingNearby ? <LoaderCircle className="animate-spin" /> : <><MapPin className="mr-2"/>Find Nearby</>}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        );
    }
    
    // Step 3: Display Results
    if (step === 'results') {
        const bookableHospitals = searchResults.filter(h => 'firestoreId' in h) as HospitalWithIdAndDistance[];
        const nearbyOnlyHospitals = searchResults.filter(h => 'place_id' in h) as NearbyHospitalWithDistance[];

        return (
            <div className="max-w-4xl mx-auto w-full">
                <div className="flex items-center gap-4 mb-6">
                    <Button variant="outline" onClick={() => setStep('form')}><ArrowLeft className="mr-2"/>Back to Search</Button>
                    <h2 className="text-2xl font-bold font-headline">Search Results</h2>
                </div>

                {searchResults.length > 0 ? (
                    <div className="space-y-8">
                        {bookableHospitals.length > 0 && (
                            <div>
                                <h3 className="text-xl font-bold font-headline mb-4">Hospitals in Our Network (Bookable)</h3>
                                <Accordion type="single" collapsible className="w-full">
                                    <div className="space-y-4">
                                    {bookableHospitals.map(hospital => {
                                        const slots = (hospital.timeSlots && hospital.timeSlots.length > 0) ? hospital.timeSlots : defaultTimeSlots;
                                        return (
                                        <AccordionItem value={hospital.firestoreId} key={hospital.firestoreId} className="border-b-0">
                                            <Card className="overflow-hidden">
                                            <AccordionTrigger className="p-4 hover:no-underline bg-muted/50 data-[state=open]:bg-muted">
                                                <div className="text-left w-full">
                                                    <h3 className="font-bold text-lg text-primary">{hospital.name}</h3>
                                                    <p className="text-sm text-muted-foreground">{hospital.address}</p>
                                                    {hospital.distance !== undefined && (
                                                        <Badge variant="secondary" className="mt-2">
                                                            <MapPin className="mr-1.5 h-3.5 w-3.5" />
                                                            {hospital.distance.toFixed(1)} km away
                                                        </Badge>
                                                    )}
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="p-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div>
                                                        <h4 className="font-semibold mb-2">Live Status</h4>
                                                        <div className="space-y-2 text-sm">
                                                            <p className="flex items-center gap-2"><BedDouble className="w-4 h-4 text-primary"/> General Beds: {hospital.beds.general.available} / {hospital.beds.general.total}</p>
                                                            <p className="flex items-center gap-2"><BedDouble className="w-4 h-4 text-destructive"/> ICU Beds: {hospital.beds.icu.available} / {hospital.beds.icu.total}</p>
                                                            <p className="flex items-center gap-2"><Droplet className={`w-4 h-4 ${hospital.oxygen.available ? 'text-green-500' : 'text-destructive'}`}/> Oxygen: {hospital.oxygen.available ? 'Available' : 'Low'}</p>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold mb-2">Doctors on Staff</h4>
                                                        {hospital.doctors && hospital.doctors.length > 0 ? (
                                                            <ul className="space-y-2 text-sm">
                                                                {hospital.doctors.map(doc => (
                                                                    <li key={doc.name} className="flex items-center justify-between">
                                                                        <div className="flex items-center gap-2">
                                                                            <UserCheck className="w-4 h-4 text-primary" />
                                                                            <span>{doc.name} <span className="text-muted-foreground">({doc.specialization})</span></span>
                                                                        </div>
                                                                        <Badge variant="secondary">{doc.availability}</Badge>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        ) : (
                                                            <p className="text-sm text-muted-foreground">No doctor information available.</p>
                                                        )}
                                                    </div>
                                                </div>

                                                <Separator className="my-4" />
                                                <div>
                                                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                                                        <Clock className="w-4 h-4 text-primary" />
                                                        Select an Available Time Slot
                                                    </h4>
                                                    <RadioGroup
                                                        value={selectedTimeSlots[hospital.firestoreId]}
                                                        onValueChange={(value) => {
                                                            setSelectedTimeSlots(prev => ({ ...prev, [hospital.firestoreId]: value }));
                                                        }}
                                                        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2"
                                                    >
                                                        {slots.map(slot => (
                                                            <div key={slot} className="flex items-center">
                                                                <RadioGroupItem value={slot} id={`${hospital.firestoreId}-${slot}`} />
                                                                <Label htmlFor={`${hospital.firestoreId}-${slot}`} className="ml-2 cursor-pointer text-sm">
                                                                    {slot}
                                                                </Label>
                                                            </div>
                                                        ))}
                                                    </RadioGroup>
                                                </div>
                                                
                                                <Separator className="my-4" />
                                                
                                                <Button 
                                                    onClick={() => handleConfirmBooking(hospital)} 
                                                    disabled={isBooking !== null}
                                                    className="w-full sm:w-auto"
                                                >
                                                    {isBooking === hospital.firestoreId ? <LoaderCircle className="animate-spin" /> : <><Send className="mr-2"/>Confirm {serviceType}</>}
                                                </Button>
                                            </AccordionContent>
                                            </Card>
                                        </AccordionItem>
                                    )})}
                                    </div>
                                </Accordion>
                            </div>
                        )}

                        {nearbyOnlyHospitals.length > 0 && (
                             <div>
                                <h3 className="text-xl font-bold font-headline mb-4">Other Nearby Hospitals</h3>
                                <p className="text-muted-foreground mb-4 text-sm">The following are from a public directory. Live data and booking are not available for them via SwasthyaConnect.</p>
                                <div className="space-y-4">
                                {nearbyOnlyHospitals.map(hospital => (
                                    <Card key={hospital.place_id}>
                                        <CardHeader>
                                            <div className="flex justify-between items-start gap-4">
                                                <div>
                                                    <CardTitle className="font-bold text-lg text-primary">{hospital.name}</CardTitle>
                                                    <CardDescription>{hospital.address}</CardDescription>
                                                </div>
                                                {hospital.distance !== undefined && (
                                                    <Badge variant="secondary" className="mt-2 shrink-0">
                                                        <MapPin className="mr-1.5 h-3.5 w-3.5" />
                                                        {hospital.distance.toFixed(1)} km away
                                                    </Badge>
                                                )}
                                            </div>
                                        </CardHeader>
                                        <CardFooter>
                                            <Button asChild className="w-full" variant="outline">
                                                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hospital.name)}&query_place_id=${hospital.place_id}`} target="_blank" rel="noopener noreferrer">
                                                    View on Google Maps <ArrowRight className="ml-2 h-4 w-4" />
                                                </a>
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                                </div>
                             </div>
                        )}
                    </div>
                ) : (
                    <Card className="text-center p-12">
                         <Stethoscope className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-xl font-bold font-headline">No Matching Hospitals Found</h3>
                        <p className="text-muted-foreground mt-2">
                            We couldn't find any hospitals matching your search criteria.
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
