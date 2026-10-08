'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Plan, OptimizeRequest } from '@/lib/types';
import { apiService } from '@/lib/api';
import MetricasBanda from '@/components/ruteo/MetricasBanda';
import RutasList from '@/components/ruteo/RutasList';
import DiferidosList from '@/components/ruteo/DiferidosList';
import { 
  Route, 
  Calendar, 
  Sliders, 
  Sparkles, 
  RefreshCw, 
  AlertCircle,
  Layers,
  MapPin
} from 'lucide-react';

const RutasMap = dynamic(() => import('@/components/map/RutasMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full min-h-[500px] w-full rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
      <div className="flex flex-col items-center space-y-2">
        <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
        <span className="text-xs font-medium">Cargando mapa de rutas de Piura...</span>
      </div>
    </div>
  ),
});

export default function RuteoPage() {
  const [fecha, setFecha] = useState<string>(new Date().toISOString().split('T')[0]);
  const [umbralLlenado, setUmbralLlenado] = useState<number>(60);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeVehiculoId, setActiveVehiculoId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Carga o generación inicial de plan
  useEffect(() => {
    handleGenerarPlan();
  }, []);

  const handleGenerarPlan = async () => {
    setIsGenerating(true);
    setErrorMessage(null);
    try {
      const nuevoPlan = await apiService.generarPlan({
        fecha,
        umbral_llenado: umbralLlenado,
      });
      setPlan(nuevoPlan);
    } catch (err: any) {
      setErrorMessage(
        err.message || 'Error al conectar con el servicio de optimización. Intente nuevamente.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Barra de Controles y Parámetros del Plan */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex-shrink-0">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Route className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900">
                Planificador y Optimizador CVRP
              </h1>
              <p className="text-xs text-slate-500">
                Genera rutas óptimas considerando capacidad volumétrica, depósitos y botadero.
              </p>
            </div>
          </div>

          {/* Parámetros */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Selector de Fecha */}
            <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs">
              <Calendar className="w-4 h-4 text-slate-400" />
              <label htmlFor="fecha-plan" className="text-slate-500 font-medium">Fecha:</label>
              <input
                id="fecha-plan"
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="bg-transparent font-semibold text-slate-800 focus:outline-none"
              />
            </div>

            {/* Selector de Umbral de Llenado */}
            <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs">
              <Sliders className="w-4 h-4 text-slate-400" />
              <label htmlFor="umbral-slider" className="text-slate-500 font-medium">Umbral mínimo:</label>
              <span className="font-bold text-emerald-700 font-mono">{umbralLlenado}%</span>
              <input
                id="umbral-slider"
                type="range"
                min="40"
                max="90"
                step="5"
                value={umbralLlenado}
                onChange={(e) => setUmbralLlenado(Number(e.target.value))}
                className="w-20 accent-emerald-600 cursor-pointer"
              />
            </div>

            {/* Botón de Ejecución */}
            <button
              onClick={handleGenerarPlan}
              disabled={isGenerating}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-70 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-md shadow-emerald-950/20 transition-all cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Calculando con OR-Tools...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generar Plan Optimizado</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Mensaje de error si ocurre */}
        {errorMessage && (
          <div className="mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Banda de Métricas de Ahorro e Impacto */}
      {plan && <MetricasBanda plan={plan} />}

      {/* Área Principal de Rutas y Mapa */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">
        {/* Panel Lateral: Lista de Rutas por Vehículo y Diferidos (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-3 overflow-y-auto pr-1 min-h-0">
          {plan?.rutas && plan.rutas.length > 0 ? (
            <>
              <RutasList
                rutas={plan.rutas}
                activeVehiculoId={activeVehiculoId}
                onSelectVehiculo={setActiveVehiculoId}
              />
              <DiferidosList noAsignadosIds={plan.no_asignados} />
            </>
          ) : (
            <div className="bg-white p-6 rounded-xl border border-slate-200 text-center text-slate-400">
              <Route className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-xs">No hay rutas calculadas para esta fecha.</p>
            </div>
          )}
        </div>

        {/* Mapa de Rutas Coloreadas (7 cols) */}
        <div className="lg:col-span-7 h-[500px] lg:h-full min-h-[500px]">
          <RutasMap
            rutas={plan?.rutas || []}
            activeVehiculoId={activeVehiculoId}
          />
        </div>
      </div>
    </div>
  );
}
