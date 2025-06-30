'use server';
/**
 * @fileOverview A flow to find nearby hospitals using Google Places API.
 * - findNearbyHospitals - A function that fetches hospitals from Google Places.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const NearbyHospitalsInputSchema = z.object({
  lat: z.number().describe('Latitude of the user location.'),
  lng: z.number().describe('Longitude of the user location.'),
});

const NearbyHospitalSchema = z.object({
  place_id: z.string(),
  name: z.string(),
  address: z.string(),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  rating: z.number().optional(),
  user_ratings_total: z.number().optional(),
});

const NearbyHospitalsOutputSchema = z.array(NearbyHospitalSchema);

// IMPORTANT: You must create a .env.local file in the root of your project
// and add your Google Maps API key like this:
// GOOGLE_MAPS_API_KEY='YOUR_API_KEY_HERE'
// Make sure the "Places API" is enabled for this key in your Google Cloud console.
const API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const PLACES_API_URL = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';

export const findNearbyHospitals = ai.defineFlow(
  {
    name: 'findNearbyHospitalsFlow',
    inputSchema: NearbyHospitalsInputSchema,
    outputSchema: NearbyHospitalsOutputSchema,
  },
  async ({ lat, lng }) => {
    if (!API_KEY) {
      console.error('GOOGLE_MAPS_API_KEY is not set in .env.local');
      // Return an empty array or throw an error if the key is missing.
      return [];
    }

    const radius = 25000; // 25km radius
    const url = `${PLACES_API_URL}?location=${lat},${lng}&radius=${radius}&type=hospital&key=${API_KEY}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Google Places API error:', errorData);
        throw new Error(`Google Places API request failed with status ${response.status}`);
      }
      const data = await response.json();

      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        console.error('Google Places API returned status:', data.status, data.error_message);
        throw new Error(`Google Places API returned status: ${data.status}`);
      }

      const hospitals = (data.results || []).map((place: any) => ({
        place_id: place.place_id,
        name: place.name,
        address: place.vicinity,
        location: {
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng,
        },
        rating: place.rating,
        user_ratings_total: place.user_ratings_total,
      }));

      return hospitals;
    } catch (error) {
      console.error('Failed to fetch from Google Places API:', error);
      return [];
    }
  }
);
