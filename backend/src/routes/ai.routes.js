'use strict';

/**
 * src/routes/ai.routes.js
 * Proxy routes to the Python FastAPI AI service.
 * Accessible by authenticated users.
 *
 * POST /api/ai/fare-predict
 * GET  /api/ai/demand/:area
 */

const { Router } = require('express');
const { body, param, query } = require('express-validator');

const { predictFare, getDemandForecast } = require('../services/ai.service');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = Router();

// All AI proxy routes require authentication
router.use(authenticate);

// ── POST /fare-predict ─────────────────────────────────────────────────────
router.post(
  '/fare-predict',
  [
    body('vehicle_type')
      .isIn(['auto', 'bike', 'cab', 'premium'])
      .withMessage('vehicle_type must be auto, bike, cab, or premium.'),
    body('distance_km').isFloat({ min: 0.1 }).withMessage('distance_km must be > 0.'),
    body('duration_min').isFloat({ min: 1 }).withMessage('duration_min must be > 0.'),
    body('city').optional().trim(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const result = await predictFare({
        vehicle_type: req.body.vehicle_type,
        distance_km: req.body.distance_km,
        duration_min: req.body.duration_min,
        city: req.body.city,
        hour: new Date().getHours(),
      });

      if (!result.ok) {
        return res.status(503).json({
          success: false,
          message: 'AI service is currently unavailable. Please use /rides/estimate for a formula-based estimate.',
        });
      }

      return res.status(200).json({
        success: true,
        data: result.data,
      });
    } catch (err) {
      next(err);
    }
  }
);

// ── GET /demand/:area ──────────────────────────────────────────────────────
router.get(
  '/demand/:area',
  [
    param('area').trim().notEmpty().withMessage('Area is required.'),
    query('hour')
      .optional()
      .isInt({ min: 0, max: 23 })
      .withMessage('hour must be 0–23.'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { area } = req.params;
      const hour = req.query.hour ? parseInt(req.query.hour, 10) : new Date().getHours();

      const result = await getDemandForecast(area, hour);

      return res.status(200).json({
        success: true,
        source: result.ok ? 'ai' : 'fallback',
        data: result.data,
      });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
