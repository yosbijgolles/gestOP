'use client';

import React, { useState, useEffect } from 'react';
import { Vehiculo } from '@/lib/types';
import { apiService } from '@/lib/api';
import VehiculoCard from '@/components/vehiculos/VehiculoCard';
import {
  Truck,
  CheckCircle2,
  Wrench,
  Layers,
  RefreshCw,
  Info,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export default function VehiculosPage() {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'todos' | 'disponible' | 'mantenimiento'>('todos');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadVehiculos = async () => {
    setLoading(true);
    try {
      setVehiculos(await apiService.getVehiculos());
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'No se pudieron cargar los vehículos',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehiculos();
  }, []);

  const handleToggleEstado = async (id: string) => {
    try {
      setVehiculos(await apiService.toggleVehiculoEstado(id));
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No se pudo actualizar el vehículo');
    }
  };

  const disponibles = vehiculos.filter((v) => v.estado === 'disponible');
  const mantenimiento = vehiculos.filter((v) => v.estado === 'mantenimiento');
  const capacidadTotalDisponible = disponibles.reduce((sum, v) => sum + v.capacidad_m3, 0);

  const vehiculosFiltrados = vehiculos.filter((v) => {
    if (filter === 'todos') return true;
    return v.estado === filter;
  });

  return (
    <div className="flex flex-col h-full gap-5">
      {errorMessage && (
        <div role="alert" className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Encabezado y KPIs superiores */}
      <div className="flex flex-col gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Truck className="w-5 h-5 text-emerald-600" />
              Gestión de Flota de Compactadores
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Administración de disponibilidad mecánica y capacidad volumétrica para el algoritmo CVRP.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter('todos')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                filter === 'todos'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todos ({vehiculos.length})
            </button>
            <button
              onClick={() => setFilter('disponible')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                filter === 'disponible'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              Disponibles ({disponibles.length})
            </button>
            <button
              onClick={() => setFilter('mantenimiento')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                filter === 'mantenimiento'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
              }`}
            >
              Mantenimiento ({mantenimiento.length})
            </button>
          </div>
        </div>

        {/* Tarjetas de Métricas de Flota */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-xl">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span>Flota Total</span>
              <Truck className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-1">{vehiculos.length}</p>
            <span className="text-[11px] text-slate-500">Unidades registradas</span>
          </div>

          <div className="bg-emerald-50/70 border border-emerald-200/80 p-3.5 rounded-xl">
            <div className="flex items-center justify-between text-emerald-700 text-xs font-medium">
              <span>Activos para Ruteo</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-emerald-900 mt-1">{disponibles.length}</p>
            <span className="text-[11px] text-emerald-700 font-medium">Entran al optimizador</span>
          </div>

          <div className="bg-amber-50/70 border border-amber-200/80 p-3.5 rounded-xl">
            <div className="flex items-center justify-between text-amber-700 text-xs font-medium">
              <span>En Taller / Alerta</span>
              <Wrench className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl font-bold text-amber-900 mt-1">{mantenimiento.length}</p>
            <span className="text-[11px] text-amber-700 font-medium">Pausados preventivamente</span>
          </div>

          <div className="bg-sky-50/70 border border-sky-200/80 p-3.5 rounded-xl">
            <div className="flex items-center justify-between text-sky-700 text-xs font-medium">
              <span>Capacidad Operativa</span>
              <Layers className="w-4 h-4 text-sky-600" />
            </div>
            <p className="text-2xl font-bold text-sky-900 mt-1 font-mono">
              {capacidadTotalDisponible} <span className="text-sm font-sans font-medium">m³</span>
            </p>
            <span className="text-[11px] text-sky-700 font-medium">Volumen disponible hoy</span>
          </div>
        </div>
      </div>

      {/* Regla de Negocio Banner Informativo */}
      <div className="bg-blue-50 border border-blue-200 text-blue-900 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2">
        <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
        <span>
          <strong>Regla de negocio:</strong> Solo los vehículos con estado <code>disponible</code> serán considerados por el solver OR-Tools para la asignación de rutas y paradas.
        </span>
      </div>

      {/* Grid de Vehículos */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
            <span className="text-xs">Cargando flota de vehículos...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vehiculosFiltrados.map((v) => (
              <VehiculoCard
                key={v.id}
                vehiculo={v}
                onToggleEstado={handleToggleEstado}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
