
"use client";

import { useState, useMemo, useEffect } from 'react';
import type { Hospital } from '@/lib/types';
import { getDistance } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import HospitalCard from '@/components/HospitalCard';
import { Search, LoaderCircle, AlertTriangle, List } from 'lucide-react';
import { Button } from './ui/button';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

type HospitalListProps = {
  hospitals: Hospital[];
};

export default function HospitalList({ hospitals }: HospitalListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
                setIsLocating(false);
            },
            (error) => {
                setLocationError('Could not access your location. Showing all hospitals instead.');
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
  }, []);

  const processedHospitals = useMemo(() => {
    const hospitalsWithDistance = hospitals.map(h => ({
        ...h,
        distance: userLocation ? getDistance(userLocation, h.location) : undefined
    }));

    let filtered = hospitalsWithDistance;

    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      filtered = hospitalsWithDistance.filter(hospital =>
        hospital.name.toLowerCase().includes(lowercasedTerm) ||
        hospital.address.toLowerCase().includes(lowercasedTerm) ||
        hospital.specialties.some(s => s.toLowerCase().includes(lowercasedTerm)) ||
        hospital.medicines.some(m => m.toLowerCase().includes(lowercasedTerm))
      );
    }

    if (userLocation && !showAll) {
        return filtered
            .filter(h => h.distance !== undefined && h.distance <= 25) // 25km radius
            .sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
    }
    
    // Fallback sort by name if not sorting by distance
    return filtered.sort((a, b) => a.name.localeCompare(b.name));

  }, [searchTerm, hospitals, userLocation, showAll]);

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

      {isLocating && (
        <div className="flex justify-center items-center py-16">
            <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-4 text-lg text-muted-foreground">Finding nearby hospitals...</p>
        </div>
      )}

      {locationError && !isLocating && (
        <Alert variant="destructive" className="max-w-2xl mx-auto mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Location Error</AlertTitle>
          <AlertDescription>{locationError}</AlertDescription>
        </Alert>
      )}

      {!isLocating && userLocation && (
        <div className="text-center mb-6">
            <Button variant="outline" onClick={() => setShowAll(!showAll)}>
                <List className="mr-2 h-4 w-4" />
                {showAll ? 'Show Nearby Hospitals' : 'Show All Hospitals'}
            </Button>
        </div>
      )}

      {!isLocating && processedHospitals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {processedHospitals.map(hospital => (
            <HospitalCard key={hospital.id} hospital={hospital} distance={hospital.distance} />
          ))}
        </div>
      ) : !isLocating && (
        <div className="text-center py-16">
          <p className="text-xl text-muted-foreground">
            {userLocation && !showAll 
              ? "No hospitals found within 25km."
              : "No hospitals found matching your search."
            }
          </p>
        </div>
      )}
    </div>
  );
}
