import HospitalProfile from '@/components/HospitalProfile';
import { notFound } from 'next/navigation';

export default async function HospitalDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const hospitalId = parseInt(params.id, 10);

  if (isNaN(hospitalId)) {
    notFound();
  }

  return <HospitalProfile hospitalId={hospitalId} />;
}
