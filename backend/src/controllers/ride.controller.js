'use strict';

/**
 * src/controllers/ride.controller.js
 * Handles ride booking, fare estimation, cancellation, status,
 * reviews, and receipts. Integrates dispatch and AI services.
 */

const { v4: uuidv4 } = require('uuid');
const { query, getClient } = require('../config/db');
const { getIO } = require('../config/socket');
const { dispatchRide } = require('../services/dispatch.service');
const { calculateFare, getSurgeFactor } = require('../services/ride.service');
const { predictFare, analyzeSentiment } = require('../services/ai.service');

// ─── estimateFare ─────────────────────────────────────────────────────────────
const estimateFare = async (req, res, next) => {
  try {
    const {
      vehicle_type = 'auto',
      distance_km,
      duration_min,
      city,
    } = req.body;

    const hour = new Date().getHours();
    const surgeFactor = getSurgeFactor(hour);

    // Try AI fare prediction first
    const aiResult = await predictFare({
      vehicle_type,
      distance_km,
      duration_min,
      hour,
      surge_factor: surgeFactor,
      city,
    });

    let fareData;
    if (aiResult.ok && aiResult.data) {
      fareData = {
        estimated_fare: aiResult.data.estimated_fare,
        surge_multiplier: aiResult.data.surge_multiplier || surgeFactor,
        vehicle_type,
        source: 'ai',
        confidence: aiResult.data.confidence,
      };
    } else {
      // Fallback to formula
      fareData = {
        ...calculateFare({ vehicleType: vehicle_type, distanceKm: distance_km, durationMin: duration_min, surgeMultiplier: surgeFactor }),
        source: 'formula',
      };
    }

    return res.status(200).json({
      success: true,
      message: 'Fare estimated successfully.',
      data: fareData,
    });
  } catch (err) {
    next(err);
  }
};

