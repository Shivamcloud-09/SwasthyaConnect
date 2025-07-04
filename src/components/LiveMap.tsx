"use client";

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useToast } from '@/hooks/use-toast';

// Fix for default icon issue with webpack
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

export default function LiveMap() {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<L.Map | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        if (!mapRef.current) return;

        // This static assignment is a workaround for a common issue with Leaflet and bundlers like Webpack.
        // @ts-ignore
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: iconRetinaUrl.src,
            iconUrl: iconUrl.src,
            shadowUrl: shadowUrl.src,
        });

        if (!navigator.geolocation) {
            toast({ variant: 'destructive', title: 'Location Error', description: 'Geolocation is not supported by your browser.' });
            return;
        }

        if (mapInstance.current) {
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                if (mapRef.current && !mapInstance.current) {
                    const map = L.map(mapRef.current).setView([latitude, longitude], 15);
                    mapInstance.current = map;

                    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                    }).addTo(map);

                    L.marker([latitude, longitude]).addTo(map).bindPopup("You are here.").openPopup();
                }
            },
            () => {
                toast({ variant: 'destructive', title: 'Location Error', description: 'Could not get your location. Please enable location services.' });
            }
        );

        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, [toast]);

    return <div ref={mapRef} id="map" className="w-full h-96" />;
}
