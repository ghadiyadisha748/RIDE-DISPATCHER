-- ============================================================
-- RIDE-DISPATCHER — Complete PostgreSQL Database Schema
-- Version: 1.0.0
-- Cities: Surat (primary), Ahmedabad, Vadodara, Rajkot
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "postgis"; -- optional: for geo queries

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM ('user', 'driver', 'admin');
CREATE TYPE driver_status AS ENUM ('online', 'offline', 'on_ride');
CREATE TYPE vehicle_type AS ENUM ('auto', 'bike', 'cab', 'premium');
CREATE TYPE ride_status AS ENUM (
  'requested', 'driver_assigned', 'en_route',
  'arrived', 'in_progress', 'completed', 'cancelled'
);
CREATE TYPE payment_method AS ENUM ('cash', 'card', 'wallet', 'upi');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE reviewer_type AS ENUM ('user', 'driver');
CREATE TYPE sentiment_label AS ENUM ('positive', 'neutral', 'negative');
CREATE TYPE complaint_status AS ENUM ('open', 'in_review', 'resolved', 'closed');
CREATE TYPE location_label AS ENUM ('home', 'work', 'other');
CREATE TYPE performance_grade AS ENUM ('A', 'B', 'C', 'D', 'F');
CREATE TYPE demand_level AS ENUM ('low', 'medium', 'high', 'surge');

-- ============================================================
-- TABLE: users
-- ============================================================

