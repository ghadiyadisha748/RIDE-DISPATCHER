'use strict';

/**
 * src/routes/ride.routes.js
 * Ride-related routes — accessible by authenticated users.
 *
 * POST /api/rides/estimate
 * POST /api/rides/book
 * GET  /api/rides/:id
 * PUT  /api/rides/:id/cancel
 * GET  /api/rides/:id/status
 * POST /api/rides/:id/review
 * GET  /api/rides/:id/receipt
 */

const { Router } = require('express');
const { body, param } = require('express-validator');

const {
  estimateFare,
  bookRide,
  getRide,
  cancelRide,
  getRideStatus,
  submitReview,
  getReceipt,
} = require('../controllers/ride.controller');

const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = Router();

// All ride routes require authentication
router.use(authenticate);

// ── POST /estimate ─────────────────────────────────────────────────────────
router.post(
  '/estimate',
  [
    body('vehicle_type')
      .isIn(['auto', 'bike', 'cab', 'premium'])
      .withMessage('vehicle_type must be auto, bike, cab, or premium.'),
    body('distance_km')
      .isFloat({ min: 0.1 }).withMessage('distance_km must be > 0.'),
    body('duration_min')
      .isFloat({ min: 1 }).withMessage('duration_min must be > 0.'),
  ],
  validate,
  estimateFare
);

// ── POST /book ─────────────────────────────────────────────────────────────
router.post(
  '/book',
  [
    body('vehicle_type')
      .isIn(['auto', 'bike', 'cab', 'premium'])
      .withMessage('vehicle_type must be auto, bike, cab, or premium.'),
    body('pickup_lat').isFloat({ min: -90, max: 90 }).withMessage('Invalid pickup latitude.'),
    body('pickup_lng').isFloat({ min: -180, max: 180 }).withMessage('Invalid pickup longitude.'),
    body('pickup_address').trim().notEmpty().withMessage('Pickup address is required.'),
    body('drop_lat').isFloat({ min: -90, max: 90 }).withMessage('Invalid drop latitude.'),
    body('drop_lng').isFloat({ min: -180, max: 180 }).withMessage('Invalid drop longitude.'),
    body('drop_address').trim().notEmpty().withMessage('Drop address is required.'),
    body('distance_km').isFloat({ min: 0.1 }).withMessage('distance_km must be > 0.'),
    body('duration_min').isFloat({ min: 1 }).withMessage('duration_min must be > 0.'),
  ],
  validate,
  bookRide
);

// ── GET /:id ───────────────────────────────────────────────────────────────
router.get(
  '/:id',
  [param('id').isUUID().withMessage('Invalid ride ID.')],
  validate,
  getRide
);

// ── PUT /:id/cancel ────────────────────────────────────────────────────────
router.put(
  '/:id/cancel',
  [
    param('id').isUUID().withMessage('Invalid ride ID.'),
    body('reason').optional().trim().isLength({ max: 300 }).withMessage('Reason too long.'),
  ],
  validate,
  cancelRide
);

// ── GET /:id/status ────────────────────────────────────────────────────────
router.get(
  '/:id/status',
  [param('id').isUUID().withMessage('Invalid ride ID.')],
  validate,
  getRideStatus
);

// ── POST /:id/review ───────────────────────────────────────────────────────
router.post(
  '/:id/review',
  [
    param('id').isUUID().withMessage('Invalid ride ID.'),
    body('rating')
      .isInt({ min: 1, max: 5 }).withMessage('Rating must be an integer between 1 and 5.'),
    body('comment')
      .optional()
      .trim()
      .isLength({ max: 1000 }).withMessage('Comment must be under 1000 characters.'),
  ],
  validate,
  submitReview
);

// ── GET /:id/receipt ───────────────────────────────────────────────────────
router.get(
  '/:id/receipt',
  [param('id').isUUID().withMessage('Invalid ride ID.')],
  validate,
  getReceipt
);

module.exports = router;
