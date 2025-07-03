
'use client';

import HospitalProfile from '@/components/HospitalProfile';
import { notFound } from 'next/navigation';

// The ID from the URL will now be the Firestore document ID (a string)
export default function HospitalDetailPage({ params }: { params: { id: string } }) {
  if (!params.id) {
    notFound();
  }

  return <HospitalProfile hospitalId={params.id} />;
}
