'use client';

import React from 'react';
import { Polyline, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Ruta, Sitio, Contenedor } from '@/lib/types';
import { SITIOS_MOCK, CONTENEDORES_MOCK } from '@/lib/mockData';

interface RutasLayerProps {
  rutas: Ruta[];
  sitios?: Sitio[];
  activeVehiculoId?: string | null;
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
      box-shadow: 0 4px 8px rgba(0,0,0,0.3);
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
    iconSize: [80, 24],
    iconAnchor: [40, 12],
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
      box-shadow: 0 2px 5px rgba(0,0,0,0.25);
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

export default function RutasLayer({
  rutas,
  sitios = SITIOS_MOCK,
  activeVehiculoId,
}: RutasLayerProps) {
  // Mapa de contenedores para buscar coordenadas de paradas de secuencia
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
    <>
      {/* Sitios Especiales: Cochera y Botadero */}
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

        // GeoJSON coordinates son [lng, lat] -> Leaflet necesita [lat, lng]
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

            {/* Paradas intermedias numeradas si la ruta está activa o visible */}
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
                          Llenado: {c.nivel_llenado}% (Recolección asignada a {ruta.vehiculo_id})
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
          </React.Fragment>
        );
      })}
    </>
  );
}
