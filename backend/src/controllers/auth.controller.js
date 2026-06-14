'use strict';

/**
 * src/controllers/auth.controller.js
 * Handles all authentication flows: register, login, logout,
 * token refresh, forgot/reset password, and email verification.
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
const { query } = require('../config/db');
const env = require('../config/env');

// ─── JWT Helpers ──────────────────────────────────────────────────────────────
const signAccessToken = (payload) =>
  jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });

const signRefreshToken = (payload) =>
  jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  });

// ─── Cookie Config ────────────────────────────────────────────────────────────
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.isProd,
  sameSite: env.isProd ? 'strict' : 'lax',
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
};

// ─── Mailer ───────────────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
});

const sendMail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"Ride Dispatcher" <${env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`[Auth] 📧 Email sent to ${to}: ${subject}`);
  } catch (err) {
    console.error('[Auth] ❌ Email send failed:', err.message);
  }
};

// ─── register ─────────────────────────────────────────────────────────────────
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role = 'user' } = req.body;

    // Check duplicate email
    const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rowCount > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const emailVerifyToken = uuidv4();
    const emailVerifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    const { rows } = await query(
      `INSERT INTO users
         (name, email, password_hash, phone, role, email_verify_token, email_verify_expires)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, name, email, role, is_active, created_at`,
      [name, email, passwordHash, phone, role, emailVerifyToken, emailVerifyExpires]
    );
    const user = rows[0];

    // Send verification email (non-blocking)
    const verifyUrl = `${env.FRONTEND_URL}/verify-email/${emailVerifyToken}`;
    sendMail(
      email,
      'Verify your Ride Dispatcher account',
      `<h2>Welcome, ${name}!</h2>
       <p>Please verify your email by clicking the link below:</p>
       <a href="${verifyUrl}">${verifyUrl}</a>
       <p>This link expires in 24 hours.</p>`
    );

    const payload = { id: user.id, role: user.role, email: user.email };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    // Store hashed refresh token in DB
    const refreshHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await query(
      `UPDATE users SET refresh_token_hash = $1, last_login = NOW() WHERE id = $2`,
      [refreshHash, user.id]
    );

    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);

    console.log(`[Auth] ✅ New user registered: ${email} (role: ${role})`);
    return res.status(201).json({
      success: true,
      message: 'Registration successful. Please verify your email.',
      data: { user, accessToken },
    });
  } catch (err) {
    next(err);
  }
};

// ─── login ────────────────────────────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const { rows } = await query(
      `SELECT id, name, email, password_hash, role, is_active, is_email_verified
       FROM users WHERE email = $1`,
      [email]
    );
    const user = rows[0];

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact support.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const payload = { id: user.id, role: user.role, email: user.email };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    const refreshHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await query(
      `UPDATE users SET refresh_token_hash = $1, last_login = NOW() WHERE id = $2`,
      [refreshHash, user.id]
    );

    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);

    console.log(`[Auth] ✅ User logged in: ${email}`);
    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          is_email_verified: user.is_email_verified,
        },
        accessToken,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── logout ───────────────────────────────────────────────────────────────────
const logout = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (userId) {
      await query('UPDATE users SET refresh_token_hash = NULL WHERE id = $1', [userId]);
    }
    res.clearCookie('refreshToken', { httpOnly: true, secure: env.isProd });
    console.log(`[Auth] 🚪 User logged out: ${userId}`);
    return res.status(200).json({ success: true, message: 'Logged out successfully.' });
  } catch (err) {
    next(err);
  }
};

// ─── refreshToken ─────────────────────────────────────────────────────────────
const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No refresh token provided.',
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, env.JWT_REFRESH_SECRET);
    } catch {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token. Please log in again.',
        code: 'REFRESH_TOKEN_INVALID',
      });
    }

    // Verify stored hash
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const { rows } = await query(
      'SELECT id, email, role, refresh_token_hash, is_active FROM users WHERE id = $1',
      [decoded.id]
    );
    const user = rows[0];

    if (!user || user.refresh_token_hash !== tokenHash) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token has been revoked. Please log in again.',
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Account is suspended.',
      });
    }

    const payload = { id: user.id, role: user.role, email: user.email };
    const accessToken = signAccessToken(payload);

    return res.status(200).json({
      success: true,
      message: 'Access token refreshed.',
      data: { accessToken },
    });
  } catch (err) {
    next(err);
  }
};

// ─── forgotPassword ───────────────────────────────────────────────────────────
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const { rows } = await query(
      'SELECT id, name FROM users WHERE email = $1 AND is_active = true',
      [email]
    );
    // Always return 200 to avoid email enumeration
    if (rows.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'If that email exists, a reset link has been sent.',
      });
    }
    const user = rows[0];

    // Generate secure reset token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await query(
      `UPDATE users SET reset_password_token = $1, reset_password_expires = $2 WHERE id = $3`,
      [tokenHash, expires, user.id]
    );

    const resetUrl = `${env.FRONTEND_URL}/reset-password/${rawToken}`;
    await sendMail(
      email,
      'Password Reset — Ride Dispatcher',
      `<h2>Hi ${user.name},</h2>
       <p>You requested a password reset. Click the link below (valid for 1 hour):</p>
       <a href="${resetUrl}">${resetUrl}</a>
       <p>If you did not request this, ignore this email.</p>`
    );

    console.log(`[Auth] 🔑 Password reset email sent to: ${email}`);
    return res.status(200).json({
      success: true,
      message: 'If that email exists, a reset link has been sent.',
    });
  } catch (err) {
    next(err);
  }
};

// ─── resetPassword ────────────────────────────────────────────────────────────
const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const { rows } = await query(
      `SELECT id FROM users
       WHERE reset_password_token = $1
         AND reset_password_expires > NOW()
         AND is_active = true`,
      [tokenHash]
    );

    if (rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Password reset token is invalid or has expired.',
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await query(
      `UPDATE users
       SET password_hash = $1,
           reset_password_token = NULL,
           reset_password_expires = NULL,
           refresh_token_hash = NULL
       WHERE id = $2`,
      [passwordHash, rows[0].id]
    );

    console.log(`[Auth] ✅ Password reset successful for user: ${rows[0].id}`);
    return res.status(200).json({
      success: true,
      message: 'Password reset successful. Please log in with your new password.',
    });
  } catch (err) {
    next(err);
  }
};

// ─── verifyEmail ──────────────────────────────────────────────────────────────
const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;

    const { rows } = await query(
      `SELECT id FROM users
       WHERE email_verify_token = $1
         AND email_verify_expires > NOW()`,
      [token]
    );

    if (rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Email verification link is invalid or has expired.',
      });
    }

    await query(
      `UPDATE users
       SET is_email_verified = true,
           email_verify_token = NULL,
           email_verify_expires = NULL
       WHERE id = $1`,
      [rows[0].id]
    );

    console.log(`[Auth] ✅ Email verified for user: ${rows[0].id}`);
    return res.status(200).json({
      success: true,
      message: 'Email verified successfully. You can now log in.',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  verifyEmail,
};
