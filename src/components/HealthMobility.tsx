'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import type { Hospital } from '@/data/hospitals';
import { getDistance } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import dynamic from 'next/dynamic';
import { LoaderCircle, Car, Bike, Ambulance, MapPin, ArrowLeft } from 'lucide-react';

const UberIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M7.29.116 2.451 15.98h2.384l1.63-4.997h4.032l1.63 4.997h2.384L9.71.116h-2.42zm.843 2.54h.732l2.262 7.042H5.87L8.133 2.656z"/></svg>
);

const RapidoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256"><path d="M233.75,86.41,194.2,43.05a16,16,0,0,0-23.44,1.86l-18.18,29.35A64.12,64.12,0,0,0,128,64a63.3,63.3,0,0,0-28.81,6.81L86.87,40.1A16,16,0,0,0,64,32H40a16,16,0,0,0-16,16V96a16,16,0,0,0,16,16H64a16,16,0,0,0,13.23-7.14l8.63-13.8a64,64,0,0,0,3.33,70.53l-9.52,15.23A16,16,0,0,0,88,208h24.3a16,16,0,0,0,14.07-8.79l15.15-32.8C152,172.08,162.77,176,176,176a56,56,0,0,0,51.87-83.16ZM176,160a40,40,0,1,1,40-40A40,40,0,0,1,176,160Z"/></svg>
);

const LiveMap = dynamic(() => import('@/components/LiveMap'), { 
    ssr: false,
    loading: () => <Skeleton className="w-full h-64 rounded-lg" />
});

type HospitalWithId = Hospital & { firestoreId: string; distance: number };

export default function HealthMobility() {
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [hospitals, setHospitals] = useState<HospitalWithId[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isBooking, setIsBooking] = useState<string | null>(null);
    const { user } = useAuth();
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        if (!navigator.geolocation) {
            toast({ variant: 'destructive', title: 'Error', description: 'Geolocation is not supported.' });
            setIsLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            () => {
                toast({ variant: 'destructive', title: 'Location Error', description: 'Could not get location. Please enable it.' });
                setIsLoading(false);
            }
        );
    }, [toast]);

    useEffect(() => {
        const fetchHospitals = async () => {
            if (!location || !db) {
                setIsLoading(false);
                return;
            };
            
            setIsLoading(true);
            try {
                const snapshot = await getDocs(collection(db, "hospitals"));
                const nearby: HospitalWithId[] = [];

                snapshot.forEach((doc) => {
                    const data = doc.data() as Hospital;
                    // Check if the services array includes "Emergency Room" as a proxy for ambulance availability.
                    if (data.services?.includes("Emergency Room")) {
                        const distance = getDistance(location, data.location);
                        if (distance < 50) { // Show hospitals within 50km
                            nearby.push({ firestoreId: doc.id, distance, ...data });
                        }
                    }
                });

                setHospitals(nearby.sort((a, b) => a.distance - b.distance));
            } catch (error) {
                console.error("Failed to fetch hospitals:", error);
                toast({ variant: 'destructive', title: 'Fetch Error', description: 'Could not load hospital data.' });
            } finally {
                setIsLoading(false);
            }
        };

        if (location) fetchHospitals();
    }, [location, toast]);

    const handleBooking = async (hospital: HospitalWithId) => {
        if (!location) return toast({ variant: 'destructive', title: 'Missing Location' });
        if (!user) return toast({ variant: 'destructive', title: 'Please Log In', description: 'You must be logged in to book an ambulance.' });
        if (!db) return toast({ variant: 'destructive', title: 'Database Error', description: 'Cannot connect to the database.' });

        setIsBooking(hospital.firestoreId);
        try {
            await addDoc(collection(db, "ambulanceBookings"), {
                userId: user.uid,
                hospitalId: hospital.firestoreId,
                hospitalName: hospital.name,
                userLocation: location,
                timestamp: new Date(),
            });
            toast({ title: "✅ Ambulance Booked!", description: `An ambulance from ${hospital.name} has been requested to your location.` });
        } catch (error) {
            console.error("Booking failed:", error);
            toast({ variant: 'destructive', title: 'Booking Failed', description: 'Please ensure you have permission to perform this action.' });
        } finally {
            setIsBooking(null);
        }
    };

    const uberLink = location ? `https://m.uber.com/ul/?action=setPickup&pickup[latitude]=${location.lat}&pickup[longitude]=${location.lng}` : "#";
    const rapidoLink = location ? `https://book.rapido.bike/?lat=${location.lat}&lng=${location.lng}` : "#";

    return (
        <div className="space-y-12">
            <section>
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Book a Ride</CardTitle>
                        <CardDescription>Instantly book a cab to your current location.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Button asChild className="bg-black text-white hover:bg-gray-800" size="lg" disabled={!location}>
                            <a href={uberLink} target="_blank" rel="noopener noreferrer">
                                <UberIcon /> <span className="ml-2">Book Uber</span>
                            </a>
                        </Button>
                        <Button asChild className="bg-yellow-400 text-black hover:bg-yellow-500" size="lg" disabled={!location}>
                            <a href={rapidoLink} target="_blank" rel="noopener noreferrer">
                               <RapidoIcon /> <span className="ml-2">Book Rapido</span>
                            </a>
                        </Button>
                    </CardContent>
                </Card>
            </section>
            
            <section id="map-container">
                 <h2 className="text-3xl font-bold font-headline text-center text-primary mb-6">Your Live Location</h2>
                 <p className="text-center text-muted-foreground mb-6">Note: Map functionality requires location permissions.</p>
                 <div className="rounded-lg overflow-hidden border">
                    {location ? <LiveMap /> : <Skeleton className="w-full h-96" />}
                 </div>
            </section>

            <section>
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-bold font-headline text-primary">Nearby Ambulance Services</h2>
                    <p className="text-muted-foreground">Hospitals with emergency services near you.</p>
                </div>
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Skeleton className="h-48 w-full" />
                        <Skeleton className="h-48 w-full" />
                        <Skeleton className="h-48 w-full" />
                    </div>
                ) : hospitals.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {hospitals.map((hosp) => (
                            <Card key={hosp.firestoreId} className="flex flex-col">
                                <CardHeader>
                                    <CardTitle>{hosp.name}</CardTitle>
                                    <CardDescription className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {hosp.distance.toFixed(1)} km away</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                     <p className="text-sm text-muted-foreground">{hosp.address}</p>
                                </CardContent>
                                <CardContent>
                                    <Button onClick={() => handleBooking(hosp)} className="w-full" disabled={isBooking !== null}>
                                        {isBooking === hosp.firestoreId ? <LoaderCircle className="animate-spin" /> : <><Ambulance className="mr-2" /> Book Ambulance</>}
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-muted-foreground">No hospitals with ambulance services found within 50km of your location.</p>
                )}
            </section>

            <div className="mt-12 text-center">
                <Button onClick={() => router.push('/')} variant="outline">
                    <ArrowLeft className="mr-2" /> Back to Home
                </Button>
            </div>
        </div>
    );
}
