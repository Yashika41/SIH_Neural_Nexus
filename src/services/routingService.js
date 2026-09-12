/**
 * Real OSRM driving routes fetcher.
 * Converts OSRM GeoJSON [longitude, latitude] to Leaflet { lat, lng } objects.
 */
export async function fetchOSRMRoutes(pickup, destination) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const url = `https://router.project-osrm.org/route/v1/driving/${pickup.lng},${pickup.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson&alternatives=true&steps=true`;
    
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) return null;

    const data = await response.json();
    if (!data.routes || data.routes.length === 0) return null;

    const defaultNames = ['Fastest Route', 'Safest / Most Accessible', 'AI Recommended Route'];

    return data.routes.map((r, idx) => {
      const coords = r.geometry.coordinates;
      // Convert OSRM GeoJSON [longitude, latitude] to Leaflet { lat, lng }
      const path = coords.map(([lng, lat]) => ({ lat, lng }));
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
    return null;
  }
}
