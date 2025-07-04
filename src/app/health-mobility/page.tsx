'use client';

import HealthMobility from '@/components/HealthMobility';

export default function HealthMobilityPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary mb-2">Health Mobility</h1>
                <p className="text-lg text-muted-foreground">Book a ride or find nearby ambulance services.</p>
            </div>
            <HealthMobility />
        </div>
    );
}
