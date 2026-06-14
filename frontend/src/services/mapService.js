// Nominatim (OSM) + OSRM helpers — drop-in replaceable with Google Maps later

const NOMINATIM  = 'https://nominatim.openstreetmap.org';
const OSRM       = 'https://router.project-osrm.org/route/v1/driving';

const headers = { 'Accept-Language': 'en', 'User-Agent': 'RIDE-DISPATCHER/1.0' };

/**
 * Search places by text query, biased toward India
 */
export async function searchPlace(query) {
  const url = `${NOMINATIM}/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=5&addressdetails=1`;
  const res  = await fetch(url, { headers });
  const data = await res.json();
  return data.map(p => ({
    id:      p.place_id,
    name:    p.display_name,
    lat:     parseFloat(p.lat),
    lng:     parseFloat(p.lon),
    address: p.display_name,
  }));
}

/**
 * Reverse geocode lat/lng to address string
 */
export async function reverseGeocode(lat, lng) {
  const url  = `${NOMINATIM}/reverse?format=json&lat=${lat}&lon=${lng}`;
  const res  = await fetch(url, { headers });
  const data = await res.json();
  return data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}

/**
 * Get route between two coordinates via OSRM
 * Returns { distanceKm, durationMin, geometry }
 */
export async function getRoute(fromLat, fromLng, toLat, toLng) {
  const url = `${OSRM}/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`;
  try {
    const res  = await fetch(url);
    const data = await res.json();
    if (data.code !== 'Ok') throw new Error('Route not found');
    const leg = data.routes[0].legs[0];
    return {
      distanceKm:  parseFloat((leg.distance / 1000).toFixed(2)),
      durationMin: Math.ceil(leg.duration / 60),
      geometry:    data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]),
    };
  } catch {
    // Haversine fallback if OSRM unavailable
    const d = haversineKm(fromLat, fromLng, toLat, toLng);
    return { distanceKm: d, durationMin: Math.ceil(d * 3), geometry: [[fromLat, fromLng], [toLat, toLng]] };
  }
}

/**
 * Haversine distance in km
 */
export function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return parseFloat((R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(2));
}

/**
 * Surat city center (default map center)
 */
export const SURAT_CENTER = { lat: 21.1702, lng: 72.8311 };

/**
 * Indian cities map centers
 */
export const CITY_CENTERS = {
  Surat:     { lat: 21.1702, lng: 72.8311, zoom: 13 },
  Ahmedabad: { lat: 23.0225, lng: 72.5714, zoom: 12 },
  Vadodara:  { lat: 22.3072, lng: 73.1812, zoom: 13 },
  Rajkot:    { lat: 22.3039, lng: 70.8022, zoom: 13 },
};
