'use strict';

/**
 * src/controllers/admin.controller.js
 * Admin dashboard, user/driver management, analytics, and complaint resolution.
 */

const { query } = require('../config/db');
const { getDemandForecast } = require('../services/ai.service');

// ─── getDashboardStats ────────────────────────────────────────────────────────
const getDashboardStats = async (req, res, next) => {
  try {
    const [users, drivers, rides, revenue, active] = await Promise.all([
      query("SELECT COUNT(*) FROM users WHERE role = 'user'"),
      query('SELECT COUNT(*) FROM drivers'),
      query('SELECT COUNT(*) FROM rides'),
      query("SELECT COALESCE(SUM(COALESCE(final_fare, estimated_fare)), 0) AS total FROM rides WHERE status = 'completed'"),
      query(
        "SELECT COUNT(*) FROM rides WHERE status IN ('searching','accepted','in_progress') AND DATE(created_at) = CURRENT_DATE"
      ),
    ]);

    const newUsersToday = await query(
      "SELECT COUNT(*) FROM users WHERE DATE(created_at) = CURRENT_DATE"
    );
    const completedToday = await query(
      "SELECT COUNT(*) FROM rides WHERE status = 'completed' AND DATE(completed_at) = CURRENT_DATE"
    );

    return res.status(200).json({
      success: true,
      data: {
        total_users: parseInt(users.rows[0].count, 10),
        total_drivers: parseInt(drivers.rows[0].count, 10),
        total_rides: parseInt(rides.rows[0].count, 10),
        total_revenue: parseFloat(revenue.rows[0].total),
        active_rides_today: parseInt(active.rows[0].count, 10),
        new_users_today: parseInt(newUsersToday.rows[0].count, 10),
        completed_rides_today: parseInt(completedToday.rows[0].count, 10),
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── getUsers ─────────────────────────────────────────────────────────────────
const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const offset = (page - 1) * limit;
    const search = req.query.search ? `%${req.query.search}%` : null;

    const whereClause = search
      ? "WHERE role = 'user' AND (name ILIKE $3 OR email ILIKE $3 OR phone ILIKE $3)"
      : "WHERE role = 'user'";
    const params = search ? [limit, offset, search] : [limit, offset];

    const { rows } = await query(
      `SELECT id, name, email, phone, city, is_active, is_email_verified,
              created_at, last_login,
              (SELECT COUNT(*) FROM rides WHERE user_id = users.id) AS total_rides
       FROM users ${whereClause}
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      params
    );

    const countQuery = search
      ? "SELECT COUNT(*) FROM users WHERE role = 'user' AND (name ILIKE $1 OR email ILIKE $1 OR phone ILIKE $1)"
      : "SELECT COUNT(*) FROM users WHERE role = 'user'";
    const countParams = search ? [search] : [];
    const { rows: countRows } = await query(countQuery, countParams);

    return res.status(200).json({
      success: true,
      data: {
        users: rows,
        pagination: { page, limit, total: parseInt(countRows[0].count, 10) },
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── updateUserStatus ─────────────────────────────────────────────────────────
const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { is_active, reason } = req.body;

    const { rows } = await query(
      `UPDATE users SET is_active = $1, updated_at = NOW() WHERE id = $2
       RETURNING id, name, email, is_active`,
      [is_active, id]
    );

    if (!rows[0]) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const action = is_active ? 'activated' : 'banned';
    console.log(
      `[Admin] 👤 User ${id} ${action} by admin ${req.user.id}. Reason: ${reason}`
    );
    return res.status(200).json({
      success: true,
      message: `User ${action} successfully.`,
      data: { user: rows[0] },
    });
  } catch (err) {
    next(err);
  }
};

// ─── getDrivers ───────────────────────────────────────────────────────────────
const getDrivers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const offset = (page - 1) * limit;
    const status = req.query.status; // 'pending' | 'verified' | 'rejected'

    const conditions = [];
    const params = [limit, offset];
    let i = 3;
    if (status) { conditions.push(`d.verification_status = $${i++}`); params.push(status); }

    const whereStr = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const { rows } = await query(
      `SELECT
         d.id, v.vehicle_type, v.plate_number AS vehicle_number, v.model AS vehicle_model,
         d.rating AS avg_rating, d.total_rides, d.completion_rate, d.status,
         d.is_verified, d.is_active, d.current_city AS city, d.joined_at AS created_at,
         u.name, u.email, u.phone,
         (d.rating / 5.0 * 0.5 + d.completion_rate / 100.0 * 0.5) AS performance_score
       FROM drivers d
       JOIN users u ON u.id = d.user_id
       LEFT JOIN vehicles v ON v.driver_id = d.id AND v.is_active = TRUE
       ${whereStr}
       ORDER BY performance_score DESC, d.joined_at DESC
       LIMIT $1 OFFSET $2`,
      params
    );

    const { rows: countRows } = await query(
      `SELECT COUNT(*) FROM drivers d ${whereStr}`,
      conditions.length ? params.slice(2) : []
    );

    return res.status(200).json({
      success: true,
      data: {
        drivers: rows,
        pagination: { page, limit, total: parseInt(countRows[0].count, 10) },
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── verifyDriver ─────────────────────────────────────────────────────────────
const verifyDriver = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action, reason } = req.body; // action: 'approve' | 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'action must be "approve" or "reject".',
      });
    }

    const isVerified = action === 'approve';
    const verificationStatus = action === 'approve' ? 'verified' : 'rejected';

    const { rows } = await query(
      `UPDATE drivers
       SET is_verified = $1, verification_status = $2, verification_reason = $3,
           verified_at = CASE WHEN $1 THEN NOW() ELSE NULL END, updated_at = NOW()
       WHERE id = $4
       RETURNING id, is_verified, verification_status`,
      [isVerified, verificationStatus, reason, id]
    );

    if (!rows[0]) {
      return res.status(404).json({ success: false, message: 'Driver not found.' });
    }

    console.log(`[Admin] ✅ Driver ${id} ${verificationStatus} by admin ${req.user.id}`);
    return res.status(200).json({
      success: true,
      message: `Driver ${verificationStatus} successfully.`,
      data: { driver: rows[0] },
    });
  } catch (err) {
    next(err);
  }
};

// ─── getRides ─────────────────────────────────────────────────────────────────
const getRides = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const offset = (page - 1) * limit;
    const { status, vehicle_type, city, date_from, date_to } = req.query;

    const conditions = [];
    const params = [limit, offset];
    let i = 3;

    if (status)       { conditions.push(`r.status = $${i++}`);        params.push(status); }
    if (vehicle_type) { conditions.push(`r.vehicle_type = $${i++}`);  params.push(vehicle_type); }
    if (city)         { conditions.push(`u.city = $${i++}`);          params.push(city); }
    if (date_from)    { conditions.push(`r.created_at >= $${i++}`);   params.push(date_from); }
    if (date_to)      { conditions.push(`r.created_at <= $${i++}`);   params.push(date_to); }

    const whereStr = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const { rows } = await query(
      `SELECT
         r.id, r.status, r.vehicle_type, r.pickup_address, r.drop_address,
         r.estimated_fare, r.final_fare, r.surge_multiplier,
         r.distance_km, r.created_at, r.completed_at,
         u.name AS user_name, u.phone AS user_phone,
         du.name AS driver_name
       FROM rides r
       JOIN users u ON u.id = r.user_id
       LEFT JOIN drivers d ON d.id = r.driver_id
       LEFT JOIN users du ON du.id = d.user_id
       ${whereStr}
       ORDER BY r.created_at DESC
       LIMIT $1 OFFSET $2`,
      params
    );

    return res.status(200).json({
      success: true,
      data: { rides: rows, page, limit },
    });
  } catch (err) {
    next(err);
  }
};

// ─── getComplaints ────────────────────────────────────────────────────────────
const getComplaints = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const offset = (page - 1) * limit;
    const status = req.query.status || null;

    const { rows } = await query(
      `SELECT
         c.id, c.category AS type, c.category AS subject, c.description, c.status,
         c.created_at, c.resolved_at, c.resolution AS resolution_note,
         u.name AS user_name, u.email AS user_email,
         r.id AS ride_id
       FROM complaints c
       JOIN users u ON u.id = c.user_id
       LEFT JOIN rides r ON r.id = c.ride_id
       ${status ? 'WHERE c.status = $3' : ''}
       ORDER BY c.created_at DESC
       LIMIT $1 OFFSET $2`,
      status ? [limit, offset, status] : [limit, offset]
    );

    return res.status(200).json({
      success: true,
      data: { complaints: rows },
    });
  } catch (err) {
    next(err);
  }
};

// ─── updateComplaint ──────────────────────────────────────────────────────────
const updateComplaint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, resolution_note } = req.body;
    const VALID = ['open', 'in_review', 'resolved', 'closed'];

    if (!VALID.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${VALID.join(', ')}`,
      });
    }

    const { rows } = await query(
      `UPDATE complaints
       SET status = $1, resolution = $2,
           resolved_at = CASE WHEN $1 IN ('resolved','closed') THEN NOW() ELSE NULL END,
           updated_at = NOW()
       WHERE id = $3
       RETURNING id, status, resolution AS resolution_note, resolved_at`,
      [status, resolution_note, id]
    );

    if (!rows[0]) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Complaint updated.',
      data: { complaint: rows[0] },
    });
  } catch (err) {
    next(err);
  }
};

