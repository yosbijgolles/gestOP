'use client';

import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Contenedor } from '@/lib/types';

interface ContenedoresLayerProps {
  contenedores: Contenedor[];
  onSelect?: (contenedor: Contenedor) => void;
  selectedId?: string | null;
}

// Generador de Icono personalizado con SVG y badges de nivel de llenado
function createContenedorIcon(nivel: number, activo: boolean, isSelected: boolean) {
  let colorBg = '#10b981'; // verde
  let borderColor = '#047857';

  if (!activo) {
    colorBg = '#94a3b8'; // gris
    borderColor = '#475569';
  } else if (nivel >= 80) {
    colorBg = '#ef4444'; // rojo crítico
    borderColor = '#b91c1c';
  } else if (nivel >= 60) {
    colorBg = '#f59e0b'; // naranja advertencia
    borderColor = '#b45309';
  }

  const pulseClass = activo && nivel >= 80 ? 'animate-ping opacity-40' : '';
  const scale = isSelected ? 'transform: scale(1.35); z-index: 999;' : '';

  const html = `
    <div style="position: relative; width: 32px; height: 32px; ${scale}">
      ${
        activo && nivel >= 80
          ? `<div style="position: absolute; inset: -4px; border-radius: 9999px; background-color: ${colorBg}; opacity: 0.45;" class="animate-ping"></div>`
          : ''
      }
      <div style="
        width: 30px;
        height: 30px;
        border-radius: 9999px;
        background-color: ${colorBg};
        border: 2.5px solid ${borderColor};
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 11px;
        font-weight: 800;
        box-shadow: 0 4px 6px -1px rgba(0,0,0,0.25);
        cursor: pointer;
      ">
        ${activo ? `${nivel}%` : '✕'}
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-container-pin',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  });
}

export default function ContenedoresLayer({
  contenedores,
  onSelect,
  selectedId,
}: ContenedoresLayerProps) {
  return (
    <>
      {contenedores.map((c) => {
        const isSelected = selectedId === c.id;
        const icon = createContenedorIcon(c.nivel_llenado, c.activo, isSelected);

        return (
          <Marker
            key={c.id}
            position={[c.lat, c.lng]}
            icon={icon}
            eventHandlers={{
              click: () => onSelect?.(c),
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
                  <p className="text-slate-500">Zona: <span className="font-semibold text-slate-700">{c.zona}</span></p>
                  <p className="text-slate-500">Capacidad: <span className="font-mono font-medium text-slate-700">{c.capacidad_litros} L</span> ({(c.capacidad_litros / 1000).toFixed(1)} m³)</p>
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
                  {c.nivel_llenado >= 60 ? '⚠️ Prioridad de recolección hoy' : '✓ Nivel operativo normal'}
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}
