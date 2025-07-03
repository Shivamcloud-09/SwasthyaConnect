
import HospitalProfile from '@/components/HospitalProfile';
import { notFound } from 'next/navigation';

export default function HospitalDetailPage({ params }: { params: { id: string } }) {
  // The ID from the URL is now the Firestore document ID (a string).
  // We no longer need to parse it as an integer.
  const hospitalId = params?.id;

  if (!hospitalId) {
    notFound();
  }

  return <HospitalProfile hospitalId={hospitalId} />;
}
