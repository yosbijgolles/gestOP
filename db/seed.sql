-- Registros y métricas de demostración; las rutas no son una salida del optimizador.
-- Ejecutar después de db/schema.sql. Reejecutable: conserva los mismos IDs usando upsert.
insert into public.sitios (id, tipo, nombre, lat, lng) values
  ('10000000-0000-4000-8000-000000000001', 'cochera', 'Cochera Municipal de Piura', -5.1940, -80.6320),
  ('10000000-0000-4000-8000-000000000002', 'botadero', 'Relleno Sanitario de Piura', -5.1600, -80.5560)
on conflict (id) do update set
  tipo = excluded.tipo,
  nombre = excluded.nombre,
  lat = excluded.lat,
  lng = excluded.lng;

insert into public.vehiculos (id, placa, capacidad_m3, estado, conductor) values
  ('20000000-0000-4000-8000-000000000001', 'EUC-101', 12.00, 'disponible', 'Carlos Ramirez'),
  ('20000000-0000-4000-8000-000000000002', 'EUC-102', 12.00, 'disponible', 'Maria Torres'),
  ('20000000-0000-4000-8000-000000000003', 'EUC-103', 10.00, 'disponible', 'Jose Garcia'),
  ('20000000-0000-4000-8000-000000000004', 'EUC-104', 10.00, 'disponible', 'Ana Castillo'),
  ('20000000-0000-4000-8000-000000000005', 'EUC-105', 8.00, 'disponible', 'Luis Flores')
on conflict (id) do update set
  placa = excluded.placa,
  capacidad_m3 = excluded.capacidad_m3,
  estado = excluded.estado,
  conductor = excluded.conductor;

insert into public.contenedores
  (id, codigo, direccion, zona, lat, lng, capacidad_litros, nivel_llenado, activo)
values
  ('30000000-0000-4000-8000-000000000001', 'CNT-001', 'Av. Grau con Av. Loreto', 'Centro', -5.1948, -80.6305, 1100, 82, true),
  ('30000000-0000-4000-8000-000000000002', 'CNT-002', 'Calle Tacna con Jr. Ica', 'Centro', -5.1917, -80.6280, 1100, 74, true),
  ('30000000-0000-4000-8000-000000000003', 'CNT-003', 'Av. Sanchez Cerro con Av. Vice', 'Noroeste', -5.1870, -80.6440, 1200, 88, true),
  ('30000000-0000-4000-8000-000000000004', 'CNT-004', 'Urb. Los Tallanes, parque principal', 'Noroeste', -5.1810, -80.6380, 1100, 68, true),
  ('30000000-0000-4000-8000-000000000005', 'CNT-005', 'Av. Don Bosco con Av. Sullana', 'Oeste', -5.1980, -80.6500, 1200, 91, true),
  ('30000000-0000-4000-8000-000000000006', 'CNT-006', 'Urb. Santa Ana, calle Las Begonias', 'Oeste', -5.2030, -80.6420, 1100, 77, true),
  ('30000000-0000-4000-8000-000000000007', 'CNT-007', 'Av. Guardia Civil con Av. Circunvalacion', 'Sur', -5.2110, -80.6260, 1100, 71, true),
  ('30000000-0000-4000-8000-000000000008', 'CNT-008', 'Urb. Miraflores, parque central', 'Sur', -5.2160, -80.6190, 1200, 85, true),
  ('30000000-0000-4000-8000-000000000009', 'CNT-009', 'Av. Progreso con calle Libertad, Castilla', 'Castilla', -5.1940, -80.6180, 1100, 66, true),
  ('30000000-0000-4000-8000-000000000010', 'CNT-010', 'Av. Junin con calle Ayacucho, Castilla', 'Castilla', -5.1870, -80.6140, 1100, 80, true)
on conflict (id) do update set
  codigo = excluded.codigo,
  direccion = excluded.direccion,
  zona = excluded.zona,
  lat = excluded.lat,
  lng = excluded.lng,
  capacidad_litros = excluded.capacidad_litros,
  nivel_llenado = excluded.nivel_llenado,
  activo = excluded.activo;

insert into public.planes
  (id, fecha, estado, km_optimizado, km_baseline, ahorro_pct)