// ─── bookRide ─────────────────────────────────────────────────────────────────
const bookRide = async (req, res, next) => {
  const client = await getClient();
  try {
    const {
      vehicle_type,
      pickup_lat,
      pickup_lng,
      pickup_address,
      drop_lat,
      drop_lng,
      drop_address,
      distance_km,
      duration_min,
    } = req.body;

    await client.query('BEGIN');

    // Calculate fare
    const surgeFactor = getSurgeFactor(new Date().getHours());
    const fareData = calculateFare({
      vehicleType: vehicle_type,
      distanceKm: distance_km,
      durationMin: duration_min,
      surgeMultiplier: surgeFactor,
    });

    // Get user's city
    const { rows: userRows } = await client.query(
      'SELECT city FROM users WHERE id = $1',
      [req.user.id]
    );
    const city = userRows[0]?.city || 'unknown';

    // Create ride record
    const rideId = uuidv4();
    const { rows: rideRows } = await client.query(
      `INSERT INTO rides
         (id, user_id, vehicle_type, status,
          pickup_lat, pickup_lng, pickup_address,
          drop_lat, drop_lng, drop_address,
          estimated_fare, surge_multiplier, distance_km, duration_min)
       VALUES ($1,$2,$3,'searching',$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING *`,
      [
        rideId, req.user.id, vehicle_type,
        pickup_lat, pickup_lng, pickup_address,
        drop_lat, drop_lng, drop_address,
        fareData.estimated_fare, surgeFactor, distance_km, duration_min,
      ]
    );

    await client.query('COMMIT');
    const ride = rideRows[0];

    // Dispatch drivers (async, after response)
    setImmediate(async () => {
      try {
        const candidates = await dispatchRide({
          pickupLat: pickup_lat,
          pickupLng: pickup_lng,
          city,
          vehicleType: vehicle_type,
          userId: req.user.id,
        });

        const io = getIO();
        if (candidates.length === 0) {
          io.to(`user:${req.user.id}`).emit('ride:no_drivers', {
            rideId: ride.id,
            message: 'No drivers available nearby. Please try again.',
          });
          await query("UPDATE rides SET status = 'cancelled' WHERE id = $1", [ride.id]);
          return;
        }

        // Notify top candidate drivers
        candidates.forEach((driver) => {
          io.to(`driver:${driver.id}`).emit('ride:request', {
            rideId: ride.id,
            pickup: { lat: pickup_lat, lng: pickup_lng, address: pickup_address },
            drop: { lat: drop_lat, lng: drop_lng, address: drop_address },
            vehicle_type,
            estimatedFare: fareData.estimated_fare,
            distanceKm: distance_km,
            durationMin: duration_min,
          });
        });

        console.log(
          `[Ride] 📍 Dispatched ride ${ride.id} to ${candidates.length} drivers`
        );
      } catch (e) {
        console.error('[Ride] ❌ Dispatch error:', e.message);
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Ride booked. Searching for nearby drivers…',
      data: { ride, fare: fareData },
    });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

// ─── getRide ──────────────────────────────────────────────────────────────────
const getRide = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { rows } = await query(
      `SELECT
         r.*,
         u.name AS user_name, u.phone AS user_phone,
         du.name AS driver_name, du.phone AS driver_phone,
         d.vehicle_number, d.vehicle_model, d.avg_rating AS driver_rating,
         d.current_lat AS driver_lat, d.current_lng AS driver_lng
       FROM rides r
       JOIN users u ON u.id = r.user_id
       LEFT JOIN drivers d ON d.id = r.driver_id
       LEFT JOIN users du ON du.id = d.user_id
       WHERE r.id = $1`,
      [id]
    );

    if (!rows[0]) {
      return res.status(404).json({ success: false, message: 'Ride not found.' });
    }

    // Users can only see their own rides; admins see all
    if (req.user.role === 'user' && rows[0].user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    return res.status(200).json({
      success: true,
      data: { ride: rows[0] },
    });
  } catch (err) {
    next(err);
  }
};

// ─── cancelRide ───────────────────────────────────────────────────────────────
const cancelRide = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const { rows } = await query(
      "SELECT * FROM rides WHERE id = $1 AND user_id = $2 AND status IN ('searching','accepted')",
      [id, req.user.id]
    );

    if (!rows[0]) {
      return res.status(400).json({
        success: false,
        message: 'Ride cannot be cancelled or does not exist.',
      });
    }

    await query(
      `UPDATE rides SET status = 'cancelled', cancel_reason = $1, cancelled_at = NOW()
       WHERE id = $2`,
      [reason, id]
    );

    // Notify driver if already assigned
    if (rows[0].driver_id) {
      try {
        getIO()
          .to(`driver:${rows[0].driver_id}`)
          .emit('ride:cancelled', { rideId: id, reason });
      } catch (_) { /* socket may not be init */ }
    }

    console.log(`[Ride] ❌ Ride ${id} cancelled by user ${req.user.id}`);
    return res.status(200).json({
      success: true,
      message: 'Ride cancelled successfully.',
    });
  } catch (err) {
    next(err);
  }
};

// ─── getRideStatus ────────────────────────────────────────────────────────────
const getRideStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rows } = await query(
      `SELECT r.id, r.status, r.driver_id,
              d.current_lat, d.current_lng,
              du.name AS driver_name, du.phone AS driver_phone,
              d.vehicle_number, d.avg_rating
       FROM rides r
       LEFT JOIN drivers d ON d.id = r.driver_id
       LEFT JOIN users du ON du.id = d.user_id
       WHERE r.id = $1`,
      [id]
    );

    if (!rows[0]) {
      return res.status(404).json({ success: false, message: 'Ride not found.' });
    }

    return res.status(200).json({
      success: true,
      data: { status: rows[0].status, ride: rows[0] },
    });
  } catch (err) {
    next(err);
  }
};

