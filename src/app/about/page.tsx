
import Image from 'next/image';
import { Building, HeartHandshake, Users, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function AboutPage() {
  return (
    <div className="relative">
      {/* Background Image and Overlay */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1551192422-9b76a6d09322?q=80&w=1920&auto=format&fit=crop"
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

        {/* Mission and Vision Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-16 items-start">
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-3xl font-bold font-headline flex items-center gap-3"><HeartHandshake className="text-accent" /> Our Mission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Our mission is to empower individuals with instant access to crucial healthcare information and services. From finding the nearest hospital with available beds to booking emergency transport, SwasthyaConnect is your reliable partner in health management, ensuring that quality care is always within reach.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
             <CardTitle className="font-bold text-lg">Core Features</CardTitle>
            </CardHeader>
            <CardContent>
             <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Live hospital data tracking</li>
                <li>Emergency service coordination</li>
                <li>Seamless appointment booking</li>
                <li>Integrated mobility solutions</li>
             </ul>
            </CardContent>
          </Card>
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
                        <a href="mailto:gupta29satyam@gmail.com" className="hover:text-primary hover:underline">gupta29satyam@gmail.com</a>
                    </p>
                    <p className="flex items-center justify-center gap-2">
                        <Mail className="h-4 w-4" />
                        <a href="mailto:syedhamishnehal121@gmail.com" className="hover:text-primary hover:underline">syedhamishnehal121@gmail.com</a>
                    </p>
                </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
