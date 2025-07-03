
"use client";

import { useState, useMemo, useEffect } from 'react';
import type { Hospital } from '@/data/hospitals';
import { db } from '@/lib/firebase';
import { collection, getDocs, type DocumentData } from 'firebase/firestore';
import { Input } from '@/components/ui/input';
import HospitalCard from '@/components/HospitalCard';
import { Search, ServerCrash, LoaderCircle } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { useToast } from '@/hooks/use-toast';

type HospitalWithId = Hospital & { firestoreId: string };

export default function CuratedList() {
  const [hospitals, setHospitals] = useState<HospitalWithId[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchHospitals = async () => {
      if (!db) {
        toast({
          variant: "destructive",
          title: "Database Error",
          description: "Firebase is not configured, cannot load hospital data.",
        });
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        const hospitalsRef = collection(db, "hospitals");
        const querySnapshot = await getDocs(hospitalsRef);
        const fetchedHospitals: HospitalWithId[] = [];
        querySnapshot.forEach(doc => {
          fetchedHospitals.push({
            ...(doc.data() as Hospital),
            firestoreId: doc.id,
          });
        });
        setHospitals(fetchedHospitals);
      } catch (error) {
        console.error("Error fetching hospitals:", error);
        toast({
          variant: "destructive",
          title: "Failed to load hospitals",
          description: "Could not retrieve data from the database.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchHospitals();
  }, [toast]);

  const filteredHospitals = useMemo(() => {
    if (!searchTerm) {
      return hospitals;
    }
    
    const lowercasedTerm = searchTerm.toLowerCase();
    return hospitals.filter(hospital =>
      hospital.name.toLowerCase().includes(lowercasedTerm) ||
      hospital.address.toLowerCase().includes(lowercasedTerm) ||
      (Array.isArray(hospital.specialties) && hospital.specialties.some(s => s.toLowerCase().includes(lowercasedTerm)))
    );
  }, [searchTerm, hospitals]);

  if (isLoading) {
    return (
      <div>
        <div className="relative mb-8 max-w-2xl mx-auto">
            <Skeleton className="h-14 w-full rounded-full" />
        </div>
        <div className="text-center py-16">
            <LoaderCircle className="h-12 w-12 mx-auto text-primary animate-spin mb-4" />
            <h2 className="text-2xl font-semibold mb-2 font-headline">Loading Hospitals...</h2>
            <p className="text-muted-foreground">Fetching the latest data from our network.</p>
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
              key={hospital.firestoreId} 
              hospital={hospital} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 max-w-lg mx-auto">
          <ServerCrash className="h-12 w-12 mx-auto text-destructive mb-4" />
          <h2 className="text-2xl font-semibold mb-2 font-headline">No Hospitals Found</h2>
          <p className="text-muted-foreground mb-6">
            Your search returned no results. This may be because the database is empty. An admin can claim hospitals from the admin dashboard to populate the list.
          </p>
        </div>
      )}
    </div>
  );
}
