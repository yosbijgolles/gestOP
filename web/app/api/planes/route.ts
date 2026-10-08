import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { PLAN_DEMO_MOCK, CONTENEDORES_MOCK, VEHICULOS_MOCK, SITIOS_MOCK } from '@/lib/mockData';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const fecha = body.fecha || new Date().toISOString().split('T')[0];
    const umbral = body.umbral_llenado || 60;

    // Si OPTIMIZER_URL está configurado, podemos intentar contactar a FastAPI /optimize
    const optimizerUrl = process.env.OPTIMIZER_URL;
    if (optimizerUrl && !optimizerUrl.includes('<tu-')) {
      try {
        const cochera = SITIOS_MOCK.find((s) => s.tipo === 'cochera')!;
        const botadero = SITIOS_MOCK.find((s) => s.tipo === 'botadero')!;
        const vehiculosDisponibles = VEHICULOS_MOCK.filter((v) => v.estado === 'disponible');
        const contenedoresCandidatos = CONTENEDORES_MOCK.filter(
          (c) => c.activo && c.nivel_llenado >= umbral
        );

        const payload = {
          deposito: { id: cochera.id, lat: cochera.lat, lng: cochera.lng },
          botadero: { id: botadero.id, lat: botadero.lat, lng: botadero.lng },
          vehiculos: vehiculosDisponibles.map((v) => ({ id: v.id, capacidad_m3: v.capacidad_m3 })),
          contenedores: contenedoresCandidatos.map((c) => ({
            id: c.id,
            lat: c.lat,
            lng: c.lng,
            volumen_m3: Number((c.capacidad_litros / 1000).toFixed(2)),
          })),
        };

        const optRes = await fetch(`${optimizerUrl}/optimize`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (optRes.ok) {
          const optData = await optRes.json();
          const planCalculado = {
            id: `plan-${Date.now()}`,
            fecha,
            estado: 'confirmado',
            km_optimizado: optData.km_total,
            km_baseline: optData.km_baseline,
            ahorro_pct: Number(
              (((optData.km_baseline - optData.km_total) / optData.km_baseline) * 100).toFixed(1)
            ),
            rutas: optData.rutas,
            no_asignados: optData.no_asignados,
            creado_en: new Date().toISOString(),
          };
          return NextResponse.json(planCalculado);
        }
      } catch (optErr) {
        console.warn('Error llamando a OPTIMIZER_URL, cayendo a generador interno:', optErr);
      }
    }

    // Generador de fallback con datos realistas
    const plan = {
      ...PLAN_DEMO_MOCK,
      id: `plan-${Date.now()}`,
      fecha,
    };

    return NextResponse.json(plan);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json(PLAN_DEMO_MOCK);
}
