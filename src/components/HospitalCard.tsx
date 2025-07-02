
"use client";

import Link from 'next/link';
import Image from 'next/image';
import type { Hospital, NearbyHospital } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BedDouble, Droplet, ShieldCheck, ArrowRight, MapPin } from 'lucide-react';

type HospitalCardProps = {
  hospital: Hospital | NearbyHospital;
  distance?: number;
};

function isNearbyHospital(hospital: Hospital | NearbyHospital): hospital is NearbyHospital {
    return (hospital as NearbyHospital).place_id !== undefined;
}

export default function HospitalCard({ hospital, distance }: HospitalCardProps) {

  if (isNearbyHospital(hospital)) {
    const osmUrl = `https://www.openstreetmap.org/?mlat=${hospital.location.lat}&mlon=${hospital.location.lng}#map=16/${hospital.location.lat}/${hospital.location.lng}`;
    return (
        <Card className="flex flex-col h-full hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="font-headline text-xl text-primary">{hospital.name}</CardTitle>
                        <CardDescription>{hospital.address}</CardDescription>
                    </div>
                    {distance !== undefined && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground whitespace-nowrap">
                            <MapPin className="h-4 w-4" />
                            <span>{distance.toFixed(1)} km</span>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
                <p className="text-sm text-muted-foreground">Details for this hospital are provided by OpenStreetMap. Live data like bed availability is not available.</p>
            </CardContent>
            <CardFooter>
                <Button asChild className="w-full">
                    <a href={osmUrl} target="_blank" rel="noopener noreferrer">
                        View on OpenStreetMap <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                </Button>
            </CardFooter>
        </Card>
    );
  }

  const { id, name, address, hygiene, beds, oxygen } = hospital;
  
  const hygieneVariant = hygiene.rating >= 4.7 ? 'default' : hygiene.rating >= 4.0 ? 'secondary' : 'destructive';
  const hygieneText = hygiene.rating >= 4.7 ? 'High Hygiene' : hygiene.rating >= 4.0 ? 'Good Hygiene' : 'Needs Improvement';

  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="font-headline text-xl text-primary">{name}</CardTitle>
                    <CardDescription>{address}</CardDescription>
                </div>
                {distance !== undefined && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground whitespace-nowrap">
                        <MapPin className="h-4 w-4" />
                        <span>{distance.toFixed(1)} km</span>
                    </div>
                )}
            </div>
        </CardHeader>
        <CardContent className="flex-grow space-y-4">
            <div data-ai-hint="hospital building" className="relative h-40 w-full rounded-md overflow-hidden">
                 <Image src={`https://placehold.co/600x400.png`} alt={name} fill style={{ objectFit: 'cover' }} />
            </div>
            <div className="flex flex-wrap gap-2">
                <Badge variant={hygieneVariant} className="flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5" /> {hygieneText}: {hygiene.rating.toFixed(1)}
                </Badge>
                {oxygen.available ? (
                    <Badge className="bg-green-100 text-green-800 flex items-center gap-1.5">
                        <Droplet className="h-3.5 w-3.5" /> Oxygen Available
                    </Badge>
                ) : (
                    <Badge variant="destructive" className="flex items-center gap-1.5">
                        <Droplet className="h-3.5 w-3.5" /> Oxygen Low
                    </Badge>
                )}
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                    <BedDouble className="h-5 w-5 text-primary" />
                    <div>
                        <p className="font-semibold">{beds.general.available}</p>
                        <p className="text-muted-foreground">General Beds</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <BedDouble className="h-5 w-5 text-destructive" />
                    <div>
                        <p className="font-semibold">{beds.icu.available}</p>
                        <p className="text-muted-foreground">ICU Beds</p>
                    </div>
                </div>
            </div>
        </CardContent>
        <CardFooter>
            <Button asChild className="w-full">
                <Link href={`/hospitals/${id}`}>
                    View Details <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
        </CardFooter>
    </Card>
  );
}
