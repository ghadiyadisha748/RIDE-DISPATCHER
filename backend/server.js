'use strict';

/**
 * server.js
 * Entry point for the Ride Dispatcher API.
 *
 * Responsibilities:
 *  1. Create an HTTP server from the Express app
 *  2. Initialise Socket.IO
 *  3. Register socket event handlers
 *  4. Connect to PostgreSQL
 *  5. Start listening
 *
 * Keep this file thin — all business logic lives in src/.
 */

const http = require('http');

// Load env first (validates required variables; exits on missing)
const env = require('./src/config/env');

const app = require('./src/app');
const { connect: connectDB } = require('./src/config/db');
const { initSocket } = require('./src/config/socket');
const { registerRideSocketHandlers } = require('./src/sockets/rideSocket');

// ─── HTTP Server ──────────────────────────────────────────────────────────────
const server = http.createServer(app);

// ─── Socket.IO ────────────────────────────────────────────────────────────────
const io = initSocket(server);
registerRideSocketHandlers(io);

// ─── Startup ──────────────────────────────────────────────────────────────────
const start = async () => {
  try {
    // Verify database connectivity
    await connectDB();

    // Start HTTP server
    server.listen(env.PORT, () => {
      console.log('');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`  🚀  Ride Dispatcher API`);
      console.log(`  🌍  Environment : ${env.NODE_ENV}`);
      console.log(`  📡  Listening   : http://localhost:${env.PORT}`);
      console.log(`  ❤️   Health      : http://localhost:${env.PORT}/health`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('');
    });
  } catch (err) {
    console.error('[Server] ❌ Failed to start:', err.message);
    process.exit(1);
  }
};

start();

// ─── Graceful Shutdown ────────────────────────────────────────────────────────
const shutdown = (signal) => {
  console.log(`\n[Server] ${signal} received. Shutting down gracefully…`);
  server.close(() => {
    console.log('[Server] HTTP server closed.');
    process.exit(0);
  });

  // Force exit after 10 s if connections linger
  setTimeout(() => {
    console.error('[Server] ⚠️  Forced shutdown after timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// ─── Unhandled Errors ─────────────────────────────────────────────────────────
process.on('unhandledRejection', (reason) => {
  console.error('[Server] ❌ Unhandled Promise Rejection:', reason);
  // In production, exit and let the process manager restart
  if (env.isProd) process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('[Server] ❌ Uncaught Exception:', err.message);
  process.exit(1);
});
