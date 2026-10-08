'use client';

import React from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Ruta, Sitio, Contenedor } from '@/lib/types';
import { SITIOS_MOCK, CONTENEDORES_MOCK } from '@/lib/mockData';

// Fix para iconos por defecto de Leaflet en Next.js
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}

interface RutasMapProps {
  rutas: Ruta[];
  sitios?: Sitio[];
  activeVehiculoId: string | null;
}

const VEHICLE_COLORS = ['#0284c7', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

// Marcador especial para Cochera y Botadero
function createSpecialMarkerIcon(tipo: 'cochera' | 'botadero') {
  const isCochera = tipo === 'cochera';
  const color = isCochera ? '#0284c7' : '#e11d48';
  const label = isCochera ? '🏢 COCHERA' : '♻️ BOTADERO';

  const html = `
    <div style="
      background-color: ${color};
      color: white;
      font-size: 10px;
      font-weight: 800;
      padding: 4px 8px;
      border-radius: 9999px;
      border: 2px solid white;
      box-shadow: 0 4px 8px rgba(0,0,0,0.35);
      white-space: nowrap;
      display: flex;
      align-items: center;
      gap: 4px;
      transform: translate(-50%, -50%);
    ">
      ${label}
    </div>
  `;

  return L.divIcon({
    html,
    className: 'special-site-pin',
    iconSize: [84, 24],
    iconAnchor: [42, 12],
  });
}

// Marcador para paradas intermedias numeradas
function createStopMarkerIcon(order: number, color: string) {
  const html = `
    <div style="
      width: 22px;
      height: 22px;
      border-radius: 9999px;
      background-color: white;
      border: 3px solid ${color};
      color: ${color};
      font-size: 10px;
      font-weight: 900;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    ">
      ${order}
    </div>
  `;

  return L.divIcon({
    html,
    className: 'stop-pin',
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}

export default function RutasMap({
  rutas,
  sitios = SITIOS_MOCK,
  activeVehiculoId,
}: RutasMapProps) {
  const center: [number, number] = [-5.194, -80.632];

  const containersMap = new Map<string, Contenedor>();
  for (const route of rutas) {
    for (const stop of route.paradas ?? []) {
      if (stop.contenedor) containersMap.set(stop.contenedor_id, stop.contenedor);
    }
  }
  CONTENEDORES_MOCK.forEach((c) => {
    if (!containersMap.has(c.id)) containersMap.set(c.id, c);
  });

  return (
    <div
      className="relative w-full h-full min-h-[500px] overflow-hidden rounded-xl border border-slate-200 shadow-sm bg-slate-100"
      style={{ height: '100%', minHeight: '520px', width: '100%' }}
    >
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={true}
        className="h-full w-full"
        style={{ height: '100%', minHeight: '520px', width: '100%', zIndex: 1 }}
      >
        {/* OpenStreetMap estándar */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* Sitios Oficiales: Cochera y Botadero */}
        {sitios.map((sitio) => (
          <Marker
            key={sitio.id}
            position={[sitio.lat, sitio.lng]}
            icon={createSpecialMarkerIcon(sitio.tipo)}
          >
            <Popup>
              <div className="p-2 text-xs">
                <span className="font-bold text-slate-800 block text-sm">{sitio.nombre}</span>
                <span className="text-slate-500 capitalize">{sitio.tipo} oficial de operaciones</span>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Trazado de Rutas */}
        {rutas.map((ruta, idx) => {
          const color = VEHICLE_COLORS[idx % VEHICLE_COLORS.length];
          const isHighlighted = !activeVehiculoId || activeVehiculoId === ruta.vehiculo_id;
          const opacity = isHighlighted ? 0.95 : 0.25;
          const weight = isHighlighted ? (activeVehiculoId === ruta.vehiculo_id ? 6 : 4) : 2;

          // GeoJSON coordinates son [lng, lat] -> Leaflet usa [lat, lng]
          const polylineCoords: [number, number][] = (ruta.geometria.coordinates || []).map(
            (coord: [number, number]) => [coord[1], coord[0]]
          );

          return (
            <React.Fragment key={ruta.id || `ruta-${idx}`}>
              <Polyline
                positions={polylineCoords}
                pathOptions={{
                  color,
                  weight,
                  opacity,
                  lineCap: 'round',
                  lineJoin: 'round',
                }}
              >
                <Popup>
                  <div className="p-2 text-xs text-slate-800">
                    <div className="font-bold text-sm" style={{ color }}>
                      Vehículo {ruta.vehiculo?.placa ?? ruta.vehiculo_id.toUpperCase()}
                    </div>
                    <div className="mt-1 space-y-0.5 text-slate-600">
                      <p>Distancia: <strong>{(ruta.distancia_m / 1000).toFixed(1)} km</strong></p>
                      <p>Carga total: <strong>{ruta.carga_total} m³</strong></p>
                      <p>Contenedores: <strong>{ruta.secuencia?.length ?? 0} paradas</strong></p>
                    </div>
                  </div>
                </Popup>
              </Polyline>

              {/* Paradas intermedias numeradas */}
              {isHighlighted &&
                ruta.secuencia?.map((contId, stopIdx) => {
                  const c = containersMap.get(contId);
                  if (!c) return null;
                  return (
                    <Marker
                      key={`${ruta.id}-stop-${contId}`}
                      position={[c.lat, c.lng]}
                      icon={createStopMarkerIcon(stopIdx + 1, color)}
                    >
                      <Popup>
                        <div className="p-2 text-xs">
                          <div className="font-bold text-slate-800">
                            Parada #{stopIdx + 1}: {c.codigo}
                          </div>
                          <p className="text-slate-500 mt-0.5">{c.direccion}</p>
                          <p className="text-emerald-700 font-semibold mt-1">
                            Llenado: {c.nivel_llenado}% (Asignado a {ruta.vehiculo_id})
                          </p>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
}
