
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

type ServiceCardProps = {
    icon: LucideIcon;
    title: string;
    description: string;
    href: string;
};
  
export const ServiceCard = ({ icon: Icon, title, description, href }: ServiceCardProps) => (
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
