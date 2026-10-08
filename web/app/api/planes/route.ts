import { NextRequest, NextResponse } from 'next/server'
import { errorResponse, isFiniteNumber, isRecord } from '@/lib/api'
import { getSupabase } from '@/lib/supabase'
import type { Contenedor, Json, Ruta, Vehiculo } from '@/lib/types'

type OptimizerRoute = {
  vehiculo_id: string
  secuencia: string[]
  distancia_m: number
  geometria: Json
}

type OptimizerResult = {
  rutas: OptimizerRoute[]
  no_asignados: string[]
  km_total: number
  km_baseline: number
}

function isOptimizerRoute(value: unknown): value is OptimizerRoute {
  if (
    !isRecord(value) ||
    typeof value.vehiculo_id !== 'string' ||
    !Array.isArray(value.secuencia) ||
    value.secuencia.length === 0 ||
    !value.secuencia.every((id) => typeof id === 'string') ||
    !isFiniteNumber(value.distancia_m) ||
    value.distancia_m < 0 ||
    !isRecord(value.geometria) ||
    value.geometria.type !== 'LineString' ||
    !Array.isArray(value.geometria.coordinates) ||
    value.geometria.coordinates.length < 2
  ) {
    return false
  }
  return value.geometria.coordinates.every(
    (point) =>
      Array.isArray(point) &&
      point.length >= 2 &&
      isFiniteNumber(point[0]) &&
      point[0] >= -180 &&
      point[0] <= 180 &&
      isFiniteNumber(point[1]) &&
      point[1] >= -90 &&
      point[1] <= 90 &&
      point.every((coordinate) => isFiniteNumber(coordinate)),
  )
}

function isOptimizerResult(value: unknown): value is OptimizerResult {
  return (
    isRecord(value) &&
    Array.isArray(value.rutas) &&
    value.rutas.every(isOptimizerRoute) &&
    Array.isArray(value.no_asignados) &&
    value.no_asignados.every((id) => typeof id === 'string') &&
    isFiniteNumber(value.km_total) &&
    value.km_total >= 0 &&
    isFiniteNumber(value.km_baseline) &&
    value.km_baseline >= 0
  )
}

function volumeM3(container: Contenedor): number {
  return (container.capacidad_litros * container.nivel_llenado) / 100_000
}

