'use strict';

/**
 * src/controllers/user.controller.js
 * Handles user profile, ride history, favorites, and notifications.
 */

const bcrypt = require('bcryptjs');
const { query } = require('../config/db');

// ─── getProfile ───────────────────────────────────────────────────────────────
const getProfile = async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT id, name, email, phone, city, profile_pic, role,
              is_email_verified, is_active, created_at, last_login
       FROM users WHERE id = $1`,
      [req.user.id]
    );

    if (!rows[0]) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.status(200).json({
      success: true,
      data: { user: rows[0] },
    });
  } catch (err) {
    next(err);
  }
};

// ─── updateProfile ────────────────────────────────────────────────────────────
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, city } = req.body;
    const profilePic = req.file ? req.file.path : undefined;

    // Build dynamic update
    const updates = [];
    const values = [];
    let idx = 1;

    if (name)       { updates.push(`name = $${idx++}`);        values.push(name); }
    if (phone)      { updates.push(`phone = $${idx++}`);       values.push(phone); }
    if (city)       { updates.push(`city = $${idx++}`);        values.push(city); }
    if (profilePic) { updates.push(`profile_pic = $${idx++}`); values.push(profilePic); }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields provided to update.',
      });
    }

    updates.push(`updated_at = NOW()`);
    values.push(req.user.id);

    const { rows } = await query(
      `UPDATE users SET ${updates.join(', ')}
       WHERE id = $${idx}
       RETURNING id, name, email, phone, city, profile_pic, role`,
      values
    );

    console.log(`[User] ✅ Profile updated for user: ${req.user.id}`);
    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: { user: rows[0] },
    });
  } catch (err) {
    next(err);
  }
};

// ─── changePassword ───────────────────────────────────────────────────────────
const changePassword = async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body;

    const { rows } = await query(
      'SELECT password_hash FROM users WHERE id = $1',
      [req.user.id]
    );

    const isMatch = await bcrypt.compare(current_password, rows[0].password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect.',
      });
    }

    const newHash = await bcrypt.hash(new_password, 12);
    await query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [newHash, req.user.id]
    );

    console.log(`[User] 🔒 Password changed for user: ${req.user.id}`);
    return res.status(200).json({
      success: true,
      message: 'Password changed successfully.',
    });
  } catch (err) {
    next(err);
  }
};

// ─── getRideHistory ───────────────────────────────────────────────────────────
const getRideHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const { rows } = await query(
      `SELECT
         r.id, r.status, r.ride_type AS vehicle_type, r.pickup_address,
         r.drop_address, r.estimated_fare, r.final_fare,
         r.pickup_lat, r.pickup_lng, r.drop_lat, r.drop_lng,
         r.created_at, r.completed_at,
         d.id AS driver_id, u.name AS driver_name,
         v.plate_number AS vehicle_number, d.rating AS driver_rating,
         rv.rating AS user_rating
       FROM rides r
       LEFT JOIN drivers d ON d.id = r.driver_id
       LEFT JOIN vehicles v ON v.driver_id = d.id AND v.is_active = TRUE
       LEFT JOIN users u ON u.id = d.user_id
       LEFT JOIN reviews rv ON rv.ride_id = r.id AND rv.reviewer_id = r.user_id AND rv.reviewer_type = 'user'
       WHERE r.user_id = $1
       ORDER BY r.created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
    );

    const countResult = await query(
      'SELECT COUNT(*) FROM rides WHERE user_id = $1',
      [req.user.id]
    );
    const total = parseInt(countResult.rows[0].count, 10);

    return res.status(200).json({
      success: true,
      data: {
        rides: rows,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── getFavorites ─────────────────────────────────────────────────────────────
const getFavorites = async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT id, label, address, lat, lng, created_at
       FROM favorite_locations
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    return res.status(200).json({
      success: true,
      data: { favorites: rows },
    });
  } catch (err) {
    next(err);
  }
};

// ─── addFavorite ──────────────────────────────────────────────────────────────
const addFavorite = async (req, res, next) => {
  try {
    const { label, address, lat, lng } = req.body;

    const { rows } = await query(
      `INSERT INTO favorite_locations (user_id, label, address, lat, lng)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, label, address, lat, lng, created_at`,
      [req.user.id, label, address, lat, lng]
    );

    return res.status(201).json({
      success: true,
      message: 'Favorite added successfully.',
      data: { favorite: rows[0] },
    });
  } catch (err) {
    next(err);
  }
};

// ─── deleteFavorite ───────────────────────────────────────────────────────────
const deleteFavorite = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      'DELETE FROM favorite_locations WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Favorite not found or does not belong to you.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Favorite deleted.',
    });
  } catch (err) {
    next(err);
  }
};

// ─── getNotifications ─────────────────────────────────────────────────────────
const getNotifications = async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT id, type, title, message AS body, is_read, created_at
       FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [req.user.id]
    );

    // Mark all unread as read
    await query(
      `UPDATE notifications SET is_read = true
       WHERE user_id = $1 AND is_read = false`,
      [req.user.id]
    );

    const unreadCount = rows.filter((n) => !n.is_read).length;

    return res.status(200).json({
      success: true,
      data: {
        notifications: rows,
        unread_count: unreadCount,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  getRideHistory,
  getFavorites,
  addFavorite,
  deleteFavorite,
  getNotifications,
};
