create table if not exists public.sitios (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('cochera', 'botadero')),
  nombre text not null,
  lat double precision not null check (lat between -90 and 90),
  lng double precision not null check (lng between -180 and 180)
);

create unique index if not exists sitios_un_tipo_idx on public.sitios (tipo);

create table if not exists public.vehiculos (
  id uuid primary key default gen_random_uuid(),
  placa text not null unique,
  capacidad_m3 numeric(8, 2) not null check (capacidad_m3 > 0),
  estado text not null default 'disponible'
    check (estado in ('disponible', 'mantenimiento', 'fuera_servicio')),
  conductor text
);

create table if not exists public.contenedores (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  direccion text not null,
  zona text not null,
  lat double precision not null check (lat between -90 and 90),
  lng double precision not null check (lng between -180 and 180),
  capacidad_litros integer not null check (capacidad_litros > 0),
  nivel_llenado integer not null default 0 check (nivel_llenado between 0 and 100),
  activo boolean not null default true
);

create index if not exists contenedores_zona_idx on public.contenedores (zona);
create index if not exists contenedores_activo_nivel_idx
  on public.contenedores (activo, nivel_llenado);

create table if not exists public.planes (
  id uuid primary key default gen_random_uuid(),
  fecha date not null,
  estado text not null default 'generado' check (estado in ('generado', 'demo')),
  km_optimizado numeric(10, 2) not null check (km_optimizado >= 0),
  km_baseline numeric(10, 2) not null check (km_baseline >= 0),
  ahorro_pct numeric(7, 2) not null,
  creado_en timestamptz not null default now()
);

create table if not exists public.rutas (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.planes (id) on delete cascade,
  vehiculo_id uuid not null references public.vehiculos (id),
  orden_global integer not null check (orden_global > 0),
  distancia_m integer not null check (distancia_m >= 0),
  duracion_s integer check (duracion_s is null or duracion_s >= 0),
  carga_total numeric(8, 3) not null check (carga_total >= 0),
  geometria jsonb not null,
  unique (plan_id, vehiculo_id),
  unique (plan_id, orden_global)
);

create table if not exists public.paradas (
  id uuid primary key default gen_random_uuid(),
  ruta_id uuid not null references public.rutas (id) on delete cascade,
  contenedor_id uuid not null references public.contenedores (id),
  orden integer not null check (orden > 0),
  carga_acumulada numeric(8, 3) not null check (carga_acumulada >= 0),
  unique (ruta_id, orden),
  unique (ruta_id, contenedor_id)
);

create index if not exists rutas_plan_idx on public.rutas (plan_id, orden_global);
create index if not exists paradas_ruta_idx on public.paradas (ruta_id, orden);

-- El prototipo aún no implementa autenticación; la API usa la clave pública anon.
alter table public.sitios enable row level security;
alter table public.vehiculos enable row level security;
alter table public.contenedores enable row level security;
alter table public.planes enable row level security;
alter table public.rutas enable row level security;
alter table public.paradas enable row level security;

drop policy if exists gestop_demo_api_access on public.sitios;
create policy gestop_demo_api_access on public.sitios
  for all to anon, authenticated using (true) with check (true);

drop policy if exists gestop_demo_api_access on public.vehiculos;
create policy gestop_demo_api_access on public.vehiculos
  for all to anon, authenticated using (true) with check (true);

drop policy if exists gestop_demo_api_access on public.contenedores;
create policy gestop_demo_api_access on public.contenedores
  for all to anon, authenticated using (true) with check (true);

drop policy if exists gestop_demo_api_access on public.planes;
create policy gestop_demo_api_access on public.planes
  for all to anon, authenticated using (true) with check (true);

drop policy if exists gestop_demo_api_access on public.rutas;
create policy gestop_demo_api_access on public.rutas
  for all to anon, authenticated using (true) with check (true);

drop policy if exists gestop_demo_api_access on public.paradas;
create policy gestop_demo_api_access on public.paradas
  for all to anon, authenticated using (true) with check (true);

grant select, insert, update, delete
  on public.sitios, public.vehiculos, public.contenedores, public.planes, public.rutas, public.paradas
  to anon, authenticated;

notify pgrst, 'reload schema';