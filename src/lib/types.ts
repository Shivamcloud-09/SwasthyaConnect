
export type Doctor = {
  name: string;
  specialization: string;
  availability: string;
};

export type Hospital = {
  id: number;
  name: string;
  address: string;
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
