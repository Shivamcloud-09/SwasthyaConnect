
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
    
    const data = await response.json();

    if (!response.ok || !data || data.length === 0) {
      throw new Error(`Could not find coordinates for the address: ${address}`);
    }
    
    const result = data[0];

    // Validate the output before returning
    const parsedResult = GeocodeAddressOutputSchema.parse({
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        displayName: result.display_name,
    });
    
    return parsedResult;

  } catch (error) {
    console.error('Failed to fetch from Nominatim API for geocoding:', error);
    throw new Error('Geocoding service failed.');
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
    
    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.error?.message || `API returned status: ${response.status}`;
      console.error('Nominatim API error:', errorMessage, data);
      throw new Error(`Nominatim API Error: ${errorMessage}`);
    }
    
    // Map the OSM response to our existing `NearbyHospital` type.
    const hospitals = (data || []).map((place: any): NearbyHospital => ({
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

    return NearbyHospitalsOutputSchema.parse(hospitals);
  } catch (error) {
    console.error('Failed to fetch from Nominatim API:', error);
    throw new Error('Failed to fetch nearby hospitals.');
  }
}
