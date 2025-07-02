
"use client";

import { useState, useEffect } from 'react';
import type { Hospital } from '@/data/hospitals';
import { hospitals as allHospitals } from '@/data/hospitals';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { BedDouble, Droplet, Clock, Phone, ShieldCheck, Stethoscope, Tag, Syringe, Star, ServerCrash } from 'lucide-react';
import BookRideButtons from './BookRideButtons';
import UserRating from './UserRating';
import RequestDoctorVisit from './RequestDoctorVisit';
import { Skeleton } from './ui/skeleton';

type HospitalProfileProps = {
    hospitalId: number;
};

export default function HospitalProfile({ hospitalId }: HospitalProfileProps) {
    const [hospital, setHospital] = useState<Hospital | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userRating, setUserRating] = useState<number | null>(null);

    useEffect(() => {
        setIsLoading(true);
        if (!hospitalId || isNaN(hospitalId)) {
            setError("Invalid hospital ID provided.");
            setIsLoading(false);
            return;
        };

        const foundHospital = allHospitals.find(h => h.id === hospitalId);

        if (foundHospital) {
            setHospital(foundHospital);
            const storedUserRating = localStorage.getItem(`swasthya-rating-${foundHospital.id}`);
            if(storedUserRating) {
                setUserRating(parseInt(storedUserRating, 10));
            }
        } else {
            setHospital(null);
            setError(`No hospital found with ID: ${hospitalId}`);
        }
        
        setIsLoading(false);
    }, [hospitalId]);

    const handleRatingChange = (newRating: number) => {
        if (!hospital) return;
        setUserRating(newRating);
        localStorage.setItem(`swasthya-rating-${hospital.id}`, newRating.toString());
    };

    if (isLoading) {
        return <HospitalProfileSkeleton />;
    }

    if (error || !hospital) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                 <ServerCrash className="h-16 w-16 mx-auto text-destructive mb-4" />
                 <h1 className="text-3xl font-bold text-destructive mb-2">Could Not Load Hospital</h1>
                 <p className="text-muted-foreground">{error || "The requested hospital could not be found."}</p>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="bg-card rounded-xl shadow-lg p-6 md:p-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary mb-2">{hospital.name}</h1>
                    <p className="text-lg text-muted-foreground">{hospital.address}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left/Main Column */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Map */}
                        <Card>
                             <CardContent className="p-0 rounded-lg overflow-hidden h-64 md:h-96">
                                <iframe
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    loading="lazy"
                                    allowFullScreen
                                    src={`https://www.google.com/maps?q=${hospital.location.lat},${hospital.location.lng}&output=embed`}
                                ></iframe>
                             </CardContent>
                        </Card>
                        
                        {/* Doctors List */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 font-headline"><Stethoscope /> Doctors</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-4">
                                    {hospital.doctors.map((doctor) => (
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

                        {/* Services & Medicines */}
                        <div className="grid md:grid-cols-2 gap-8">
                             <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 font-headline"><Tag /> Services Offered</CardTitle>
                                </CardHeader>
                                <CardContent className="flex flex-wrap gap-2">
                                    {hospital.services.map(service => <Badge key={service}>{service}</Badge>)}
                                </CardContent>
                            </Card>
                             <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 font-headline"><Syringe /> Available Medicines</CardTitle>
                                </CardHeader>
                                <CardContent className="flex flex-wrap gap-2">
                                     {hospital.medicines.map(med => <Badge variant="outline" key={med}>{med}</Badge>)}
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Right/Info Column */}
                    <div className="space-y-6">
                        <Card>
                             <CardHeader>
                                <CardTitle className="font-headline">Live Status</CardTitle>
                             </CardHeader>
                             <CardContent className="space-y-4">
                                <InfoItem icon={<BedDouble />} label="General Beds" value={`${hospital.beds.general.available} / ${hospital.beds.general.total} Available`} />
                                <InfoItem icon={<BedDouble className="text-destructive"/>} label="ICU Beds" value={`${hospital.beds.icu.available} / ${hospital.beds.icu.total} Available`} />
                                <InfoItem icon={<Droplet className={hospital.oxygen.available ? "text-green-500" : "text-destructive"} />} label="Oxygen" value={hospital.oxygen.available ? 'Available' : 'Unavailable'} />
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
                                <InfoItem icon={<ShieldCheck className="text-accent" />} label="Cleanliness Rating" value={`${hospital.hygiene.rating.toFixed(1)} / 5.0`} />
                                <InfoItem icon={<Clock />} label="Last Sanitized" value={hospital.hygiene.lastSanitized} />
                                <InfoItem icon={<Star className={userRating ? "text-yellow-400" : ""}/>} label="Your Rating" value={<UserRating currentRating={userRating} onRatingChange={handleRatingChange} />} />
                                <Separator />
                                <p className="text-xs text-muted-foreground">License: {hospital.license}</p>
                             </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-headline">Get Help</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <BookRideButtons location={hospital.location} />
                                <RequestDoctorVisit hospitalName={hospital.name} />
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
