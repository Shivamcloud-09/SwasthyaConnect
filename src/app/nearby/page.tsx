
'use client';

import NearbyList from "@/components/NearbyList";

export default function NearbyPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary mb-2">Nearby Hospitals</h1>
                <p className="text-lg text-muted-foreground">Find hospitals near your location using GPS or manual entry.</p>
            </div>
            <NearbyList />
        </div>
    );
}
