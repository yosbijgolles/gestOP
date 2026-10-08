import { Contenedor, Vehiculo, Sitio, Plan } from './types';
import realRoutes from './realRoutes.json';

export const SITIOS_MOCK: Sitio[] = [
  {
    id: 'cochera-1',
    tipo: 'cochera',
    nombre: 'Base Maestranza Municipal (Cochera)',
    lat: -5.1940,
    lng: -80.6320,
  },
  {
    id: 'botadero-1',
    tipo: 'botadero',
    nombre: 'Relleno Sanitario Municipal de Piura',
    lat: -5.1600,
    lng: -80.5560,
  },
];

export const VEHICULOS_MOCK: Vehiculo[] = [
  {
    id: 'v1',
    placa: 'EGA-492',
    capacidad_m3: 15.0,
    estado: 'disponible',
    conductor: 'Carlos Mendoza Ramos',
  },
  {
    id: 'v2',
    placa: 'P1A-821',
    capacidad_m3: 12.0,
    estado: 'disponible',
    conductor: 'Jorge Farfán Silva',
  },
  {
    id: 'v3',
    placa: 'T3C-710',
    capacidad_m3: 12.0,
    estado: 'disponible',
    conductor: 'Manuel Chunga Vite',
  },
  {
    id: 'v4',
    placa: 'D9F-341',
    capacidad_m3: 10.0,
    estado: 'mantenimiento',
    conductor: 'Víctor Morales Pacherres',
  },
  {
    id: 'v5',
    placa: 'B2X-109',
    capacidad_m3: 15.0,
    estado: 'disponible',
    conductor: 'Santos Yarlequé Navarro',
  },
];

