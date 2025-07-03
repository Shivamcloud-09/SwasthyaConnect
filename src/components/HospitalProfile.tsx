
"use client";

import { useState, useEffect } from 'react';
import type { Hospital } from '@/data/hospitals';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { BedDouble, Droplet, Clock, Phone, ShieldCheck, Stethoscope, Tag, Syringe, Star, ServerCrash } from 'lucide-react';
import BookRideButtons from './BookRideButtons';
import UserRating from './UserRating';
import RequestDoctorVisit from './RequestDoctorVisit';
import { Skeleton } from './ui/skeleton';
import Image from 'next/image';

type HospitalProfileProps = {
    hospitalId: string; // Changed to string for Firestore document ID
};

const HospitalNotFound = () => (
    <div className="container mx-auto px-4 py-8 text-center">
        <ServerCrash className="h-16 w-16 mx-auto text-destructive mb-4" />
        <h1 className="text-3xl font-bold text-destructive mb-2">Hospital Not Found</h1>
        <p className="text-muted-foreground">The hospital you are looking for does not exist or could not be loaded.</p>
    </div>
);


export default function HospitalProfile({ hospitalId }: HospitalProfileProps) {
    const [hospital, setHospital] = useState<Hospital | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [userRating, setUserRating] = useState<number | null>(null);
    const [imgSrc, setImgSrc] = useState('https://placehold.co/600x400.png');

    useEffect(() => {
        const fetchHospital = async () => {
            if (!db || !hospitalId) {
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            try {
                const hospitalRef = doc(db, "hospitals", hospitalId);
                const docSnap = await getDoc(hospitalRef);

                if (docSnap.exists()) {
                    const hospitalData = docSnap.data() as Hospital;
                    setHospital(hospitalData);
                    setImgSrc(hospitalData.imageUrl || 'https://placehold.co/600x400.png');
                    const storedUserRating = localStorage.getItem(`swasthya-rating-${docSnap.id}`);
                    if (storedUserRating) {
                        setUserRating(parseInt(storedUserRating, 10));
                    }
                } else {
                    setHospital(null);
                }
            } catch (error) {
                console.error("Error fetching hospital document:", error);
                setHospital(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchHospital();
    }, [hospitalId]);


    const handleRatingChange = (newRating: number) => {
        if (!hospital) return;
        setUserRating(newRating);
        // Use hospitalId for a stable localStorage key
        localStorage.setItem(`swasthya-rating-${hospitalId}`, newRating.toString());
    };

    if (isLoading) {
        return <HospitalProfileSkeleton />;
    }

    if (!hospital) {
        return <HospitalNotFound />;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="bg-card rounded-xl shadow-lg p-6 md:p-8">
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary mb-2">{hospital.name}</h1>
                    <p className="text-lg text-muted-foreground">{hospital.address}</p>
                </div>
                
                <div data-ai-hint="hospital building" className="relative w-full h-64 md:h-96 mb-8 rounded-lg overflow-hidden">
                    <Image
                        src={imgSrc}
                        alt={hospital.name || 'Hospital Image'}
                        fill
                        className="object-cover"
                        onError={() => setImgSrc('https://placehold.co/600x400.png')}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <Card>
                             <CardContent className="p-0 rounded-lg overflow-hidden h-64 md:h-96">
                                {hospital.location && (
                                    <iframe
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0 }}
                                        loading="lazy"
                                        allowFullScreen
                                        src={`https://www.google.com/maps?q=${hospital.location.lat},${hospital.location.lng}&output=embed`}
                                    ></iframe>
                                )}
                             </CardContent>
                        </Card>
                        
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 font-headline"><Stethoscope /> Doctors</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-4">
                                    {hospital.doctors?.map((doctor) => (
                                        <li key={doctor.name} className="flex items-center justify-between">
                                            <div>
                                                <p className="font-semibold">{doctor.name}</p>
                                                <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
                                            </div>
                                            <Badge variant="secondary">{doctor.availability}</Badge>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>

                        <div className="grid md:grid-cols-2 gap-8">
                             <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 font-headline"><Tag /> Services Offered</CardTitle>
                                </CardHeader>
                                <CardContent className="flex flex-wrap gap-2">
                                    {hospital.services?.map(service => <Badge key={service}>{service}</Badge>)}
                                </CardContent>
                            </Card>
                             <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 font-headline"><Syringe /> Available Medicines</CardTitle>
                                </CardHeader>
                                <CardContent className="flex flex-wrap gap-2">
                                     {hospital.medicines?.map(med => <Badge variant="outline" key={med}>{med}</Badge>)}
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <Card>
                             <CardHeader>
                                <CardTitle className="font-headline">Live Status</CardTitle>
                             </CardHeader>
                             <CardContent className="space-y-4">
                                <InfoItem icon={<BedDouble />} label="General Beds" value={`${hospital.beds?.general?.available ?? 'N/A'} / ${hospital.beds?.general?.total ?? 'N/A'} Available`} />
                                <InfoItem icon={<BedDouble className="text-destructive"/>} label="ICU Beds" value={`${hospital.beds?.icu?.available ?? 'N/A'} / ${hospital.beds?.icu?.total ?? 'N/A'} Available`} />
                                <InfoItem icon={<Droplet className={hospital.oxygen?.available ? "text-green-500" : "text-destructive"} />} label="Oxygen" value={hospital.oxygen?.available ? 'Available' : 'Unavailable'} />
                                <Separator />
                                <InfoItem icon={<Clock />} label="Timings" value={hospital.timings} />
                                <InfoItem icon={<Phone />} label="Contact" value={<a href={`tel:${hospital.contact}`} className="text-primary hover:underline">{hospital.contact}</a>} />
                             </CardContent>
                        </Card>
                        <Card>
                             <CardHeader>
                                <CardTitle className="font-headline">Hygiene & Safety</CardTitle>
                             </CardHeader>
                             <CardContent className="space-y-4">
                                <InfoItem icon={<ShieldCheck className="text-accent" />} label="Cleanliness Rating" value={`${hospital.hygiene?.rating?.toFixed(1) ?? 'N/A'} / 5.0`} />
                                <InfoItem icon={<Clock />} label="Last Sanitized" value={hospital.hygiene?.lastSanitized ?? 'N/A'} />
                                <InfoItem icon={<Star className={userRating ? "text-yellow-400" : ""}/>} label="Your Rating" value={<UserRating currentRating={userRating} onRatingChange={handleRatingChange} />} />
                                <Separator />
                                <p className="text-xs text-muted-foreground">License: {hospital.license ?? 'N/A'}</p>
                             </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-headline">Get Help</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {hospital.location && <BookRideButtons location={hospital.location} />}
                                {hospital.name && <RequestDoctorVisit hospitalName={hospital.name} />}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

const InfoItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: React.ReactNode }) => (
    <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
            <span className="text-primary">{icon}</span>
            <span className="text-sm font-medium text-muted-foreground">{label}</span>
        </div>
        <span className="text-sm font-semibold text-right">{value}</span>
    </div>
);


const HospitalProfileSkeleton = () => (
    <div className="container mx-auto px-4 py-8">
        <div className="bg-card rounded-xl shadow-lg p-6 md:p-8">
            <div className="text-center mb-8">
                <Skeleton className="h-12 w-3/4 mx-auto mb-2" />
                <Skeleton className="h-7 w-1/2 mx-auto" />
            </div>
            <Skeleton className="w-full h-64 md:h-96 mb-8 rounded-lg" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <Card>
                        <CardContent className="p-0 rounded-lg overflow-hidden h-64 md:h-96">
                           <Skeleton className="h-full w-full" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                           <Skeleton className="h-8 w-32" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-6 w-full" />
                        </CardContent>
                    </Card>
                </div>
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-8 w-24" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                           <Skeleton className="h-5 w-full" />
                           <Skeleton className="h-5 w-full" />
                           <Skeleton className="h-5 w-full" />
                           <Skeleton className="h-5 w-full" />
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <Skeleton className="h-8 w-32" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                           <Skeleton className="h-5 w-full" />
                           <Skeleton className="h-5 w-full" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    </div>
);
