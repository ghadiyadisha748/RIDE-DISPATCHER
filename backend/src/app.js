'use strict';

/**
 * src/app.js
 * Express application setup.
 * Creates and configures the Express app — no server.listen() here.
 * server.js creates the HTTP server and starts listening.
 */

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const path = require('path');

const env = require('./config/env');
const { apiLimiter } = require('./middleware/rateLimiter');
const { errorHandler } = require('./middleware/errorHandler');

// ── Route Imports ─────────────────────────────────────────────────────────
const authRoutes   = require('./routes/auth.routes');
const userRoutes   = require('./routes/user.routes');
const rideRoutes   = require('./routes/ride.routes');
const driverRoutes = require('./routes/driver.routes');
const adminRoutes  = require('./routes/admin.routes');
const aiRoutes     = require('./routes/ai.routes');

// ── App Instantiation ─────────────────────────────────────────────────────
const app = express();

// ── Security Middleware ───────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow uploaded file serving
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      const allowed = [env.CORS_ORIGIN, env.FRONTEND_URL].filter(Boolean);
      // Allow requests with no origin (e.g. mobile apps, Postman, server-to-server)
      if (!origin || allowed.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin "${origin}" not allowed.`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// ── Logging ───────────────────────────────────────────────────────────────
app.use(morgan(env.isDev ? 'dev' : 'combined'));

// ── Body Parsing ──────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ── Compression ───────────────────────────────────────────────────────────
app.use(compression());

// ── Static Files (uploaded images) ───────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ── General API Rate Limiter ──────────────────────────────────────────────
app.use('/api', apiLimiter);

// ── Health Check ──────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: env.NODE_ENV,
  });
});

// ── API Routes ────────────────────────────────────────────────────────────
app.use('/api/auth',    authRoutes);
app.use('/api/users',   userRoutes);
app.use('/api/rides',   rideRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/admin',   adminRoutes);
app.use('/api/ai',      aiRoutes);

// ── Root ──────────────────────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'Ride Dispatcher API is running.',
    version: '1.0.0',
    docs: '/api/docs',
  });
});

// ── 404 Handler ───────────────────────────────────────────────────────────
app.use((_req, res, _next) => {
  res.status(404).json({
    success: false,
    message: `Route ${_req.method} ${_req.originalUrl} not found.`,
  });
});

// ── Global Error Handler (MUST be last) ───────────────────────────────────
app.use(errorHandler);

module.exports = app;
