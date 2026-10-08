import { NextResponse } from 'next/server'
import { errorResponse } from '@/lib/api'
import { getSupabase } from '@/lib/supabase'

export async function GET(): Promise<NextResponse> {
  try {
    const { data, error } = await getSupabase()
      .from('vehiculos')
      .select('*')
      .order('placa')

    if (error) {
      console.error('GET /api/vehiculos:', error.message)
      return errorResponse('No se pudieron obtener los vehículos', 500)
    }
    return NextResponse.json(data)
  } catch (error) {
    console.error('GET /api/vehiculos:', error)
    return errorResponse('No se pudieron obtener los vehículos', 500)
  }
}