import { NextRequest, NextResponse } from 'next/server'
import { errorResponse, isFiniteNumber, isRecord } from '@/lib/api'
import { getSupabase } from '@/lib/supabase'
import type { Contenedor } from '@/lib/types'

type RouteContext = { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  const { id } = await params
  if (!id.trim()) return errorResponse('El id del contenedor es obligatorio', 400)

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return errorResponse('El cuerpo de la solicitud debe ser JSON válido', 400)
  }

  if (!isRecord(body)) return errorResponse('Los datos del contenedor no son válidos', 400)

  const changes: Partial<Omit<Contenedor, 'id'>> = {}
  for (const field of ['codigo', 'direccion', 'zona'] as const) {
    if (field in body) {
      if (typeof body[field] !== 'string' || !body[field].trim()) {
        return errorResponse(`El campo ${field} no es válido`, 400)
      }
      changes[field] = body[field].trim()
    }
  }

  if ('lat' in body) {
    if (!isFiniteNumber(body.lat) || body.lat < -90 || body.lat > 90) {
      return errorResponse('La latitud no es válida', 400)
    }
    changes.lat = body.lat
  }
  if ('lng' in body) {
    if (!isFiniteNumber(body.lng) || body.lng < -180 || body.lng > 180) {
      return errorResponse('La longitud no es válida', 400)
    }
    changes.lng = body.lng
  }
  if ('capacidad_litros' in body) {
    if (!isFiniteNumber(body.capacidad_litros) || body.capacidad_litros <= 0) {
      return errorResponse('La capacidad no es válida', 400)
    }
    changes.capacidad_litros = body.capacidad_litros
  }
  if ('nivel_llenado' in body) {
    if (!isFiniteNumber(body.nivel_llenado) || body.nivel_llenado < 0 || body.nivel_llenado > 100) {
      return errorResponse('El nivel de llenado debe estar entre 0 y 100', 400)
    }
    changes.nivel_llenado = body.nivel_llenado
  }
  if ('activo' in body) {
    if (typeof body.activo !== 'boolean') return errorResponse('El estado activo no es válido', 400)
    changes.activo = body.activo
  }

  if (Object.keys(changes).length === 0) {
    return errorResponse('Debes indicar al menos un campo para actualizar', 400)
  }

  try {
    const { data, error } = await getSupabase()
      .from('contenedores')
      .update(changes)
      .eq('id', id)
      .select()
      .maybeSingle()

    if (error) {
      console.error('PATCH /api/contenedores/[id]:', error.message)
      return errorResponse('No se pudo actualizar el contenedor', 500)
    }
    if (!data) return errorResponse('No se encontró el contenedor', 404)
    return NextResponse.json(data)
  } catch (error) {
    console.error('PATCH /api/contenedores/[id]:', error)
    return errorResponse('No se pudo actualizar el contenedor', 500)
  }
}
