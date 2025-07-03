import HospitalProfile from '@/components/HospitalProfile';
import { notFound } from 'next/navigation';

export default function HospitalDetailPage({ params }: any) {
  const hospitalId = parseInt(params?.id, 10);

  if (isNaN(hospitalId)) {
    notFound();
  }

  return <HospitalProfile hospitalId={hospitalId} />;
}
