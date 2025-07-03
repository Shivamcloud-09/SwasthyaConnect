
"use client";

import { useState, useMemo, useEffect } from 'react';
import { hospitals as curatedHospitals } from '@/data/hospitals';
import { Input } from '@/components/ui/input';
import HospitalCard from '@/components/HospitalCard';
import { Search, ServerCrash } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

export default function CuratedList() {
  const [isMounted, setIsMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const filteredHospitals = useMemo(() => {
    if (!searchTerm) {
      return curatedHospitals;
    }
    
    const lowercasedTerm = searchTerm.toLowerCase();
    return curatedHospitals.filter(hospital =>
      hospital.name.toLowerCase().includes(lowercasedTerm) ||
      hospital.address.toLowerCase().includes(lowercasedTerm) ||
      (Array.isArray(hospital.specialties) && hospital.specialties.some(s => s.toLowerCase().includes(lowercasedTerm)))
    );
  }, [searchTerm]);

  if (!isMounted) {
    return (
        <div>
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

  return (
    <div>
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

      {filteredHospitals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHospitals.map(hospital => (
            <HospitalCard
              key={hospital.id} 
              hospital={hospital} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 max-w-lg mx-auto">
          <ServerCrash className="h-12 w-12 mx-auto text-destructive mb-4" />
          <h2 className="text-2xl font-semibold mb-2 font-headline">No Hospitals Found</h2>
          <p className="text-muted-foreground mb-6">
            Your search returned no results. Try adjusting your filter.
          </p>
        </div>
      )}
    </div>
  );
}
