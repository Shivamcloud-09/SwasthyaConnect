
import HospitalProfile from '@/components/HospitalProfile';
import { notFound } from 'next/navigation';

type PageProps = {
    params: {
        id: string;
    }
}

// The page is now dynamic and will fetch data on the client.
export default function HospitalDetailPage({ params }: PageProps) {
    const hospitalId = parseInt(params.id, 10);

    // If the ID from the URL is not a valid number, show a 404 page.
    if (isNaN(hospitalId)) {
        notFound();
    }
    
    return <HospitalProfile hospitalId={hospitalId} />;
}
