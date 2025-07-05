"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { addDoc, collection } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, LoaderCircle } from 'lucide-react';

// Fix for default Leaflet icon issue with webpack
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

// Icons for ride services
const UberIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M7.29.116 2.451 15.98h2.384l1.63-4.997h4.032l1.63 4.997h2.384L9.71.116h-2.42zm.843 2.54h.732l2.262 7.042H5.87L8.133 2.656z"/></svg>
);

const RapidoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256"><path d="M233.75,86.41,194.2,43.05a16,16,0,0,0-23.44,1.86l-18.18,29.35A64.12,64.12,0,0,0,128,64a63.3,63.3,0,0,0-28.81,6.81L86.87,40.1A16,16,0,0,0,64,32H40a16,16,0,0,0-16,16V96a16,16,0,0,0,16,16H64a16,16,0,0,0,13.23-7.14l8.63-13.8a64,64,0,0,0,3.33,70.53l-9.52,15.23A16,16,0,0,0,88,208h24.3a16,16,0,0,0,14.07-8.79l15.15-32.8C152,172.08,162.77,176,176,176a56,56,0,0,0,51.87-83.16ZM176,160a40,40,0,1,1,40-40A40,40,0,0,1,176,160Z"/></svg>
);

export default function HealthMobility() {
    const router = useRouter();
    const { user } = useAuth();
    const { toast } = useToast();
    
    // State for location and UI
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // State for Ambulance form
    const [patientName, setPatientName] = useState('');
    const [patientAddress, setPatientAddress] = useState('');
    const [additionalNotes, setAdditionalNotes] = useState('');

    // Refs for map
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<L.Map | null>(null);

    // Effect for initializing map and getting location
    useEffect(() => {
        // This static assignment is a workaround for a common issue with Leaflet and bundlers.
        // @ts-ignore
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: iconRetinaUrl.src,
            iconUrl: iconUrl.src,
            shadowUrl: shadowUrl.src,
        });

        if (!navigator.geolocation) {
            toast({ variant: 'destructive', title: 'Location Error', description: 'Geolocation is not supported by your browser.' });
            return;
        }

        // Get location and initialize map
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setLocation({ lat: latitude, lng: longitude });

                if (mapRef.current && !mapInstance.current) {
                    const map = L.map(mapRef.current, {
                        center: [latitude, longitude],
                        zoom: 15,
                        zoomControl: false,
                        attributionControl: false,
                    });
                    mapInstance.current = map;

                    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                    }).addTo(map);

                    L.marker([latitude, longitude]).addTo(map).bindPopup("You are here.");
                }
            },
            () => {
                toast({ variant: 'destructive', title: 'Location Error', description: 'Could not get your location. Please enable location services.' });
            }
        );

        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleAmbulanceBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            toast({ variant: 'destructive', title: 'Not Logged In', description: 'Please log in to book an ambulance.' });
            router.push('/login');
            return;
        }
        if (!location) {
             toast({ variant: 'destructive', title: 'Location Missing', description: 'Cannot book without your location.' });
             return;
        }
        if (!patientName || !patientAddress) {
            toast({ variant: 'destructive', title: 'Form Incomplete', description: 'Please fill in patient name and address.' });
            return;
        }
        if (!db) {
            toast({ variant: 'destructive', title: 'Database Error', description: 'Firebase is not configured. Cannot book ambulance.' });
            return;
        }

        setIsLoading(true);
        try {
            await addDoc(collection(db, "ambulanceBookings"), {
                userId: user.uid,
                patientName,
                patientAddress,
                additionalNotes,
                location,
                timestamp: new Date(),
            });
            toast({ title: "✅ Ambulance Booked Successfully!", description: "Help is on the way. The provider will contact you shortly." });
            setPatientName('');
            setPatientAddress('');
            setAdditionalNotes('');
        } catch (error) {
            console.error("Ambulance booking failed:", error);
            toast({ variant: 'destructive', title: 'Booking Failed', description: 'Could not complete your request. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };
    
    // Dynamic links for ride services
    const uberLink = location ? `https://m.uber.com/ul/?action=setPickup&pickup[latitude]=${location.lat}&pickup[longitude]=${location.lng}` : "#";
    const rapidoLink = "https://rapido.bike/Home";

    return (
        <div className="relative w-full h-[calc(100vh-80px)] overflow-hidden">
            {/* Background Map */}
            <div ref={mapRef} id="map" className="absolute top-0 left-0 w-full h-full z-0 opacity-40" />
            
            {/* Foreground Content */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full p-4 bg-gradient-to-t from-background/80 via-background/50 to-transparent">
                <Tabs defaultValue="ambulance" className="w-full max-w-md">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="ambulance">Book Ambulance</TabsTrigger>
                        <TabsTrigger value="transport">Transportation</TabsTrigger>
                    </TabsList>
                    
                    {/* Ambulance Booking Form */}
                    <TabsContent value="ambulance">
                        <Card className="bg-background/80 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="font-headline">Request an Ambulance</CardTitle>
                                <CardDescription>Fill in the details below. Your location will be sent automatically.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleAmbulanceBooking} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="patientName">Patient Name</Label>
                                        <Input id="patientName" value={patientName} onChange={e => setPatientName(e.target.value)} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="patientAddress">Patient Address</Label>
                                        <Input id="patientAddress" value={patientAddress} onChange={e => setPatientAddress(e.target.value)} required />
                                    </div>
                                     <div className="space-y-2">
                                        <Label htmlFor="additionalNotes">Additional Notes (optional)</Label>
                                        <Textarea id="additionalNotes" value={additionalNotes} onChange={e => setAdditionalNotes(e.target.value)} placeholder="e.g., patient is on the 3rd floor" />
                                    </div>
                                    <Button type="submit" className="w-full" disabled={isLoading}>
                                        {isLoading ? <LoaderCircle className="animate-spin"/> : "Confirm Ambulance Booking"}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    
                    {/* Transportation Services */}
                    <TabsContent value="transport">
                        <Card className="bg-background/80 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="font-headline">Book a Ride</CardTitle>
                                <CardDescription>Get a ride to a hospital, pharmacy, or home.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 gap-4">
                                <Button asChild className="bg-black text-white hover:bg-gray-800" size="lg" disabled={!location}>
                                    <a href={uberLink} target="_blank" rel="noopener noreferrer">
                                        <UberIcon /> <span className="ml-2">Book Uber</span>
                                    </a>
                                </Button>
                                <Button asChild className="bg-yellow-400 text-black hover:bg-yellow-500" size="lg">
                                    <a href={rapidoLink} target="_blank" rel="noopener noreferrer">
                                       <RapidoIcon /> <span className="ml-2">Book Rapido</span>
                                    </a>
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
                
                <div className="mt-8">
                    <Button onClick={() => router.push('/')} variant="outline" className="bg-background/80">
                        <ArrowLeft className="mr-2" /> Back to Home
                    </Button>
                </div>
            </div>
        </div>
    );
}
