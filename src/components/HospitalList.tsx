
"use client";

import { useState, useMemo, useEffect } from 'react';
import type { Hospital, NearbyHospital } from '@/data/hospitals';
import { hospitals as curatedHospitals } from '@/data/hospitals';
import { Input } from '@/components/ui/input';
import HospitalCard from '@/components/HospitalCard';
import { Search, ServerCrash, LoaderCircle, MapPin, List, Edit } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { findNearbyHospitals, geocodeAddress } from '@/lib/actions/hospitalActions';
import { getDistance } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from './ui/label';

type HospitalToShow = Hospital | NearbyHospital;

export default function HospitalList() {
  const [isMounted, setIsMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [allHospitals, setAllHospitals] = useState<HospitalToShow[]>(curatedHospitals);
  const [isSearchingNearby, setIsSearchingNearby] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const { toast } = useToast();
  
  // State for manual entry dialog
  const [isManualEntryOpen, setIsManualEntryOpen] = useState(false);
  const [manualLocation, setManualLocation] = useState('');


  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const searchForHospitals = async (lat: number, lng: number) => {
    // This is called by both GPS and manual search
    setIsSearchingNearby(true);
    setLocationError(null);
    setUserLocation({ lat, lng });

    try {
        const nearby = await findNearbyHospitals({ lat, lng });
        setAllHospitals(nearby);
    } catch (error) {
        console.error("Error fetching nearby hospitals:", error);
        const errorMsg = 'Could not fetch nearby hospitals. Please try again later.';
        setLocationError(errorMsg);
        toast({
            variant: 'destructive',
            title: 'Search Failed',
            description: errorMsg,
        });
    } finally {
        setIsSearchingNearby(false);
    }
  }

  const handleFindNearby = () => {
    // This uses the browser's GPS
    setIsSearchingNearby(true);
    setLocationError(null);
    setUserLocation(null);

    if (!navigator.geolocation) {
      const errorMsg = 'Geolocation is not supported by your browser.';
      setLocationError(errorMsg);
      toast({ variant: 'destructive', title: 'Error', description: errorMsg });
      setIsSearchingNearby(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        searchForHospitals(lat, lng);
      },
      (error) => {
        let message = 'An unknown error occurred.';
        if (error.code === error.PERMISSION_DENIED) {
          message = 'You denied the request for Geolocation.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message = 'Location information is unavailable.';
        } else if (error.code === error.TIMEOUT) {
          message = 'The request to get user location timed out.';
        }
        setLocationError(message);
        toast({
            variant: 'destructive',
            title: 'Location Error',
            description: message
        });
        setIsSearchingNearby(false);
      }
    );
  };
  
  const handleManualSearch = async (e: React.FormEvent) => {
    // This geocodes a user-entered address string
    e.preventDefault();
    if (!manualLocation) return;

    setIsGeocoding(true);
    try {
        const result = await geocodeAddress(manualLocation);
        toast({
            title: "Location Found!",
            description: `Searching for hospitals near ${result.displayName}.`
        });
        await searchForHospitals(result.lat, result.lng);
        setIsManualEntryOpen(false); // Close dialog on success
        setManualLocation(''); // Clear input
    } catch (error: any) {
        console.error("Geocoding Error:", error);
        toast({
            variant: 'destructive',
            title: 'Location Not Found',
            description: `Could not find the location "${manualLocation}". Please try a different search term.`,
        });
    } finally {
        setIsGeocoding(false);
    }
  }

  const handleShowAll = () => {
      setAllHospitals(curatedHospitals);
      setUserLocation(null);
      setLocationError(null);
      setSearchTerm('');
  }

  const filteredHospitals = useMemo(() => {
    const listToFilter = allHospitals;

    if (!searchTerm) {
      return listToFilter;
    }
    
    const lowercasedTerm = searchTerm.toLowerCase();
    return listToFilter.filter(hospital =>
      hospital.name.toLowerCase().includes(lowercasedTerm) ||
      hospital.address.toLowerCase().includes(lowercasedTerm) ||
      ('specialties' in hospital && Array.isArray(hospital.specialties) && hospital.specialties.some(s => s.toLowerCase().includes(lowercasedTerm)))
    );
  }, [searchTerm, allHospitals]);

  const sortedHospitals = useMemo(() => {
    if (!userLocation) {
        return filteredHospitals;
    }
    // Create a mutable copy before sorting
    return [...filteredHospitals].sort((a, b) => {
        const distA = getDistance(userLocation, a.location);
        const distB = getDistance(userLocation, b.location);
        return distA - distB;
    });
  }, [filteredHospitals, userLocation]);

  if (!isMounted) {
    return (
        <div>
            <div className="flex flex-wrap gap-4 items-center justify-center mb-8">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-10 w-44" />
            </div>
            <div className="relative mb-8 max-w-2xl mx-auto">
                <Skeleton className="h-14 w-full rounded-full" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Skeleton className="h-[450px] w-full" />
                <Skeleton className="h-[450px] w-full" />
                <Skeleton className="h-[450px] w-full" />
            </div>
        </div>
    )
  }

  const isLoading = isSearchingNearby || isGeocoding;

  return (
    <div>
        <div className="flex flex-wrap gap-4 items-center justify-center mb-8">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button disabled={isLoading}>
                        <MapPin /> Nearby Hospitals
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center">
                    <DropdownMenuItem onClick={handleFindNearby} disabled={isSearchingNearby}>
                        {isSearchingNearby ? (
                            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <MapPin className="mr-2 h-4 w-4" />
                        )}
                        <span>{isSearchingNearby ? 'Using GPS...' : 'Use My Location'}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsManualEntryOpen(true)}>
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Enter Location Manually</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={isManualEntryOpen} onOpenChange={setIsManualEntryOpen}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-headline">Enter Location Manually</DialogTitle>
                  <DialogDescription>
                    Type an address, city, or landmark to find hospitals in that area.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleManualSearch}>
                    <div className="py-4">
                        <div className="space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <div className="relative flex items-center">
                               <Edit className="absolute left-3 h-5 w-5 text-muted-foreground" />
                               <Input
                                    id="location"
                                    value={manualLocation}
                                    onChange={(e) => setManualLocation(e.target.value)}
                                    className="pl-10"
                                    placeholder="e.g., 'New Delhi' or 'Connaught Place'"
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                    <Button type="submit" disabled={isGeocoding} className="w-full">
                        {isGeocoding ? (
                             <>
                                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> 
                                Searching...
                             </>
                        ) : (
                            "Find Hospitals"
                        )}
                    </Button>
                    </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <Button onClick={handleShowAll} variant="outline" disabled={isLoading}>
                <List /> Show Curated List
            </Button>
        </div>
      <div className="relative mb-8 max-w-2xl mx-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Filter hospitals by name, address, or specialty..."
          className="pl-10 text-base py-6 rounded-full w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

       {locationError && (
            <div className="text-center py-4 text-destructive bg-destructive/10 rounded-md">
                <p>{locationError}</p>
            </div>
        )}

      {isLoading && sortedHospitals.length === 0 ? (
            <div className="text-center py-16">
                 <LoaderCircle className="h-12 w-12 mx-auto text-primary animate-spin mb-4" />
                 <h2 className="text-2xl font-semibold mb-2 font-headline">Finding Hospitals...</h2>
                 <p className="text-muted-foreground">Please wait while we search for hospitals near your location.</p>
            </div>
      ) : sortedHospitals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedHospitals.map(hospital => (
            <HospitalCard
              key={'place_id' in hospital ? hospital.place_id : hospital.id} 
              hospital={hospital} 
              distance={userLocation ? getDistance(userLocation, hospital.location) : undefined}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 max-w-lg mx-auto">
          <ServerCrash className="h-12 w-12 mx-auto text-destructive mb-4" />
          <h2 className="text-2xl font-semibold mb-2 font-headline">No Hospitals Found</h2>
          <p className="text-muted-foreground mb-6">
            Your search returned no results. Try adjusting your filter or searching for nearby hospitals.
          </p>
        </div>
      )}
    </div>
  );
}
