
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Hospital } from '@/data/hospitals';
import { hospitals as allHospitals } from '@/data/hospitals';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { Skeleton } from './ui/skeleton';

export default function AdminDashboard() {
    const router = useRouter();
    const { toast } = useToast();
    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const isFirebaseConfigured = !!auth;

    useEffect(() => {
        const isAuthenticated = localStorage.getItem('swasthya-admin-auth') === 'true';
        if (!isAuthenticated) {
            router.push('/admin/login');
            return;
        }
        setHospitals(allHospitals);
        setIsLoading(false);
    }, [router]);

    const handleLogout = async () => {
         if (!isFirebaseConfigured) {
             toast({
                variant: 'destructive',
                title: 'Logout Failed',
                description: 'Firebase is not configured.',
            });
            return;
        }
        try {
            await signOut(auth!);
            localStorage.removeItem('swasthya-admin-auth');
            router.push('/admin/login');
            toast({
                title: "Logged Out",
                description: "You have been successfully logged out."
            })
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Logout Failed',
                description: 'An error occurred while logging out.',
            });
        }
    };

    const handleUpdate = (hospitalId: number, field: string, value: any) => {
        setHospitals(currentHospitals =>
          currentHospitals.map(h => {
            if (h.id === hospitalId) {
              const keys = field.split('.');
              if (keys.length === 3) {
                return {
                  ...h,
                  [keys[0]]: {
                    ...(h as any)[keys[0]],
                    [keys[1]]: {
                      ...(h as any)[keys[0]][keys[1]],
                      [keys[2]]: value
                    }
                  }
                };
              }
              if (keys.length === 2) {
                return {
                  ...h,
                  [keys[0]]: {
                    ...(h as any)[keys[0]],
                    [keys[1]]: value
                  }
                };
              }
              return { ...h, [field]: value };
            }
            return h;
          })
        );
      };
      

    const handleSaveChanges = async (hospitalId: number) => {
        toast({
            title: "Read-only Mode",
            description: "Changes cannot be saved as the app is using static data.",
        });
    };

    if (isLoading) {
        return (
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
                    <CardContent className="space-y-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 md:p-8">
            <div className="flex justify-between items-center mb-6">
                 <h1 className="text-3xl font-bold font-headline">Admin Dashboard</h1>
                 <Button variant="outline" onClick={handleLogout} disabled={!isFirebaseConfigured}>Logout</Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Manage Hospitals</CardTitle>
                    <CardDescription>Update live information for each hospital below. Data is static and cannot be saved.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        {hospitals.map(hospital => (
                            <AccordionItem key={hospital.id} value={`item-${hospital.id}`}>
                                <AccordionTrigger className="font-headline">{hospital.name}</AccordionTrigger>
                                <AccordionContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
                                        <div className="space-y-2">
                                            <Label htmlFor={`general-beds-${hospital.id}`}>General Beds Available</Label>
                                            <Input type="number" id={`general-beds-${hospital.id}`} value={hospital.beds.general.available} onChange={(e) => handleUpdate(hospital.id, 'beds.general.available', parseInt(e.target.value) || 0)} />
                                        </div>
                                         <div className="space-y-2">
                                            <Label htmlFor={`icu-beds-${hospital.id}`}>ICU Beds Available</Label>
                                            <Input type="number" id={`icu-beds-${hospital.id}`} value={hospital.beds.icu.available} onChange={(e) => handleUpdate(hospital.id, 'beds.icu.available', parseInt(e.target.value) || 0)} />
                                        </div>
                                         <div className="space-y-2">
                                            <Label htmlFor={`hygiene-rating-${hospital.id}`}>Hygiene Rating</Label>
                                            <Input type="number" step="0.1" id={`hygiene-rating-${hospital.id}`} value={hospital.hygiene.rating} onChange={(e) => handleUpdate(hospital.id, 'hygiene.rating', parseFloat(e.target.value) || 0)} />
                                        </div>
                                        <div className="flex items-center space-x-2 pt-6">
                                            <Switch id={`oxygen-available-${hospital.id}`} checked={hospital.oxygen.available} onCheckedChange={(checked) => handleUpdate(hospital.id, 'oxygen.available', checked)} />
                                            <Label htmlFor={`oxygen-available-${hospital.id}`}>Oxygen Available</Label>
                                        </div>
                                    </div>
                                    <div className="text-right mt-4">
                                        <Button onClick={() => handleSaveChanges(hospital.id)}>Save Changes</Button>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </CardContent>
            </Card>
        </div>
    );
}
