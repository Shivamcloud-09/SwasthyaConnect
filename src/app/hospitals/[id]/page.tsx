import HospitalProfile from '@/components/HospitalProfile';
import { notFound } from 'next/navigation';

type PageProps = {
  params: {
    id: string;
  };
};

// ✅ Make function `async` to ensure compatibility with future dynamic data fetching
export default async function HospitalDetailPage({ params }: PageProps) {
  const hospitalId = parseInt(params.id, 10);

  // ✅ Must return `notFound()` to avoid error
  if (isNaN(hospitalId)) {
    return notFound();
  }

  return <HospitalProfile hospitalId={hospitalId} />;
}
