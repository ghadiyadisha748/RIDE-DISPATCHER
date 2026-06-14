'use strict';

/**
 * src/middleware/rbac.js
 * Role-Based Access Control middleware.
 *
 * Usage:
 *   router.delete('/users/:id', authenticate, authorize('admin'), handler);
 *   router.get('/rides',        authenticate, authorize('driver', 'admin'), handler);
 *
 * Valid roles: 'user' | 'driver' | 'admin'
 */

const VALID_ROLES = new Set(['user', 'driver', 'admin']);

/**
 * Returns Express middleware that restricts access to the given roles.
 *
 * @param {...string} roles - One or more allowed roles
 * @returns {import('express').RequestHandler}
 */
const authorize = (...roles) => {
  // Validate role names at definition time (fail fast during startup)
  roles.forEach((role) => {
    if (!VALID_ROLES.has(role)) {
      throw new Error(
        `[RBAC] Unknown role "${role}" passed to authorize(). Valid roles: ${[...VALID_ROLES].join(', ')}`
      );
    }
  });

  return (req, res, next) => {
    // authenticate() must run before authorize()
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    if (!roles.includes(req.user.role)) {
      console.warn(
        `[RBAC] 🚫 Access denied — user ${req.user.id} (role: ${req.user.role}) attempted ${req.method} ${req.originalUrl}`
      );
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role(s): ${roles.join(', ')}.`,
      });
    }

    next();
  };
};

module.exports = { authorize };
