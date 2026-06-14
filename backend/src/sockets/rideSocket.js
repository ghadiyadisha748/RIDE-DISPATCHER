'use strict';

/**
 * src/sockets/rideSocket.js
 * Registers all ride-related Socket.IO event handlers.
 *
 * Rooms used:
 *   ride:{rideId}      — user + driver on an active ride
 *   driver:{driverId}  — notifications to a specific driver
 *   user:{userId}      — notifications to a specific user
 *
 * Call registerRideSocketHandlers(io) once during server startup.
 */

const { query } = require('../config/db');

/**
 * @param {import('socket.io').Server} io
 */
const registerRideSocketHandlers = (io) => {
  io.on('connection', (socket) => {

    // ── driver:update_location ─────────────────────────────────────────────
    // Emitted by driver app periodically while on a ride.
    // Broadcasts real-time location to the ride room.
    socket.on('driver:update_location', async ({ driverId, rideId, lat, lng }) => {
      if (!driverId || !rideId || lat === undefined || lng === undefined) return;

      try {
        // Persist to DB (fire-and-forget; don't await in socket handler)
        query(
          'UPDATE drivers SET current_lat = $1, current_lng = $2, location_updated_at = NOW() WHERE id = $3',
          [lat, lng, driverId]
        ).catch((e) => console.error('[Socket] location update DB error:', e.message));

        // Broadcast to the ride room (user sees driver moving on map)
        socket.to(`ride:${rideId}`).emit('driver:location_update', {
          driverId,
          lat,
          lng,
          timestamp: new Date().toISOString(),
        });
      } catch (err) {
        console.error('[Socket] driver:update_location error:', err.message);
      }
    });

    // ── ride:request ───────────────────────────────────────────────────────
    // Emitted by server (via dispatchRide) to notify nearby drivers.
    // The client (driver app) listens for this to show the request card.
    socket.on('ride:request', ({ rideId, driverId, rideDetails }) => {
      if (!driverId || !rideId) return;
      io.to(`driver:${driverId}`).emit('ride:request', {
        rideId,
        ...rideDetails,
        timestamp: new Date().toISOString(),
      });
      console.log(`[Socket] 📣 ride:request sent to driver:${driverId} for ride:${rideId}`);
    });

    // ── ride:accept ────────────────────────────────────────────────────────
    // Emitted by driver app when driver taps Accept.
    // Notifies the waiting user that a driver is on the way.
    socket.on('ride:accept', async ({ rideId, driverId, userId }) => {
      if (!rideId || !driverId || !userId) return;

      try {
        // Fetch driver info for user notification
        const { rows } = await query(
          `SELECT du.name, du.phone, d.vehicle_number, d.vehicle_model,
                  d.vehicle_color, d.avg_rating, d.current_lat, d.current_lng
           FROM drivers d JOIN users du ON du.id = d.user_id
           WHERE d.id = $1`,
          [driverId]
        );

        io.to(`user:${userId}`).emit('ride:accepted', {
          rideId,
          driver: rows[0] || { id: driverId },
          timestamp: new Date().toISOString(),
        });

        // Both user and driver join the shared ride room
        socket.join(`ride:${rideId}`);
        io.to(`user:${userId}`).emit('ride:join_room', { room: `ride:${rideId}` });

        console.log(`[Socket] ✅ ride:accepted — ride:${rideId} accepted by driver:${driverId}`);
      } catch (err) {
        console.error('[Socket] ride:accept error:', err.message);
      }
    });

    // ── ride:status_update ─────────────────────────────────────────────────
    // Emitted by driver app at key trip milestones:
    //   arrived → in_progress → completed
    socket.on('ride:status_update', ({ rideId, userId, status, meta }) => {
      if (!rideId || !status) return;

      // Notify the user
      io.to(`user:${userId}`).emit('ride:status_update', {
        rideId,
        status,
        meta: meta || {},
        timestamp: new Date().toISOString(),
      });

      // Also broadcast to the shared ride room
      io.to(`ride:${rideId}`).emit('ride:status_update', {
        rideId,
        status,
        meta: meta || {},
        timestamp: new Date().toISOString(),
      });

      console.log(`[Socket] 🚕 ride:status_update — ride:${rideId} → ${status}`);

      // Clean up ride room when ride is done
      if (status === 'completed' || status === 'cancelled') {
        io.socketsLeave(`ride:${rideId}`);
        console.log(`[Socket] 🧹 Cleared room ride:${rideId}`);
      }
    });

    // ── chat:message ───────────────────────────────────────────────────────
    // Simple in-ride chat between user and driver
    socket.on('chat:message', ({ rideId, senderId, senderRole, message }) => {
      if (!rideId || !message) return;
      socket.to(`ride:${rideId}`).emit('chat:message', {
        senderId,
        senderRole,
        message,
        timestamp: new Date().toISOString(),
      });
    });

    // ── ride:sos ───────────────────────────────────────────────────────────
    // Emergency SOS from user or driver during a ride
    socket.on('ride:sos', ({ rideId, userId, lat, lng }) => {
      console.warn(`[Socket] 🆘 SOS from user:${userId} in ride:${rideId} at [${lat},${lng}]`);
      // Notify all admin sockets
      io.to('room:admins').emit('ride:sos', {
        rideId,
        userId,
        lat,
        lng,
        timestamp: new Date().toISOString(),
      });
    });
  });

  console.log('[Socket] 🔌 Ride socket handlers registered.');
};

module.exports = { registerRideSocketHandlers };
