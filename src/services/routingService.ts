import { LatLng } from '../types';

export interface CandidateRoute {
  id: string;
  name: string;
  path: LatLng[];
  distanceKm: number;
  durationMins: number;
  source: 'osrm' | 'fallback_graph';
}

/**
 * Real OSRM driving routes fetcher.
 * Converts GeoJSON [lng, lat] to Leaflet LatLng objects.
 * Times out gracefully after 2.5s if offline or slow.
 */
export async function fetchOSRMRoutes(
  pickup: LatLng,
  destination: LatLng
): Promise<CandidateRoute[] | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const url = `https://router.project-osrm.org/route/v1/driving/${pickup.lng},${pickup.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson&alternatives=true&steps=true`;
    
    console.log('[RoutingService] Fetching OSRM route:', url);
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn('[RoutingService] OSRM response not ok:', response.status);
      return null;
    }

    const data = await response.json();
    if (!data.routes || data.routes.length === 0) {
      console.warn('[RoutingService] No routes returned by OSRM');
      return null;
    }

    console.log(`[RoutingService] Successfully received ${data.routes.length} routes from OSRM`);

    const defaultNames = ['Fastest Route', 'Safest / Most Accessible', 'AI Recommended Route'];

    return data.routes.map((r: any, idx: number) => {
      const coords: [number, number][] = r.geometry.coordinates;
      // Convert OSRM GeoJSON [longitude, latitude] to Leaflet { lat, lng }
      const path: LatLng[] = coords.map(([lng, lat]) => ({ lat, lng }));
      const distKm = parseFloat((r.distance / 1000).toFixed(1));
      const durMins = Math.max(1, Math.round(r.duration / 60));

      return {
        id: `osrm_${idx}_${Date.now()}`,
        name: defaultNames[idx] || `Candidate Route ${idx + 1}`,
        path,
        distanceKm: distKm,
        durationMins: durMins,
        source: 'osrm'
      };
    });
  } catch (err) {
    console.warn('[RoutingService] OSRM fetch failed or timed out, switching to local graph:', err);
    return null;
  }
}
