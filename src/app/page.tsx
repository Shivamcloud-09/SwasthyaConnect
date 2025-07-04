'use client';

import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Stethoscope, Ambulance, Car, ClipboardPlus, Hospital, ListChecks, ArrowRight } from 'lucide-react';

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
    <div className="bg-muted/20">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary mb-4">Your Health, Connected</h1>
          <p className="text-lg text-muted-foreground">All your healthcare needs, simplified and accessible. Instantly find hospitals, book services, and manage your health from one place.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-16">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/nearby">Nearby Hospitals</Link>
            </Button>
            <Button asChild variant="secondary" size="lg" className="w-full sm:w-auto">
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
