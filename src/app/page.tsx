
'use client';

import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Stethoscope, Ambulance, Car, ClipboardPlus, Hospital, ListChecks, ArrowRight } from 'lucide-react';
import Image from 'next/image';

const services = [
    {
        icon: Stethoscope,
        title: "Patient Assistance",
        description: "Book appointments or arrange home services easily through our connected system.",
        href: "/assistance"
    },
    {
        icon: Ambulance,
        title: "Emergency Assistance",
        description: "Need immediate help? Access our dedicated page for emergency services.",
        href: "/emergency" 
    },
    {
        icon: Car,
        title: "Health Mobility",
        description: "Book transport via Uber, Ola, or Rapido for hospital or pharmacy visits.",
        href: "/health-mobility"
    },
    {
        icon: ClipboardPlus,
        title: "Digital Support",
        description: "Access digital prescriptions, medical records, and video consultations anytime.",
        href: "/digital-support"
    },
    {
        icon: Hospital,
        title: "Nearby Healthcare",
        description: "Find hospitals near you based on your current location and needs.",
        href: "/nearby"
    },
    {
        icon: ListChecks,
        title: "Hospital Directory",
        description: "Search hospitals by name and view their profiles, services, and contact info.",
        href: "/curated"
    }
];

type ServiceCardProps = {
    icon: LucideIcon;
    title: string;
    description: string;
    href: string;
};

function ServiceCard({ icon: Icon, title, description, href }: ServiceCardProps) {
    return (
      <Link href={href} className="flex">
        <Card className="flex flex-col h-full w-full bg-card/50 hover:bg-card/90 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
          <CardHeader>
            <div className="bg-primary/10 text-primary p-3 rounded-full self-start mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                <Icon className="w-6 h-6" />
            </div>
            <CardTitle className="font-headline text-xl">{title}</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow">
            <CardDescription>{description}</CardDescription>
          </CardContent>
          <CardFooter>
            <Button variant="link" className="p-0 group-hover:text-primary">
                Learn More <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </Link>
    );
}

export default function Home() {
  return (
    <>
      <section className="relative w-full bg-background overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1586773860418-d37222d8fce3?q=80&w=1920&auto=format&fit=crop"
            alt="Modern hospital building exterior"
            fill
            className="object-cover"
            data-ai-hint="hospital building"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        </div>
        
        <div className="container mx-auto px-4 h-full">
            <div className="flex items-center justify-center md:justify-start min-h-[calc(100vh-80px)]">
                {/* Text Content */}
                <div className="relative z-10 text-center md:text-left py-12 max-w-2xl">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-headline tracking-tight">
                    Smarter Health.
                    <br />
                    <span className="text-primary">Better Living.</span>
                  </h1>
                  <p className="mt-4 text-lg text-muted-foreground">
                    Discover seamless healthcare with instant access to doctors, hassle-free appointments, and personalized wellness support. Trust in technology and expertise designed to keep you healthy, happy, and in control.
                  </p>
                  <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                      <Button asChild size="lg">
                          <Link href="/assistance">Book an Appointment</Link>
                      </Button>
                      <Button asChild size="lg" variant="outline">
                          <Link href="/emergency">Emergency Help</Link>
                      </Button>
                  </div>
                </div>
            </div>
        </div>
      </section>

      <div className="bg-background">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-headline text-primary mb-4">All Your Healthcare Needs</h2>
            <p className="text-lg text-muted-foreground">Instantly find hospitals, book services, and manage your health from one place.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <ServiceCard key={service.title} {...service} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
