'use client';

import React from 'react';
import { Contenedor } from '@/lib/types';
import { CONTENEDORES_MOCK } from '@/lib/mockData';
import { AlertTriangle, Clock, MapPin } from 'lucide-react';

interface DiferidosListProps {
  noAsignadosIds?: string[];
}

export default function DiferidosList({ noAsignadosIds = [] }: DiferidosListProps) {
  if (!noAsignadosIds || noAsignadosIds.length === 0) {
    return null;
  }

  const map = new Map<string, Contenedor>();
  CONTENEDORES_MOCK.forEach((c) => map.set(c.id, c));

  const contenedoresDiferidos = noAsignadosIds
    .map((id) => map.get(id))
    .filter(Boolean) as Contenedor[];

  return (
    <div className="bg-amber-50/70 border border-amber-200/90 rounded-xl p-3.5 space-y-2">
      <div className="flex items-center justify-between text-amber-900">
        <div className="flex items-center space-x-1.5 font-bold text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>Contenedores Diferidos ({contenedoresDiferidos.length})</span>
        </div>
        <span className="text-[10px] bg-amber-200/80 text-amber-900 font-semibold px-2 py-0.5 rounded-full">
          Próximo Turno
        </span>
      </div>

      <p className="text-[11px] text-amber-800 leading-snug">
        Superan la capacidad volumétrica de los compactadores disponibles hoy. Se recomienda programar en el siguiente turno.
      </p>

      <div className="space-y-1.5 pt-1">
        {contenedoresDiferidos.map((c) => (
          <div
            key={c.id}
            className="flex items-center justify-between bg-white/90 p-2 rounded-lg border border-amber-200/70 text-xs text-slate-700"
          >
            <div className="min-w-0 pr-2">
              <span className="font-bold text-slate-800 block text-[11px]">{c.codigo}</span>
              <span className="text-[10px] text-slate-500 truncate block">{c.direccion}</span>
            </div>
            <div className="text-right flex-shrink-0">
              <span className="text-rose-600 font-bold text-xs">{c.nivel_llenado}%</span>
              <span className="text-[9px] text-slate-400 block">{c.zona}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
