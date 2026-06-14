'use strict';

/**
 * src/services/ai.service.js
 * HTTP client for the Python FastAPI AI microservice.
 * All calls have a 5-second timeout and graceful fallback return values.
 */

const axios = require('axios');
const env = require('../config/env');

// ─── Axios Instance ───────────────────────────────────────────────────────────
const aiClient = axios.create({
  baseURL: env.AI_SERVICE_URL,
  timeout: 5000, // 5 seconds — never block the main API
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ─── Internal Helper ──────────────────────────────────────────────────────────
/**
 * Wraps an AI service call and swallows errors gracefully.
 * @param {Function} fn  - async function that performs the axios call
 * @param {*} fallback   - value returned when the AI service is unavailable
 */
const safeCall = async (fn, fallback) => {
  try {
    const { data } = await fn();
    return { ok: true, data };
  } catch (err) {
    const reason = err.code === 'ECONNABORTED'
      ? 'timeout'
      : err.code || err.message;
    console.warn(`[AI Service] ⚠️  Call failed (${reason}). Using fallback.`);
    return { ok: false, data: fallback };
  }
};

// ─── Exports ──────────────────────────────────────────────────────────────────

/**
 * Predict fare for a ride using the AI model.
 * @param {{ vehicle_type, distance_km, duration_min, hour, surge_factor, city }} data
 * @returns {{ ok: boolean, data: { estimated_fare, confidence, surge_multiplier } }}
 */
const predictFare = (data) =>
  safeCall(
    () => aiClient.post('/ai/fare-predict', data),
    null // caller checks ok flag and uses fallback formula
  );

/**
 * AI-powered driver dispatch — returns ranked driver candidates.
 * @param {{ pickup_lat, pickup_lng, vehicle_type, city, available_drivers }} data
 * @returns {{ ok: boolean, data: { ranked_drivers: Array } }}
 */
const smartDispatch = (data) =>
  safeCall(
    () => aiClient.post('/ai/dispatch', data),
    { ranked_drivers: [] }
  );

/**
 * Sentiment analysis for ride reviews.
 * @param {string} text - Review text
 * @returns {{ ok: boolean, data: { sentiment: 'positive'|'neutral'|'negative', score: number } }}
 */
const analyzeSentiment = (text) =>
  safeCall(
    () => aiClient.post('/ai/sentiment', { text }),
    { sentiment: 'neutral', score: 0.5 }
  );

/**
 * Fraud detection for suspicious booking patterns.
 * @param {{ user_id, pickup_lat, pickup_lng, drop_lat, drop_lng, payment_method }} data
 * @returns {{ ok: boolean, data: { is_fraud: boolean, score: number, flags: string[] } }}
 */
const checkFraud = (data) =>
  safeCall(
    () => aiClient.post('/ai/fraud-check', data),
    { is_fraud: false, score: 0, flags: [] }
  );

/**
 * Demand heatmap for a given area and hour.
 * @param {string} area  - Area/zone name or geohash
 * @param {number} [hour] - Hour of day (0-23), defaults to current hour
 * @returns {{ ok: boolean, data: { demand_score, surge_factor, hotspots } }}
 */
const getDemandForecast = (area, hour = new Date().getHours()) =>
  safeCall(
    () => aiClient.get('/ai/demand', { params: { area, hour } }),
    { demand_score: 50, surge_factor: 1.0, hotspots: [] }
  );

module.exports = {
  predictFare,
  smartDispatch,
  analyzeSentiment,
  checkFraud,
  getDemandForecast,
};
