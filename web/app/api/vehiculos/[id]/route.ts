import { NextRequest, NextResponse } from 'next/server'
import { errorResponse, isRecord } from '@/lib/apiResponse'
import { getSupabase } from '@/lib/supabase'
import type { VehiculoEstado } from '@/lib/types'

type RouteContext = { params: Promise<{ id: string }> }

function isVehiculoEstado(value: unknown): value is VehiculoEstado {
  return value === 'disponible' || value === 'mantenimiento' || value === 'fuera_servicio'
}

export async function PATCH(request: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  const { id } = await params
  if (!id.trim()) return errorResponse('El id del vehículo es obligatorio', 400)

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return errorResponse('El cuerpo de la solicitud debe ser JSON válido', 400)
  }

  if (!isRecord(body) || !isVehiculoEstado(body.estado)) {
    return errorResponse('El estado del vehículo no es válido', 400)
  }

  try {
    const { data, error } = await getSupabase()
      .from('vehiculos')
      .update({ estado: body.estado })
      .eq('id', id)
      .select()
      .maybeSingle()

    if (error) {
      console.error('PATCH /api/vehiculos/[id]:', error.message)
      return errorResponse('No se pudo actualizar el vehículo', 500)
    }
    if (!data) return errorResponse('No se encontró el vehículo', 404)
    return NextResponse.json(data)
  } catch (error) {
    console.error('PATCH /api/vehiculos/[id]:', error)
    return errorResponse('No se pudo actualizar el vehículo', 500)
  }
}
