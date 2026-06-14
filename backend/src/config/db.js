'use strict';

/**
 * src/config/db.js
 * PostgreSQL connection pool using the `pg` library.
 * Exports a query() helper and getClient() for manual transaction management.
 */

const { Pool } = require('pg');
const env = require('./env');

// ─── Connection Pool ──────────────────────────────────────────────────────────
const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 20,                 // maximum pool size
  idleTimeoutMillis: 30000, // close idle clients after 30 s
  connectionTimeoutMillis: 5000, // fail after 5 s if no connection available
  ssl: env.isProd ? { rejectUnauthorized: false } : false,
});

// ─── Pool Event Listeners ─────────────────────────────────────────────────────
pool.on('connect', () => {
  if (env.isDev) console.log('[DB] New client connected to PostgreSQL');
});

pool.on('error', (err) => {
  console.error('[DB] ❌ Unexpected error on idle PostgreSQL client:', err.message);
});

// ─── Connectivity Check ───────────────────────────────────────────────────────
/**
 * Verifies the pool can reach the database.
 * Called once during server startup.
 */
const connect = async () => {
  try {
    const result = await pool.query('SELECT NOW() AS current_time');
    console.log(
      `[DB] ✅ PostgreSQL connected — server time: ${result.rows[0].current_time}`
    );
  } catch (err) {
    console.error('[DB] ❌ Failed to connect to PostgreSQL:', err.message);
    throw err; // let server.js decide whether to exit
  }
};

// ─── Query Helper ─────────────────────────────────────────────────────────────
/**
 * Executes a parameterized SQL query.
 * @param {string} text  - SQL statement with $1, $2, … placeholders
 * @param {Array}  params - Ordered parameter values
 * @returns {Promise<pg.QueryResult>}
 */
const query = async (text, params) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    if (env.isDev) {
      console.log(`[DB] query executed in ${duration}ms — rows: ${result.rowCount}`);
    }
    return result;
  } catch (err) {
    console.error('[DB] ❌ Query error:', { text, params, error: err.message });
    throw err;
  }
};

// ─── Transaction Client ───────────────────────────────────────────────────────
/**
 * Retrieves a pooled client for manual transaction management.
 * Caller must call client.release() when done.
 *
 * Usage:
 *   const client = await getClient();
 *   try {
 *     await client.query('BEGIN');
 *     ...
 *     await client.query('COMMIT');
 *   } catch (e) {
 *     await client.query('ROLLBACK');
 *     throw e;
 *   } finally {
 *     client.release();
 *   }
 */
const getClient = () => pool.connect();

module.exports = { pool, query, getClient, connect };
