'use strict';

/**
 * src/routes/driver.routes.js
 * Driver-specific routes — require authenticate + authorize('driver').
 *
 * GET  /api/drivers/me
 * PUT  /api/drivers/me
 * PUT  /api/drivers/me/status
 * PUT  /api/drivers/me/location
 * GET  /api/drivers/me/rides
 * GET  /api/drivers/me/earnings
 * GET  /api/drivers/me/ratings
 * POST /api/drivers/rides/:id/accept
 * POST /api/drivers/rides/:id/reject
 * PUT  /api/drivers/rides/:id/status
 */

const { Router } = require('express');
const { body, param, query } = require('express-validator');
const multer = require('multer');
const path = require('path');

const {
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
} = require('../controllers/driver.controller');

const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');

const router = Router();

// ── Multer for driver profile picture ──────────────────────────────────────
const storage = multer.diskStorage({
  destination: 'uploads/profiles/',
  filename: (_req, file, cb) =>
    cb(null, `drv-${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => cb(null, /jpeg|jpg|png|webp/.test(file.mimetype)),
});

// All driver routes require authentication + driver role
router.use(authenticate, authorize('driver'));

// ── GET /me ────────────────────────────────────────────────────────────────
router.get('/me', getProfile);

// ── PUT /me ────────────────────────────────────────────────────────────────
router.put(
  '/me',
  upload.single('profile_pic'),
  [
    body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 chars.'),
    body('phone').optional().isMobilePhone().withMessage('Invalid phone number.'),
    body('vehicle_number').optional().trim().isLength({ min: 2, max: 20 }).withMessage('Invalid vehicle number.'),
    body('vehicle_model').optional().trim().isLength({ max: 60 }).withMessage('Vehicle model too long.'),
    body('vehicle_color').optional().trim().isLength({ max: 30 }).withMessage('Color too long.'),
    body('city').optional().trim().isLength({ min: 2, max: 80 }).withMessage('Invalid city.'),
  ],
  validate,
  updateProfile
);

// ── PUT /me/status ─────────────────────────────────────────────────────────
router.put(
  '/me/status',
  [
    body('status')
      .isIn(['online', 'offline', 'on_ride'])
      .withMessage('status must be online, offline, or on_ride.'),
  ],
  validate,
  updateStatus
);

// ── PUT /me/location ───────────────────────────────────────────────────────
router.put(
  '/me/location',
  [
    body('lat').isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude.'),
    body('lng').isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude.'),
  ],
  validate,
  updateLocation
);

// ── GET /me/rides ──────────────────────────────────────────────────────────
router.get(
  '/me/rides',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer.'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('limit must be 1–50.'),
  ],
  validate,
  getRides
);

// ── GET /me/earnings ───────────────────────────────────────────────────────
router.get(
  '/me/earnings',
  [
    query('period')
      .optional()
      .isIn(['daily', 'weekly', 'monthly'])
      .withMessage('period must be daily, weekly, or monthly.'),
  ],
  validate,
  getEarnings
);

// ── GET /me/ratings ────────────────────────────────────────────────────────
router.get('/me/ratings', getRatings);

// ── POST /rides/:id/accept ─────────────────────────────────────────────────
router.post(
  '/rides/:id/accept',
  [param('id').isUUID().withMessage('Invalid ride ID.')],
  validate,
  acceptRide
);

// ── POST /rides/:id/reject ─────────────────────────────────────────────────
router.post(
  '/rides/:id/reject',
  [
    param('id').isUUID().withMessage('Invalid ride ID.'),
    body('reason').optional().trim().isLength({ max: 300 }).withMessage('Reason too long.'),
  ],
  validate,
  rejectRide
);

// ── PUT /rides/:id/status ──────────────────────────────────────────────────
router.put(
  '/rides/:id/status',
  [
    param('id').isUUID().withMessage('Invalid ride ID.'),
    body('status')
      .isIn(['arrived', 'in_progress', 'completed'])
      .withMessage('status must be arrived, in_progress, or completed.'),
  ],
  validate,
  updateRideStatus
);

module.exports = router;
