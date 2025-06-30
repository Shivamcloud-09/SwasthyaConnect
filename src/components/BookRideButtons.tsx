
"use client";

import { Button } from '@/components/ui/button';
import { Car, Bike, Map } from 'lucide-react';

type BookRideButtonsProps = {
  location: {
    lat: number;
    lng: number;
  };
};

const UberIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M7.29.116 2.451 15.98h2.384l1.63-4.997h4.032l1.63 4.997h2.384L9.71.116h-2.42zm.843 2.54h.732l2.262 7.042H5.87L8.133 2.656z"/></svg>
);

const RapidoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256"><path d="M233.75,86.41,194.2,43.05a16,16,0,0,0-23.44,1.86l-18.18,29.35A64.12,64.12,0,0,0,128,64a63.3,63.3,0,0,0-28.81,6.81L86.87,40.1A16,16,0,0,0,64,32H40a16,16,0,0,0-16,16V96a16,16,0,0,0,16,16H64a16,16,0,0,0,13.23-7.14l8.63-13.8a64,64,0,0,0,3.33,70.53l-9.52,15.23A16,16,0,0,0,88,208h24.3a16,16,0,0,0,14.07-8.79l15.15-32.8C152,172.08,162.77,176,176,176a56,56,0,0,0,51.87-83.16ZM176,160a40,40,0,1,1,40-40A40,40,0,0,1,176,160Z"/></svg>
);


export default function BookRideButtons({ location }: BookRideButtonsProps) {
  const { lat, lng } = location;
  const uberUrl = `https://m.uber.com/ul/?action=setPickup&dropoff[latitude]=${lat}&dropoff[longitude]=${lng}&pickup=my_location`;
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  const rapidoUrl = `https://www.google.com/search?q=Rapido+bike+taxi`; // Fallback as no universal link exists

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
      <Button asChild variant="outline">
        <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
          <Map className="mr-2 h-4 w-4" /> Directions
        </a>
      </Button>
      <Button asChild className="bg-black text-white hover:bg-gray-800">
        <a href={uberUrl} target="_blank" rel="noopener noreferrer">
          <UberIcon /> <span className="ml-2">Book Uber</span>
        </a>
      </Button>
      <Button asChild className="bg-yellow-400 text-black hover:bg-yellow-500">
        <a href={rapidoUrl} target="_blank" rel="noopener noreferrer">
           <RapidoIcon /> <span className="ml-2">Book Rapido</span>
        </a>
      </Button>
    </div>
  );
}
