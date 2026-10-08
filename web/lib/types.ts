export type EstadoVehiculo = 'disponible' | 'mantenimiento' | 'fuera_servicio';
export type TipoSitio = 'cochera' | 'botadero';
export type EstadoPlan = 'borrador' | 'confirmado' | 'en_progreso' | 'completado';

export interface Sitio {
  id: string;
  tipo: TipoSitio;
  nombre: string;
  lat: number;
  lng: number;
}

export interface Vehiculo {
  id: string;
  placa: string;
  capacidad_m3: number;
  estado: EstadoVehiculo;
  conductor: string;
}

export interface Contenedor {
  id: string;
  codigo: string;
  direccion: string;
  zona: string;
  lat: number;
  lng: number;
  capacidad_litros: number;
  nivel_llenado: number; // 0 a 100
  activo: boolean;
}

export interface Parada {
  id: string;
  ruta_id: string;
  contenedor_id: string;
  orden: number;
  carga_acumulada: number;
  contenedor?: Contenedor;
}

export interface GeoJSONLineString {
  type: 'LineString';
  coordinates: [number, number][]; // [lng, lat] segun GeoJSON estandar
}

export interface Ruta {
  id: string;
  plan_id?: string;
  vehiculo_id: string;
  orden_global?: number;
  distancia_m: number;
  duracion_s?: number;
  carga_total: number;
  secuencia?: string[]; // IDs de contenedores
  geometria: GeoJSONLineString | { type: string; coordinates: any[] };
  vehiculo?: Vehiculo;
  paradas?: Parada[];
}

export interface Plan {
  id: string;
  fecha: string;
  estado: EstadoPlan;
  km_optimizado: number;
  km_baseline: number;
  ahorro_pct: number;
  creado_en?: string;
  rutas?: Ruta[];
  no_asignados?: string[]; // IDs de contenedores diferidos
}

// Request para generacion de optimizacion
export interface OptimizeRequest {
  fecha?: string;
  umbral_llenado?: number;
}

export interface OptimizeResponse {
  rutas: {
    vehiculo_id: string;
    secuencia: string[];
    distancia_m: number;
    geometria: GeoJSONLineString;
  }[];
  no_asignados: string[];
  km_total: number;
  km_baseline: number;
}
