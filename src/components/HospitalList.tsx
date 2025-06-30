"use client";

import { useState, useMemo } from 'react';
import type { Hospital } from '@/lib/types';
import { getDistance } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import HospitalCard from '@/components/HospitalCard';
import { Search, LoaderCircle, AlertTriangle, List, MapPin } from 'lucide-react';
import { Button } from './ui/button';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

type HospitalListProps = {
  hospitals: Hospital[];
};

export default function HospitalList({ hospitals }: HospitalListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [permissionFlowStarted, setPermissionFlowStarted] = useState(false);

  const handleFindNearby = () => {
    setIsLocating(true);
    setLocationError(null);
    setPermissionFlowStarted(true);

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
                setShowAll(false); // Default to nearby view on success
                setIsLocating(false);
            },
            (error) => {
                setLocationError('Could not access your location. You may need to grant permission in your browser settings. Showing all hospitals instead.');
                console.error("Geolocation error:", error);
                setIsLocating(false);
                setShowAll(true);
            }
        );
    } else {
        setLocationError('Geolocation is not supported by your browser. Showing all hospitals.');
        setIsLocating(false);
        setShowAll(true);
    }
  };
  
  const handleShowAll = () => {
    setPermissionFlowStarted(true);
    setShowAll(true);
  }

  const processedHospitals = useMemo(() => {
    // 1. Start with all hospitals and calculate distances if location is available.
    let filteredHospitals = hospitals.map(h => ({
        ...h,
        distance: userLocation ? getDistance(userLocation, h.location) : undefined
    }));

    // 2. Filter by distance if in "nearby" mode.
    if (userLocation && !showAll) {
        filteredHospitals = filteredHospitals.filter(h => h.distance !== undefined && h.distance <= 25);
    }

    // 3. Filter by search term on the (potentially distance-filtered) list.
    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      filteredHospitals = filteredHospitals.filter(hospital =>
        hospital.name.toLowerCase().includes(lowercasedTerm) ||
        hospital.address.toLowerCase().includes(lowercasedTerm) ||
        hospital.specialties.some(s => s.toLowerCase().includes(lowercasedTerm)) ||
        hospital.medicines.some(m => m.toLowerCase().includes(lowercasedTerm))
      );
    }

    // 4. Sort the results. Prioritize distance if available.
    if (userLocation) {
        return filteredHospitals.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
    }
    return filteredHospitals.sort((a, b) => a.name.localeCompare(b.name));

  }, [searchTerm, hospitals, userLocation, showAll]);


  const renderToggleButton = () => {
    // If we have a location, the button toggles between nearby and all.
    if (userLocation) {
        return (
            <Button variant="outline" onClick={() => setShowAll(!showAll)}>
                <List className="mr-2 h-4 w-4" />
                {showAll ? 'Only Show Nearby' : 'Show All Hospitals'}
            </Button>
        )
    }
    // If we are showing all but don't have a location, the button should prompt for location.
    if (showAll && !userLocation) {
        return (
             <Button variant="outline" onClick={handleFindNearby}>
                <MapPin className="mr-2 h-4 w-4" />
                Find Nearby Hospitals
            </Button>
        )
    }
    return null;
  }

  const renderContent = () => {
    if (!permissionFlowStarted) {
        return (
            <div className="text-center py-16 max-w-lg mx-auto bg-card border p-8 rounded-lg shadow-sm">
              <MapPin className="h-12 w-12 mx-auto text-primary mb-4" />
              <h2 className="text-2xl font-semibold mb-2 font-headline">Find Care Near You</h2>
              <p className="text-muted-foreground mb-6">Allow location access to find the nearest hospitals, or view a list of all available hospitals.</p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button size="lg" onClick={handleFindNearby}>
                    Use My Location
                </Button>
                <Button size="lg" variant="secondary" onClick={handleShowAll}>
                    View All Hospitals
                </Button>
              </div>
            </div>
        );
    }

    if (isLocating) {
        return (
            <div className="flex justify-center items-center py-16">
                <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-4 text-lg text-muted-foreground">Finding nearby hospitals...</p>
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
                        <HospitalCard key={hospital.id} hospital={hospital} distance={hospital.distance} />
                    ))}
                </div>
            </>
        )
    }

    return (
        <div className="text-center py-16">
            <p className="text-xl text-muted-foreground">
                {userLocation && !showAll 
                ? "No hospitals found within 25km."
                : "No hospitals found matching your search."
                }
            </p>
             {userLocation && !showAll && searchTerm.length === 0 && (
                <Button variant="secondary" onClick={() => setShowAll(true)} className="mt-4">
                    View All Hospitals
                </Button>
            )}
        </div>
    );
  }

  return (
    <div>
      <div className="relative mb-8 max-w-2xl mx-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search hospital, specialty, symptom, or medicine..."
          className="pl-10 text-base py-6 rounded-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {locationError && (
        <Alert variant="destructive" className="max-w-2xl mx-auto mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Location Error</AlertTitle>
          <AlertDescription>{locationError}</AlertDescription>
        </Alert>
      )}

      {renderContent()}

    </div>
  );
}
