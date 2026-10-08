'use client';

import React from 'react';
import { Vehiculo, EstadoVehiculo } from '@/lib/types';
import { Truck, Wrench, CheckCircle2, XCircle, User, ShieldAlert, Sparkles } from 'lucide-react';

interface VehiculoCardProps {
  vehiculo: Vehiculo;
  onToggleEstado: (id: string) => void;
  disabled?: boolean;
}

export default function VehiculoCard({
  vehiculo,
  onToggleEstado,
  disabled = false,
}: VehiculoCardProps) {
  const isDisponible = vehiculo.estado === 'disponible';
  const isMantenimiento = vehiculo.estado === 'mantenimiento';

  return (
    <div
      className={`rounded-xl border transition-all duration-200 bg-white p-5 shadow-sm hover:shadow-md flex flex-col justify-between ${
        isDisponible
          ? 'border-emerald-200/90 ring-1 ring-emerald-500/10'
          : isMantenimiento
          ? 'border-amber-200/90 bg-amber-50/20'
          : 'border-slate-200 opacity-70'
      }`}
    >
      <div>
        {/* Header con Placa y Badge de Estado */}
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shadow-sm ${
                isDisponible
                  ? 'bg-emerald-100 text-emerald-800'
                  : isMantenimiento
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-wider text-slate-900 font-mono">
                  {vehiculo.placa}
                </span>
                <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono">
                  {vehiculo.id.toUpperCase()}
                </span>
              </div>
              <span className="text-[11px] text-slate-400">Camión Compactador</span>
            </div>
          </div>

          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${
              isDisponible
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : isMantenimiento
                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                : 'bg-rose-100 text-rose-800 border border-rose-300'
            }`}
          >
            {isDisponible ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Disponible</span>
              </>
            ) : isMantenimiento ? (
              <>
                <Wrench className="w-3.5 h-3.5 text-amber-600" />
                <span>Mantenimiento</span>
              </>
            ) : (
              <>
                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                <span>Fuera de Servicio</span>
              </>
            )}
          </span>
        </div>

        {/* Datos técnicos y conductor */}
        <div className="py-3 space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-slate-400 flex items-center gap-1">
              <User className="w-3.5 h-3.5" /> Conductor
            </span>
            <span className="font-semibold text-slate-800">{vehiculo.conductor}</span>
          </div>

          <div className="flex items-center justify-between text-slate-600">
            <span className="text-slate-400">Capacidad de Carga</span>
            <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-xs">
              {vehiculo.capacidad_m3} m³ (~{(vehiculo.capacidad_m3 * 0.45).toFixed(1)} tn)
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-600">
            <span className="text-slate-400">Elegibilidad CVRP</span>
            {isDisponible ? (
              <span className="text-emerald-700 font-semibold text-[11px] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-600" /> Entra al plan de hoy
              </span>
            ) : (
              <span className="text-slate-400 text-[11px]">Excluido de ruteo</span>
            )}
          </div>
        </div>
      </div>

      {/* Botón de cambio de estado interactivo */}
      <div className="pt-3 border-t border-slate-100">
        <button
          onClick={() => onToggleEstado(vehiculo.id)}
          disabled={disabled}
          className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
            isDisponible
              ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
          }`}
        >
          {isDisponible ? (
            <>
              <Wrench className="w-3.5 h-3.5" />
              <span>Enviar a Mantenimiento</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Habilitar para Ruta (Disponible)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
