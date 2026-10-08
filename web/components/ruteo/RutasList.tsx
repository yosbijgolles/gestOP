'use client';

import React, { useState } from 'react';
import { Ruta, Vehiculo, Contenedor } from '@/lib/types';
import { CONTENEDORES_MOCK, VEHICULOS_MOCK } from '@/lib/mockData';
import { Truck, ChevronDown, ChevronUp, MapPin, Gauge, Eye, Route } from 'lucide-react';

interface RutasListProps {
  rutas: Ruta[];
  activeVehiculoId: string | null;
  onSelectVehiculo: (vehiculoId: string | null) => void;
}

const VEHICLE_COLORS = ['#0284c7', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export default function RutasList({
  rutas,
  activeVehiculoId,
  onSelectVehiculo,
}: RutasListProps) {
  const [expandedRutaId, setExpandedRutaId] = useState<string | null>(null);

  // Mapas auxiliares para nombres y detalles
  const vehiculosMap = new Map<string, Vehiculo>();
  VEHICULOS_MOCK.forEach((v) => vehiculosMap.set(v.id, v));

  const contenedoresMap = new Map<string, Contenedor>();
  CONTENEDORES_MOCK.forEach((c) => contenedoresMap.set(c.id, c));

  const toggleExpand = (rutaId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedRutaId(expandedRutaId === rutaId ? null : rutaId);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Route className="w-3.5 h-3.5 text-slate-500" />
          Rutas Asignadas ({rutas.length} Camiones)
        </h3>
        {activeVehiculoId && (
          <button
            onClick={() => onSelectVehiculo(null)}
            className="text-[11px] text-emerald-600 font-semibold hover:underline"
          >
            Ver todas en mapa
          </button>
        )}
      </div>

      <div className="space-y-2.5">
        {rutas.map((ruta, idx) => {
          const color = VEHICLE_COLORS[idx % VEHICLE_COLORS.length];
          const vehiculo = vehiculosMap.get(ruta.vehiculo_id);
          const isSelected = activeVehiculoId === ruta.vehiculo_id;
          const isExpanded = expandedRutaId === ruta.id;
          const capacidad = vehiculo?.capacidad_m3 || 12;
          const pctLlenadoTolva = Math.min(100, Math.round((ruta.carga_total / capacidad) * 100));

          return (
            <div
              key={ruta.id || `ruta-${idx}`}
              onClick={() => onSelectVehiculo(isSelected ? null : ruta.vehiculo_id)}
              className={`rounded-xl border transition-all duration-200 bg-white overflow-hidden cursor-pointer shadow-sm ${
                isSelected
                  ? 'border-2 shadow-md ring-2 ring-emerald-500/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
              style={{
                borderColor: isSelected ? color : undefined,
              }}
            >
              {/* Encabezado de la Tarjeta */}
              <div className="p-3.5 flex items-center justify-between">
                <div className="flex items-center space-x-3 min-w-0">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0 shadow-sm"
                    style={{ backgroundColor: color }}
                  >
                    <Truck className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-sm text-slate-900 font-mono">
                        {vehiculo?.placa || ruta.vehiculo_id.toUpperCase()}
                      </span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 font-medium px-1.5 py-0.5 rounded">
                        Ruta #{idx + 1}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 truncate block">
                      Cond: {vehiculo?.conductor || 'Asignado'}
                    </span>
                  </div>
                </div>

                {/* Acciones de expandir */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => toggleExpand(ruta.id, e)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                    title={isExpanded ? 'Contraer paradas' : 'Ver secuencia de paradas'}
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Estadísticas de la ruta */}
              <div className="px-3.5 pb-3 pt-1 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-slate-50 p-1.5 rounded-lg">
                  <span className="text-[10px] text-slate-400 block">Distancia</span>
                  <span className="font-bold text-slate-800 font-mono">
                    {(ruta.distancia_m / 1000).toFixed(1)} km
                  </span>
                </div>
                <div className="bg-slate-50 p-1.5 rounded-lg">
                  <span className="text-[10px] text-slate-400 block">Tolva Usada</span>
                  <span className="font-bold text-slate-800 font-mono">
                    {ruta.carga_total} m³ <span className="text-[10px] text-slate-400">({pctLlenadoTolva}%)</span>
                  </span>
                </div>
                <div className="bg-slate-50 p-1.5 rounded-lg">
                  <span className="text-[10px] text-slate-400 block">Paradas</span>
                  <span className="font-bold text-emerald-700 font-mono">
                    {ruta.secuencia?.length || 0} ptos.
                  </span>
                </div>
              </div>

              {/* Barra de capacidad de tolva */}
              <div className="px-3.5 pb-3">
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${pctLlenadoTolva}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
              </div>

              {/* Desglose de Secuencia de Paradas (Acordeón) */}
              {isExpanded && (
                <div className="bg-slate-50/90 p-3 border-t border-slate-200/80 text-xs space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Secuencia Logística:
                  </span>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    <div className="flex items-center text-slate-600 gap-2 text-[11px] font-medium">
                      <span className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[9px] font-bold">
                        S
                      </span>
                      <span>Salida: Cochera Maestranza</span>
                    </div>

                    {ruta.secuencia?.map((contId, sIdx) => {
                      const c = contenedoresMap.get(contId);
                      return (
                        <div
                          key={`stop-${contId}`}
                          className="flex items-center justify-between text-slate-700 text-[11px] bg-white p-1.5 rounded border border-slate-200"
                        >
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span
                              className="w-4 h-4 rounded-full text-white flex items-center justify-center text-[9px] font-black flex-shrink-0"
                              style={{ backgroundColor: color }}
                            >
                              {sIdx + 1}
                            </span>
                            <span className="font-bold text-slate-800">{c?.codigo || contId}</span>
                            <span className="text-slate-400 truncate text-[10px]">{c?.direccion}</span>
                          </div>
                          <span className="text-[10px] font-semibold text-emerald-700 flex-shrink-0 ml-2">
                            {c ? `${c.nivel_llenado}%` : ''}
                          </span>
                        </div>
                      );
                    })}

                    <div className="flex items-center text-slate-600 gap-2 text-[11px] font-medium">
                      <span className="w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[9px] font-bold">
                        F
                      </span>
                      <span>Descarga: Relleno Sanitario</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
