'use strict';

/**
 * src/middleware/validate.js
 * Request validation middleware using express-validator.
 *
 * Usage (in a route file):
 *   const { body } = require('express-validator');
 *   const { validate } = require('../middleware/validate');
 *
 *   router.post(
 *     '/register',
 *     [body('email').isEmail(), body('password').isLength({ min: 8 })],
 *     validate,
 *     authController.register
 *   );
 */

const { validationResult } = require('express-validator');

/**
 * Runs all express-validator checks accumulated in `req` and returns a 422
 * response with structured field errors if any check failed.
 *
 * On success, calls next() so the real handler can proceed.
 *
 * @type {import('express').RequestHandler}
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Format errors as an array of { field, message } objects
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param || 'unknown',
      message: err.msg,
      value: err.value !== undefined ? err.value : undefined,
    }));

    return res.status(422).json({
      success: false,
      message: 'Validation failed. Please check the highlighted fields.',
      errors: formattedErrors,
    });
  }

  next();
};

module.exports = { validate };
