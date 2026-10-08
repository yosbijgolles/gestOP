import { NextResponse } from 'next/server'
import { errorResponse } from '@/lib/api'
import { getSupabase } from '@/lib/supabase'
import type { Parada, Vehiculo } from '@/lib/types'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: RouteContext): Promise<NextResponse> {
  const { id } = await params
  if (!id.trim()) return errorResponse('El id del plan es obligatorio', 400)

  try {
    const client = getSupabase()
    const { data: plan, error: planError } = await client
      .from('planes')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (planError) {
      console.error('GET /api/planes/[id]:', planError.message)
      return errorResponse('No se pudo obtener el plan', 500)
    }
    if (!plan) return errorResponse('No se encontró el plan', 404)

    const { data: routes, error: routesError } = await client
      .from('rutas')
      .select('*')
      .eq('plan_id', id)
      .order('orden_global')

    if (routesError) {
      console.error('GET /api/planes/[id]:', routesError.message)
      return errorResponse('No se pudieron obtener las rutas del plan', 500)
    }

    const routeIds = routes.map((route) => route.id)
    let stops: Parada[] = []
    let vehicles: Vehiculo[] = []

    if (routeIds.length > 0) {
      const vehicleIds = Array.from(new Set(routes.map((route) => route.vehiculo_id)))
      const [stopsResult, vehiclesResult] = await Promise.all([
        client.from('paradas').select('*').in('ruta_id', routeIds).order('orden'),
        client.from('vehiculos').select('*').in('id', vehicleIds),
      ])

      if (stopsResult.error) {
        console.error('GET /api/planes/[id]:', stopsResult.error.message)
        return errorResponse('No se pudieron obtener las paradas del plan', 500)
      }
      if (vehiclesResult.error) {
        console.error('GET /api/planes/[id]:', vehiclesResult.error.message)
        return errorResponse('No se pudieron obtener los vehículos del plan', 500)
      }
      stops = stopsResult.data
      vehicles = vehiclesResult.data
    }

    const stopContainerIds = Array.from(new Set(stops.map((stop) => stop.contenedor_id)))
    const { data: containers, error: containersError } =
      stopContainerIds.length > 0
        ? await client.from('contenedores').select('*').in('id', stopContainerIds)
        : { data: [], error: null }

    if (containersError) {
      console.error('GET /api/planes/[id]:', containersError.message)
      return errorResponse('No se pudieron obtener los contenedores del plan', 500)
    }

    const vehicleById = new Map(vehicles.map((vehicle) => [vehicle.id, vehicle]))
    const containerById = new Map((containers ?? []).map((container) => [container.id, container]))
    const stopsByRoute = new Map<string, Parada[]>()

    for (const stop of stops) {
      const routeStops = stopsByRoute.get(stop.ruta_id) ?? []
      routeStops.push(stop)
      stopsByRoute.set(stop.ruta_id, routeStops)
    }

    const assignedIds = new Set(stopContainerIds)
    const { data: currentlyEligible, error: eligibleError } = await client
      .from('contenedores')
      .select('*')
      .eq('activo', true)
      .gte('nivel_llenado', 60)

    if (eligibleError) {
      console.error('GET /api/planes/[id]:', eligibleError.message)
      return errorResponse('No se pudieron obtener los contenedores diferidos', 500)
    }

    return NextResponse.json({
      ...plan,
      rutas: routes.map((route) => ({
        ...route,
        vehiculo: vehicleById.get(route.vehiculo_id) ?? null,
        paradas: (stopsByRoute.get(route.id) ?? []).map((stop) => ({
          ...stop,
          contenedor: containerById.get(stop.contenedor_id) ?? null,
        })),
      })),
      diferidos: currentlyEligible.filter((container) => !assignedIds.has(container.id)),
    })
  } catch (error) {
    console.error('GET /api/planes/[id]:', error)
    return errorResponse('No se pudo obtener el plan', 500)
  }
}
