'use client';

import React, { useState, useMemo } from 'react';
import { Contenedor } from '@/lib/types';
import { 
  Search, 
  Filter, 
  AlertCircle, 
  CheckCircle, 
  Trash2, 
  MapPin, 
  Power,
  SlidersHorizontal 
} from 'lucide-react';

interface TablaContenedoresProps {
  contenedores: Contenedor[];
  selectedId: string | null;
  onSelect: (contenedor: Contenedor) => void;
  onToggleActivo: (id: string) => void;
}

export default function TablaContenedores({
  contenedores,
  selectedId,
  onSelect,
  onToggleActivo,
}: TablaContenedoresProps) {
  const [search, setSearch] = useState('');
  const [selectedZona, setSelectedZona] = useState<string>('todos');
  const [filtroSoloPrioritarios, setFiltroSoloPrioritarios] = useState(false);

  // Zonas únicas disponibles
  const zonas = useMemo(() => {
    const list = Array.from(new Set(contenedores.map((c) => c.zona))).filter(Boolean);
    return ['todos', ...list];
  }, [contenedores]);

  // Filtrado de contenedores
  const contenedoresFiltrados = useMemo(() => {
    return contenedores.filter((c) => {
      const matchSearch =
        c.codigo.toLowerCase().includes(search.toLowerCase()) ||
        c.direccion.toLowerCase().includes(search.toLowerCase()) ||
        c.zona.toLowerCase().includes(search.toLowerCase());

      const matchZona = selectedZona === 'todos' || c.zona === selectedZona;
      const matchPrioridad = !filtroSoloPrioritarios || (c.activo && c.nivel_llenado >= 60);

      return matchSearch && matchZona && matchPrioridad;
    });
  }, [contenedores, search, selectedZona, filtroSoloPrioritarios]);

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Barra de Filtros y Búsqueda */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/70 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por código, calle o zona..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800 placeholder-slate-400"
            />
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={selectedZona}
              onChange={(e) => setSelectedZona(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              <option value="todos">Todas las zonas</option>
              {zonas
                .filter((z) => z !== 'todos')
                .map((z) => (
                  <option key={z} value={z}>
                    Zona {z}
                  </option>
                ))}
            </select>

            <button
              onClick={() => setFiltroSoloPrioritarios(!filtroSoloPrioritarios)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                filtroSoloPrioritarios
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
              title="Filtrar solo contenedores que requieren recolección (≥ 60%)"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>≥ 60%</span>
            </button>
          </div>
        </div>

        {/* Resumen numérico */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-1 pt-1">
          <span>
            Mostrando <strong>{contenedoresFiltrados.length}</strong> de {contenedores.length} contenedores
          </span>
          <div className="flex items-center space-x-3 text-[11px]">
            <span className="flex items-center text-rose-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block mr-1" />
              {contenedores.filter((c) => c.activo && c.nivel_llenado >= 80).length} Críticos
            </span>
            <span className="flex items-center text-amber-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block mr-1" />
              {contenedores.filter((c) => c.activo && c.nivel_llenado >= 60 && c.nivel_llenado < 80).length} Alerta
            </span>
            <span className="flex items-center text-emerald-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block mr-1" />
              {contenedores.filter((c) => c.activo && c.nivel_llenado < 60).length} Óptimos
            </span>
          </div>
        </div>
      </div>

      {/* Lista / Tabla de Contenedores con Scroll */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {contenedoresFiltrados.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <Trash2 className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-medium">No se encontraron contenedores</p>
            <p className="text-xs mt-1">Prueba cambiando los filtros o término de búsqueda.</p>
          </div>
        ) : (
          contenedoresFiltrados.map((c) => {
            const isSelected = selectedId === c.id;
            const esCritico = c.nivel_llenado >= 80;
            const esAlerta = c.nivel_llenado >= 60 && c.nivel_llenado < 80;

            return (
              <div
                key={c.id}
                onClick={() => onSelect(c)}
                className={`p-3.5 flex items-center justify-between transition-colors cursor-pointer group ${
                  isSelected
                    ? 'bg-emerald-50/80 border-l-4 border-l-emerald-600'
                    : 'hover:bg-slate-50 border-l-4 border-l-transparent'
                }`}
              >
                {/* Info principal */}
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-slate-900 group-hover:text-emerald-700">
                      {c.codigo}
                    </span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 font-medium px-2 py-0.5 rounded-full">
                      {c.zona}
                    </span>
                    {!c.activo && (
                      <span className="text-[10px] bg-slate-200 text-slate-600 font-semibold px-2 py-0.5 rounded-full">
                        Inactivo
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 truncate mt-1 flex items-center">
                    <MapPin className="w-3 h-3 text-slate-400 mr-1 flex-shrink-0" />
                    <span className="truncate">{c.direccion}</span>
                  </p>
                </div>

                {/* Barra y Nivel de llenado */}
                <div className="w-36 flex-shrink-0 flex items-center space-x-3">
                  <div className="flex-1">
                    <div className="flex justify-between text-[11px] font-semibold mb-1">
                      <span
                        className={
                          !c.activo
                            ? 'text-slate-400'
                            : esCritico
                            ? 'text-rose-600'
                            : esAlerta
                            ? 'text-amber-600'
                            : 'text-emerald-600'
                        }
                      >
                        {c.activo ? `${c.nivel_llenado}%` : 'Off'}
                      </span>
                      <span className="text-slate-400 text-[10px] font-mono">{c.capacidad_litros}L</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          !c.activo
                            ? 'bg-slate-300'
                            : esCritico
                            ? 'bg-rose-500'
                            : esAlerta
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${c.activo ? c.nivel_llenado : 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Toggle Activo Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleActivo(c.id);
                    }}
                    title={c.activo ? 'Desactivar contenedor' : 'Activar contenedor'}
                    className={`p-1.5 rounded-lg transition-colors ${
                      c.activo
                        ? 'text-emerald-600 hover:bg-emerald-100'
                        : 'text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    <Power className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
