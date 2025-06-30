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
      // Throw an error that the client can catch and display.
      throw new Error('Server is missing the Google Maps API key.');
    }

    const radius = 50000; // 50km radius, increased for better coverage
    const url = `${PLACES_API_URL}?location=${lat},${lng}&radius=${radius}&keyword=hospital&key=${API_KEY}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      // Check for API errors returned in the JSON body
      if (data.status && !['OK', 'ZERO_RESULTS'].includes(data.status)) {
        const errorMessage = data.error_message || `API returned status: ${data.status}`;
        console.error('Google Places API error:', errorMessage, data);
        throw new Error(`Google Places API Error: ${errorMessage}`);
      }

      // Check for network errors
      if (!response.ok) {
        console.error('Google Places API network error:', response.statusText);
        throw new Error(`Google Places API request failed with status ${response.status}`);
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
      // Re-throw the error so the client-side catch block can handle it
      throw error;
    }
  }
);
