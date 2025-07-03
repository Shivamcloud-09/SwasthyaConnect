
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Stethoscope, Ambulance, Car, ClipboardPlus, Hospital, ListChecks, ArrowRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const services = [
    {
        icon: Stethoscope,
        title: "Patient Assistance",
        description: "Book appointments or arrange home services easily through our connected system.",
        href: "/login"
    },
    {
        icon: Ambulance,
        title: "Emergency Assistance",
        description: "Need immediate help? Book ambulances and emergency response services.",
        href: "/#emergency-numbers" 
    },
    {
        icon: Car,
        title: "Health Mobility",
        description: "Book transport via Uber, Ola, or Rapido for hospital or pharmacy visits.",
        href: "/hospitals/1"
    },
    {
        icon: ClipboardPlus,
        title: "Digital Support",
        description: "Access digital prescriptions, medical records, and video consultations anytime.",
        href: "/login"
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

const ServiceCard = ({ icon: Icon, title, description, href }: { icon: LucideIcon, title: string, description: string, href: string }) => (
    <Card className="flex flex-col h-full bg-card/50 hover:bg-card/90 hover:shadow-xl transition-all duration-300 group">
      <CardHeader>
        <div className="bg-primary/10 text-primary p-4 rounded-full w-fit group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
          <Icon className="w-8 h-8" />
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <CardTitle className="font-headline text-xl mb-2">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardContent>
      <CardFooter>
        <Button asChild variant="ghost" className="w-full justify-start p-0 h-auto text-base font-semibold text-primary">
          <Link href={href}>
            Explore
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
);

export default function Home() {
  return (
    <div className="bg-muted/20">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary mb-4">Your Health, Connected</h1>
          <p className="text-lg text-muted-foreground">All your healthcare needs, simplified and accessible. Instantly find hospitals, book services, and manage your health from one place.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-16">
            <Button asChild size="lg" className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white">
              <Link href="/nearby">Nearby Hospitals</Link>
            </Button>
            <Button asChild variant="secondary" size="lg" className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white">
              <Link href="/curated">Show Curated List</Link>
            </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <ServiceCard key={service.title} {...service} />
          ))}
        </div>
      </div>
    </div>
  );
}
