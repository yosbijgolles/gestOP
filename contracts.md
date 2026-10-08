# Contratos del backend web

Todas las rutas de la aplicación responden en JSON. Los errores usan `{ "error": "..." }`.

## Contenedores

- `GET /api/contenedores`: devuelve la lista ordenada por código. Filtros opcionales: `zona`, `nivel_min`, `nivel_max` y `activo=true|false`. El nivel debe estar entre 0 y 100.
- `POST /api/contenedores`: recibe `codigo`, `direccion`, `zona`, `lat`, `lng`, `capacidad_litros` y `nivel_llenado`. `activo` es opcional (por defecto `true`). Responde `201` con el registro creado.
- `PATCH /api/contenedores/{id}`: actualiza uno o más campos del registro. Campos permitidos: `codigo`, `direccion`, `zona`, `lat`, `lng`, `capacidad_litros`, `nivel_llenado` y `activo`.

## Vehículos

- `GET /api/vehiculos`: devuelve los vehículos ordenados por placa.
- `PATCH /api/vehiculos/{id}`: recibe `{ "estado": "disponible" | "mantenimiento" | "fuera_servicio" }`.

## Planes

- `POST /api/planes`: recibe `{ "fecha": "YYYY-MM-DD", "umbral": 60 }`; `umbral` es opcional y acepta valores entre 60 y 100. Se consideran solamente contenedores activos cuyo nivel alcance el umbral y vehículos disponibles.
- La API consulta en `sitios` la cochera y el botadero, llama a `POST {OPTIMIZER_URL}/optimize` y guarda el plan, las rutas y sus paradas.
- El volumen enviado al optimizador es `capacidad_litros * nivel_llenado / 100000`, expresado en m³. La API vuelve a validar que ninguna ruta exceda la capacidad de su vehículo.
- El optimizador no entrega duración; `rutas.duracion_s` se guarda como `null` hasta que ese dato forme parte de su contrato.
- La respuesta `201` contiene los campos del plan, `rutas` con sus `paradas` y `diferidos` con los contenedores que no fueron asignados.
- `GET /api/planes/{id}` devuelve los campos del plan, sus rutas, el vehículo y las paradas con su contenedor. `diferidos` se calcula con los contenedores activos que actualmente tienen nivel de llenado de al menos 60% y que no figuran en las paradas; no es una instantánea histórica del momento en que se generó el plan.

Los errores de validación responden `400`, los registros inexistentes `404`, las precondiciones de generación no satisfechas `422`, y los errores de Supabase `500` o del optimizador `502`.

Para este prototipo sin autenticación, `db/schema.sql` permite acceso CRUD a `anon` y `authenticated` mediante RLS. Antes de producción, reemplaza esas políticas abiertas por políticas ligadas a la autenticación y autorización de usuarios.