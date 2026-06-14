'use strict';

/**
 * src/controllers/driver.controller.js
 * Driver-specific operations: profile, status, location, rides, earnings, ratings.
 */

const { query, getClient } = require('../config/db');
const { getIO } = require('../config/socket');

// ─── getProfile ───────────────────────────────────────────────────────────────
const getProfile = async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT
         d.*,
         u.name, u.email, u.phone, u.profile_pic,
         u.is_email_verified, u.created_at AS user_created_at
       FROM drivers d
       JOIN users u ON u.id = d.user_id
       WHERE d.user_id = $1`,
      [req.user.id]
    );

    if (!rows[0]) {
      return res.status(404).json({
        success: false,
        message: 'Driver profile not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: { driver: rows[0] },
    });
  } catch (err) {
    next(err);
  }
};

// ─── updateProfile ────────────────────────────────────────────────────────────
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, vehicle_number, vehicle_model, vehicle_color, city } = req.body;
    const profilePic = req.file?.path;

    // Update users table
    const userUpdates = [];
    const userVals = [];
    let i = 1;
    if (name)       { userUpdates.push(`name = $${i++}`);        userVals.push(name); }
    if (phone)      { userUpdates.push(`phone = $${i++}`);       userVals.push(phone); }
    if (profilePic) { userUpdates.push(`profile_pic = $${i++}`); userVals.push(profilePic); }
    if (userUpdates.length) {
      userVals.push(req.user.id);
      await query(
        `UPDATE users SET ${userUpdates.join(', ')}, updated_at = NOW() WHERE id = $${i}`,
        userVals
      );
    }

    // Update drivers table
    const driverUpdates = [];
    const driverVals = [];
    let j = 1;
    if (vehicle_number) { driverUpdates.push(`vehicle_number = $${j++}`); driverVals.push(vehicle_number); }
    if (vehicle_model)  { driverUpdates.push(`vehicle_model = $${j++}`);  driverVals.push(vehicle_model); }
    if (vehicle_color)  { driverUpdates.push(`vehicle_color = $${j++}`);  driverVals.push(vehicle_color); }
    if (city)           { driverUpdates.push(`city = $${j++}`);           driverVals.push(city); }
    if (driverUpdates.length) {
      driverVals.push(req.user.id);
      await query(
        `UPDATE drivers SET ${driverUpdates.join(', ')}, updated_at = NOW() WHERE user_id = $${j}`,
        driverVals
      );
    }

    console.log(`[Driver] ✅ Profile updated for driver user: ${req.user.id}`);
    return res.status(200).json({
      success: true,
      message: 'Driver profile updated successfully.',
    });
  } catch (err) {
    next(err);
  }
};

// ─── updateStatus ─────────────────────────────────────────────────────────────
const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const VALID = ['online', 'offline', 'on_ride'];

    if (!VALID.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${VALID.join(', ')}`,
      });
    }

    await query(
      `UPDATE drivers SET status = $1, updated_at = NOW() WHERE user_id = $2`,
      [status, req.user.id]
    );

    console.log(`[Driver] 🚦 Driver ${req.user.id} status → ${status}`);
    return res.status(200).json({
      success: true,
      message: `Status updated to "${status}".`,
      data: { status },
    });
  } catch (err) {
    next(err);
  }
};

// ─── updateLocation ───────────────────────────────────────────────────────────
const updateLocation = async (req, res, next) => {
  try {
    const { lat, lng } = req.body;

    // Get driver id and active ride
    const { rows } = await query(
      `SELECT id, current_ride_id FROM drivers WHERE user_id = $1`,
      [req.user.id]
    );
    if (!rows[0]) {
      return res.status(404).json({ success: false, message: 'Driver not found.' });
    }
    const driver = rows[0];

    await query(
      `UPDATE drivers SET current_lat = $1, current_lng = $2, location_updated_at = NOW()
       WHERE id = $3`,
      [lat, lng, driver.id]
    );

    // Emit location to active ride room
    if (driver.current_ride_id) {
      try {
        getIO()
          .to(`ride:${driver.current_ride_id}`)
          .emit('driver:location_update', {
            driverId: driver.id,
            lat,
            lng,
            timestamp: new Date().toISOString(),
          });
      } catch (_) { /* Socket may not be initialised yet */ }
    }

    return res.status(200).json({
      success: true,
      message: 'Location updated.',
      data: { lat, lng },
    });
  } catch (err) {
    next(err);
  }
};

