'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const HospitalListLoading = () => (
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
);

const HospitalList = dynamic(() => import('@/components/HospitalList'), {
  ssr: false,
  loading: () => <HospitalListLoading />,
});


export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary mb-2">Welcome to SwasthyaConnect</h1>
        <p className="text-lg text-muted-foreground">Your health, connected. Find nearby hospitals and critical information instantly.</p>
      </div>
      <HospitalList />
    </div>
  );
}
