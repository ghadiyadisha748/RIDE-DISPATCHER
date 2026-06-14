'use strict';

/**
 * src/middleware/rateLimiter.js
 * Rate limiting middleware using express-rate-limit.
 *
 * Exports:
 *  - authLimiter : 5 requests per 15 minutes (auth routes)
 *  - apiLimiter  : 100 requests per minute (general API)
 */

const rateLimit = require('express-rate-limit');

// ─── Shared Handler ───────────────────────────────────────────────────────────
const rateLimitHandler = (req, res) => {
  console.warn(
    `[RateLimit] 🚫 Too many requests from IP: ${req.ip} on ${req.originalUrl}`
  );
  res.status(429).json({
    success: false,
    message: 'Too many requests. Please slow down and try again later.',
    retryAfter: res.getHeader('Retry-After'),
  });
};

// ─── Auth Limiter ─────────────────────────────────────────────────────────────
/**
 * Strict limiter for authentication endpoints (login, register, forgot-password).
 * 5 requests per 15 minutes per IP.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,  // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false,   // Disable `X-RateLimit-*` headers
  handler: rateLimitHandler,
  skipSuccessfulRequests: false,
  message: 'Too many authentication attempts. Please try again in 15 minutes.',
});

// ─── API Limiter ──────────────────────────────────────────────────────────────
/**
 * General limiter for all other API routes.
 * 100 requests per minute per IP.
 */
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  skipSuccessfulRequests: false,
  message: 'Too many requests. Please try again in a minute.',
});

module.exports = { authLimiter, apiLimiter };
