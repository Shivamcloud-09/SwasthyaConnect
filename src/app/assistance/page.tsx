'use client';

import PatientAssistance from '@/components/PatientAssistance';

export default function AssistancePage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary mb-2">Patient Assistance</h1>
                <p className="text-lg text-muted-foreground">Book appointments or request home services with ease.</p>
            </div>
            <PatientAssistance />
        </div>
    );
}
