'use server';
/**
 * @fileOverview A flow to find nearby hospitals using OpenStreetMap Nominatim.
 * - findNearbyHospitals - A function that fetches hospitals from OSM.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Only define and export the flow if the GOOGLE_API_KEY is available.
// This prevents server crashes when the environment is not fully configured.
if (process.env.GOOGLE_API_KEY) {
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

  // Using OpenStreetMap Nominatim API
  const NOMINATIM_API_URL = 'https://nominatim.openstreetmap.org/search';

  exports.findNearbyHospitals = ai.defineFlow(
    {
      name: 'findNearbyHospitalsFlow',
      inputSchema: NearbyHospitalsInputSchema,
      outputSchema: NearbyHospitalsOutputSchema,
    },
    async ({ lat, lng }) => {
      // This creates a ~20km search box around the user.
      const viewBox = `${lng - 0.1},${lat + 0.1},${lng + 0.1},${lat - 0.1}`;

      const searchParams = new URLSearchParams({
          q: 'hospital',
          format: 'jsonv2',
          addressdetails: '1',
          limit: '20',
          viewbox: viewBox,
          bounded: '1',
      });
      
      const url = `${NOMINATIM_API_URL}?${searchParams.toString()}`;

      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            // Nominatim requires a user-agent for its usage policy
            'User-Agent': 'SwasthyaConnect/1.0 (Development Project)'
          },
        });
        
        const data = await response.json();

        if (!response.ok) {
          const errorMessage = data.error?.message || `API returned status: ${response.status}`;
          console.error('Nominatim API error:', errorMessage, data);
          throw new Error(`Nominatim API Error: ${errorMessage}`);
        }
        
        // Map the OSM response to our existing `NearbyHospital` type.
        const hospitals = (data || []).map((place: any) => ({
          place_id: place.osm_type + place.osm_id.toString(), // create a unique string ID
          name: place.display_name.split(',')[0], // Extract the primary name from the display_name
          address: place.display_name,
          location: {
            lat: parseFloat(place.lat),
            lng: parseFloat(place.lon),
          },
          // OSM does not provide ratings, so these fields will be undefined
          rating: undefined,
          user_ratings_total: undefined,
        })).filter((h:any) => h.name); // Ensure we have a name

        return hospitals;
      } catch (error) {
        console.error('Failed to fetch from Nominatim API:', error);
        // Re-throw the error so the client-side catch block can handle it
        throw error;
      }
    }
  );
}
