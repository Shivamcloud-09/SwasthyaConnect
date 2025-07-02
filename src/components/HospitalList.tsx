
"use client";

import { useState, useMemo, useEffect } from 'react';
import type { Hospital, NearbyHospital } from '@/lib/types';
import { getDistance } from '@/lib/utils';
import { Input } from '@/components/ui/input';
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


  const handleFindNearby = () => {
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
                setUserLocation(coords);
                setIsLocating(false);
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
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );
    } else {
        setLocationError('Geolocation is not supported by your browser. Showing all hospitals.');
        setIsLocating(false);
        setViewMode('all');
    }
  };
  
  const handleShowAll = () => {
    setViewMode('all');
  }

  const processedHospitals: HospitalWithDistance[] = useMemo(() => {
    let list: (Hospital | NearbyHospital)[] = [];

    if (viewMode === 'nearby') {
        list = apiHospitals;
    } else if (viewMode === 'all') {
        list = curatedHospitals;
    }

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

  const renderToggleButton = () => {
    if (viewMode === 'prompt' || isLocating || isFetchingApi) return null;

    const isShowingNearby = viewMode === 'nearby' && apiHospitals.length > 0;
    const isShowingAll = viewMode === 'all';

    return (
        <Button variant="outline" onClick={() => setViewMode(isShowingAll ? 'nearby' : 'all')}>
            {isShowingAll ? (
                <><MapPin className="mr-2 h-4 w-4" /> Show Nearby Hospitals (Live)</>
            ) : (
                <><List className="mr-2 h-4 w-4" /> Show All Hospitals (Curated)</>
            )}
        </Button>
    );
  }

  const renderContent = () => {
    if (viewMode === 'prompt') {
        return (
            <div className="text-center py-16 max-w-lg mx-auto bg-card border p-8 rounded-lg shadow-sm">
              <MapPin className="h-12 w-12 mx-auto text-primary mb-4" />
              <h2 className="text-2xl font-semibold mb-2 font-headline">Find Care Near You</h2>
              <p className="text-muted-foreground mb-6">Use live search to find hospitals near you via OpenStreetMap, or view our curated list of hospitals from the database.</p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button size="lg" onClick={handleFindNearby}>
                    Find Nearby
                </Button>
                <Button size="lg" variant="secondary" onClick={handleShowAll}>
                    View Curated List
                </Button>
              </div>
            </div>
        );
    }

    if (isLocating || isFetchingApi || (viewMode === 'all' && isFetchingCurated)) {
        const message = isLocating 
            ? "Getting your location..." 
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
            <>
                 <div className="text-center mb-6">
                    {renderToggleButton()}
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {processedHospitals.map(hospital => (
                        <HospitalCard key={('place_id' in hospital) ? hospital.place_id : hospital.id} hospital={hospital} distance={hospital.distance} />
                    ))}
                </div>
            </>
        )
    }

    return (
        <div className="text-center py-16 max-w-lg mx-auto">
            <ServerCrash className="h-12 w-12 mx-auto text-destructive mb-4" />
            <h2 className="text-2xl font-semibold mb-2 font-headline">No Hospitals Found</h2>
            <p className="text-muted-foreground mb-6">
                {viewMode === 'nearby' 
                ? "We couldn't find any hospitals nearby using OpenStreetMap. This could be due to your location or a temporary API issue."
                : `No hospitals found matching your search in our database.`
                }
            </p>
            {renderToggleButton()}
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
      <div className="relative mb-8 max-w-2xl mx-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search for a hospital..."
          className="pl-10 text-base py-6 rounded-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={viewMode === 'prompt'}
        />
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
