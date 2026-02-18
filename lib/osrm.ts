/**
 * Fetch walking route between waypoints using OSRM public API.
 * Returns polyline positions [lat, lng][] for Leaflet, or null on error.
 */
export type LatLngTuple = [number, number];

export async function fetchWalkingRoute(
  waypoints: LatLngTuple[]
): Promise<LatLngTuple[] | null> {
  if (waypoints.length < 2) return null;

  // OSRM expects lon,lat;lon,lat;...
  const coords = waypoints
    .map(([lat, lon]) => `${lon},${lat}`)
    .join(";");

  const url = `https://router.project-osrm.org/route/v1/foot/${coords}?overview=full&geometries=geojson`;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.code !== "Ok" || !data.routes?.[0]?.geometry?.coordinates) {
      return null;
    }
    // GeoJSON is [lon, lat][] -> convert to [lat, lon][] for Leaflet
    const coordsGeo = data.routes[0].geometry.coordinates as [number, number][];
    return coordsGeo.map(([lon, lat]) => [lat, lon] as LatLngTuple);
  } catch {
    return null;
  }
}
