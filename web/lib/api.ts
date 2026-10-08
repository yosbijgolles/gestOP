import type { Contenedor, EstadoVehiculo, OptimizeRequest, Plan, Vehiculo } from './types'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

async function readResponse(response: Response): Promise<unknown> {
  let body: unknown
  try {
    body = await response.json()
  } catch {
    throw new Error(`La API devolvió una respuesta inválida (HTTP ${response.status})`)
  }

  if (!response.ok) {
    const message = isRecord(body) && typeof body.error === 'string' ? body.error : null
    throw new Error(message ?? `La solicitud falló (HTTP ${response.status})`)
  }

  return body
}

function isContenedor(value: unknown): value is Contenedor {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.codigo === 'string' &&
    typeof value.direccion === 'string' &&
    typeof value.zona === 'string' &&
    typeof value.lat === 'number' &&
    typeof value.lng === 'number' &&
    typeof value.capacidad_litros === 'number' &&
    typeof value.nivel_llenado === 'number' &&
    typeof value.activo === 'boolean'
  )
}

function isVehiculo(value: unknown): value is Vehiculo {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.placa === 'string' &&
    typeof value.capacidad_m3 === 'number' &&
    (value.estado === 'disponible' ||
      value.estado === 'mantenimiento' ||
      value.estado === 'fuera_servicio') &&
    (typeof value.conductor === 'string' || value.conductor === null)
  )
}

function isPlan(value: unknown): value is Plan {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.fecha === 'string' &&
    typeof value.estado === 'string' &&
    typeof value.km_optimizado === 'number' &&
    typeof value.km_baseline === 'number' &&
    typeof value.ahorro_pct === 'number' &&
    Array.isArray(value.rutas) &&
    Array.isArray(value.no_asignados)
  )
}

async function getContenedores(): Promise<Contenedor[]> {
  const body = await readResponse(await fetch('/api/contenedores'))
  if (!Array.isArray(body) || !body.every(isContenedor)) {
    throw new Error('La API devolvió una lista de contenedores inválida')
  }
  return body
}

async function getVehiculos(): Promise<Vehiculo[]> {
  const body = await readResponse(await fetch('/api/vehiculos'))
  if (!Array.isArray(body) || !body.every(isVehiculo)) {
    throw new Error('La API devolvió una lista de vehículos inválida')
  }
  return body
}

export const apiService = {
  async getContenedores(): Promise<Contenedor[]> {
    return getContenedores()
  },

  async toggleContenedorActivo(id: string): Promise<Contenedor[]> {
    const contenedores = await getContenedores()
    const target = contenedores.find((container) => container.id === id)
    if (!target) throw new Error('No se encontró el contenedor')

    const body = await readResponse(
      await fetch(`/api/contenedores/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activo: !target.activo }),
      }),
    )
    if (!isContenedor(body)) throw new Error('La API devolvió un contenedor inválido')

    return contenedores.map((container) => (container.id === id ? body : container))
  },

  async getVehiculos(): Promise<Vehiculo[]> {
    return getVehiculos()
  },

  async toggleVehiculoEstado(id: string): Promise<Vehiculo[]> {
    const vehiculos = await getVehiculos()
    const target = vehiculos.find((vehicle) => vehicle.id === id)
    if (!target) throw new Error('No se encontró el vehículo')

    const nuevoEstado: EstadoVehiculo =
      target.estado === 'disponible' ? 'mantenimiento' : 'disponible'
    const body = await readResponse(
      await fetch(`/api/vehiculos/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado }),
      }),
    )
    if (!isVehiculo(body)) throw new Error('La API devolvió un vehículo inválido')

    return vehiculos.map((vehicle) => (vehicle.id === id ? body : vehicle))
  },

  async generarPlan(params: OptimizeRequest): Promise<Plan> {
    const body = await readResponse(
      await fetch('/api/planes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      }),
    )
    if (!isPlan(body)) throw new Error('La API devolvió un plan inválido')
    return body
  },
}
