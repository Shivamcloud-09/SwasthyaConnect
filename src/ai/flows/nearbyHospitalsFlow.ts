'use server';
/**
 * @fileOverview A flow to find nearby hospitals using Google Places API (New).
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

// IMPORTANT: You must have a .env file in the root of your project
// with your Google Maps API key like this:
// GOOGLE_MAPS_API_KEY='YOUR_API_KEY_HERE'
// Make sure the "Places API" is enabled for this key in your Google Cloud console.
const API_KEY = process.env.GOOGLE_MAPS_API_KEY;
// Using the new Places API endpoint
const PLACES_API_URL = 'https://places.googleapis.com/v1/places:searchNearby';

export const findNearbyHospitals = ai.defineFlow(
  {
    name: 'findNearbyHospitalsFlow',
    inputSchema: NearbyHospitalsInputSchema,
    outputSchema: NearbyHospitalsOutputSchema,
  },
  async ({ lat, lng }) => {
    if (!API_KEY) {
      throw new Error('Server is missing the Google Maps API key.');
    }

    const radius = 50000; // 50km radius
    const requestBody = {
      includedTypes: ["hospital"],
      maxResultCount: 20, // Max is 20 for the new API
      locationRestriction: {
        circle: {
          center: {
            latitude: lat,
            longitude: lng,
          },
          radius: radius,
        },
      },
    };

    try {
      const response = await fetch(PLACES_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': API_KEY,
          // Specify fields to return to avoid unnecessary data and charges
          'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        // The new API returns error details in the 'error' object
        const errorMessage = data.error?.message || `API returned status: ${response.status}`;
        console.error('Google Places API error:', errorMessage, data);
        throw new Error(`Google Places API Error: ${errorMessage}`);
      }
      
      const hospitals = (data.places || []).map((place: any) => ({
        place_id: place.id,
        name: place.displayName?.text || 'Name not available',
        address: place.formattedAddress || 'Address not available',
        location: {
          lat: place.location.latitude,
          lng: place.location.longitude,
        },
        rating: place.rating,
        user_ratings_total: place.userRatingCount,
      }));

      return hospitals;
    } catch (error) {
      console.error('Failed to fetch from Google Places API:', error);
      // Re-throw the error so the client-side catch block can handle it
      throw error;
    }
  }
);
