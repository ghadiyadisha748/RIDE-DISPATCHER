'use strict';

/**
 * src/middleware/auth.js
 * JWT authentication middleware.
 *
 * Exports:
 *  - authenticate      : requires a valid access token; 401 if missing/invalid
 *  - optionalAuth      : populates req.user when a valid token exists; no error if absent
 */

const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');

// ─── Token Extractor ──────────────────────────────────────────────────────────
/**
 * Reads the Bearer token from the Authorization header.
 * @param {import('express').Request} req
 * @returns {string|null}
 */
const extractToken = (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  return null;
};

// ─── Token Verifier ───────────────────────────────────────────────────────────
/**
 * Verifies a JWT and returns the decoded payload.
 * @param {string} token
 * @returns {{ id: string, role: string, email: string }}
 */
const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

// ─── authenticate ─────────────────────────────────────────────────────────────
/**
 * Requires a valid Bearer access token.
 * Attaches req.user = { id, role, email } on success.
 * Returns 401 if the token is missing, expired, or invalid.
 */
const authenticate = (req, res, next) => {
  try {
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please provide a valid access token.',
      });
    }

    const decoded = verifyToken(token);
    req.user = {
      id: decoded.id,
      role: decoded.role,
      email: decoded.email,
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Access token has expired. Please refresh your token.',
        code: 'TOKEN_EXPIRED',
      });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid access token.',
        code: 'TOKEN_INVALID',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Authentication failed.',
    });
  }
};

// ─── optionalAuth ─────────────────────────────────────────────────────────────
/**
 * Populates req.user if a valid token is present, but does NOT reject the
 * request when the header is absent. Useful for public endpoints that have
 * richer responses for logged-in users.
 */
const optionalAuth = (req, res, next) => {
  try {
    const token = extractToken(req);
    if (token) {
      const decoded = verifyToken(token);
      req.user = {
        id: decoded.id,
        role: decoded.role,
        email: decoded.email,
      };
    }
  } catch (_) {
    // Silently ignore invalid / expired tokens in optional mode
    req.user = null;
  }
  next();
};

module.exports = { authenticate, optionalAuth };
