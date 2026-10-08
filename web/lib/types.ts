export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Contenedor = {
  id: string
  codigo: string
  direccion: string
  zona: string
  lat: number
  lng: number
  capacidad_litros: number
  nivel_llenado: number
  activo: boolean
}

export type VehiculoEstado = 'disponible' | 'mantenimiento' | 'fuera_servicio'

export type Vehiculo = {
  id: string
  placa: string
  capacidad_m3: number
  estado: VehiculoEstado
  conductor: string | null
}

export type Sitio = {
  id: string
  tipo: 'cochera' | 'botadero'
  nombre: string
  lat: number
  lng: number
}

export type Plan = {
  id: string
  fecha: string
  estado: string
  km_optimizado: number
  km_baseline: number
  ahorro_pct: number
  creado_en: string
}

export type Ruta = {
  id: string
  plan_id: string
  vehiculo_id: string
  orden_global: number
  distancia_m: number
  duracion_s: number | null
  carga_total: number
  geometria: Json
}

export type Parada = {
  id: string
  ruta_id: string
  contenedor_id: string
  orden: number
  carga_acumulada: number
}

type Table<Row, Insert, Update = Partial<Insert>> = {
  Row: Row
  Insert: Insert
  Update: Update
  Relationships: []
}

export type Database = {
  public: {
    Tables: {
      sitios: Table<Sitio, Omit<Sitio, 'id'> & { id?: string }>
      vehiculos: Table<Vehiculo, Omit<Vehiculo, 'id'> & { id?: string }>
      contenedores: Table<Contenedor, Omit<Contenedor, 'id'> & { id?: string }>
      planes: Table<Plan, Omit<Plan, 'id' | 'creado_en'> & { id?: string; creado_en?: string }>
      rutas: Table<Ruta, Omit<Ruta, 'id'> & { id?: string }>
      paradas: Table<Parada, Omit<Parada, 'id'> & { id?: string }>
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
