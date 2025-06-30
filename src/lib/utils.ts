import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Calculates the distance between two geographical points in kilometers.
 * Uses the Haversine formula.
 * @param pos1 - The first position { lat: number, lng: number }.
 * @param pos2 - The second position { lat: number, lng: number }.
 * @returns The distance in kilometers.
 */
export function getDistance(
  pos1: { lat: number; lng: number },
  pos2: { lat: number; lng: number }
): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = ((pos2.lat - pos1.lat) * Math.PI) / 180;
  const dLon = ((pos2.lng - pos1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((pos1.lat * Math.PI) / 180) *
      Math.cos((pos2.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}
