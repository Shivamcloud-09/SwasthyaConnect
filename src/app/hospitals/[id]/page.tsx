
import { hospitals } from '@/data/hospitals';
import HospitalProfile from '@/components/HospitalProfile';
import { notFound } from 'next/navigation';

type PageProps = {
    params: {
        id: string;
    }
}

export function generateStaticParams() {
    return hospitals.map((hospital) => ({
      id: hospital.id.toString(),
    }))
}

const getHospitalById = (id: number) => {
    return hospitals.find(h => h.id === id);
}

export default function HospitalDetailPage({ params }: PageProps) {
    const hospitalId = parseInt(params.id, 10);
    const hospital = getHospitalById(hospitalId);

    if (!hospital) {
        notFound();
    }
    
    return <HospitalProfile hospital={hospital} />;
}