async function deletePlanData(
  client: ReturnType<typeof getSupabase>,
  planId: string,
  routeIds: string[],
): Promise<void> {
  if (routeIds.length > 0) {
    const { error: stopError } = await client.from('paradas').delete().in('ruta_id', routeIds)
    if (stopError) console.error('Rollback de paradas:', stopError.message)

    const { error: routeError } = await client.from('rutas').delete().in('id', routeIds)
    if (routeError) console.error('Rollback de rutas:', routeError.message)
  }

  const { error: planError } = await client.from('planes').delete().eq('id', planId)
  if (planError) console.error('Rollback de plan:', planError.message)
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return errorResponse('El cuerpo de la solicitud debe ser JSON válido', 400)
  }

  if (!isRecord(body) || typeof body.fecha !== 'string') {
    return errorResponse('Debes indicar una fecha válida para el plan', 400)
  }

  const date = new Date(`${body.fecha}T00:00:00.000Z`)
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== body.fecha) {
    return errorResponse('La fecha debe tener el formato YYYY-MM-DD', 400)
  }

  const threshold = body.umbral === undefined ? 60 : body.umbral
  if (!isFiniteNumber(threshold) || threshold < 60 || threshold > 100) {
    return errorResponse('El umbral debe estar entre 60 y 100', 400)
  }

  const optimizerUrl = process.env.OPTIMIZER_URL
  if (!optimizerUrl) return errorResponse('El optimizador no está configurado', 500)

  try {
    const client = getSupabase()
    const [containersResult, vehiclesResult, sitesResult] = await Promise.all([
      client
        .from('contenedores')
        .select('*')
        .eq('activo', true)
        .gte('nivel_llenado', threshold),
      client.from('vehiculos').select('*').eq('estado', 'disponible'),
      client.from('sitios').select('*').order('nombre'),
    ])

    if (containersResult.error) throw new Error(containersResult.error.message)
    if (vehiclesResult.error) throw new Error(vehiclesResult.error.message)
    if (sitesResult.error) throw new Error(sitesResult.error.message)

    const containers = containersResult.data
    const vehicles = vehiclesResult.data
    const depot = sitesResult.data.find((site) => site.tipo === 'cochera')
    const dump = sitesResult.data.find((site) => site.tipo === 'botadero')

    if (!depot || !dump) {
      return errorResponse('Debes registrar una cochera y un botadero para generar rutas', 422)
    }
    if (vehicles.length === 0) {
      return errorResponse('No hay vehículos disponibles para generar el plan', 422)
    }
    if (containers.length === 0) {
      return errorResponse('No hay contenedores activos que alcancen el umbral indicado', 422)
    }

    let optimizerResponse: Response
    try {
      optimizerResponse = await fetch(new URL('/optimize', optimizerUrl), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deposito: { id: depot.id, lat: depot.lat, lng: depot.lng },
          botadero: { id: dump.id, lat: dump.lat, lng: dump.lng },
          vehiculos: vehicles.map((vehicle) => ({
            id: vehicle.id,
            capacidad_m3: vehicle.capacidad_m3,
          })),
          contenedores: containers.map((container) => ({
            id: container.id,
            lat: container.lat,
            lng: container.lng,
            volumen_m3: volumeM3(container),
          })),
        }),
        signal: AbortSignal.timeout(30_000),
      })
    } catch (error) {
      console.error('POST /api/planes: no se pudo conectar con el optimizador', error)
      return errorResponse('No se pudo conectar con el servicio de optimización', 502)
    }

    if (!optimizerResponse.ok) {
      console.error('POST /api/planes: optimizador respondió', optimizerResponse.status)
      return errorResponse('El servicio de optimización no pudo generar el plan', 502)
    }

    let optimizerBody: unknown
    try {
      optimizerBody = await optimizerResponse.json()
    } catch (error) {
      console.error('POST /api/planes: respuesta JSON inválida del optimizador', error)
      return errorResponse('El servicio de optimización devolvió una respuesta inválida', 502)
    }

    if (!isOptimizerResult(optimizerBody)) {
      return errorResponse('El servicio de optimización devolvió datos incompletos', 502)
    }

    const vehicleById = new Map<string, Vehiculo>(vehicles.map((vehicle) => [vehicle.id, vehicle]))
    const containerById = new Map<string, Contenedor>(
      containers.map((container) => [container.id, container]),
    )
    const assignedIds = new Set<string>()
    const routeVehicleIds = new Set<string>()

    for (const route of optimizerBody.rutas) {
      const vehicle = vehicleById.get(route.vehiculo_id)
      if (!vehicle || routeVehicleIds.has(route.vehiculo_id)) {
        return errorResponse('El optimizador asignó un vehículo inválido o duplicado', 502)
      }
      routeVehicleIds.add(route.vehiculo_id)

      let routeLoad = 0
      for (const containerId of route.secuencia) {
        const container = containerById.get(containerId)
        if (!container || assignedIds.has(containerId)) {
          return errorResponse('El optimizador devolvió contenedores inválidos o duplicados', 502)
        }
        assignedIds.add(containerId)
        routeLoad += volumeM3(container)
      }
      if (routeLoad > vehicle.capacidad_m3 + 1e-6) {
        return errorResponse('El optimizador excedió la capacidad de un vehículo', 502)
      }
    }

    const deferredIds = new Set(optimizerBody.no_asignados)
    for (const id of deferredIds) {
      if (!containerById.has(id) || assignedIds.has(id)) {
        return errorResponse('El optimizador devolvió contenedores diferidos inválidos', 502)
      }
    }
    for (const container of containers) {
      if (!assignedIds.has(container.id)) deferredIds.add(container.id)
    }

    const ahorroPct =
      optimizerBody.km_baseline === 0
        ? 0
        : ((optimizerBody.km_baseline - optimizerBody.km_total) / optimizerBody.km_baseline) * 100

    const { data: plan, error: planError } = await client
      .from('planes')
      .insert({
        fecha: body.fecha,
        estado: 'generado',
        km_optimizado: optimizerBody.km_total,
        km_baseline: optimizerBody.km_baseline,
        ahorro_pct: Number(ahorroPct.toFixed(2)),
      })
      .select()
      .single()

    if (planError) throw new Error(planError.message)

    const savedRoutes: (Ruta & { vehiculo: Vehiculo; paradas: Array<Record<string, unknown>> })[] = []
    const routeIds: string[] = []

    try {
      for (const [index, route] of optimizerBody.rutas.entries()) {
        let cumulativeLoad = 0
        const stops = route.secuencia.map((containerId, stopIndex) => {
          const container = containerById.get(containerId)!
          cumulativeLoad += volumeM3(container)
          return {
            contenedor_id: containerId,
            orden: stopIndex + 1,
            carga_acumulada: cumulativeLoad,
            contenedor: container,
          }
        })

        const { data: savedRoute, error: routeError } = await client
          .from('rutas')
          .insert({
            plan_id: plan.id,
            vehiculo_id: route.vehiculo_id,
            orden_global: index + 1,
            distancia_m: route.distancia_m,
            duracion_s: null,
            carga_total: cumulativeLoad,
            geometria: route.geometria,
          })
          .select()
          .single()

        if (routeError) throw new Error(routeError.message)
        routeIds.push(savedRoute.id)

        const { data: savedStops, error: stopsError } = await client
          .from('paradas')
          .insert(
            stops.map(({ contenedor: _container, ...stop }) => ({
              ruta_id: savedRoute.id,
              contenedor_id: stop.contenedor_id,
              orden: stop.orden,
              carga_acumulada: stop.carga_acumulada,
            })),
          )
          .select()

        if (stopsError) throw new Error(stopsError.message)

        savedRoutes.push({
          ...savedRoute,
          vehiculo: vehicleById.get(route.vehiculo_id)!,
          paradas: (savedStops ?? []).map((stop) => ({
            ...stop,
            contenedor: containerById.get(stop.contenedor_id),
          })),
        })
      }
    } catch (error) {
      console.error('POST /api/planes: no se pudieron guardar las rutas', error)
      await deletePlanData(client, plan.id, routeIds)
      return errorResponse('No se pudo guardar el plan y sus rutas', 500)
    }

    const diferidos = containers.filter((container) => deferredIds.has(container.id))
    return NextResponse.json({ ...plan, rutas: savedRoutes, diferidos }, { status: 201 })
  } catch (error) {
    console.error('POST /api/planes:', error)
    return errorResponse('No se pudo generar el plan', 500)
  }
}