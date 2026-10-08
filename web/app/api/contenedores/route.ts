import { NextRequest, NextResponse } from 'next/server'
import { errorResponse, isFiniteNumber, isRecord } from '@/lib/apiResponse'
import { getSupabase } from '@/lib/supabase'

function validLevel(value: unknown): value is number {
  return isFiniteNumber(value) && value >= 0 && value <= 100
}

function validCoordinate(value: unknown, min: number, max: number): value is number {
  return isFiniteNumber(value) && value >= min && value <= max
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const params = request.nextUrl.searchParams
  const zone = params.get('zona')?.trim()
  const minLevelText = params.get('nivel_min')
  const maxLevelText = params.get('nivel_max')
  const activeText = params.get('activo')
  const minLevel = minLevelText === null ? undefined : Number(minLevelText)
  const maxLevel = maxLevelText === null ? undefined : Number(maxLevelText)

  if (
    (minLevel !== undefined && !validLevel(minLevel)) ||
    (maxLevel !== undefined && !validLevel(maxLevel)) ||
    (minLevel !== undefined && maxLevel !== undefined && minLevel > maxLevel) ||
    (activeText !== null && activeText !== 'true' && activeText !== 'false')
  ) {
    return errorResponse('Los filtros de contenedores no son válidos', 400)
  }

  try {
    let query = getSupabase().from('contenedores').select('*').order('codigo')
    if (zone) query = query.eq('zona', zone)
    if (minLevel !== undefined) query = query.gte('nivel_llenado', minLevel)
    if (maxLevel !== undefined) query = query.lte('nivel_llenado', maxLevel)
    if (activeText !== null) query = query.eq('activo', activeText === 'true')

    const { data, error } = await query
    if (error) {
      console.error('GET /api/contenedores:', error.message)
      return errorResponse('No se pudieron obtener los contenedores', 500)
    }
    return NextResponse.json(data)
  } catch (error) {
    console.error('GET /api/contenedores:', error)
    return errorResponse('No se pudieron obtener los contenedores', 500)
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return errorResponse('El cuerpo de la solicitud debe ser JSON válido', 400)
  }

  if (
    !isRecord(body) ||
    typeof body.codigo !== 'string' ||
    !body.codigo.trim() ||
    typeof body.direccion !== 'string' ||
    !body.direccion.trim() ||
    typeof body.zona !== 'string' ||
    !body.zona.trim() ||
    !validCoordinate(body.lat, -90, 90) ||
    !validCoordinate(body.lng, -180, 180) ||
    !isFiniteNumber(body.capacidad_litros) ||
    body.capacidad_litros <= 0 ||
    !validLevel(body.nivel_llenado) ||
    (body.activo !== undefined && typeof body.activo !== 'boolean')
  ) {
    return errorResponse('Los datos del contenedor no son válidos', 400)
  }

  try {
    const { data, error } = await getSupabase()
      .from('contenedores')
      .insert({
        codigo: body.codigo.trim(),
        direccion: body.direccion.trim(),
        zona: body.zona.trim(),
        lat: body.lat,
        lng: body.lng,
        capacidad_litros: body.capacidad_litros,
        nivel_llenado: body.nivel_llenado,
        activo: body.activo ?? true,
      })
      .select()
      .single()

    if (error) {
      console.error('POST /api/contenedores:', error.message)
      return errorResponse('No se pudo crear el contenedor', 500)
    }
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('POST /api/contenedores:', error)
    return errorResponse('No se pudo crear el contenedor', 500)
  }
}