CREATE TABLE users (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                   VARCHAR(100) NOT NULL,
    email                  VARCHAR(150) UNIQUE NOT NULL,
    phone                  VARCHAR(15) UNIQUE NOT NULL,
    password_hash          TEXT NOT NULL,
    profile_pic            TEXT,
    role                   user_role NOT NULL DEFAULT 'user',
    is_email_verified      BOOLEAN DEFAULT FALSE,
    is_active              BOOLEAN DEFAULT TRUE,
    city                   VARCHAR(50) DEFAULT 'Surat',
    refresh_token_hash     TEXT,
    reset_password_token   TEXT,
    reset_password_expires TIMESTAMP WITH TIME ZONE,
    email_verify_token     TEXT,
    email_verify_expires   TIMESTAMP WITH TIME ZONE,
    last_login             TIMESTAMP,
    created_at             TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at             TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role  ON users(role);

-- ============================================================
-- TABLE: drivers
-- ============================================================

CREATE TABLE drivers (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    license_number      VARCHAR(50) UNIQUE NOT NULL,
    license_expiry      DATE NOT NULL,
    aadhar_number       VARCHAR(20) UNIQUE,
    is_verified         BOOLEAN DEFAULT FALSE,
    is_active           BOOLEAN DEFAULT TRUE,
    is_available        BOOLEAN DEFAULT FALSE,
    status              driver_status DEFAULT 'offline',
    rating              DECIMAL(3,2) DEFAULT 5.00 CHECK (rating BETWEEN 1 AND 5),
    total_rides         INT DEFAULT 0,
    completed_rides     INT DEFAULT 0,
    completion_rate     DECIMAL(5,2) DEFAULT 100.00,
    current_lat         DECIMAL(10,8),
    current_lng         DECIMAL(11,8),
    current_city        VARCHAR(50) DEFAULT 'Surat',
    ai_performance_score DECIMAL(5,2) DEFAULT 100.00,
    performance_grade   performance_grade DEFAULT 'A',
    joined_at           TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_drivers_user_id   ON drivers(user_id);
CREATE INDEX idx_drivers_status    ON drivers(status);
CREATE INDEX idx_drivers_location  ON drivers(current_lat, current_lng);
CREATE INDEX idx_drivers_city      ON drivers(current_city);

-- ============================================================
-- TABLE: vehicles
-- ============================================================

CREATE TABLE vehicles (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id     UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
    make          VARCHAR(50) NOT NULL,
    model         VARCHAR(50) NOT NULL,
    year          SMALLINT CHECK (year BETWEEN 2000 AND 2030),
    plate_number  VARCHAR(20) UNIQUE NOT NULL,
    color         VARCHAR(30),
    vehicle_type  vehicle_type NOT NULL,
    is_active     BOOLEAN DEFAULT TRUE,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_vehicles_driver_id ON vehicles(driver_id);
CREATE INDEX idx_vehicles_type      ON vehicles(vehicle_type);

-- ============================================================
-- TABLE: rides
-- ============================================================

CREATE TABLE rides (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID NOT NULL REFERENCES users(id),
    driver_id         UUID REFERENCES drivers(id),
    vehicle_id        UUID REFERENCES vehicles(id),
    pickup_lat        DECIMAL(10,8) NOT NULL,
    pickup_lng        DECIMAL(11,8) NOT NULL,
    pickup_address    TEXT NOT NULL,
    drop_lat          DECIMAL(10,8) NOT NULL,
    drop_lng          DECIMAL(11,8) NOT NULL,
    drop_address      TEXT NOT NULL,
    city              VARCHAR(50) DEFAULT 'Surat',
    distance_km       DECIMAL(8,2),
    duration_min      INT,
    ride_type         vehicle_type NOT NULL,
    status            ride_status DEFAULT 'requested',
    estimated_fare    DECIMAL(10,2),
    final_fare        DECIMAL(10,2),
    surge_multiplier  DECIMAL(4,2) DEFAULT 1.00,
    ai_fare_used      BOOLEAN DEFAULT TRUE,
    cancellation_reason TEXT,
    cancelled_by      VARCHAR(10),          -- user | driver | system
    otp               VARCHAR(6),           -- ride start OTP
    driver_assigned_at TIMESTAMP WITH TIME ZONE,
    driver_arrived_at  TIMESTAMP WITH TIME ZONE,
    started_at        TIMESTAMP WITH TIME ZONE,
    completed_at      TIMESTAMP WITH TIME ZONE,
    created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_rides_user_id   ON rides(user_id);
CREATE INDEX idx_rides_driver_id ON rides(driver_id);
CREATE INDEX idx_rides_status    ON rides(status);
CREATE INDEX idx_rides_city      ON rides(city);
CREATE INDEX idx_rides_created   ON rides(created_at DESC);
CREATE INDEX idx_rides_type      ON rides(ride_type);

-- ============================================================
-- TABLE: payments
-- ============================================================

CREATE TABLE payments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ride_id         UUID NOT NULL REFERENCES rides(id),
    user_id         UUID NOT NULL REFERENCES users(id),
    amount          DECIMAL(10,2) NOT NULL,
    method          payment_method NOT NULL DEFAULT 'cash',
    status          payment_status DEFAULT 'pending',
    -- Mock fields (replace with Razorpay fields later)
    transaction_id  VARCHAR(100),
    gateway         VARCHAR(30) DEFAULT 'mock',  -- mock | razorpay | stripe
    gateway_order_id VARCHAR(100),
    gateway_payment_id VARCHAR(100),
    refund_amount   DECIMAL(10,2),
    refund_reason   TEXT,
    paid_at         TIMESTAMP WITH TIME ZONE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_payments_ride_id ON payments(ride_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status  ON payments(status);

-- ============================================================
-- TABLE: reviews
-- ============================================================

CREATE TABLE reviews (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ride_id         UUID NOT NULL REFERENCES rides(id),
    reviewer_id     UUID NOT NULL REFERENCES users(id),
    reviewee_id     UUID NOT NULL REFERENCES users(id),
    rating          SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment         TEXT,
    reviewer_type   reviewer_type NOT NULL,
    -- AI-classified fields
    sentiment       sentiment_label,
    sentiment_score DECIMAL(5,4),
    is_flagged      BOOLEAN DEFAULT FALSE,   -- Fraud/spam detection flag
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_reviews_ride_id     ON reviews(ride_id);
CREATE INDEX idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX idx_reviews_reviewee_id ON reviews(reviewee_id);
CREATE INDEX idx_reviews_sentiment   ON reviews(sentiment);

-- ============================================================
-- TABLE: complaints
-- ============================================================

CREATE TABLE complaints (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID NOT NULL REFERENCES users(id),
    ride_id      UUID REFERENCES rides(id),
    category     VARCHAR(60) NOT NULL, -- safety | payment | driver_behavior | app_issue | other
    description  TEXT NOT NULL,
    status       complaint_status DEFAULT 'open',
    priority     VARCHAR(10) DEFAULT 'medium', -- low | medium | high | critical
    assigned_to  UUID REFERENCES users(id),   -- admin user
    resolution   TEXT,
    created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at  TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_complaints_user_id ON complaints(user_id);
CREATE INDEX idx_complaints_status  ON complaints(status);

-- ============================================================
-- TABLE: driver_earnings
-- ============================================================

CREATE TABLE driver_earnings (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id      UUID NOT NULL REFERENCES drivers(id),
    ride_id        UUID NOT NULL REFERENCES rides(id),
    gross_amount   DECIMAL(10,2) NOT NULL,
    commission_pct DECIMAL(5,2) DEFAULT 20.00,  -- Platform takes 20%
    commission     DECIMAL(10,2) NOT NULL,
    net_amount     DECIMAL(10,2) NOT NULL,
    is_paid        BOOLEAN DEFAULT FALSE,
    paid_at        TIMESTAMP WITH TIME ZONE,
    earned_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_earnings_driver_id ON driver_earnings(driver_id);
CREATE INDEX idx_earnings_ride_id   ON driver_earnings(ride_id);
CREATE INDEX idx_earnings_earned_at ON driver_earnings(earned_at DESC);

-- ============================================================
-- TABLE: demand_analytics
-- ============================================================

CREATE TABLE demand_analytics (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    area_name         VARCHAR(100) NOT NULL,
    city              VARCHAR(50) NOT NULL DEFAULT 'Surat',
    latitude          DECIMAL(10,8) NOT NULL,
    longitude         DECIMAL(11,8) NOT NULL,
    hour_of_day       SMALLINT CHECK (hour_of_day BETWEEN 0 AND 23),
    day_of_week       SMALLINT CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday
    is_weekend        BOOLEAN DEFAULT FALSE,
    is_holiday        BOOLEAN DEFAULT FALSE,
    predicted_demand  INT,
    actual_demand     INT,
    demand_level      demand_level DEFAULT 'medium',
    surge_multiplier  DECIMAL(4,2) DEFAULT 1.00,
    recorded_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_demand_city     ON demand_analytics(city);
CREATE INDEX idx_demand_area     ON demand_analytics(area_name);
CREATE INDEX idx_demand_hour_dow ON demand_analytics(hour_of_day, day_of_week);

-- ============================================================
-- TABLE: favorite_locations
-- ============================================================

CREATE TABLE favorite_locations (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    label      location_label NOT NULL DEFAULT 'other',
    name       VARCHAR(100),
    address    TEXT NOT NULL,
    lat        DECIMAL(10,8) NOT NULL,
    lng        DECIMAL(11,8) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_favorites_user_id ON favorite_locations(user_id);

-- ============================================================
-- TABLE: notifications
-- ============================================================

CREATE TABLE notifications (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title       VARCHAR(200) NOT NULL,
    message     TEXT NOT NULL,
    type        VARCHAR(30) DEFAULT 'info', -- info | ride | payment | promo | sos
    is_read     BOOLEAN DEFAULT FALSE,
    ride_id     UUID REFERENCES rides(id),
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifs_user_id  ON notifications(user_id);
CREATE INDEX idx_notifs_is_read  ON notifications(user_id, is_read);

-- ============================================================
-- VIEWS
-- ============================================================

-- Active drivers view with vehicle info
CREATE VIEW v_active_drivers AS
SELECT
    d.id,
    d.user_id,
    u.name,
    u.phone,
    d.rating,
    d.total_rides,
    d.completion_rate,
    d.current_lat,
    d.current_lng,
    d.current_city,
    d.ai_performance_score,
    d.performance_grade,
    v.vehicle_type,
    v.make,
    v.model,
    v.color,
    v.plate_number
FROM drivers d
JOIN users u ON u.id = d.user_id
LEFT JOIN vehicles v ON v.driver_id = d.id AND v.is_active = TRUE
WHERE d.status = 'online' AND d.is_verified = TRUE AND d.is_active = TRUE;

-- Revenue summary view
CREATE VIEW v_revenue_summary AS
SELECT
    DATE(p.paid_at) AS date,
    COUNT(p.id) AS total_transactions,
    SUM(p.amount) AS gross_revenue,
    SUM(e.commission) AS platform_commission,
    SUM(e.net_amount) AS driver_payouts
FROM payments p
LEFT JOIN driver_earnings e ON e.ride_id = p.ride_id
WHERE p.status = 'completed'
GROUP BY DATE(p.paid_at)
ORDER BY date DESC;

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated    BEFORE UPDATE ON users    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_drivers_updated  BEFORE UPDATE ON drivers  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_rides_updated    BEFORE UPDATE ON rides    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_payments_updated BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-update driver completion_rate when ride completed
CREATE OR REPLACE FUNCTION update_driver_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        UPDATE drivers
        SET
            total_rides = total_rides + 1,
            completed_rides = completed_rides + 1,
            completion_rate = ROUND((completed_rides + 1)::DECIMAL / (total_rides + 1) * 100, 2)
        WHERE id = NEW.driver_id;
    ELSIF NEW.status = 'cancelled' AND OLD.status = 'driver_assigned' THEN
        UPDATE drivers
        SET
            total_rides = total_rides + 1,
            completion_rate = ROUND(completed_rides::DECIMAL / (total_rides + 1) * 100, 2)
        WHERE id = NEW.driver_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_driver_stats
AFTER UPDATE OF status ON rides
FOR EACH ROW EXECUTE FUNCTION update_driver_stats();

-- Auto-update driver average rating after review
CREATE OR REPLACE FUNCTION update_driver_rating()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.reviewer_type = 'user' THEN
        UPDATE drivers d
        SET rating = (
            SELECT ROUND(AVG(r.rating)::DECIMAL, 2)
            FROM reviews r
            JOIN rides ri ON ri.id = r.ride_id
            WHERE ri.driver_id = d.id
              AND r.reviewer_type = 'user'
        )
        FROM rides ri
        WHERE ri.id = NEW.ride_id AND d.id = ri.driver_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_driver_rating
AFTER INSERT ON reviews
FOR EACH ROW EXECUTE FUNCTION update_driver_rating();
