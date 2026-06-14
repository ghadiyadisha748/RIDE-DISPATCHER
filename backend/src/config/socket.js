'use strict';

/**
 * src/config/socket.js
 * Initialises and exports the Socket.IO instance.
 * Provides initSocket(server) for startup and getIO() for use anywhere.
 */

const { Server } = require('socket.io');
const env = require('./env');

/** @type {import('socket.io').Server|null} */
let io = null;

// ─── Initialise ───────────────────────────────────────────────────────────────
/**
 * Attaches Socket.IO to the HTTP server.
 * Must be called once in server.js before the server starts listening.
 *
 * @param {import('http').Server} server - Node HTTP server instance
 * @returns {import('socket.io').Server}
 */
const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [env.CORS_ORIGIN, env.FRONTEND_URL].filter(Boolean),
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      credentials: true,
    },
    // Increase ping timeout for poor mobile connections
    pingTimeout: 60000,
    pingInterval: 25000,
    // Allow both polling and websocket transports
    transports: ['polling', 'websocket'],
  });

  // ── Connection lifecycle ──────────────────────────────────────────────────
  io.on('connection', (socket) => {
    console.log(`[Socket] 🟢 Client connected — id: ${socket.id}`);

    // Client sends its userId/driverId to join a personal room
    socket.on('join:room', ({ type, id }) => {
      if (!type || !id) return;
      const room = `${type}:${id}`;
      socket.join(room);
      console.log(`[Socket] 📦 ${socket.id} joined room "${room}"`);
    });

    // Client leaves a ride room
    socket.on('leave:room', ({ room }) => {
      socket.leave(room);
      console.log(`[Socket] 📤 ${socket.id} left room "${room}"`);
    });

    socket.on('disconnect', (reason) => {
      console.log(`[Socket] 🔴 Client disconnected — id: ${socket.id} reason: ${reason}`);
    });

    socket.on('error', (err) => {
      console.error(`[Socket] ❌ Error on socket ${socket.id}:`, err.message);
    });
  });

  console.log('[Socket] ✅ Socket.IO initialised');
  return io;
};

// ─── Getter ───────────────────────────────────────────────────────────────────
/**
 * Returns the initialised Socket.IO instance.
 * Throws if called before initSocket().
 *
 * @returns {import('socket.io').Server}
 */
const getIO = () => {
  if (!io) {
    throw new Error(
      '[Socket] getIO() called before initSocket(). Make sure to call initSocket(server) in server.js.'
    );
  }
  return io;
};

module.exports = { initSocket, getIO };
