-- ============================================================
-- Ride Dispatcher — PostgreSQL Schema
-- Run with: psql -U postgres -d ride_dispatcher -f schema.sql
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ──────────────────────────────────────────────────────────────
-- 1. USERS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                    VARCHAR(100) NOT NULL,
  email                   VARCHAR(255) UNIQUE NOT NULL,
  password_hash           TEXT NOT NULL,
  phone                   VARCHAR(20),
  city                    VARCHAR(80),
  profile_pic             TEXT,
  role                    VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'driver', 'admin')),
  is_active               BOOLEAN NOT NULL DEFAULT true,
  is_email_verified       BOOLEAN NOT NULL DEFAULT false,
  email_verify_token      TEXT,
  email_verify_expires    TIMESTAMPTZ,
  reset_password_token    TEXT,
  reset_password_expires  TIMESTAMPTZ,
  refresh_token_hash      TEXT,
  last_login              TIMESTAMPTZ,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email  ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role   ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_phone  ON users(phone);

-- ──────────────────────────────────────────────────────────────
-- 2. DRIVERS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS drivers (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vehicle_type          VARCHAR(20) NOT NULL CHECK (vehicle_type IN ('auto', 'bike', 'cab', 'premium')),
  vehicle_number        VARCHAR(20),
  vehicle_model         VARCHAR(60),
  vehicle_color         VARCHAR(30),
  vehicle_year          SMALLINT,
  license_number        VARCHAR(50),
  city                  VARCHAR(80),
  status                VARCHAR(20) NOT NULL DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'on_ride')),
  is_verified           BOOLEAN NOT NULL DEFAULT false,
  verification_status   VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verification_reason   TEXT,
  verified_at           TIMESTAMPTZ,
  avg_rating            NUMERIC(3,2) NOT NULL DEFAULT 5.00,
  total_rides           INTEGER NOT NULL DEFAULT 0,
  completion_rate       NUMERIC(5,2) NOT NULL DEFAULT 100.00,
  current_lat           NUMERIC(10,7),
  current_lng           NUMERIC(10,7),
  location_updated_at   TIMESTAMPTZ,
  current_ride_id       UUID,
  last_ride_ended_at    TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_drivers_user_id      ON drivers(user_id);
CREATE INDEX IF NOT EXISTS idx_drivers_status       ON drivers(status);
CREATE INDEX IF NOT EXISTS idx_drivers_city         ON drivers(city);
CREATE INDEX IF NOT EXISTS idx_drivers_vehicle_type ON drivers(vehicle_type);

-- ──────────────────────────────────────────────────────────────
-- 3. RIDES
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rides (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES users(id),
  driver_id        UUID REFERENCES drivers(id),
  vehicle_type     VARCHAR(20) NOT NULL,
  status           VARCHAR(20) NOT NULL DEFAULT 'searching'
                     CHECK (status IN ('searching','accepted','arrived','in_progress','completed','cancelled')),
  pickup_lat       NUMERIC(10,7) NOT NULL,
  pickup_lng       NUMERIC(10,7) NOT NULL,
  pickup_address   TEXT NOT NULL,
  drop_lat         NUMERIC(10,7) NOT NULL,
  drop_lng         NUMERIC(10,7) NOT NULL,
  drop_address     TEXT NOT NULL,
  distance_km      NUMERIC(8,2),
  duration_min     NUMERIC(8,2),
  estimated_fare   NUMERIC(10,2),
  final_fare       NUMERIC(10,2),
  surge_multiplier NUMERIC(4,2) NOT NULL DEFAULT 1.00,
  payment_method   VARCHAR(30) DEFAULT 'cash',
  payment_status   VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending','paid','failed','refunded')),
  cancel_reason    TEXT,
  cancelled_at     TIMESTAMPTZ,
  accepted_at      TIMESTAMPTZ,
  started_at       TIMESTAMPTZ,
  completed_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rides_user_id    ON rides(user_id);
CREATE INDEX IF NOT EXISTS idx_rides_driver_id  ON rides(driver_id);
CREATE INDEX IF NOT EXISTS idx_rides_status     ON rides(status);
CREATE INDEX IF NOT EXISTS idx_rides_created_at ON rides(created_at DESC);

-- ──────────────────────────────────────────────────────────────
-- 4. RIDE REVIEWS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ride_reviews (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ride_id      UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
  reviewer_id  UUID NOT NULL REFERENCES users(id),
  driver_id    UUID REFERENCES drivers(id),
  rating       SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment      TEXT,
  sentiment    VARCHAR(20) CHECK (sentiment IN ('positive','neutral','negative')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(ride_id, reviewer_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_driver_id ON ride_reviews(driver_id);
CREATE INDEX IF NOT EXISTS idx_reviews_ride_id   ON ride_reviews(ride_id);

-- ──────────────────────────────────────────────────────────────
-- 5. USER FAVORITES
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_favorites (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label      VARCHAR(60) NOT NULL,
  address    TEXT NOT NULL,
  lat        NUMERIC(10,7),
  lng        NUMERIC(10,7),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON user_favorites(user_id);

-- ──────────────────────────────────────────────────────────────
-- 6. NOTIFICATIONS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type       VARCHAR(50) NOT NULL,
  title      VARCHAR(200) NOT NULL,
  body       TEXT,
  is_read    BOOLEAN NOT NULL DEFAULT false,
  metadata   JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read  ON notifications(is_read);

-- ──────────────────────────────────────────────────────────────
-- 7. COMPLAINTS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS complaints (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES users(id),
  ride_id          UUID REFERENCES rides(id),
  type             VARCHAR(50) NOT NULL,
  subject          VARCHAR(200) NOT NULL,
  description      TEXT NOT NULL,
  status           VARCHAR(20) NOT NULL DEFAULT 'open'
                     CHECK (status IN ('open','in_review','resolved','closed')),
  resolution_note  TEXT,
  resolved_at      TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_complaints_user_id ON complaints(user_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status  ON complaints(status);

-- ──────────────────────────────────────────────────────────────
-- 8. UPDATED_AT TRIGGER (auto-update updated_at on all tables)
-- ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['users','drivers','rides','complaints'] LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS trg_updated_at ON %I;
       CREATE TRIGGER trg_updated_at
       BEFORE UPDATE ON %I
       FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();',
      t, t
    );
  END LOOP;
END;
$$;

-- ──────────────────────────────────────────────────────────────
-- 9. SEED: Default Admin User
-- password: Admin@1234  (bcrypt hash — change in production!)
-- ──────────────────────────────────────────────────────────────
INSERT INTO users (name, email, password_hash, role, is_email_verified)
VALUES (
  'Super Admin',
  'admin@ridedispatcher.com',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uBKi',
  'admin',
  true
)
ON CONFLICT (email) DO NOTHING;
