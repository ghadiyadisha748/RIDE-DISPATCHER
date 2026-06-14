'use strict';

/**
 * src/routes/user.routes.js
 * User profile & account routes — all protected by authenticate middleware.
 *
 * GET    /api/users/me
 * PUT    /api/users/me
 * PUT    /api/users/me/password
 * GET    /api/users/me/rides
 * GET    /api/users/me/favorites
 * POST   /api/users/me/favorites
 * DELETE /api/users/me/favorites/:id
 * GET    /api/users/me/notifications
 */

const { Router } = require('express');
const { body, param, query } = require('express-validator');
const multer = require('multer');
const path = require('path');

const {
  getProfile,
  updateProfile,
  changePassword,
  getRideHistory,
  getFavorites,
  addFavorite,
  deleteFavorite,
  getNotifications,
} = require('../controllers/user.controller');

const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = Router();

// ── Multer config for profile pictures ─────────────────────────────────────
const storage = multer.diskStorage({
  destination: 'uploads/profiles/',
  filename: (_req, file, cb) =>
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`),
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    cb(null, allowed.test(file.mimetype));
  },
});

// All user routes require authentication
router.use(authenticate);

// ── GET /me ────────────────────────────────────────────────────────────────
router.get('/me', getProfile);

// ── PUT /me ────────────────────────────────────────────────────────────────
router.put(
  '/me',
  upload.single('profile_pic'),
  [
    body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 chars.'),
    body('phone').optional().isMobilePhone().withMessage('Provide a valid phone number.'),
    body('city').optional().trim().isLength({ min: 2, max: 80 }).withMessage('Invalid city name.'),
  ],
  validate,
  updateProfile
);

// ── PUT /me/password ───────────────────────────────────────────────────────
router.put(
  '/me/password',
  [
    body('current_password').notEmpty().withMessage('Current password is required.'),
    body('new_password')
      .isLength({ min: 8 }).withMessage('New password must be at least 8 characters.')
      .matches(/[A-Z]/).withMessage('Must contain at least one uppercase letter.')
      .matches(/[0-9]/).withMessage('Must contain at least one number.'),
  ],
  validate,
  changePassword
);

// ── GET /me/rides ──────────────────────────────────────────────────────────
router.get(
  '/me/rides',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer.'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('limit must be 1–50.'),
  ],
  validate,
  getRideHistory
);

// ── GET /me/favorites ──────────────────────────────────────────────────────
router.get('/me/favorites', getFavorites);

// ── POST /me/favorites ─────────────────────────────────────────────────────
router.post(
  '/me/favorites',
  [
    body('label').trim().notEmpty().withMessage('Label is required.'),
    body('address').trim().notEmpty().withMessage('Address is required.'),
    body('lat').isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude.'),
    body('lng').isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude.'),
  ],
  validate,
  addFavorite
);

// ── DELETE /me/favorites/:id ───────────────────────────────────────────────
router.delete(
  '/me/favorites/:id',
  [param('id').isUUID().withMessage('Invalid favorite ID.')],
  validate,
  deleteFavorite
);

// ── GET /me/notifications ──────────────────────────────────────────────────
router.get('/me/notifications', getNotifications);

module.exports = router;
