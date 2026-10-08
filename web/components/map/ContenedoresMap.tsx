'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Contenedor } from '@/lib/types';

// Fix para iconos por defecto de Leaflet en Next.js
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}

interface ContenedoresMapProps {
  contenedores: Contenedor[];
  selectedContenedor: Contenedor | null;
  onSelectContenedor: (c: Contenedor) => void;
}

// Subcomponente para animar y centrar el mapa cuando se selecciona un contenedor
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

// Icono personalizado con indicador de llenado
function createContenedorIcon(nivel: number, activo: boolean, isSelected: boolean) {
  let colorBg = '#10b981'; // verde (< 60%)
  let borderColor = '#047857';

  if (!activo) {
    colorBg = '#94a3b8'; // gris
    borderColor = '#475569';
  } else if (nivel >= 80) {
    colorBg = '#ef4444'; // rojo crítico (>= 80%)
    borderColor = '#b91c1c';
  } else if (nivel >= 60) {
    colorBg = '#f59e0b'; // ámbar alerta (60 - 79%)
    borderColor = '#b45309';
  }

  const scale = isSelected ? 'transform: scale(1.3); z-index: 1000;' : '';

  const html = `
    <div style="position: relative; width: 34px; height: 34px; ${scale}">
      ${
        activo && nivel >= 80
          ? `<div style="position: absolute; inset: -4px; border-radius: 9999px; background-color: ${colorBg}; opacity: 0.4;" class="animate-ping"></div>`
          : ''
      }
      <div style="
        width: 32px;
        height: 32px;
        border-radius: 9999px;
        background-color: ${colorBg};
        border: 2.5px solid ${borderColor};
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 11px;
        font-weight: 800;
        box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3);
        cursor: pointer;
      ">
        ${activo ? `${nivel}%` : '✕'}
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-container-pin',
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -18],
  });
}

export default function ContenedoresMap({
  contenedores,
  selectedContenedor,
  onSelectContenedor,
}: ContenedoresMapProps) {
  // Centro de Piura
  const center: [number, number] = [-5.194, -80.632];
  const targetLocation: [number, number] | null = selectedContenedor
    ? [selectedContenedor.lat, selectedContenedor.lng]
    : null;

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
        {/* OpenStreetMap estándar: 100% libre, sin requerir API key ni registrar dominio */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        <MapFlyTo target={targetLocation} />

        {contenedores.map((c) => {
          const isSelected = selectedContenedor?.id === c.id;
          const icon = createContenedorIcon(c.nivel_llenado, c.activo, isSelected);

          return (
            <Marker
              key={c.id}
              position={[c.lat, c.lng]}
              icon={icon}
              eventHandlers={{
                click: () => onSelectContenedor(c),
              }}
            >
              <Popup>
                <div className="p-3 min-w-[210px] text-slate-800">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                    <span className="font-bold text-slate-900 text-sm">{c.codigo}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        c.activo
                          ? c.nivel_llenado >= 80
                            ? 'bg-rose-100 text-rose-800'
                            : c.nivel_llenado >= 60
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {c.activo ? `${c.nivel_llenado}% LLENADO` : 'INACTIVO'}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-slate-600 mb-3">
                    <p className="font-medium text-slate-800 leading-snug">{c.direccion}</p>
                    <p className="text-slate-500">
                      Zona: <span className="font-semibold text-slate-700">{c.zona}</span>
                    </p>
                    <p className="text-slate-500">
                      Capacidad: <span className="font-mono font-medium text-slate-700">{c.capacidad_litros} L</span> ({(c.capacidad_litros / 1000).toFixed(1)} m³)
                    </p>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-2">
                    <div
                      className={`h-full rounded-full ${
                        c.nivel_llenado >= 80
                          ? 'bg-rose-500'
                          : c.nivel_llenado >= 60
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${c.nivel_llenado}%` }}
                    />
                  </div>

                  <div className="text-[10px] text-slate-400 text-right">
                    {c.nivel_llenado >= 60 ? '⚠️ Prioridad para plan de hoy' : '✓ Nivel operativo normal'}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