// ─── getRevenue ───────────────────────────────────────────────────────────────
const getRevenue = async (req, res, next) => {
  try {
    const { period = 'daily' } = req.query;
    const groupBy =
      period === 'monthly'
        ? "DATE_TRUNC('month', p.paid_at)"
        : period === 'weekly'
        ? "DATE_TRUNC('week', p.paid_at)"
        : "DATE_TRUNC('day', p.paid_at)";

    const { rows } = await query(
      `SELECT
         ${groupBy} AS period,
         COUNT(*) AS total_rides,
         SUM(p.amount) AS gross_revenue,
         SUM(e.commission) AS platform_commission,
         AVG(p.amount) AS avg_fare
       FROM payments p
       LEFT JOIN driver_earnings e ON e.ride_id = p.ride_id
       WHERE p.status = 'completed' AND p.paid_at IS NOT NULL
       GROUP BY period
       ORDER BY period DESC
       LIMIT 30`
    );

    return res.status(200).json({
      success: true,
      data: { period, revenue: rows },
    });
  } catch (err) {
    next(err);
  }
};

// ─── getDemandAnalytics ───────────────────────────────────────────────────────
const getDemandAnalytics = async (req, res, next) => {
  try {
    const { area } = req.params;
    const { hour } = req.query;

    // DB-based demand by area/hour
    const { rows } = await query(
      `SELECT
         hour_of_day AS hour,
         SUM(actual_demand) AS ride_count,
         AVG(surge_multiplier) AS avg_surge
       FROM demand_analytics
       WHERE area_name ILIKE $1
       GROUP BY hour_of_day
       ORDER BY hour_of_day`,
      [`%${area}%`]
    );

    // Try AI forecast
    const aiResult = await getDemandForecast(area, hour ? parseInt(hour, 10) : undefined);

    return res.status(200).json({
      success: true,
      data: {
        area,
        historical_demand: rows,
        ai_forecast: aiResult.data,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
  updateUserStatus,
  getDrivers,
  verifyDriver,
  getRides,
  getComplaints,
  updateComplaint,
  getRevenue,
  getDemandAnalytics,
};