// ─── submitReview ─────────────────────────────────────────────────────────────
const submitReview = async (req, res, next) => {
  try {
    const { id: rideId } = req.params;
    const { rating, comment } = req.body;

    // Verify ride belongs to user and is completed
    const { rows: rideRows } = await query(
      "SELECT driver_id FROM rides WHERE id = $1 AND user_id = $2 AND status = 'completed'",
      [rideId, req.user.id]
    );

    if (!rideRows[0]) {
      return res.status(400).json({
        success: false,
        message: 'Ride not found, not yours, or not yet completed.',
      });
    }

    // Check for duplicate review
    const existing = await query(
      'SELECT id FROM ride_reviews WHERE ride_id = $1 AND reviewer_id = $2',
      [rideId, req.user.id]
    );
    if (existing.rowCount > 0) {
      return res.status(409).json({ success: false, message: 'You have already reviewed this ride.' });
    }

    // AI sentiment (non-blocking)
    let sentiment = null;
    if (comment) {
      const sentimentResult = await analyzeSentiment(comment);
      if (sentimentResult.ok) sentiment = sentimentResult.data.sentiment;
    }

    const { rows } = await query(
      `INSERT INTO ride_reviews (ride_id, reviewer_id, driver_id, rating, comment, sentiment)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, rating, comment, sentiment, created_at`,
      [rideId, req.user.id, rideRows[0].driver_id, rating, comment, sentiment]
    );

    // Update driver's average rating
    await query(
      `UPDATE drivers SET avg_rating = (
         SELECT AVG(rating)::numeric(3,2) FROM ride_reviews WHERE driver_id = $1
       ) WHERE id = $1`,
      [rideRows[0].driver_id]
    );

    console.log(`[Ride] ⭐ Review submitted for ride ${rideId}`);
    return res.status(201).json({
      success: true,
      message: 'Review submitted. Thank you!',
      data: { review: rows[0] },
    });
  } catch (err) {
    next(err);
  }
};

// ─── getReceipt ───────────────────────────────────────────────────────────────
const getReceipt = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rows } = await query(
      `SELECT
         r.id, r.status, r.vehicle_type,
         r.pickup_address, r.drop_address,
         r.estimated_fare, r.final_fare, r.surge_multiplier,
         r.distance_km, r.duration_min,
         r.created_at, r.completed_at,
         r.payment_method, r.payment_status,
         u.name AS user_name, u.email AS user_email,
         du.name AS driver_name, d.vehicle_number
       FROM rides r
       JOIN users u ON u.id = r.user_id
       LEFT JOIN drivers d ON d.id = r.driver_id
       LEFT JOIN users du ON du.id = d.user_id
       WHERE r.id = $1 AND r.user_id = $2 AND r.status = 'completed'`,
      [id, req.user.id]
    );

    if (!rows[0]) {
      return res.status(404).json({ success: false, message: 'Receipt not found.' });
    }

    const ride = rows[0];
    const receipt = {
      receipt_id: `RCT-${ride.id.slice(0, 8).toUpperCase()}`,
      ride_id: ride.id,
      passenger: { name: ride.user_name, email: ride.user_email },
      driver: { name: ride.driver_name, vehicle: ride.vehicle_number },
      trip: {
        pickup: ride.pickup_address,
        drop: ride.drop_address,
        distance: `${ride.distance_km} km`,
        duration: `${ride.duration_min} min`,
        vehicle: ride.vehicle_type,
      },
      fare: {
        estimated: ride.estimated_fare,
        final: ride.final_fare || ride.estimated_fare,
        surge: ride.surge_multiplier,
      },
      payment: {
        method: ride.payment_method || 'cash',
        status: ride.payment_status || 'paid',
      },
      timestamps: {
        booked: ride.created_at,
        completed: ride.completed_at,
      },
    };

    return res.status(200).json({
      success: true,
      data: { receipt },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  estimateFare,
  bookRide,
  getRide,
  cancelRide,
  getRideStatus,
  submitReview,
  getReceipt,
};
