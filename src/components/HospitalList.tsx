
"use client";

import { useState, useMemo } from 'react';
import type { Hospital, NearbyHospital } from '@/lib/types';
import { getDistance } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import HospitalCard from '@/components/HospitalCard';
import { Search, LoaderCircle, AlertTriangle, List, MapPin, ServerCrash } from 'lucide-react';
import { Button } from './ui/button';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { findNearbyHospitals } from '@/ai/flows/nearbyHospitalsFlow';

type HospitalListProps = {
  staticHospitals: Hospital[];
};

type HospitalWithDistance = (Hospital | NearbyHospital) & { distance?: number };

export default function HospitalList({ staticHospitals }: HospitalListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<React.ReactNode | null>(null);
  
  const [viewMode, setViewMode] = useState<'prompt' | 'nearby' | 'all'>('prompt');
  const [apiHospitals, setApiHospitals] = useState<NearbyHospital[]>([]);
  const [isFetchingApi, setIsFetchingApi] = useState(false);


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
                     if (errorMessage.includes("has not been used in project") || errorMessage.includes("is disabled")) {
                        const projectIdMatch = errorMessage.match(/project(?:s\/|\s)(\d+)/);
                        const projectId = projectIdMatch ? projectIdMatch[1] : null;
                        const enableApiUrl = projectId
                            ? `https://console.developers.google.com/apis/api/places.googleapis.com/overview?project=${projectId}`
                            : 'https://console.cloud.google.com/apis/library/places.googleapis.com';
                        
                        setLocationError(
                            <>
                                <span>Google Places API Error: The API must be enabled.</span>
                                <a href={enableApiUrl} target="_blank" rel="noopener noreferrer" className="font-bold underline ml-1 hover:text-destructive/80">
                                    Click here to fix it.
                                </a>
                            </>
                        );
                    } else {
                        setLocationError(`Could not fetch nearby hospitals. Reason: ${errorMessage}`);
                    }
                    setViewMode('all');
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
        list = staticHospitals;
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
        ('specialties' in hospital && hospital.specialties.some(s => s.toLowerCase().includes(lowercasedTerm)))
      );
    }

    if (userLocation) {
        return hospitalWithDistance.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
    }
    return hospitalWithDistance.sort((a, b) => a.name.localeCompare(b.name));

  }, [searchTerm, staticHospitals, apiHospitals, userLocation, viewMode]);


  const renderToggleButton = () => {
    if (viewMode === 'prompt' || isLocating) return null;

    return (
        <Button variant="outline" onClick={() => setViewMode(viewMode === 'all' ? 'nearby' : 'all')}>
            {viewMode === 'all' ? (
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
              <p className="text-muted-foreground mb-6">Use live search to find hospitals near you via Google, or view our curated list of hospitals.</p>
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

    if (isLocating || isFetchingApi) {
        return (
            <div className="flex justify-center items-center py-16 flex-col gap-4">
                <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
                <p className="text-lg text-muted-foreground">
                    {isLocating ? "Getting your location..." : "Searching for nearby hospitals via Google..."}
                </p>
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
                ? "We couldn't find any hospitals nearby using Google Places API. This could be due to your location or an API configuration issue."
                : "No hospitals found matching your search in our curated list."
                }
            </p>
            {renderToggleButton()}
        </div>
    );
  }

  return (
    <div suppressHydrationWarning>
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
