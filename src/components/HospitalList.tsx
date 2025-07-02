
"use client";

import { useState, useMemo, useEffect } from 'react';
import type { Hospital, NearbyHospital } from '@/lib/types';
import { getDistance } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import HospitalCard from '@/components/HospitalCard';
import { Search, LoaderCircle, AlertTriangle, List, MapPin, ServerCrash } from 'lucide-react';
import { Button } from './ui/button';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { findNearbyHospitals } from '@/ai/flows/nearbyHospitalsFlow';
import { Skeleton } from './ui/skeleton';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

type HospitalWithDistance = (Hospital | NearbyHospital) & { distance?: number };

export default function HospitalList() {
  const [isMounted, setIsMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [manualLocation, setManualLocation] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<React.ReactNode | null>(null);
  
  const [viewMode, setViewMode] = useState<'prompt' | 'nearby' | 'all'>('prompt');
  const [apiHospitals, setApiHospitals] = useState<NearbyHospital[]>([]);
  const [isFetchingApi, setIsFetchingApi] = useState(false);
  
  const [curatedHospitals, setCuratedHospitals] = useState<Hospital[]>([]);
  const [isFetchingCurated, setIsFetchingCurated] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Effect to fetch curated hospitals from Firestore
  useEffect(() => {
    if (viewMode !== 'all' || !isMounted) return;

    setIsFetchingCurated(true);
    const hospitalsCollection = collection(db, 'hospitals');
    const q = query(hospitalsCollection, orderBy('id'));
    
    // Using onSnapshot for real-time updates from admin dashboard
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const hospitalList = snapshot.docs.map(doc => ({
            firestoreId: doc.id,
            ...doc.data()
        } as Hospital));
        setCuratedHospitals(hospitalList);
        setIsFetchingCurated(false);
    }, (error) => {
        console.error("Error fetching curated hospitals:", error);
        setLocationError("Could not fetch curated hospital list. Is your Firebase config correct?");
        setIsFetchingCurated(false);
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, [viewMode, isMounted]);

  const fetchHospitalsForLocation = async (coords: { lat: number; lng: number }) => {
    setUserLocation(coords);
    setIsFetchingApi(true);
    try {
        const results = await findNearbyHospitals(coords);
        setApiHospitals(results);
    } catch (error) {
        console.error("API call to find hospitals failed:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        setLocationError(`Could not fetch nearby hospitals. Please try again later. Reason: ${errorMessage}`);
        setViewMode('all'); // Revert to a safe view on error
    } finally {
        setIsFetchingApi(false);
    }
  };

  const handleFindNearbyWithGeolocation = () => {
    setIsLocating(true);
    setLocationError(null);
    setViewMode('nearby'); 

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const coords = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                setIsLocating(false);
                await fetchHospitalsForLocation(coords);
            },
            (error) => {
                let message = 'Could not access your location. You may need to grant permission in your browser settings. Showing all hospitals instead.';
                if (error.code === error.TIMEOUT) {
                    message = 'Could not get your location in time. Showing all hospitals instead.';
                }
                setLocationError(message);
                console.error("Geolocation error:", error);
                setIsLocating(false);
                setViewMode('all');
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    } else {
        setLocationError('Geolocation is not supported by your browser. Showing all hospitals.');
        setIsLocating(false);
        setViewMode('all');
    }
  };
  
  const handleManualSearch = async () => {
    if (!manualLocation.trim()) {
        setLocationError("Please enter a location to search.");
        return;
    }
    setIsLocating(true);
    setLocationError(null);
    setViewMode('nearby'); 
    try {
        const geocodeUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(manualLocation)}&format=jsonv2&limit=1`;
        const geocodeResponse = await fetch(geocodeUrl, {
            method: 'GET',
            headers: { 'Accept': 'application/json', 'User-Agent': 'SwasthyaConnect/1.0 (Development Project)' }
        });
        const geocodeData = await geocodeResponse.json();

        if (!geocodeResponse.ok || geocodeData.length === 0) {
            throw new Error(`Could not find coordinates for "${manualLocation}". Please try a different location.`);
        }
        const coords = { lat: parseFloat(geocodeData[0].lat), lng: parseFloat(geocodeData[0].lon) };
        setIsLocating(false);
        await fetchHospitalsForLocation(coords);
    } catch (error) {
        console.error("Manual search failed:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during manual search.";
        setLocationError(errorMessage);
        setViewMode('prompt');
    } finally {
        setIsLocating(false);
    }
  };

  const handleShowAll = () => {
    setViewMode('all');
  }

  const processedHospitals: HospitalWithDistance[] = useMemo(() => {
    let list: (Hospital | NearbyHospital)[] = [];
    if (viewMode === 'nearby') list = apiHospitals;
    else if (viewMode === 'all') list = curatedHospitals;

    let hospitalWithDistance = list.map(h => ({
        ...h,
        distance: userLocation ? getDistance(userLocation, h.location) : undefined
    }));
    
    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      hospitalWithDistance = hospitalWithDistance.filter(hospital =>
        hospital.name.toLowerCase().includes(lowercasedTerm) ||
        hospital.address.toLowerCase().includes(lowercasedTerm) ||
        ('specialties' in hospital && Array.isArray(hospital.specialties) && hospital.specialties.some(s => s.toLowerCase().includes(lowercasedTerm)))
      );
    }

    if (userLocation) {
        return hospitalWithDistance.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
    }
    return hospitalWithDistance.sort((a, b) => a.name.localeCompare(b.name));

  }, [searchTerm, curatedHospitals, apiHospitals, userLocation, viewMode]);

  const renderContent = () => {
    if (viewMode === 'prompt') {
        return (
            <div className="text-center py-10 max-w-lg mx-auto bg-card border p-8 rounded-lg shadow-sm">
                <MapPin className="h-12 w-12 mx-auto text-primary mb-4" />
                <h2 className="text-2xl font-semibold mb-2 font-headline">Find Care Near You</h2>
                <p className="text-muted-foreground mb-6">Search for hospitals using your current location, a manual address, or view our complete curated list.</p>
                <div className="space-y-4">
                    <Button size="lg" onClick={handleFindNearbyWithGeolocation} className="w-full">
                        <MapPin className="mr-2 h-4 w-4" /> Use My Current Location
                    </Button>
                    <form onSubmit={(e) => { e.preventDefault(); handleManualSearch(); }} className="space-y-2 text-left">
                        <Label htmlFor="manual-location" className="text-muted-foreground text-sm">Or search by city/address</Label>
                        <div className="flex gap-2">
                            <Input id="manual-location" type="text" placeholder="e.g., New York, NY" className="text-base py-5 flex-grow" value={manualLocation} onChange={(e) => setManualLocation(e.target.value)} required />
                            <Button type="submit" variant="secondary" className="px-5">Search</Button>
                        </div>
                    </form>
                    <div className="relative py-2">
                        <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or</span></div>
                    </div>
                    <Button size="lg" variant="outline" onClick={handleShowAll} className="w-full">
                        <List className="mr-2 h-4 w-4" /> View Full Curated List
                    </Button>
                </div>
            </div>
        );
    }

    if (isLocating || isFetchingApi || (viewMode === 'all' && isFetchingCurated)) {
        const message = isLocating 
            ? "Processing your location..." 
            : isFetchingApi 
            ? "Searching for nearby hospitals..."
            : "Loading hospitals from database...";
        return (
            <div className="flex justify-center items-center py-16 flex-col gap-4">
                <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
                <p className="text-lg text-muted-foreground">{message}</p>
            </div>
        );
    }

    if (processedHospitals.length > 0) {
        return (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {processedHospitals.map(hospital => (
                    <HospitalCard key={('place_id' in hospital) ? hospital.place_id : hospital.id} hospital={hospital} distance={hospital.distance} />
                ))}
            </div>
        )
    }

    return (
        <div className="text-center py-16 max-w-lg mx-auto">
            <ServerCrash className="h-12 w-12 mx-auto text-destructive mb-4" />
            <h2 className="text-2xl font-semibold mb-2 font-headline">No Hospitals Found</h2>
            <p className="text-muted-foreground mb-6">
                {viewMode === 'nearby' 
                ? "We couldn't find any hospitals nearby using that location. This could be due to an invalid location or a temporary API issue."
                : `No hospitals found matching your filter in our database.`
                }
            </p>
            <Button variant="outline" onClick={handleShowAll}>View Full Curated List</Button>
        </div>
    );
  }

  if (!isMounted) {
    return (
        <div>
            <div className="relative mb-8 max-w-2xl mx-auto">
                <Skeleton className="h-14 w-full rounded-full" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Skeleton className="h-[300px] w-full" />
                <Skeleton className="h-[300px] w-full" />
                <Skeleton className="h-[300px] w-full" />
            </div>
        </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-8 max-w-2xl mx-auto">
        <div className="relative w-full flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder={viewMode === 'prompt' ? "Start a search below" : "Filter current results..."}
              className="pl-10 text-base py-6 rounded-full w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={viewMode === 'prompt'}
            />
        </div>
        {viewMode !== 'prompt' && !isLocating && !isFetchingApi && (
             <Button variant="secondary" onClick={() => {
                setViewMode('prompt');
                setSearchTerm('');
                setLocationError(null);
                setManualLocation('');
                setApiHospitals([]);
                setUserLocation(null);
            }}>
                <Search className="mr-2 h-4 w-4" /> New Search
            </Button>
        )}
    </div>

      {locationError && (
        <Alert variant="destructive" className="max-w-2xl mx-auto mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{locationError}</AlertDescription>
        </Alert>
      )}

      {renderContent()}

    </div>
  );
}
