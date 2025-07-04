
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

export async function POST(req: Request) {
  if (!db) {
    return NextResponse.json({ error: 'Firebase is not configured.' }, { status: 500 });
  }

  try {
    const { lat, lng, phone } = await req.json();

    if (lat === undefined || lng === undefined) {
      return NextResponse.json({ error: 'Missing latitude or longitude.' }, { status: 400 });
    }

    await addDoc(collection(db, 'sos-alerts'), {
      timestamp: serverTimestamp(),
      phone: phone || 'Unknown',
      location: { lat, lng },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e) {
    console.error('SOS API Error:', e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return NextResponse.json({ error: 'Failed to store SOS alert.', details: errorMessage }, { status: 500 });
  }
}
