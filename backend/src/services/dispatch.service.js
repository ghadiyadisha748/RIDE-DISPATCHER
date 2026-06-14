'use strict';

/**
 * src/services/dispatch.service.js
 * Driver matching and dispatch algorithm.
 *
 * Scoring formula:
 *   score = (1/distanceKm)*0.40  +  (rating/5)*0.25
 *         + (completionRate/100)*0.20  +  idleTimeFactor*0.15
 *
 * Falls back to pure formula when the AI dispatch service is unavailable.
 */

const { query } = require('../config/db');
const { smartDispatch } = require('./ai.service');

// ─── Distance Helper ──────────────────────────────────────────────────────────
/**
 * Haversine distance in km between two lat/lng points.
 */
const haversineKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// ─── Idle Time Factor ─────────────────────────────────────────────────────────
/**
 * Drivers idle longer get a slight priority boost (max factor = 1).
 * @param {Date|string} lastRideEndedAt
 */
const idleTimeFactor = (lastRideEndedAt) => {
  if (!lastRideEndedAt) return 0.5;
  const idleMinutes = (Date.now() - new Date(lastRideEndedAt).getTime()) / 60000;
  // Caps at 60 minutes → factor 1.0
  return Math.min(idleMinutes / 60, 1.0);
};

// ─── Score Driver ─────────────────────────────────────────────────────────────
const scoreDriver = (driver, pickupLat, pickupLng) => {
  const dist = haversineKm(
    pickupLat,
    pickupLng,
    parseFloat(driver.current_lat),
    parseFloat(driver.current_lng)
  );
  // Avoid division-by-zero; very close drivers get a capped boost
  const distScore = dist < 0.1 ? 1.0 : 1 / dist;
  const ratingScore = (parseFloat(driver.avg_rating) || 4.0) / 5;
  const completionScore = (parseFloat(driver.completion_rate) || 80) / 100;
  const idleScore = idleTimeFactor(driver.last_ride_ended_at);

  const score =
    distScore * 0.4 +
    ratingScore * 0.25 +
    completionScore * 0.2 +
    idleScore * 0.15;

  return {
    ...driver,
    distance_km: parseFloat(dist.toFixed(2)),
    score: parseFloat(score.toFixed(4)),
  };
};

// ─── findNearbyDrivers ────────────────────────────────────────────────────────
/**
 * Fetches all online drivers in the same city within a radius.
 */
const findNearbyDrivers = async (city, vehicleType, radiusKm = 10) => {
  const sql = `
    SELECT
      d.id,
      d.user_id,
      d.vehicle_type,
      d.vehicle_number,
      d.avg_rating,
      d.completion_rate,
      d.total_rides,
      d.last_ride_ended_at,
      d.current_lat,
      d.current_lng,
      u.name AS driver_name,
      u.phone AS driver_phone
    FROM drivers d
    JOIN users u ON u.id = d.user_id
    WHERE d.status = 'online'
      AND d.city = $1
      AND d.vehicle_type = $2
      AND d.current_lat IS NOT NULL
      AND d.current_lng IS NOT NULL
      AND d.is_verified = true
      AND u.is_active = true
    LIMIT 50
  `;
  const { rows } = await query(sql, [city, vehicleType]);
  return rows;
};

// ─── dispatchRide ─────────────────────────────────────────────────────────────
/**
 * Main dispatch entry point.
 *
 * @param {{
 *   pickupLat: number,
 *   pickupLng: number,
 *   city: string,
 *   vehicleType: string,
 *   userId: string
 * }} params
 *
 * @returns {Promise<Array>} Top-3 ranked driver candidates with score + distance
 */
const dispatchRide = async ({ pickupLat, pickupLng, city, vehicleType, userId }) => {
  console.log(
    `[Dispatch] Finding drivers for city=${city} vehicleType=${vehicleType} user=${userId}`
  );

  const drivers = await findNearbyDrivers(city, vehicleType);
  if (drivers.length === 0) {
    console.log('[Dispatch] No online drivers found.');
    return [];
  }

  // ── Try AI dispatch first ─────────────────────────────────────────────────
  const aiResult = await smartDispatch({
    pickup_lat: pickupLat,
    pickup_lng: pickupLng,
    vehicle_type: vehicleType,
    city,
    available_drivers: drivers.map((d) => ({
      id: d.id,
      lat: d.current_lat,
      lng: d.current_lng,
      rating: d.avg_rating,
      completion_rate: d.completion_rate,
    })),
  });

  if (aiResult.ok && aiResult.data.ranked_drivers?.length > 0) {
    console.log('[Dispatch] ✅ Using AI ranked drivers.');
    // Enrich with full driver data
    const idOrderMap = new Map(
      aiResult.data.ranked_drivers.map((d, idx) => [d.id, idx])
    );
    return drivers
      .filter((d) => idOrderMap.has(d.id))
      .map((d) => scoreDriver(d, pickupLat, pickupLng))
      .sort((a, b) => (idOrderMap.get(a.id) || 0) - (idOrderMap.get(b.id) || 0))
      .slice(0, 3);
  }

  // ── Formula-based fallback ────────────────────────────────────────────────
  console.log('[Dispatch] ⚠️  AI unavailable. Using formula-based scoring.');
  const scored = drivers
    .map((d) => scoreDriver(d, pickupLat, pickupLng))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  console.log(
    '[Dispatch] Top candidates:',
    scored.map((d) => ({ id: d.id, score: d.score, dist: d.distance_km }))
  );

  return scored;
};

module.exports = { dispatchRide, findNearbyDrivers, haversineKm };
