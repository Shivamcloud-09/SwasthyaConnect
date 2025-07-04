
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Ambulance, ShieldAlert, Flame, MessageSquare, Map as MapIcon, Siren, ArrowLeft } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

// Dynamically import the LiveMap component to avoid SSR issues with Leaflet
const LiveMap = dynamic(() => import('@/components/LiveMap'), { 
    ssr: false,
    loading: () => <Skeleton className="w-full h-96 rounded-lg" />
});

export default function EmergencyPage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleSos = async () => {
    if (!navigator.geolocation) {
      toast({ variant: 'destructive', title: 'Error', description: 'Geolocation is not supported by your browser.' });
      return;
    }
    toast({ title: "Triggering SOS...", description: "Getting your location. Please wait." });

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch('/api/sos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            }),
          });
          if (res.ok) {
            toast({ title: 'SOS Triggered!', description: 'Your location has been sent to our emergency response team.' });
          } else {
             // Try to parse the error message from the server for better debugging
            const errorData = await res.json().catch(() => ({}));
            const serverMessage = errorData.details || `Server responded with status ${res.status}.`;
            throw new Error(serverMessage);
          }
        } catch (error) {
          console.error("SOS Error:", error);
          const description = error instanceof Error ? error.message : 'Could not send your location. Please try calling directly.';
          toast({ variant: 'destructive', title: 'SOS Failed', description });
        }
      },
      (error) => {
        toast({ variant: 'destructive', title: 'Location Error', description: 'Could not get your location. Please enable location services.' });
      }
    );
  };

  const handleWhatsAppLocation = () => {
    if (!navigator.geolocation) {
      toast({ variant: 'destructive', title: 'Error', description: 'Geolocation is not supported by your browser.' });
      return;
    }
    toast({ title: "Getting Location...", description: "Please wait while we fetch your coordinates for WhatsApp." });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const message = `🚨 Emergency! Please help.\nMy live location:\nhttps://www.google.com/maps?q=${latitude},${longitude}`;
        const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
      },
      (error) => {
        console.error("Location error for WhatsApp:", error);
        toast({ variant: 'destructive', title: 'Location Error', description: 'Could not get your location. Please share it manually.' });
        // Fallback to old behavior if location fails
        const fallbackUrl = 'https://wa.me/?text=Emergency%20Help%20Needed.%20My%20location%20is...';
        window.open(fallbackUrl, '_blank');
      }
    );
  };
  
  const emergencyServices = [
    {
      title: 'Call Ambulance',
      description: 'Instantly call for an ambulance in a medical emergency.',
      icon: Ambulance,
      action: () => window.open('tel:102', '_self'),
    },
    {
      title: 'Police Assistance',
      description: 'Reach your nearest police station for any safety concerns.',
      icon: ShieldAlert,
      action: () => window.open('tel:100', '_self'),
    },
    {
      title: 'Fire Emergency',
      description: 'Contact the fire department in case of a fire.',
      icon: Flame,
      action: () => window.open('tel:101', '_self'),
    },
    {
      title: 'WhatsApp Help',
      description: 'Send a pre-filled emergency message with your location via WhatsApp.',
      icon: MessageSquare,
      action: handleWhatsAppLocation,
    },
    {
      title: 'View Live Location',
      description: 'See a map showing your current real-time location.',
      icon: MapIcon,
      action: () => {
        const el = document.getElementById('map-container');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      },
    },
    {
      title: 'SOS Alert',
      description: 'Trigger an SOS alert and store your location with us.',
      icon: Siren,
      action: handleSos,
    },
  ];

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary mb-4">Emergency Services</h1>
          <p className="text-lg text-muted-foreground">Instant access to vital emergency support when you need it most.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {emergencyServices.map((service, i) => (
            <Card
              key={i}
              onClick={service.action}
              className="cursor-pointer bg-card/50 hover:bg-card/90 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
            >
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="bg-destructive/10 text-destructive p-3 rounded-full group-hover:bg-destructive group-hover:text-destructive-foreground transition-colors duration-300">
                  <service.icon className="w-6 h-6" />
                </div>
                <CardTitle className="font-headline text-xl">{service.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{service.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div id="map-container" className="mt-16 pt-8 border-t">
           <h2 className="text-3xl font-bold font-headline text-center text-primary mb-6">Your Live Location</h2>
           <p className="text-center text-muted-foreground mb-6">Note: Map functionality requires location permissions.</p>
            <div className="rounded-lg overflow-hidden border">
             <LiveMap />
           </div>
        </div>

        <div className="mt-12 text-center">
            <Button onClick={() => router.push('/')} variant="outline">
                <ArrowLeft className="mr-2" /> Back to Home
            </Button>
        </div>
      </div>
    </div>
  );
}
