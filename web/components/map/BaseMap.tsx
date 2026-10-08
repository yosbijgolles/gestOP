'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface BaseMapProps {
  children?: React.ReactNode;
  center?: [number, number];
  zoom?: number;
  className?: string;
  selectedLocation?: [number, number] | null;
}

// Subcomponente para mover suavemente el mapa cuando se selecciona un punto
function MapFlyTo({ target }: { target: [number, number] | null }) {
  const map = useMap();

  useEffect(() => {
    if (target) {
      map.flyTo(target, 16, {
        duration: 1.2,
      });
    }
  }, [target, map]);

  return null;
}

export default function BaseMap({
  children,
  center = [-5.194, -80.632], // Centro de Piura
  zoom = 13,
  className = 'h-full w-full',
  selectedLocation = null,
}: BaseMapProps) {
  return (
    <div className={`relative h-full w-full overflow-hidden rounded-xl border border-slate-200 shadow-sm ${className}`}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="h-full w-full"
        attributionControl={true}
      >
        {/* Capa de Mapa: CartoDB Voyager con API Key o fallback a OpenStreetMap */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url={
            process.env.NEXT_PUBLIC_CARTO_API_KEY
              ? `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?api_key=${process.env.NEXT_PUBLIC_CARTO_API_KEY}`
              : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          }
        />

        {selectedLocation && <MapFlyTo target={selectedLocation} />}

        {children}
      </MapContainer>
    </div>
  );
}