values
  ('40000000-0000-4000-8000-000000000001', current_date, 'demo', 38.70, 49.50, 21.82)
on conflict (id) do update set
  fecha = excluded.fecha,
  estado = excluded.estado,
  km_optimizado = excluded.km_optimizado,
  km_baseline = excluded.km_baseline,
  ahorro_pct = excluded.ahorro_pct;

insert into public.rutas
  (id, plan_id, vehiculo_id, orden_global, distancia_m, duracion_s, carga_total, geometria)
values
  (
    '50000000-0000-4000-8000-000000000001',
    '40000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    1, 7300, null, 1.716,
    '{"type":"LineString","coordinates":[[-80.6320,-5.1940],[-80.6305,-5.1948],[-80.6280,-5.1917],[-80.5560,-5.1600]]}'::jsonb
  ),
  (
    '50000000-0000-4000-8000-000000000002',
    '40000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000002',
    2, 8100, null, 1.804,
    '{"type":"LineString","coordinates":[[-80.6320,-5.1940],[-80.6440,-5.1870],[-80.6380,-5.1810],[-80.5560,-5.1600]]}'::jsonb
  ),
  (
    '50000000-0000-4000-8000-000000000003',
    '40000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000003',
    3, 6900, null, 1.939,
    '{"type":"LineString","coordinates":[[-80.6320,-5.1940],[-80.6500,-5.1980],[-80.6420,-5.2030],[-80.5560,-5.1600]]}'::jsonb
  ),
  (
    '50000000-0000-4000-8000-000000000004',
    '40000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000004',
    4, 8800, null, 1.80,
    '{"type":"LineString","coordinates":[[-80.6320,-5.1940],[-80.6260,-5.2110],[-80.6190,-5.2160],[-80.5560,-5.1600]]}'::jsonb
  ),
  (
    '50000000-0000-4000-8000-000000000005',
    '40000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000005',
    5, 7600, null, 1.61,
    '{"type":"LineString","coordinates":[[-80.6320,-5.1940],[-80.6180,-5.1940],[-80.6140,-5.1870],[-80.5560,-5.1600]]}'::jsonb
  )
on conflict (id) do update set
  plan_id = excluded.plan_id,
  vehiculo_id = excluded.vehiculo_id,
  orden_global = excluded.orden_global,
  distancia_m = excluded.distancia_m,
  duracion_s = excluded.duracion_s,
  carga_total = excluded.carga_total,
  geometria = excluded.geometria;

insert into public.paradas
  (id, ruta_id, contenedor_id, orden, carga_acumulada)
values
  ('60000000-0000-4000-8000-000000000001', '50000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001', 1, 0.902),
  ('60000000-0000-4000-8000-000000000002', '50000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000002', 2, 1.716),
  ('60000000-0000-4000-8000-000000000003', '50000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000003', 1, 1.056),
  ('60000000-0000-4000-8000-000000000004', '50000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000004', 2, 1.804),
  ('60000000-0000-4000-8000-000000000005', '50000000-0000-4000-8000-000000000003', '30000000-0000-4000-8000-000000000005', 1, 1.092),
  ('60000000-0000-4000-8000-000000000006', '50000000-0000-4000-8000-000000000003', '30000000-0000-4000-8000-000000000006', 2, 1.939),
  ('60000000-0000-4000-8000-000000000007', '50000000-0000-4000-8000-000000000004', '30000000-0000-4000-8000-000000000007', 1, 0.781),
  ('60000000-0000-4000-8000-000000000008', '50000000-0000-4000-8000-000000000004', '30000000-0000-4000-8000-000000000008', 2, 1.801),
  ('60000000-0000-4000-8000-000000000009', '50000000-0000-4000-8000-000000000005', '30000000-0000-4000-8000-000000000009', 1, 0.726),
  ('60000000-0000-4000-8000-000000000010', '50000000-0000-4000-8000-000000000005', '30000000-0000-4000-8000-000000000010', 2, 1.606)
on conflict (id) do update set
  ruta_id = excluded.ruta_id,
  contenedor_id = excluded.contenedor_id,
  orden = excluded.orden,
  carga_acumulada = excluded.carga_acumulada;