export const CONTENEDORES_MOCK: Contenedor[] = [
  // Zona Centro
  { id: 'c01', codigo: 'CNT-001', direccion: 'Plaza de Armas / Jr. Huancavelica', zona: 'Centro', lat: -5.1972, lng: -80.6271, capacidad_litros: 1100, nivel_llenado: 85, activo: true },
  { id: 'c02', codigo: 'CNT-002', direccion: 'Av. Grau / Jr. Tacna', zona: 'Centro', lat: -5.1985, lng: -80.6290, capacidad_litros: 1100, nivel_llenado: 92, activo: true },
  { id: 'c03', codigo: 'CNT-003', direccion: 'Jr. Ayacucho / Jr. Libertad', zona: 'Centro', lat: -5.1958, lng: -80.6255, capacidad_litros: 1100, nivel_llenado: 78, activo: true },
  { id: 'c04', codigo: 'CNT-004', direccion: 'Jr. Ica / Av. Loreto', zona: 'Centro', lat: -5.1942, lng: -80.6305, capacidad_litros: 1100, nivel_llenado: 64, activo: true },
  { id: 'c05', codigo: 'CNT-005', direccion: 'Mercado Modelo / Jr. Gonzalo Farfán', zona: 'Centro', lat: -5.2010, lng: -80.6315, capacidad_litros: 1100, nivel_llenado: 95, activo: true },
  { id: 'c06', codigo: 'CNT-006', direccion: 'Av. Sánchez Cerro / Jr. Cuzco', zona: 'Centro', lat: -5.1925, lng: -80.6288, capacidad_litros: 1100, nivel_llenado: 88, activo: true },
  { id: 'c07', codigo: 'CNT-007', direccion: 'Jr. Arequipa / Jr. Callao', zona: 'Centro', lat: -5.1960, lng: -80.6240, capacidad_litros: 1100, nivel_llenado: 45, activo: true },
  { id: 'c08', codigo: 'CNT-008', direccion: 'Malecón Eguiguren / Puente Bolognesi', zona: 'Centro', lat: -5.1990, lng: -80.6235, capacidad_litros: 1100, nivel_llenado: 70, activo: true },
  { id: 'c09', codigo: 'CNT-009', direccion: 'Av. Grau / Av. Gulman', zona: 'Centro', lat: -5.2025, lng: -80.6350, capacidad_litros: 1100, nivel_llenado: 82, activo: true },
  { id: 'c10', codigo: 'CNT-010', direccion: 'Plazuela Merino / Jr. Libertad', zona: 'Centro', lat: -5.1935, lng: -80.6260, capacidad_litros: 1100, nivel_llenado: 55, activo: true },

  // Castilla
  { id: 'c11', codigo: 'CNT-011', direccion: 'Plaza Luis Montero / Castilla', zona: 'Castilla', lat: -5.1980, lng: -80.6185, capacidad_litros: 1100, nivel_llenado: 89, activo: true },
  { id: 'c12', codigo: 'CNT-012', direccion: 'Av. Ramón Castilla / Jr. Tacna', zona: 'Castilla', lat: -5.2015, lng: -80.6170, capacidad_litros: 1100, nivel_llenado: 74, activo: true },
  { id: 'c13', codigo: 'CNT-013', direccion: 'Mercado de Castilla / Av. Guardia Civil', zona: 'Castilla', lat: -5.2045, lng: -80.6195, capacidad_litros: 1100, nivel_llenado: 96, activo: true },
  { id: 'c14', codigo: 'CNT-014', direccion: 'Av. Junín / Jr. Ayacucho', zona: 'Castilla', lat: -5.1965, lng: -80.6160, capacidad_litros: 1100, nivel_llenado: 62, activo: true },
  { id: 'c15', codigo: 'CNT-015', direccion: 'Malecón María Auxiliadora', zona: 'Castilla', lat: -5.2000, lng: -80.6210, capacidad_litros: 1100, nivel_llenado: 40, activo: true },
  { id: 'c16', codigo: 'CNT-016', direccion: 'Urb. Miraflores / Calle Las Dalias', zona: 'Castilla', lat: -5.1890, lng: -80.6140, capacidad_litros: 1100, nivel_llenado: 77, activo: true },
  { id: 'c17', codigo: 'CNT-017', direccion: 'Av. Independencia / Ovalo El Chira', zona: 'Castilla', lat: -5.1930, lng: -80.6115, capacidad_litros: 1100, nivel_llenado: 68, activo: true },
  { id: 'c18', codigo: 'CNT-018', direccion: 'Hospital Cayetano Heredia / Av. Guardia Civil', zona: 'Castilla', lat: -5.2060, lng: -80.6145, capacidad_litros: 1100, nivel_llenado: 84, activo: true },
  { id: 'c19', codigo: 'CNT-019', direccion: 'Urb. El Bosque / Calle Los Cedros', zona: 'Castilla', lat: -5.1915, lng: -80.6190, capacidad_litros: 1100, nivel_llenado: 35, activo: true },
  { id: 'c20', codigo: 'CNT-020', direccion: 'Av. Progreso / Puente Independencia', zona: 'Castilla', lat: -5.2110, lng: -80.6180, capacidad_litros: 1100, nivel_llenado: 91, activo: true },

  // Veintiséis de Octubre
  { id: 'c21', codigo: 'CNT-021', direccion: 'Av. Grau / Av. Chulucanas', zona: 'Veintiséis de Octubre', lat: -5.1980, lng: -80.6550, capacidad_litros: 1100, nivel_llenado: 90, activo: true },
  { id: 'c22', codigo: 'CNT-022', direccion: 'Mercado Santa Rosa / Calle 5', zona: 'Veintiséis de Octubre', lat: -5.2030, lng: -80.6510, capacidad_litros: 1100, nivel_llenado: 94, activo: true },
  { id: 'c23', codigo: 'CNT-023', direccion: 'Av. Sánchez Cerro / Av. Gullman', zona: 'Veintiséis de Octubre', lat: -5.1890, lng: -80.6410, capacidad_litros: 1100, nivel_llenado: 67, activo: true },
  { id: 'c24', codigo: 'CNT-024', direccion: 'Urb. Santa Margarita / Av. Los Diamantes', zona: 'Veintiséis de Octubre', lat: -5.1850, lng: -80.6650, capacidad_litros: 1100, nivel_llenado: 81, activo: true },
  { id: 'c25', codigo: 'CNT-025', direccion: 'Av. Don Bosco (Circunvalación) / Calle 12', zona: 'Veintiséis de Octubre', lat: -5.2070, lng: -80.6470, capacidad_litros: 1100, nivel_llenado: 73, activo: true },
  { id: 'c26', codigo: 'CNT-026', direccion: 'Parque Ecológico Kurt Beer / Av. Grau', zona: 'Veintiséis de Octubre', lat: -5.2150, lng: -80.6580, capacidad_litros: 1100, nivel_llenado: 50, activo: true },
  { id: 'c27', codigo: 'CNT-027', direccion: 'A.H. San Sebastián / Mz. B', zona: 'Veintiséis de Octubre', lat: -5.1950, lng: -80.6620, capacidad_litros: 1100, nivel_llenado: 86, activo: true },
  { id: 'c28', codigo: 'CNT-028', direccion: 'Av. César Vallejo / Calle Las Palmeras', zona: 'Veintiséis de Octubre', lat: -5.2010, lng: -80.6430, capacidad_litros: 1100, nivel_llenado: 63, activo: true },
  { id: 'c29', codigo: 'CNT-029', direccion: 'A.H. Enace / Sector 3', zona: 'Veintiséis de Octubre', lat: -5.2100, lng: -80.6520, capacidad_litros: 1100, nivel_llenado: 88, activo: true },
  { id: 'c30', codigo: 'CNT-030', direccion: 'Av. Los Algarrobos / Calle 2', zona: 'Veintiséis de Octubre', lat: -5.1820, lng: -80.6480, capacidad_litros: 1100, nivel_llenado: 58, activo: true },

  // Urb. San Eduardo & Los Ejidos
  { id: 'c31', codigo: 'CNT-031', direccion: 'Av. Fortunato Chirichigno / UDEP', zona: 'Los Ejidos', lat: -5.1760, lng: -80.6295, capacidad_litros: 1100, nivel_llenado: 79, activo: true },
  { id: 'c32', codigo: 'CNT-032', direccion: 'Av. Los Tallanes / Urb. San Eduardo', zona: 'Los Ejidos', lat: -5.1815, lng: -80.6270, capacidad_litros: 1100, nivel_llenado: 83, activo: true },
  { id: 'c33', codigo: 'CNT-033', direccion: 'Av. Ramón Mujica / Gobierno Regional', zona: 'Los Ejidos', lat: -5.1860, lng: -80.6310, capacidad_litros: 1100, nivel_llenado: 66, activo: true },
  { id: 'c34', codigo: 'CNT-034', direccion: 'Colegio Turicará / Los Ejidos', zona: 'Los Ejidos', lat: -5.1680, lng: -80.6350, capacidad_litros: 1100, nivel_llenado: 48, activo: true },
  { id: 'c35', codigo: 'CNT-035', direccion: 'Av. San Josemaría Escrivá / UDEP Portón 2', zona: 'Los Ejidos', lat: -5.1720, lng: -80.6260, capacidad_litros: 1100, nivel_llenado: 71, activo: true },

  // Santa Clara / Bancarios
  { id: 'c36', codigo: 'CNT-036', direccion: 'Urb. Santa Clara / Calle Los Tulipanes', zona: 'Centro', lat: -5.1895, lng: -80.6350, capacidad_litros: 1100, nivel_llenado: 93, activo: true },
  { id: 'c37', codigo: 'CNT-037', direccion: 'Av. Los Cocos / Club Grau', zona: 'Centro', lat: -5.1920, lng: -80.6375, capacidad_litros: 1100, nivel_llenado: 61, activo: true },
  { id: 'c38', codigo: 'CNT-038', direccion: 'Urb. Clark / Calle Tacna Norte', zona: 'Centro', lat: -5.1880, lng: -80.6320, capacidad_litros: 1100, nivel_llenado: 38, activo: true },
  { id: 'c39', codigo: 'CNT-039', direccion: 'Av. Cáceres / Real Plaza Piura', zona: 'Centro', lat: -5.1830, lng: -80.6400, capacidad_litros: 1100, nivel_llenado: 91, activo: true },
  { id: 'c40', codigo: 'CNT-040', direccion: 'Ovalo Cáceres / Av. Vice', zona: 'Centro', lat: -5.1865, lng: -80.6440, capacidad_litros: 1100, nivel_llenado: 87, activo: true },
];

