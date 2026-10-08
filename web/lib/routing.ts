/**
 * Servicio de enrutamiento vial real usando Open Source Routing Machine (OSRM).
 * Convierte una secuencia de paradas [lng, lat] en una ruta vehicular real
 * que sigue calles, avenidas y giros reales de la ciudad.
 */

export interface RouteGeometryResult {
  coordinates: [number, number][];
  distancia_m: number;
}

export async function fetchOSRMRoute(
  waypoints: [number, number][]
): Promise<RouteGeometryResult | null> {
  if (waypoints.length < 2) return null;

  try {
    const coordsStr = waypoints.map((p) => `${p[0]},${p[1]}`).join(';');
    const url = `https://router.project-osrm.org/route/v1/driving/${coordsStr}?overview=full&geometries=geojson`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`OSRM HTTP ${res.status}`);

    const data = await res.json();
    if (data.code === 'Ok' && data.routes && data.routes[0]) {
      const primaryRoute = data.routes[0];
      return {
        coordinates: primaryRoute.geometry.coordinates as [number, number][],
        distancia_m: Math.round(primaryRoute.distance),
      };
    }
  } catch (err) {
    console.warn('Fallo al obtener ruta OSRM vial, usando fallback:', err);
  }

  return null;
}
