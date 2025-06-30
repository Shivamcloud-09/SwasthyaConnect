
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Hospital } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BedDouble, Droplet, ShieldCheck, ArrowRight } from 'lucide-react';

type HospitalCardProps = {
  hospital: Hospital;
};

export default function HospitalCard({ hospital: initialHospital }: HospitalCardProps) {
    const [hospital, setHospital] = useState(initialHospital);

    useEffect(() => {
        const storedData = localStorage.getItem(`swasthya-hospital-${initialHospital.id}`);
        if (storedData) {
            const updatedData = JSON.parse(storedData);
            setHospital(prevHospital => ({ ...prevHospital, ...updatedData }));
        }
    }, [initialHospital.id]);

  const { id, name, address, hygiene, beds, oxygen } = hospital;
  
  const hygieneVariant = hygiene.rating >= 4.7 ? 'default' : hygiene.rating >= 4.0 ? 'secondary' : 'destructive';
  const hygieneText = hygiene.rating >= 4.7 ? 'High Hygiene' : hygiene.rating >= 4.0 ? 'Good Hygiene' : 'Needs Improvement';

  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
            <CardTitle className="font-headline text-xl text-primary">{name}</CardTitle>
            <CardDescription>{address}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow space-y-4">
            <div data-ai-hint="hospital building" className="relative h-40 w-full rounded-md overflow-hidden">
                 <Image src={`https://placehold.co/600x400.png`} alt={name} layout="fill" objectFit="cover" />
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
