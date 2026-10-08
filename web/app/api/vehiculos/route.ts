import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { VEHICULOS_MOCK } from '@/lib/mockData';

export async function GET() {
  try {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('vehiculos').select('*').order('placa');
      if (!error && data && data.length > 0) {
        return NextResponse.json(data);
      }
    }

    return NextResponse.json(VEHICULOS_MOCK);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
