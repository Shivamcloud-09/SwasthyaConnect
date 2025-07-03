
import { z } from 'zod';

// Schemas for geocoding an address string
export const GeocodeAddressInputSchema = z.string().describe('An address, city, or place name to search for.');
export type GeocodeAddressInput = z.infer<typeof GeocodeAddressInputSchema>;

export const GeocodeAddressOutputSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  displayName: z.string(),
});
export type GeocodeAddressOutput = z.infer<typeof GeocodeAddressOutputSchema>;

export const NearbyHospitalsInputSchema = z.object({
  lat: z.number().describe('Latitude of the user location.'),
  lng: z.number().describe('Longitude of the user location.'),
});
export type NearbyHospitalsInput = z.infer<typeof NearbyHospitalsInputSchema>;

export type Doctor = {
  name: string;
  specialization: string;
  availability: string;
};

export type Hospital = {
  id: number;
  firestoreId?: string; // Document ID from Firestore
  adminUid?: string; // UID of the admin user from Firebase Auth
  name: string;
  address: string;
  imageUrl: string;
  location: {
    lat: number;
    lng: number;
  };
  timings: string;
  contact: string;
  services: string[];
  specialties: string[];
  beds: {
    icu: {
      total: number;
      available: number;
    };
    general: {
      total: number;
      available: number;
    };
  };
  oxygen: {
    available: boolean;
    lastChecked: string;
  };
  medicines: string[];
  doctors: Doctor[];
  hygiene: {
    rating: number; // out of 5
    lastSanitized: string;
  };
  license: string;
};

export type NearbyHospital = {
  place_id: string;
  name: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  rating?: number;
  user_ratings_total?: number;
};

// Zod schema for NearbyHospital, for use in Genkit flows
export const NearbyHospitalSchema = z.object({
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
export const NearbyHospitalsOutputSchema = z.array(NearbyHospitalSchema);


export const hospitals: Hospital[] = [
  {
    id: 1,
    name: "City General Hospital",
    address: "123 Main St, Anytown, USA",
    imageUrl: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?q=80&w=600&h=400&auto=format&fit=crop",
    location: { lat: 28.6139, lng: 77.2090 }, // Delhi for example
    timings: "Open 24/7",
    contact: "555-123-4567",
    services: ["Emergency Room", "X-Ray", "Pharmacy", "Laboratory"],
    specialties: ["Cardiology", "Neurology", "Orthopedics"],
    beds: {
      general: { total: 200, available: 150 },
      icu: { total: 40, available: 10 },
    },
    oxygen: { available: true, lastChecked: "Today at 2:00 PM" },
    medicines: ["Aspirin", "Ibuprofen", "Paracetamol", "Amoxicillin"],
    doctors: [
      { name: "Dr. John Doe", specialization: "Cardiology", availability: "Mon-Fri, 9am-5pm" },
      { name: "Dr. Jane Smith", specialization: "Neurology", availability: "On Call" },
    ],
    hygiene: { rating: 4.8, lastSanitized: "Today at 1:00 PM" },
    license: "LIC-12345-XYZ",
  },
  {
    id: 2,
    name: "Suburban Community Clinic",
    address: "456 Oak Ave, Suburbia, USA",
    imageUrl: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?q=80&w=600&h=400&auto=format&fit=crop",
    location: { lat: 28.5355, lng: 77.3910 }, // Noida for example
    timings: "8am - 10pm Daily",
    contact: "555-987-6543",
    services: ["General Check-ups", "Vaccinations", "Pharmacy"],
    specialties: ["Pediatrics", "Family Medicine"],
    beds: {
      general: { total: 50, available: 35 },
      icu: { total: 5, available: 2 },
    },
    oxygen: { available: true, lastChecked: "Today at 11:00 AM" },
    medicines: ["Paracetamol", "Antacids", "Band-Aids"],
    doctors: [
      { name: "Dr. Emily White", specialization: "Pediatrics", availability: "Mon-Sat, 8am-6pm" },
      { name: "Dr. Michael Green", specialization: "Family Medicine", availability: "Mon, Wed, Fri" },
    ],
    hygiene: { rating: 4.5, lastSanitized: "Today at 12:00 PM" },
    license: "LIC-67890-ABC",
  },
   {
    id: 3,
    name: "Hope Medical Center",
    address: "789 Pine Ln, Metro City, USA",
    imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=600&h=400&auto=format&fit=crop",
    location: { lat: 19.0760, lng: 72.8777 }, // Mumbai for example
    timings: "Open 24/7",
    contact: "555-234-5678",
    services: ["Oncology", "Radiology", "Surgical Services"],
    specialties: ["Cancer Treatment", "Diagnostic Imaging"],
    beds: {
      general: { total: 300, available: 210 },
      icu: { total: 60, available: 15 },
    },
    oxygen: { available: false, lastChecked: "Today at 9:00 AM" },
    medicines: ["Chemotherapy Drugs", "Pain Relievers", "Antibiotics"],
    doctors: [
        { name: "Dr. Robert Brown", specialization: "Oncology", availability: "By Appointment" },
        { name: "Dr. Sarah Davis", specialization: "Radiology", availability: "Mon-Fri, 8am-4pm" },
    ],
    hygiene: { rating: 4.9, lastSanitized: "Today at 3:00 PM" },
    license: "LIC-54321-DEF",
  },
   {
    id: 4,
    name: "Riverside Recovery Institute",
    address: "101 River Rd, Greenfield, USA",
    imageUrl: "https://images.unsplash.com/photo-1626302592078-2054e0da1902?q=80&w=600&h=400&auto=format&fit=crop",
    location: { lat: 12.9716, lng: 77.5946 }, // Bengaluru for example
    timings: "9am - 6pm Weekdays",
    contact: "555-876-5432",
    services: ["Physical Therapy", "Rehabilitation", "Mental Health Support"],
    specialties: ["Sports Injury", "Post-operative Care"],
    beds: {
      general: { total: 100, available: 80 },
      icu: { total: 0, available: 0 },
    },
    oxygen: { available: true, lastChecked: "Yesterday at 5:00 PM" },
    medicines: ["Pain Ointments", "Muscle Relaxants"],
    doctors: [
        { name: "Dr. David Wilson", specialization: "Physical Therapy", availability: "Mon-Fri, 9am-6pm" },
    ],
    hygiene: { rating: 4.3, lastSanitized: "Today at 10:00 AM" },
    license: "LIC-98765-GHI",
  },
];
