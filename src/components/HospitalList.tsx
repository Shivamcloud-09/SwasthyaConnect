
"use client";

import { useState, useMemo } from 'react';
import type { Hospital } from '@/lib/types';
import { Input } from '@/components/ui/input';
import HospitalCard from '@/components/HospitalCard';
import { Search } from 'lucide-react';

type HospitalListProps = {
  hospitals: Hospital[];
};

export default function HospitalList({ hospitals }: HospitalListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHospitals = useMemo(() => {
    if (!searchTerm) {
      return hospitals;
    }
    const lowercasedTerm = searchTerm.toLowerCase();
    return hospitals.filter(hospital =>
      hospital.name.toLowerCase().includes(lowercasedTerm) ||
      hospital.address.toLowerCase().includes(lowercasedTerm) ||
      hospital.specialties.some(s => s.toLowerCase().includes(lowercasedTerm))
    );
  }, [searchTerm, hospitals]);

  return (
    <div>
      <div className="relative mb-8 max-w-2xl mx-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by hospital name, specialty, or symptom..."
          className="pl-10 text-base py-6 rounded-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredHospitals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHospitals.map(hospital => (
            <HospitalCard key={hospital.id} hospital={hospital} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-xl text-muted-foreground">No hospitals found matching your search.</p>
        </div>
      )}
    </div>
  );
}
