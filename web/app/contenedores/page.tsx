'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Contenedor } from '@/lib/types';
import { apiService } from '@/lib/api';
import TablaContenedores from '@/components/contenedores/TablaContenedores';
import { Trash2, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';

// Dynamic import para evitar problemas de SSR con Leaflet
const ContenedoresMap = dynamic(() => import('@/components/map/ContenedoresMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full min-h-[500px] w-full rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
      <div className="flex flex-col items-center space-y-2">
        <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
        <span className="text-xs font-medium">Cargando mapa interactivo de Piura...</span>
      </div>
    </div>
  ),
});

export default function ContenedoresPage() {
  const [contenedores, setContenedores] = useState<Contenedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContenedor, setSelectedContenedor] = useState<Contenedor | null>(null);

  // Carga inicial de datos
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await apiService.getContenedores();
      setContenedores(data);
      setLoading(false);
    }
    loadData();
  }, []);

  const handleSelectContenedor = (c: Contenedor) => {
    setSelectedContenedor(c);
  };

  const handleToggleActivo = async (id: string) => {
    const updated = await apiService.toggleContenedorActivo(id);
    setContenedores(updated);
    if (selectedContenedor && selectedContenedor.id === id) {
      setSelectedContenedor(updated.find((c) => c.id === id) || null);
    }
  };

  const prioritariosCount = contenedores.filter((c) => c.activo && c.nivel_llenado >= 60).length;

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Encabezado del Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex-shrink-0">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-emerald-600" />
            Monitoreo de Contenedores Urbanos
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Supervisión en tiempo real de niveles de llenado y estado operativo en el distrito de Piura.
          </p>
        </div>

        {/* Badges de resumen rápido */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-700">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>{prioritariosCount} contenedores requieren vaciado urgente (≥ 60%)</span>
          </div>

          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{contenedores.filter((c) => c.activo).length} Operativos</span>
          </div>
        </div>
      </div>

      {/* Contenido Principal: 2 Columnas (Tabla + Mapa) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">
        {/* Columna Izquierda: Tabla y Filtros (5 cols) */}
        <div className="lg:col-span-5 h-[500px] lg:h-full min-h-0">
          {loading ? (
            <div className="h-full bg-white rounded-xl border border-slate-200 p-6 flex items-center justify-center text-slate-400">
              <div className="flex flex-col items-center gap-2">
                <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
                <span className="text-xs font-medium">Cargando inventario de contenedores...</span>
              </div>
            </div>
          ) : (
            <TablaContenedores
              contenedores={contenedores}
              selectedId={selectedContenedor?.id || null}
              onSelect={handleSelectContenedor}
              onToggleActivo={handleToggleActivo}
            />
          )}
        </div>

        {/* Columna Derecha: Mapa Interactivo (7 cols) */}
        <div className="lg:col-span-7 h-[500px] lg:h-full min-h-[500px]">
          <ContenedoresMap
            contenedores={contenedores}
            selectedContenedor={selectedContenedor}
            onSelectContenedor={handleSelectContenedor}
          />
        </div>
      </div>
    </div>
  );
}
