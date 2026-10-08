'use client';

import React from 'react';
import { Plan } from '@/lib/types';
import { TrendingDown, Gauge, Fuel, CheckCircle, Zap } from 'lucide-react';

interface MetricasBandaProps {
  plan: Plan;
}

export default function MetricasBanda({ plan }: MetricasBandaProps) {
  // Calculo de ahorro de combustible estimado (~0.35 L diesel por km en camion compactador)
  const kmDiferencia = Math.max(0, plan.km_baseline - plan.km_optimizado);
  const combustibleAhorradoL = (kmDiferencia * 0.38).toFixed(1);

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-xl p-4 shadow-lg border border-slate-700/60 flex-shrink-0">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Titulo y Status */}
        <div className="flex items-center space-x-3 w-full lg:w-auto">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Zap className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">
                PLAN DIARIO OPTIMIZADO
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                Fecha: {plan.fecha}
              </span>
            </div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Resultados de la Optimización CVRP
            </h2>
          </div>
        </div>

        {/* Bloque de Métricas Comparativas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
          {/* Km Optimizado */}
          <div className="bg-slate-800/80 border border-slate-700 p-2.5 rounded-xl text-center">
            <span className="text-[10px] uppercase font-bold text-emerald-400 block tracking-wider">
              Ruta Optimizada
            </span>
            <div className="text-xl sm:text-2xl font-black font-mono text-white mt-0.5">
              {plan.km_optimizado} <span className="text-xs font-sans font-normal text-slate-400">km</span>
            </div>
            <span className="text-[10px] text-emerald-300">Con OR-Tools</span>
          </div>

          {/* Km Baseline */}
          <div className="bg-slate-800/80 border border-slate-700 p-2.5 rounded-xl text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Ruta Convencional
            </span>
            <div className="text-xl sm:text-2xl font-black font-mono text-slate-300 mt-0.5">
              {plan.km_baseline} <span className="text-xs font-sans font-normal text-slate-400">km</span>
            </div>
            <span className="text-[10px] text-slate-400">Ruta empírica sin modelo</span>
          </div>

          {/* % Ahorro Destacado */}
          <div className="bg-emerald-500/20 border-2 border-emerald-500 p-2.5 rounded-xl text-center shadow-inner">
            <span className="text-[10px] uppercase font-black text-emerald-300 block tracking-wider flex items-center justify-center gap-1">
              <TrendingDown className="w-3 h-3 text-emerald-400" /> % Ahorro Total
            </span>
            <div className="text-xl sm:text-2xl font-black font-mono text-emerald-300 mt-0.5">
              {plan.ahorro_pct}%
            </div>
            <span className="text-[10px] text-emerald-200 font-semibold">
              -{kmDiferencia.toFixed(1)} km menos
            </span>
          </div>

          {/* Impacto Ecológico / Combustible */}
          <div className="bg-slate-800/80 border border-slate-700 p-2.5 rounded-xl text-center">
            <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider flex items-center justify-center gap-1">
              <Fuel className="w-3 h-3 text-amber-400" /> Ahorro Diésel
            </span>
            <div className="text-xl sm:text-2xl font-black font-mono text-amber-300 mt-0.5">
              ~{combustibleAhorradoL} <span className="text-xs font-sans font-normal text-slate-400">gal/día</span>
            </div>
            <span className="text-[10px] text-slate-400">Menos emisión CO₂</span>
          </div>
        </div>
      </div>
    </div>
  );
}
