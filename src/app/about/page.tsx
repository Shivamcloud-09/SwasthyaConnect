
import Image from 'next/image';
import type { LucideIcon } from 'lucide-react';
import { Building, Users, Mail, UsersRound, ShieldCheck, Flag, Lightbulb, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const values = [
  {
    icon: UsersRound,
    title: 'Patient Centricity',
    points: [
      "Commit to 'best outcomes and experience' for our patients",
      'Treat patients and their caregivers with compassion, care',
      "Our patients' needs will come first",
    ],
  },
  {
    icon: ShieldCheck,
    title: 'Integrity',
    points: [
      'Be principled, open and honest',
      "Model and live our 'Values'",
      'Demonstrate moral courage to speak up and do the right things',
    ],
  },
  {
    icon: Users,
    title: 'Teamwork',
    points: [
      'Proactively support each other and operate as one team',
      'Respect and value people at all levels with different opinions, experiences and backgrounds',
      'Demonstrate moral courage to speak up and do the right things',
    ],
  },
  {
    icon: Flag,
    title: 'Ownership',
    points: [
      'Be responsible and take pride in our actions',
      'Take initiative and go beyond the call of duty',
      'Deliver commitment and agreement made',
    ],
  },
  {
    icon: Lightbulb,
    title: 'Innovation',
    points: [
      'Continuously improve and innovate to exceed expectations',
      "Adopt a 'can-do' attitude",
      'Challenge ourselves to do things differently',
    ],
  },
];

type ValueCardProps = {
  icon: LucideIcon;
  title: string;
  points: string[];
}

const ValueCard = ({ icon: Icon, title, points }: ValueCardProps) => (
  <Card className="group bg-card/80 backdrop-blur-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 h-full border-2 border-transparent hover:border-primary/30">
    <CardHeader className="flex flex-row items-center gap-4">
      <div className="bg-primary/10 text-primary p-3 rounded-lg flex-shrink-0 transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
        <Icon className="h-6 w-6" />
      </div>
      <CardTitle className="font-bold text-lg">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <ul className="space-y-3 text-muted-foreground">
        {points.map((point, index) => (
          <li key={index} className="flex items-start gap-3">
            <ChevronRight className="h-5 w-5 mt-0.5 text-primary/70 shrink-0 transition-transform duration-300 group-hover:translate-x-1" />
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </CardContent>
  </Card>
)

export default function AboutPage() {
  return (
    <div className="relative">
      {/* Background Image and Overlay */}
      <div className="absolute inset-0">
        <Image
          src="https://placehold.co/1920x1080.png"
          alt="Modern hospital hallway"
          fill
          className="object-cover"
          data-ai-hint="hospital hallway"
        />
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-12 md:py-20">
        
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-4 bg-primary/20 rounded-full mb-4 border border-primary/30">
            <Building className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary mb-4">About SwasthyaConnect</h1>
          <p className="max-w-3xl mx-auto text-lg text-foreground/80">
            Connecting you to better health, faster. We are dedicated to bridging the gap between patients and healthcare providers through seamless technology.
          </p>
        </div>

        {/* Our Values Section */}
        <div className="mb-20">
          <h2 className="text-3xl md:text-4xl font-bold font-headline text-center mb-12">Our Values</h2>
          
          {/* Top row of 3 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {values.slice(0, 3).map((value) => (
              <ValueCard key={value.title} {...value} />
            ))}
          </div>
          
          {/* Bottom row of 2, centered on large screens */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:w-2/3 lg:mx-auto">
            {values.slice(3).map((value) => (
              <ValueCard key={value.title} {...value} />
            ))}
          </div>
        </div>

        {/* Team Section */}
        <Card className="max-w-2xl mx-auto text-center bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary/20 border border-primary/30 mb-4">
                <Users className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="font-headline">Developed by Team TechBrix</CardTitle>
            <CardDescription>A passionate team dedicated to leveraging technology for social good.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-t pt-6">
                <h3 className="font-semibold text-lg mb-4">Contact & Support</h3>
                <div className="space-y-2 text-muted-foreground">
                    <p className="flex items-center justify-center gap-2">
                        <Mail className="h-4 w-4" />
                        <a href="mailto:contactswasthyaconnect@gmail.com" className="hover:text-primary hover:underline">contactswasthyaconnect@gmail.com</a>
                    </p>
                </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