// ─── getRides ─────────────────────────────────────────────────────────────────
const getRides = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const { rows: driverRows } = await query(
      'SELECT id FROM drivers WHERE user_id = $1',
      [req.user.id]
    );
    if (!driverRows[0]) {
      return res.status(404).json({ success: false, message: 'Driver not found.' });
    }

    const { rows } = await query(
      `SELECT
         r.id, r.status, r.vehicle_type,
         r.pickup_address, r.drop_address,
         r.final_fare, r.estimated_fare, r.distance_km, r.duration_min,
         r.created_at, r.completed_at,
         u.name AS user_name, u.phone AS user_phone,
         rv.rating AS user_rating
       FROM rides r
       JOIN users u ON u.id = r.user_id
       LEFT JOIN ride_reviews rv ON rv.ride_id = r.id AND rv.driver_id = $1
       WHERE r.driver_id = $1
       ORDER BY r.created_at DESC
       LIMIT $2 OFFSET $3`,
      [driverRows[0].id, limit, offset]
    );

    const { rows: countRows } = await query(
      'SELECT COUNT(*) FROM rides WHERE driver_id = $1',
      [driverRows[0].id]
    );

    return res.status(200).json({
      success: true,
      data: {
        rides: rows,
        pagination: {
          page,
          limit,
          total: parseInt(countRows[0].count, 10),
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── getEarnings ──────────────────────────────────────────────────────────────
const getEarnings = async (req, res, next) => {
  try {
    const { period = 'weekly' } = req.query;
    const { rows: driverRows } = await query(
      'SELECT id FROM drivers WHERE user_id = $1',
      [req.user.id]
    );
    if (!driverRows[0]) return res.status(404).json({ success: false, message: 'Driver not found.' });

    const driverId = driverRows[0].id;
    const groupBy = period === 'monthly'
      ? "DATE_TRUNC('month', completed_at)"
      : period === 'daily'
      ? "DATE_TRUNC('day', completed_at)"
      : "DATE_TRUNC('week', completed_at)";

    const { rows } = await query(
      `SELECT
         ${groupBy} AS period_start,
         COUNT(*) AS total_rides,
         SUM(COALESCE(final_fare, estimated_fare)) AS gross_earnings,
         SUM(COALESCE(final_fare, estimated_fare) * 0.80) AS net_earnings,
         AVG(COALESCE(final_fare, estimated_fare)) AS avg_fare
       FROM rides
       WHERE driver_id = $1
         AND status = 'completed'
         AND completed_at IS NOT NULL
       GROUP BY period_start
       ORDER BY period_start DESC
       LIMIT 12`,
      [driverId]
    );

    const totalResult = await query(
      `SELECT
         COUNT(*) AS total_rides,
         SUM(COALESCE(final_fare, estimated_fare)) AS total_gross
       FROM rides WHERE driver_id = $1 AND status = 'completed'`,
      [driverId]
    );

    return res.status(200).json({
      success: true,
      data: {
        period,
        breakdown: rows,
        summary: totalResult.rows[0],
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── getRatings ───────────────────────────────────────────────────────────────
const getRatings = async (req, res, next) => {
  try {
    const { rows: driverRows } = await query(
      'SELECT id, avg_rating FROM drivers WHERE user_id = $1',
      [req.user.id]
    );
    if (!driverRows[0]) return res.status(404).json({ success: false, message: 'Driver not found.' });

    const { rows } = await query(
      `SELECT
         rr.id, rr.rating, rr.comment, rr.sentiment, rr.created_at,
         u.name AS reviewer_name,
         r.pickup_address, r.drop_address
       FROM ride_reviews rr
       JOIN users u ON u.id = rr.reviewer_id
       JOIN rides r ON r.id = rr.ride_id
       WHERE rr.driver_id = $1
       ORDER BY rr.created_at DESC
       LIMIT 50`,
      [driverRows[0].id]
    );

    return res.status(200).json({
      success: true,
      data: {
        avg_rating: driverRows[0].avg_rating,
        total_reviews: rows.length,
        reviews: rows,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── acceptRide ───────────────────────────────────────────────────────────────
const acceptRide = async (req, res, next) => {
  const client = await getClient();
  try {
    const { id: rideId } = req.params;

    await client.query('BEGIN');

    const { rows: driverRows } = await client.query(
      "SELECT id, status FROM drivers WHERE user_id = $1 AND status = 'online'",
      [req.user.id]
    );
    if (!driverRows[0]) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'You must be online to accept rides.',
      });
    }

    const { rows: rideRows } = await client.query(
      "SELECT * FROM rides WHERE id = $1 AND status = 'searching' FOR UPDATE",
      [rideId]
    );
    if (!rideRows[0]) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Ride is no longer available.',
      });
    }

    await client.query(
      "UPDATE rides SET driver_id = $1, status = 'accepted', accepted_at = NOW() WHERE id = $2",
      [driverRows[0].id, rideId]
    );
    await client.query(
      "UPDATE drivers SET status = 'on_ride', current_ride_id = $1 WHERE id = $2",
      [rideId, driverRows[0].id]
    );

    await client.query('COMMIT');

    // Notify user
    try {
      getIO().to(`user:${rideRows[0].user_id}`).emit('ride:accepted', {
        rideId,
        driverId: driverRows[0].id,
      });
    } catch (_) {}

    console.log(`[Driver] ✅ Ride ${rideId} accepted by driver ${driverRows[0].id}`);
    return res.status(200).json({
      success: true,
      message: 'Ride accepted.',
      data: { rideId },
    });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

// ─── rejectRide ───────────────────────────────────────────────────────────────
const rejectRide = async (req, res, next) => {
  try {
    const { id: rideId } = req.params;
    const { reason } = req.body;

    console.log(`[Driver] ❌ Ride ${rideId} rejected by driver ${req.user.id}. Reason: ${reason}`);
    return res.status(200).json({
      success: true,
      message: 'Ride rejected.',
    });
  } catch (err) {
    next(err);
  }
};

// ─── updateRideStatus ─────────────────────────────────────────────────────────
const updateRideStatus = async (req, res, next) => {
  try {
    const { id: rideId } = req.params;
    const { status } = req.body;
    const VALID_STATUSES = ['arrived', 'in_progress', 'completed'];

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
      });
    }

    const { rows: driverRows } = await query(
      'SELECT id FROM drivers WHERE user_id = $1',
      [req.user.id]
    );
    if (!driverRows[0]) return res.status(404).json({ success: false, message: 'Driver not found.' });

    const extraFields =
      status === 'completed'
        ? `, completed_at = NOW(), final_fare = estimated_fare`
        : status === 'in_progress'
        ? `, started_at = NOW()`
        : '';

    const { rows } = await query(
      `UPDATE rides SET status = $1${extraFields} WHERE id = $2 AND driver_id = $3 RETURNING *`,
      [status, rideId, driverRows[0].id]
    );

    if (!rows[0]) {
      return res.status(404).json({ success: false, message: 'Ride not found or not assigned to you.' });
    }

    // Free driver if completed
    if (status === 'completed') {
      await query(
        "UPDATE drivers SET status = 'online', current_ride_id = NULL, last_ride_ended_at = NOW() WHERE id = $1",
        [driverRows[0].id]
      );
    }

    // Notify user
    try {
      getIO().to(`user:${rows[0].user_id}`).emit('ride:status_update', {
        rideId,
        status,
        timestamp: new Date().toISOString(),
      });
    } catch (_) {}

    console.log(`[Driver] 🚕 Ride ${rideId} status → ${status}`);
    return res.status(200).json({
      success: true,
      message: `Ride status updated to "${status}".`,
      data: { ride: rows[0] },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  updateStatus,
  updateLocation,
  getRides,
  getEarnings,
  getRatings,
  acceptRide,
  rejectRide,
  updateRideStatus,
};
