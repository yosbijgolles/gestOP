'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Trash2, 
  Truck, 
  Route, 
  Building2, 
  CheckCircle2, 
  Leaf, 
  TrendingUp,
  MapPin
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppShellProps {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  {
    name: 'Contenedores',
    href: '/contenedores',
    icon: Trash2,
    badge: 'Monitoreo',
    description: 'Nivel de llenado y ubicación',
  },
  {
    name: 'Vehículos',
    href: '/vehiculos',
    icon: Truck,
    badge: 'Flota',
    description: 'Disponibilidad y compactadores',
  },
  {
    name: 'Ruteo y Planes',
    href: '/ruteo',
    icon: Route,
    badge: 'CVRP AI',
    description: 'Optimización de rutas diarias',
  },
];

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 select-none">
        {/* Brand */}
        <div className="p-5 border-b border-slate-800 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-900/40 text-white font-bold text-lg">
            <Leaf className="w-5 h-5 text-emerald-100" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-base tracking-tight text-white">gestOP</span>
              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold px-1.5 py-0.5 rounded-full border border-emerald-500/30">
                PIURA
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Planificador de Residuos</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Módulos del Sistema
          </div>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group flex items-center justify-between px-3.5 py-3 rounded-xl transition-all duration-150',
                  isActive
                    ? 'bg-emerald-600 text-white font-semibold shadow-md shadow-emerald-950/40'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                )}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <Icon className={cn('w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110', isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400')} />
                  <div className="truncate">
                    <span className="text-sm block font-medium">{item.name}</span>
                    <span className={cn('text-[11px] block truncate', isActive ? 'text-emerald-100' : 'text-slate-500')}>
                      {item.description}
                    </span>
                  </div>
                </div>
                {item.badge && (
                  <span
                    className={cn(
                      'text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ml-2 flex-shrink-0',
                      isActive
                        ? 'bg-emerald-700/80 text-emerald-100 border border-emerald-500'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Municipality Info Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <Building2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <div className="truncate">
              <p className="font-semibold text-slate-200 truncate">Muni. Provincial de Piura</p>
              <p className="text-[10px] text-slate-500">Gerencia de Medio Ambiente</p>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block mr-1.5 animate-pulse" />
              CVRP Online
            </span>
            <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 font-mono">v1.0-hack</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 flex-shrink-0 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-sm z-20">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-slate-500 text-sm">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span className="font-medium text-slate-700">Piura, Perú</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-500 text-xs font-mono">Zona Operacional Urbana</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-full text-xs font-medium text-emerald-800">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>Ahorro estimado proyectado: <strong>~30%</strong></span>
            </div>

            <div className="h-4 w-px bg-slate-200" />

            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs border border-slate-300">
                RZ
              </div>
              <div className="text-left text-xs leading-tight hidden sm:block">
                <span className="font-semibold text-slate-800 block">Renzo</span>
                <span className="text-slate-400 text-[10px]">Gestor de Operaciones</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-slate-100 p-6 min-h-0">
          <div className="max-w-[1700px] mx-auto h-full flex flex-col">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
