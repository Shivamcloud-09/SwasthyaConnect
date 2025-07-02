'use server';
/**
 * @fileOverview A flow to geocode an address string into latitude and longitude.
 * - geocodeAddress - A function that converts an address to coordinates using OSM Nominatim.
 * - GeocodeAddressInput - The input type for the geocodeAddress function (imported).
 * - GeocodeAddressOutput - The return type for the geocodeAddress function (imported).
 */

import { ai } from '@/ai/genkit';
import { 
    GeocodeAddressInputSchema,
    type GeocodeAddressInput,
    GeocodeAddressOutputSchema,
    type GeocodeAddressOutput
} from '@/data/hospitals';


const NOMINATIM_API_URL = 'https://nominatim.openstreetmap.org/search';

const geocodeAddressFlow = ai.defineFlow(
  {
    name: 'geocodeAddressFlow',
    inputSchema: GeocodeAddressInputSchema,
    outputSchema: GeocodeAddressOutputSchema,
  },
  async (address) => {
    const searchParams = new URLSearchParams({
        q: address,
        format: 'jsonv2',
        limit: '1',
    });
    
    const url = `${NOMINATIM_API_URL}?${searchParams.toString()}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'SwasthyaConnect/1.0 (Development Project)'
        },
      });
      
      const data = await response.json();

      if (!response.ok || !data || data.length === 0) {
        throw new Error(`Could not find coordinates for the address: ${address}`);
      }
      
      const result = data[0];

      return {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
          displayName: result.display_name,
      };

    } catch (error) {
      console.error('Failed to fetch from Nominatim API for geocoding:', error);
      throw error;
    }
  }
);

// Export a wrapper function to be called from the client
export async function geocodeAddress(input: GeocodeAddressInput): Promise<GeocodeAddressOutput> {
  return await geocodeAddressFlow(input);
}