export const PLAN_DEMO_MOCK: Plan = {
  id: 'plan-demo-01',
  fecha: new Date().toISOString().split('T')[0],
  estado: 'confirmado',
  km_optimizado: Number(((realRoutes.r1.dist + realRoutes.r2.dist + realRoutes.r3.dist) / 1000).toFixed(1)),
  km_baseline: Number((((realRoutes.r1.dist + realRoutes.r2.dist + realRoutes.r3.dist) * 1.45) / 1000).toFixed(1)),
  ahorro_pct: 31.0,
  creado_en: new Date().toISOString(),
  no_asignados: ['c27', 'c29'], // Contenedores diferidos de muestra
  rutas: [
    {
      id: 'ruta-v1',
      vehiculo_id: 'v1',
      distancia_m: realRoutes.r1.dist,
      carga_total: 13.8,
      secuencia: ['c01', 'c02', 'c05', 'c06', 'c09', 'c36', 'c39', 'c40'],
      geometria: {
        type: 'LineString',
        coordinates: realRoutes.r1.coords as [number, number][],
      },
    },
    {
      id: 'ruta-v2',
      vehiculo_id: 'v2',
      distancia_m: realRoutes.r2.dist,
      carga_total: 11.2,
      secuencia: ['c11', 'c12', 'c13', 'c14', 'c16', 'c18', 'c20'],
      geometria: {
        type: 'LineString',
        coordinates: realRoutes.r2.coords as [number, number][],
      },
    },
    {
      id: 'ruta-v3',
      vehiculo_id: 'v3',
      distancia_m: realRoutes.r3.dist,
      carga_total: 11.6,
      secuencia: ['c21', 'c22', 'c23', 'c24', 'c25', 'c28', 'c31', 'c32'],
      geometria: {
        type: 'LineString',
        coordinates: realRoutes.r3.coords as [number, number][],
      },
    },
  ],
};
