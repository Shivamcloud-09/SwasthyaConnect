
'use server';
/**
 * @fileOverview Server actions for fetching hospital data from external APIs.
 * - geocodeAddress: Converts an address string into latitude and longitude.
 * - findNearbyHospitals: Finds hospitals near a given set of coordinates.
 */

import type { NearbyHospital } from '@/data/hospitals';
import { 
    GeocodeAddressInputSchema,
    type GeocodeAddressInput,
    GeocodeAddressOutputSchema,
    type GeocodeAddressOutput,
    NearbyHospitalsInputSchema, 
    type NearbyHospitalsInput,
    NearbyHospitalsOutputSchema
} from '@/data/hospitals';


const NOMINATIM_API_URL = 'https://nominatim.openstreetmap.org/search';

/**
 * Converts an address string into latitude and longitude using the OpenStreetMap Nominatim API.
 */
export async function geocodeAddress(address: GeocodeAddressInput): Promise<GeocodeAddressOutput> {
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
    
    if (!response.ok) {
        throw new Error(`Geocoding API request failed with status: ${response.status}`);
    }

    const data = await response.json();

    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new Error(`Could not find coordinates for the address: ${address}`);
    }
    
    const result = data[0];

    // Add robust checking for required fields
    if (!result || typeof result.lat === 'undefined' || typeof result.lon === 'undefined' || typeof result.display_name === 'undefined') {
        throw new Error('Incomplete location data received from geocoding service.');
    }

    // Validate the output before returning
    const parsedResult = GeocodeAddressOutputSchema.parse({
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        displayName: result.display_name,
    });
    
    return parsedResult;

  } catch (error) {
    console.error('Failed to fetch from Nominatim API for geocoding:', error);
    if (error instanceof Error) {
        throw new Error(`Geocoding service failed: ${error.message}`);
    }
    throw new Error('An unknown geocoding error occurred.');
  }
}

/**
 * Fetches nearby hospitals from the OpenStreetMap Nominatim API.
 */
export async function findNearbyHospitals({ lat, lng }: NearbyHospitalsInput): Promise<NearbyHospital[]> {
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
    
    if (!response.ok) {
      const errorData = await response.text();
      const errorMessage = `API returned status: ${response.status}. Response: ${errorData}`;
      console.error('Nominatim API error:', errorMessage);
      throw new Error(`Nominatim API Error: ${errorMessage}`);
    }
    
    const data = await response.json();

    if (!Array.isArray(data)) {
        throw new Error('Invalid data format received from Nominatim API.');
    }
    
    // Map the OSM response to our existing `NearbyHospital` type with robust checks.
    const hospitals: NearbyHospital[] = data
      .map((place: any): NearbyHospital | null => {
        if (!place || !place.osm_id || !place.display_name || !place.lat || !place.lon) {
          return null;
        }

        const name = typeof place.display_name === 'string' ? place.display_name.split(',')[0] : 'Unnamed Location';
        
        return {
          place_id: `${place.osm_type || 'node'}${place.osm_id}`,
          name,
          address: place.display_name,
          location: {
            lat: parseFloat(place.lat),
            lng: parseFloat(place.lon),
          },
          rating: undefined,
          user_ratings_total: undefined,
        };
      })
      .filter((h): h is NearbyHospital => h !== null && !!h.name);

    return NearbyHospitalsOutputSchema.parse(hospitals);
  } catch (error) {
    console.error('Failed to fetch from Nominatim API:', error);
    if (error instanceof Error) {
        throw new Error(`Failed to fetch nearby hospitals: ${error.message}`);
    }
    throw new Error('An unknown error occurred while fetching nearby hospitals.');
  }
}
