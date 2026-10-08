import { Contenedor, Vehiculo, EstadoVehiculo, Plan, OptimizeRequest } from './types';
import { CONTENEDORES_MOCK, VEHICULOS_MOCK, PLAN_DEMO_MOCK } from './mockData';

const isBrowser = typeof window !== 'undefined';

// Helper de persistencia local para prototipo fluido
function getStoredVehicles(): Vehiculo[] {
  if (!isBrowser) return VEHICULOS_MOCK;
  const stored = localStorage.getItem('gestop_vehiculos');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // fallback
    }
  }
  return VEHICULOS_MOCK;
}

function saveStoredVehicles(vehicles: Vehiculo[]) {
  if (isBrowser) {
    localStorage.setItem('gestop_vehiculos', JSON.stringify(vehicles));
  }
}

function getStoredContainers(): Contenedor[] {
  if (!isBrowser) return CONTENEDORES_MOCK;
  const stored = localStorage.getItem('gestop_contenedores');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // fallback
    }
  }
  return CONTENEDORES_MOCK;
}

function saveStoredContainers(containers: Contenedor[]) {
  if (isBrowser) {
    localStorage.setItem('gestop_contenedores', JSON.stringify(containers));
  }
}

export const apiService = {
  // Contenedores
  async getContenedores(): Promise<Contenedor[]> {
    try {
      const res = await fetch('/api/contenedores');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch (e) {
      console.warn('API /api/contenedores no disponible, usando dataset local', e);
    }
    return getStoredContainers();
  },

  async toggleContenedorActivo(id: string): Promise<Contenedor[]> {
    try {
      const current = getStoredContainers();
      const target = current.find(c => c.id === id);
      if (target) {
        await fetch(`/api/contenedores/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ activo: !target.activo }),
        });
      }
    } catch (e) {
      console.warn('Fallo PATCH /api/contenedores, aplicando localmente', e);
    }

    const current = getStoredContainers();
    const updated = current.map(c => (c.id === id ? { ...c, activo: !c.activo } : c));
    saveStoredContainers(updated);
    return updated;
  },

  // Vehiculos
  async getVehiculos(): Promise<Vehiculo[]> {
    try {
      const res = await fetch('/api/vehiculos');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch (e) {
      console.warn('API /api/vehiculos no disponible, usando dataset local', e);
    }
    return getStoredVehicles();
  },

  async toggleVehiculoEstado(id: string): Promise<Vehiculo[]> {
    const current = getStoredVehicles();
    const target = current.find(v => v.id === id);
    if (!target) return current;

    const nuevoEstado: EstadoVehiculo = target.estado === 'disponible' ? 'mantenimiento' : 'disponible';

    try {
      await fetch(`/api/vehiculos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
    } catch (e) {
      console.warn('Fallo PATCH /api/vehiculos, aplicando localmente', e);
    }

    const updated = current.map(v => (v.id === id ? { ...v, estado: nuevoEstado } : v));
    saveStoredVehicles(updated);
    return updated;
  },

  // Planes de optimizacion
  async generarPlan(params: OptimizeRequest): Promise<Plan> {
    try {
      const res = await fetch('/api/planes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.rutas) return data;
      }
    } catch (e) {
      console.warn('API /api/planes no disponible, generando plan simulado', e);
    }

    // Simulacion de llamada al optimizer con calculo dinamico segun vehiculos disponibles y umbral
    await new Promise(r => setTimeout(r, 1200)); // Simula tiempo de calculo OR-Tools

    const vehiculosDisponibles = getStoredVehicles().filter(v => v.estado === 'disponible');
    const umbral = params.umbral_llenado ?? 60;
    const contenedoresCandidatos = getStoredContainers().filter(c => c.activo && c.nivel_llenado >= umbral);

    // Ajustar km_optimizado y baseline segun la carga
    const n = contenedoresCandidatos.length;
    const kmOptimizado = Number((42.5 + n * 0.85).toFixed(1));
    const kmBaseline = Number((kmOptimizado * 1.45).toFixed(1));
    const ahorroPct = Number((((kmBaseline - kmOptimizado) / kmBaseline) * 100).toFixed(1));

    return {
      ...PLAN_DEMO_MOCK,
      id: `plan-${Date.now()}`,
      fecha: params.fecha || new Date().toISOString().split('T')[0],
      km_optimizado: kmOptimizado,
      km_baseline: kmBaseline,
      ahorro_pct: ahorroPct,
    };
  },
};
