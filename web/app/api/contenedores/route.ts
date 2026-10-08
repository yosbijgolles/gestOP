import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { CONTENEDORES_MOCK } from '@/lib/mockData';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const zona = searchParams.get('zona');
    const nivelMin = searchParams.get('nivel_min');

    if (isSupabaseConfigured && supabase) {
      let query = supabase.from('contenedores').select('*').order('codigo');
      if (zona) query = query.eq('zona', zona);
      if (nivelMin) query = query.gte('nivel_llenado', Number(nivelMin));

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return NextResponse.json(data);
      }
    }

    // Fallback a mock data
    let list = [...CONTENEDORES_MOCK];
    if (zona) list = list.filter((c) => c.zona.toLowerCase() === zona.toLowerCase());
    if (nivelMin) list = list.filter((c) => c.nivel_llenado >= Number(nivelMin));

    return NextResponse.json(list);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('contenedores').insert([body]).select();
      if (error) throw error;
      return NextResponse.json(data[0], { status: 201 });
    }

    const nuevo = { id: `c-${Date.now()}`, ...body };
    return NextResponse.json(nuevo, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
