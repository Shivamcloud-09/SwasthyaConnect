
import { hospitals } from '@/data/hospitals';
import HospitalList from '@/components/HospitalList';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary mb-2">Welcome to SwasthyaConnect</h1>
        <p className="text-lg text-muted-foreground">Your health, connected. Find nearby hospitals and critical information instantly.</p>
      </div>
      <HospitalList staticHospitals={hospitals} />
    </div>
  );
}
