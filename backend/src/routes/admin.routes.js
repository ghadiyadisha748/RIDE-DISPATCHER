'use strict';

/**
 * src/routes/admin.routes.js
 * Admin-only routes — require authenticate + authorize('admin').
 *
 * GET  /api/admin/dashboard
 * GET  /api/admin/users
 * PUT  /api/admin/users/:id/status
 * GET  /api/admin/drivers
 * PUT  /api/admin/drivers/:id/verify
 * GET  /api/admin/rides
 * GET  /api/admin/complaints
 * PUT  /api/admin/complaints/:id
 * GET  /api/admin/revenue
 * GET  /api/admin/analytics/demand/:area
 */

const { Router } = require('express');
const { body, param, query } = require('express-validator');

const {
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
} = require('../controllers/admin.controller');

const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');

const router = Router();

// All admin routes require authentication + admin role
router.use(authenticate, authorize('admin'));

// ── GET /dashboard ─────────────────────────────────────────────────────────
router.get('/dashboard', getDashboardStats);

// ── GET /users ─────────────────────────────────────────────────────────────
router.get(
  '/users',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer.'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be 1–100.'),
    query('search').optional().trim().isLength({ max: 100 }).withMessage('Search query too long.'),
  ],
  validate,
  getUsers
);

// ── PUT /users/:id/status ──────────────────────────────────────────────────
router.put(
  '/users/:id/status',
  [
    param('id').isUUID().withMessage('Invalid user ID.'),
    body('is_active').isBoolean().withMessage('is_active must be a boolean.'),
    body('reason').optional().trim().isLength({ max: 500 }).withMessage('Reason too long.'),
  ],
  validate,
  updateUserStatus
);

// ── GET /drivers ───────────────────────────────────────────────────────────
router.get(
  '/drivers',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer.'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be 1–100.'),
    query('status')
      .optional()
      .isIn(['pending', 'verified', 'rejected'])
      .withMessage('status must be pending, verified, or rejected.'),
  ],
  validate,
  getDrivers
);

// ── PUT /drivers/:id/verify ────────────────────────────────────────────────
router.put(
  '/drivers/:id/verify',
  [
    param('id').isUUID().withMessage('Invalid driver ID.'),
    body('action')
      .isIn(['approve', 'reject'])
      .withMessage('action must be "approve" or "reject".'),
    body('reason').optional().trim().isLength({ max: 500 }).withMessage('Reason too long.'),
  ],
  validate,
  verifyDriver
);

// ── GET /rides ─────────────────────────────────────────────────────────────
router.get(
  '/rides',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer.'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be 1–100.'),
    query('status')
      .optional()
      .isIn(['searching', 'accepted', 'in_progress', 'completed', 'cancelled'])
      .withMessage('Invalid ride status.'),
    query('vehicle_type')
      .optional()
      .isIn(['auto', 'bike', 'cab', 'premium'])
      .withMessage('Invalid vehicle type.'),
  ],
  validate,
  getRides
);

// ── GET /complaints ────────────────────────────────────────────────────────
router.get(
  '/complaints',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer.'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be 1–100.'),
    query('status')
      .optional()
      .isIn(['open', 'in_review', 'resolved', 'closed'])
      .withMessage('Invalid complaint status.'),
  ],
  validate,
  getComplaints
);

// ── PUT /complaints/:id ────────────────────────────────────────────────────
router.put(
  '/complaints/:id',
  [
    param('id').isUUID().withMessage('Invalid complaint ID.'),
    body('status')
      .isIn(['open', 'in_review', 'resolved', 'closed'])
      .withMessage('Invalid status.'),
    body('resolution_note')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Resolution note too long.'),
  ],
  validate,
  updateComplaint
);

// ── GET /revenue ───────────────────────────────────────────────────────────
router.get(
  '/revenue',
  [
    query('period')
      .optional()
      .isIn(['daily', 'weekly', 'monthly'])
      .withMessage('period must be daily, weekly, or monthly.'),
  ],
  validate,
  getRevenue
);

// ── GET /analytics/demand/:area ────────────────────────────────────────────
router.get(
  '/analytics/demand/:area',
  [
    param('area').trim().notEmpty().withMessage('Area is required.'),
    query('hour')
      .optional()
      .isInt({ min: 0, max: 23 })
      .withMessage('hour must be 0–23.'),
  ],
  validate,
  getDemandAnalytics
);

module.exports = router;
