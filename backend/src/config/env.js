'use strict';

/**
 * src/config/env.js
 * Validates and exports all required environment variables.
 * Fails fast on startup if critical variables are missing.
 */

require('dotenv').config();

// ─── Required Variables ───────────────────────────────────────────────────────
const REQUIRED_VARS = [
  'DATABASE_URL',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'CORS_ORIGIN',
  'SMTP_HOST',
  'SMTP_USER',
  'SMTP_PASS',
  'FRONTEND_URL',
];

const missing = REQUIRED_VARS.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(
    `[ENV] ❌ Missing required environment variables: ${missing.join(', ')}`
  );
  console.error('[ENV] Copy .env.example to .env and fill in the values.');
  process.exit(1);
}

// ─── Export Validated Config ──────────────────────────────────────────────────
const env = {
  // Server
  PORT: parseInt(process.env.PORT, 10) || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Database
  DATABASE_URL: process.env.DATABASE_URL,

  // JWT
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '30d',

  // AI Service
  AI_SERVICE_URL: process.env.AI_SERVICE_URL || 'http://localhost:8000',

  // CORS & Frontend
  CORS_ORIGIN: process.env.CORS_ORIGIN,
  FRONTEND_URL: process.env.FRONTEND_URL,

  // SMTP / Email
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: parseInt(process.env.SMTP_PORT, 10) || 587,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,

  // Convenience helpers
  isDev: (process.env.NODE_ENV || 'development') === 'development',
  isProd: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
};

console.log(
  `[ENV] ✅ Environment loaded — NODE_ENV=${env.NODE_ENV}, PORT=${env.PORT}`
);

module.exports = env;
