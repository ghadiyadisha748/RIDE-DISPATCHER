'use strict';

/**
 * src/routes/auth.routes.js
 * Authentication routes — publicly accessible (no auth middleware).
 * POST /api/auth/register
 * POST /api/auth/login
 * POST /api/auth/logout
 * POST /api/auth/refresh-token
 * POST /api/auth/forgot-password
 * POST /api/auth/reset-password
 * GET  /api/auth/verify-email/:token
 */

const { Router } = require('express');
const { body } = require('express-validator');

const {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  verifyEmail,
} = require('../controllers/auth.controller');

const { validate } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

const router = Router();

// ── Apply auth rate limiter to all routes in this file ─────────────────────
router.use(authLimiter);

// ── POST /register ─────────────────────────────────────────────────────────
router.post(
  '/register',
  [
    body('name')
      .trim()
      .notEmpty().withMessage('Name is required.')
      .isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 characters.'),
    body('email')
      .trim()
      .isEmail().withMessage('A valid email is required.')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
      .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter.')
      .matches(/[0-9]/).withMessage('Password must contain at least one number.'),
    body('phone')
      .optional()
      .isMobilePhone().withMessage('Provide a valid phone number.'),
    body('role')
      .optional()
      .isIn(['user', 'driver']).withMessage('Role must be "user" or "driver".'),
  ],
  validate,
  register
);

// ── POST /login ────────────────────────────────────────────────────────────
router.post(
  '/login',
  [
    body('email')
      .trim()
      .isEmail().withMessage('A valid email is required.')
      .normalizeEmail(),
    body('password')
      .notEmpty().withMessage('Password is required.'),
  ],
  validate,
  login
);

// ── POST /logout ───────────────────────────────────────────────────────────
// authenticate is optional — we clear the cookie regardless
router.post('/logout', authenticate, logout);

// ── POST /refresh-token ────────────────────────────────────────────────────
router.post('/refresh-token', refreshToken);

// ── POST /forgot-password ──────────────────────────────────────────────────
router.post(
  '/forgot-password',
  [
    body('email')
      .trim()
      .isEmail().withMessage('A valid email is required.')
      .normalizeEmail(),
  ],
  validate,
  forgotPassword
);

// ── POST /reset-password ───────────────────────────────────────────────────
router.post(
  '/reset-password',
  [
    body('token').notEmpty().withMessage('Reset token is required.'),
    body('password')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
      .matches(/[A-Z]/).withMessage('Must contain at least one uppercase letter.')
      .matches(/[0-9]/).withMessage('Must contain at least one number.'),
  ],
  validate,
  resetPassword
);

// ── GET /verify-email/:token ───────────────────────────────────────────────
router.get('/verify-email/:token', verifyEmail);

module.exports = router;
