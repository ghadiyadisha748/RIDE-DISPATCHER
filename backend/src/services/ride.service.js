'use strict';

/**
 * src/services/ride.service.js
 * Fare calculation fallback used when the AI service is unavailable.
 *
 * Pricing matrix:
 *   auto    : base 25  + ₹8/km   + ₹1.5/min
 *   bike    : base 15  + ₹5/km   + ₹1/min
 *   cab     : base 40  + ₹12/km  + ₹2/min
 *   premium : base 80  + ₹20/km  + ₹3/min
 *
 * A surge multiplier (1.0–3.0) is applied to the final amount.
 */

// ─── Pricing Matrix ───────────────────────────────────────────────────────────
const PRICING = {
  auto: { base: 25, perKm: 8, perMin: 1.5, minFare: 30 },
  bike: { base: 15, perKm: 5, perMin: 1.0, minFare: 20 },
  cab: { base: 40, perKm: 12, perMin: 2.0, minFare: 50 },
  premium: { base: 80, perKm: 20, perMin: 3.0, minFare: 120 },
};

// ─── calculateFare ────────────────────────────────────────────────────────────
/**
 * Estimates the fare using a simple formula.
 *
 * @param {object}  params
 * @param {string}  params.vehicleType   - 'auto' | 'bike' | 'cab' | 'premium'
 * @param {number}  params.distanceKm    - Estimated route distance in km
 * @param {number}  params.durationMin   - Estimated route duration in minutes
 * @param {number}  [params.surgeMultiplier=1.0] - Surge factor (1.0 – 3.0)
 *
 * @returns {{
 *   estimated_fare: number,
 *   base_fare: number,
 *   distance_charge: number,
 *   time_charge: number,
 *   surge_multiplier: number,
 *   vehicle_type: string,
 *   breakdown: object
 * }}
 */
const calculateFare = ({
  vehicleType = 'auto',
  distanceKm,
  durationMin,
  surgeMultiplier = 1.0,
}) => {
  const type = vehicleType.toLowerCase();
  const pricing = PRICING[type];
  if (!pricing) {
    throw new Error(
      `Unknown vehicle type "${vehicleType}". Valid types: ${Object.keys(PRICING).join(', ')}`
    );
  }

  if (typeof distanceKm !== 'number' || distanceKm < 0) {
    throw new Error('distanceKm must be a non-negative number.');
  }
  if (typeof durationMin !== 'number' || durationMin < 0) {
    throw new Error('durationMin must be a non-negative number.');
  }

  // Clamp surge between 1.0 and 3.0
  const surge = Math.min(Math.max(parseFloat(surgeMultiplier) || 1.0, 1.0), 3.0);

  const distanceCharge = parseFloat((distanceKm * pricing.perKm).toFixed(2));
  const timeCharge = parseFloat((durationMin * pricing.perMin).toFixed(2));
  const subtotal = pricing.base + distanceCharge + timeCharge;
  const withSurge = subtotal * surge;
  const estimated_fare = parseFloat(
    Math.max(withSurge, pricing.minFare * surge).toFixed(2)
  );

  return {
    estimated_fare,
    base_fare: pricing.base,
    distance_charge: distanceCharge,
    time_charge: timeCharge,
    surge_multiplier: surge,
    vehicle_type: type,
    breakdown: {
      base: pricing.base,
      distance: `${distanceKm} km × ₹${pricing.perKm} = ₹${distanceCharge}`,
      time: `${durationMin} min × ₹${pricing.perMin} = ₹${timeCharge}`,
      surge: surge > 1 ? `×${surge} surge applied` : 'No surge',
      total: `₹${estimated_fare}`,
    },
  };
};

// ─── getSurgeFactor ───────────────────────────────────────────────────────────
/**
 * Returns a basic rule-based surge multiplier based on hour of day.
 * Replace with AI prediction in production.
 *
 * @param {number} [hour=current hour] - Hour of day (0-23)
 * @returns {number} Surge multiplier
 */
const getSurgeFactor = (hour = new Date().getHours()) => {
  // Peak hours: 8-10 AM and 5-8 PM
  if ((hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 20)) {
    return 1.5;
  }
  // Late night: 11 PM – 5 AM
  if (hour >= 23 || hour <= 5) {
    return 1.3;
  }
  return 1.0;
};

// ─── getPricingInfo ───────────────────────────────────────────────────────────
/**
 * Returns the pricing matrix for all vehicle types.
 * Useful for building fare estimation UI.
 */
const getPricingInfo = () => {
  return Object.entries(PRICING).map(([type, p]) => ({
    vehicle_type: type,
    base_fare: p.base,
    per_km: p.perKm,
    per_min: p.perMin,
    min_fare: p.minFare,
  }));
};

module.exports = { calculateFare, getSurgeFactor, getPricingInfo };
