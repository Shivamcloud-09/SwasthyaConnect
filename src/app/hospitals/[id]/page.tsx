
import HospitalProfile from '@/components/HospitalProfile';
import { notFound } from 'next/navigation';

export default function HospitalDetailPage({ params }: { params: { id: string } }) {
  // Revert to parsing ID as an integer for static data lookup
  const hospitalId = parseInt(params?.id, 10);

  if (isNaN(hospitalId)) {
    notFound();
  }

  return <HospitalProfile hospitalId={hospitalId} />;
}
