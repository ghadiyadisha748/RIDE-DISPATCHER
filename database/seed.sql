-- ============================================================
-- RIDE-DISPATCHER — Seed Data
-- Primary City: Surat | Also: Ahmedabad, Vadodara, Rajkot
-- ============================================================

-- ============================================================
-- USERS (3 admins, 10 riders, 8 drivers)
-- ============================================================

-- Passwords are bcrypt hash of 'Password@123'
INSERT INTO users (id, name, email, phone, password_hash, role, is_verified, is_active, city) VALUES
-- Admins
('a1000000-0000-0000-0000-000000000001', 'Disha Ghadiya',   'disha@ridedispatcher.in',   '9900000001', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TcGc7TgV0/bCg8iyCHX3bBM5SRxO', 'admin', TRUE, TRUE, 'Surat'),
('a1000000-0000-0000-0000-000000000002', 'Anshika Badala',  'anshika@ridedispatcher.in', '9900000002', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TcGc7TgV0/bCg8iyCHX3bBM5SRxO', 'admin', TRUE, TRUE, 'Surat'),
('a1000000-0000-0000-0000-000000000003', 'Shruti Babariya', 'shruti@ridedispatcher.in',  '9900000003', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TcGc7TgV0/bCg8iyCHX3bBM5SRxO', 'admin', TRUE, TRUE, 'Surat'),
-- Riders (Surat)
('b1000000-0000-0000-0000-000000000001', 'Arjun Mehta',      'arjun.mehta@gmail.com',      '9825000001', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TcGc7TgV0/bCg8iyCHX3bBM5SRxO', 'user', TRUE, TRUE, 'Surat'),
('b1000000-0000-0000-0000-000000000002', 'Priya Shah',        'priya.shah@gmail.com',        '9825000002', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TcGc7TgV0/bCg8iyCHX3bBM5SRxO', 'user', TRUE, TRUE, 'Surat'),
('b1000000-0000-0000-0000-000000000003', 'Rohan Patel',       'rohan.patel@gmail.com',       '9825000003', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TcGc7TgV0/bCg8iyCHX3bBM5SRxO', 'user', TRUE, TRUE, 'Surat'),
('b1000000-0000-0000-0000-000000000004', 'Neha Desai',        'neha.desai@gmail.com',        '9825000004', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TcGc7TgV0/bCg8iyCHX3bBM5SRxO', 'user', TRUE, TRUE, 'Surat'),
('b1000000-0000-0000-0000-000000000005', 'Kiran Joshi',       'kiran.joshi@gmail.com',       '9825000005', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TcGc7TgV0/bCg8iyCHX3bBM5SRxO', 'user', TRUE, TRUE, 'Ahmedabad'),
('b1000000-0000-0000-0000-000000000006', 'Sanjana Kapoor',    'sanjana.kapoor@gmail.com',    '9825000006', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TcGc7TgV0/bCg8iyCHX3bBM5SRxO', 'user', TRUE, TRUE, 'Vadodara'),
('b1000000-0000-0000-0000-000000000007', 'Vivek Sharma',      'vivek.sharma@gmail.com',      '9825000007', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TcGc7TgV0/bCg8iyCHX3bBM5SRxO', 'user', TRUE, TRUE, 'Rajkot'),
-- Driver users
('c1000000-0000-0000-0000-000000000001', 'Ramesh Tadvi',      'ramesh.tadvi@gmail.com',      '9726000001', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TcGc7TgV0/bCg8iyCHX3bBM5SRxO', 'driver', TRUE, TRUE, 'Surat'),
('c1000000-0000-0000-0000-000000000002', 'Suresh Baraiya',    'suresh.baraiya@gmail.com',    '9726000002', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TcGc7TgV0/bCg8iyCHX3bBM5SRxO', 'driver', TRUE, TRUE, 'Surat'),
('c1000000-0000-0000-0000-000000000003', 'Mahesh Nakum',      'mahesh.nakum@gmail.com',      '9726000003', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TcGc7TgV0/bCg8iyCHX3bBM5SRxO', 'driver', TRUE, TRUE, 'Surat'),
('c1000000-0000-0000-0000-000000000004', 'Dinesh Prajapati',  'dinesh.prajapati@gmail.com',  '9726000004', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TcGc7TgV0/bCg8iyCHX3bBM5SRxO', 'driver', TRUE, TRUE, 'Surat'),
('c1000000-0000-0000-0000-000000000005', 'Nilesh Vasava',     'nilesh.vasava@gmail.com',     '9726000005', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TcGc7TgV0/bCg8iyCHX3bBM5SRxO', 'driver', TRUE, TRUE, 'Ahmedabad'),
('c1000000-0000-0000-0000-000000000006', 'Bhavesh Rathod',    'bhavesh.rathod@gmail.com',    '9726000006', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TcGc7TgV0/bCg8iyCHX3bBM5SRxO', 'driver', TRUE, TRUE, 'Vadodara'),
('c1000000-0000-0000-0000-000000000007', 'Jayesh Solanki',    'jayesh.solanki@gmail.com',    '9726000007', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TcGc7TgV0/bCg8iyCHX3bBM5SRxO', 'driver', TRUE, TRUE, 'Rajkot'),
('c1000000-0000-0000-0000-000000000008', 'Pratik Gamit',      'pratik.gamit@gmail.com',      '9726000008', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TcGc7TgV0/bCg8iyCHX3bBM5SRxO', 'driver', TRUE, TRUE, 'Surat');

-- ============================================================
-- DRIVERS
-- ============================================================

INSERT INTO drivers (id, user_id, license_number, license_expiry, aadhar_number, is_verified, is_available, status, rating, total_rides, completed_rides, completion_rate, current_lat, current_lng, current_city, ai_performance_score, performance_grade) VALUES
-- Surat drivers (lat ~21.17, lng ~72.83)
('d1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'GJ05 2019 001234', '2027-03-15', '2345 6789 0123', TRUE, TRUE,  'online',  4.8, 312, 305, 97.76, 21.1702, 72.8311, 'Surat',     92.5, 'A'),
('d1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000002', 'GJ05 2020 002567', '2028-07-20', '3456 7890 1234', TRUE, TRUE,  'online',  4.6, 198, 188, 94.95, 21.1950, 72.8406, 'Surat',     85.0, 'B'),
('d1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000003', 'GJ05 2021 003890', '2029-01-10', '4567 8901 2345', TRUE, FALSE, 'offline', 4.9, 540, 535, 99.07, 21.2095, 72.8476, 'Surat',     97.8, 'A'),
('d1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000004', 'GJ05 2018 004123', '2026-11-30', '5678 9012 3456', TRUE, TRUE,  'on_ride', 4.3, 156, 140, 89.74, 21.1682, 72.8261, 'Surat',     74.0, 'C'),
-- Ahmedabad
('d1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000005', 'GJ01 2020 005456', '2028-05-15', '6789 0123 4567', TRUE, TRUE,  'online',  4.7, 423, 415, 98.11, 23.0225, 72.5714, 'Ahmedabad', 89.3, 'B'),
-- Vadodara
('d1000000-0000-0000-0000-000000000006', 'c1000000-0000-0000-0000-000000000006', 'GJ06 2019 006789', '2027-09-22', '7890 1234 5678', TRUE, TRUE,  'online',  4.5, 267, 252, 94.38, 22.3072, 73.1812, 'Vadodara',  80.5, 'B'),
-- Rajkot
('d1000000-0000-0000-0000-000000000007', 'c1000000-0000-0000-0000-000000000007', 'GJ03 2021 007012', '2029-04-18', '8901 2345 6789', TRUE, FALSE, 'offline', 4.2, 89,  78,  87.64, 22.3039, 70.8022, 'Rajkot',    68.0, 'C'),
-- Surat (second wave)
('d1000000-0000-0000-0000-000000000008', 'c1000000-0000-0000-0000-000000000008', 'GJ05 2022 008345', '2030-02-28', '9012 3456 7890', TRUE, TRUE,  'online',  4.7, 78,  76,  97.44, 21.1757, 72.8520, 'Surat',     91.0, 'A');

-- ============================================================
-- VEHICLES
-- ============================================================

INSERT INTO vehicles (driver_id, make, model, year, plate_number, color, vehicle_type) VALUES
('d1000000-0000-0000-0000-000000000001', 'Bajaj',   'RE Auto',   2020, 'GJ-05-AA-1234', 'Yellow',     'auto'),
('d1000000-0000-0000-0000-000000000002', 'Maruti',  'Swift',     2021, 'GJ-05-AB-5678', 'White',      'cab'),
('d1000000-0000-0000-0000-000000000003', 'Honda',   'Activa',    2022, 'GJ-05-AC-9012', 'Black',      'bike'),
('d1000000-0000-0000-0000-000000000004', 'Toyota',  'Innova',    2019, 'GJ-05-AD-3456', 'Silver',     'premium'),
('d1000000-0000-0000-0000-000000000005', 'Maruti',  'Ertiga',    2021, 'GJ-01-BA-7890', 'Grey',       'cab'),
('d1000000-0000-0000-0000-000000000006', 'Bajaj',   'RE Auto',   2020, 'GJ-06-CA-1122', 'Yellow',     'auto'),
('d1000000-0000-0000-0000-000000000007', 'Hero',    'Splendor',  2021, 'GJ-03-DA-3344', 'Blue',       'bike'),
('d1000000-0000-0000-0000-000000000008', 'Hyundai', 'i20',       2022, 'GJ-05-AE-5566', 'Red',        'cab');

-- ============================================================
-- FAVORITE LOCATIONS (Surat landmarks)
-- ============================================================

INSERT INTO favorite_locations (user_id, label, name, address, lat, lng) VALUES
('b1000000-0000-0000-0000-000000000001', 'home',  'Home',        'Vesu, Surat, Gujarat 395007',            21.1481, 72.7836),
('b1000000-0000-0000-0000-000000000001', 'work',  'Office',      'Magdalla, Surat, Gujarat 395009',        21.1289, 72.7683),
('b1000000-0000-0000-0000-000000000002', 'home',  'Home',        'Adajan, Surat, Gujarat 395009',          21.2097, 72.7939),
('b1000000-0000-0000-0000-000000000002', 'work',  'Office',      'Ring Road, Surat, Gujarat 395002',       21.1938, 72.8302),
('b1000000-0000-0000-0000-000000000003', 'home',  'Home',        'Katargam, Surat, Gujarat 395004',        21.2299, 72.8342),
('b1000000-0000-0000-0000-000000000003', 'other', 'SVNIT Campus','SVNIT, Ichchhanath, Surat, Gujarat',     21.1631, 72.7823);

-- ============================================================
-- RIDES (completed sample rides in Surat)
-- ============================================================

INSERT INTO rides (id, user_id, driver_id, pickup_lat, pickup_lng, pickup_address, drop_lat, drop_lng, drop_address, city, distance_km, duration_min, ride_type, status, estimated_fare, final_fare, surge_multiplier, ai_fare_used, started_at, completed_at, created_at) VALUES
-- Completed rides
('r1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 21.1481, 72.7836, 'Vesu, Surat',          21.2097, 72.8300, 'Ring Road, Surat',       'Surat', 8.5,  22, 'auto',    'completed', 85.00,  80.00,  1.00, TRUE, NOW() - INTERVAL '2 days 3 hours', NOW() - INTERVAL '2 days 2 hours 38 min', NOW() - INTERVAL '2 days 3 hours'),
('r1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000002', 21.2097, 72.7939, 'Adajan, Surat',        21.1631, 72.7823, 'SVNIT, Surat',           'Surat', 9.2,  27, 'cab',     'completed', 138.00, 145.00, 1.00, TRUE, NOW() - INTERVAL '1 day 5 hours',  NOW() - INTERVAL '1 day 4 hours 33 min', NOW() - INTERVAL '1 day 5 hours'),
('r1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000001', 21.2299, 72.8342, 'Katargam, Surat',      21.1702, 72.8311, 'Surat Railway Station',  'Surat', 7.1,  18, 'auto',    'completed', 71.00,  70.00,  1.00, TRUE, NOW() - INTERVAL '3 days 1 hour',  NOW() - INTERVAL '3 days 42 min',        NOW() - INTERVAL '3 days 1 hour'),
('r1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000004', 'd1000000-0000-0000-0000-000000000008', 21.1938, 72.8302, 'Ring Road, Surat',     21.2395, 72.8700, 'Dumas Beach, Surat',     'Surat', 12.4, 35, 'cab',     'completed', 186.00, 180.00, 1.00, TRUE, NOW() - INTERVAL '5 hours',         NOW() - INTERVAL '4 hours 25 min',       NOW() - INTERVAL '5 hours'),
('r1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000003', 21.1481, 72.7836, 'Vesu, Surat',          21.1702, 72.8311, 'Surat Railway Station',  'Surat', 5.8,  15, 'bike',    'completed', 46.00,  46.00,  1.00, TRUE, NOW() - INTERVAL '7 days 6 hours',  NOW() - INTERVAL '7 days 5 hours 45 min',NOW() - INTERVAL '7 days 6 hours'),
-- Surge rides (evening peak)
('r1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000002', 21.1631, 72.7823, 'SVNIT, Surat',         21.2097, 72.7939, 'Adajan, Surat',          'Surat', 9.2,  30, 'cab',     'completed', 207.00, 210.00, 1.50, TRUE, NOW() - INTERVAL '1 day 13 hours', NOW() - INTERVAL '1 day 12 hours 30 min',NOW() - INTERVAL '1 day 13 hours'),
-- Cancelled ride
('r1000000-0000-0000-0000-000000000007', 'b1000000-0000-0000-0000-000000000003', NULL,                                   21.2299, 72.8342, 'Katargam, Surat',      21.1481, 72.7836, 'Vesu, Surat',            'Surat', 11.0, NULL, 'auto',   'cancelled', 110.00, NULL,   1.00, TRUE, NULL,                               NULL,                                      NOW() - INTERVAL '6 hours'),
-- Ahmedabad ride
('r1000000-0000-0000-0000-000000000008', 'b1000000-0000-0000-0000-000000000005', 'd1000000-0000-0000-0000-000000000005', 23.0225, 72.5714, 'SG Highway, Ahmedabad',23.0395, 72.5550, 'Bopal, Ahmedabad',       'Ahmedabad', 6.3, 20, 'cab',  'completed', 94.50, 92.00,   1.00, TRUE, NOW() - INTERVAL '4 days 8 hours',  NOW() - INTERVAL '4 days 7 hours 40 min',NOW() - INTERVAL '4 days 8 hours');

-- ============================================================
-- PAYMENTS
-- ============================================================

INSERT INTO payments (ride_id, user_id, amount, method, status, transaction_id, gateway, paid_at) VALUES
('r1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 80.00,  'cash',   'completed', 'MOCK-001-CASH',  'mock', NOW() - INTERVAL '2 days 2 hours 38 min'),
('r1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000002', 145.00, 'upi',    'completed', 'MOCK-002-UPI',   'mock', NOW() - INTERVAL '1 day 4 hours 33 min'),
('r1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000003', 70.00,  'cash',   'completed', 'MOCK-003-CASH',  'mock', NOW() - INTERVAL '3 days 42 min'),
('r1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000004', 180.00, 'card',   'completed', 'MOCK-004-CARD',  'mock', NOW() - INTERVAL '4 hours 25 min'),
('r1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000001', 46.00,  'wallet', 'completed', 'MOCK-005-WALL',  'mock', NOW() - INTERVAL '7 days 5 hours 45 min'),
('r1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000002', 210.00, 'upi',    'completed', 'MOCK-006-UPI',   'mock', NOW() - INTERVAL '1 day 12 hours 30 min'),
('r1000000-0000-0000-0000-000000000008', 'b1000000-0000-0000-0000-000000000005', 92.00,  'upi',    'completed', 'MOCK-008-UPI',   'mock', NOW() - INTERVAL '4 days 7 hours 40 min');

-- ============================================================
-- DRIVER EARNINGS
-- ============================================================

INSERT INTO driver_earnings (driver_id, ride_id, gross_amount, commission_pct, commission, net_amount, is_paid) VALUES
('d1000000-0000-0000-0000-000000000001', 'r1000000-0000-0000-0000-000000000001', 80.00,  20.00, 16.00, 64.00,  TRUE),
('d1000000-0000-0000-0000-000000000002', 'r1000000-0000-0000-0000-000000000002', 145.00, 20.00, 29.00, 116.00, TRUE),
('d1000000-0000-0000-0000-000000000001', 'r1000000-0000-0000-0000-000000000003', 70.00,  20.00, 14.00, 56.00,  TRUE),
('d1000000-0000-0000-0000-000000000008', 'r1000000-0000-0000-0000-000000000004', 180.00, 20.00, 36.00, 144.00, TRUE),
('d1000000-0000-0000-0000-000000000003', 'r1000000-0000-0000-0000-000000000005', 46.00,  20.00, 9.20,  36.80,  TRUE),
('d1000000-0000-0000-0000-000000000002', 'r1000000-0000-0000-0000-000000000006', 210.00, 20.00, 42.00, 168.00, TRUE),
('d1000000-0000-0000-0000-000000000005', 'r1000000-0000-0000-0000-000000000008', 92.00,  20.00, 18.40, 73.60,  TRUE);

-- ============================================================
-- REVIEWS
-- ============================================================

INSERT INTO reviews (ride_id, reviewer_id, reviewee_id, rating, comment, reviewer_type, sentiment, sentiment_score) VALUES
('r1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 5, 'Ramesh bhai was very punctual and the auto was clean. Smooth ride!',          'user',   'positive', 0.9210),
('r1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000002', 4, 'Good ride but took slightly longer route. Overall decent experience.',         'user',   'neutral',  0.6100),
('r1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000001', 5, 'Excellent driver! Very professional and the ride was extremely comfortable.',  'user',   'positive', 0.9650),
('r1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000008', 4, 'Nice car, good AC. Driver was friendly.',                                      'user',   'positive', 0.8300),
('r1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000003', 5, 'Best bike ride in Surat. Super fast delivery to the station.',                 'user',   'positive', 0.9500),
('r1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000002', 3, 'Surge pricing was too high during evening. Driver was okay.',                  'user',   'neutral',  0.5200),
('r1000000-0000-0000-0000-000000000008', 'b1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000005', 4, 'Comfortable ride in Ahmedabad. The driver knew the city roads very well.',     'user',   'positive', 0.8700);

-- ============================================================
-- DEMAND ANALYTICS (Surat hotspots by hour)
-- ============================================================

INSERT INTO demand_analytics (area_name, city, latitude, longitude, hour_of_day, day_of_week, is_weekend, predicted_demand, actual_demand, demand_level, surge_multiplier) VALUES
-- Surat morning rush (8am)
('Adajan',            'Surat',     21.2097, 72.7939, 8,  1, FALSE, 145, 138, 'high',   1.30),
('Vesu',              'Surat',     21.1481, 72.7836, 8,  1, FALSE, 110, 108, 'high',   1.20),
('Ring Road',         'Surat',     21.1938, 72.8302, 8,  1, FALSE, 190, 195, 'surge',  1.60),
('Katargam',          'Surat',     21.2299, 72.8342, 8,  1, FALSE, 95,  92,  'medium', 1.10),
('Surat Railway Stn', 'Surat',     21.1939, 72.8302, 8,  1, FALSE, 220, 225, 'surge',  1.80),
-- Surat evening rush (6pm)
('Adajan',            'Surat',     21.2097, 72.7939, 18, 5, FALSE, 178, 182, 'surge',  1.70),
('Ring Road',         'Surat',     21.1938, 72.8302, 18, 5, FALSE, 240, 235, 'surge',  2.00),
('SVNIT',             'Surat',     21.1631, 72.7823, 18, 5, FALSE, 120, 115, 'high',   1.40),
('Dumas Beach',       'Surat',     21.2395, 72.8700, 18, 6, TRUE,  85,  90,  'high',   1.30),
-- Surat night (midnight)
('Ring Road',         'Surat',     21.1938, 72.8302, 0,  6, TRUE,  45,  42,  'low',    1.00),
('Surat Airport',     'Surat',     21.1139, 72.7481, 0,  6, TRUE,  60,  65,  'medium', 1.00),
-- Ahmedabad
('SG Highway',        'Ahmedabad', 23.0225, 72.5714, 9,  2, FALSE, 210, 205, 'surge',  1.50),
('CG Road',           'Ahmedabad', 23.0261, 72.5687, 18, 5, FALSE, 195, 200, 'surge',  1.80),
-- Vadodara
('Sayajigunj',        'Vadodara',  22.3072, 73.1812, 8,  1, FALSE, 75,  72,  'medium', 1.00),
-- Rajkot
('Kalawad Road',      'Rajkot',    22.3039, 70.8022, 8,  1, FALSE, 55,  52,  'medium', 1.00);

-- ============================================================
-- COMPLAINTS
-- ============================================================

INSERT INTO complaints (user_id, ride_id, category, description, status, priority) VALUES
('b1000000-0000-0000-0000-000000000002', 'r1000000-0000-0000-0000-000000000006', 'payment',         'Surge pricing was applied without clear notice. Want partial refund.', 'in_review', 'medium'),
('b1000000-0000-0000-0000-000000000003', 'r1000000-0000-0000-0000-000000000007', 'driver_behavior', 'Driver never showed up after accepting the ride. Very inconvenient.',    'open',      'high'),
('b1000000-0000-0000-0000-000000000004', 'r1000000-0000-0000-0000-000000000004', 'app_issue',       'Map showed wrong route for Dumas Beach.',                               'resolved',  'low');

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

INSERT INTO notifications (user_id, title, message, type, is_read, ride_id) VALUES
('b1000000-0000-0000-0000-000000000001', 'Ride Completed!',     'Your ride to Ring Road, Surat is complete. Total: ₹80',             'ride',    TRUE,  'r1000000-0000-0000-0000-000000000001'),
('b1000000-0000-0000-0000-000000000001', 'Special Offer!',      'Get 20% off on your next ride this weekend. Use code: WKND20',      'promo',   FALSE, NULL),
('b1000000-0000-0000-0000-000000000002', 'Ride Completed!',     'Your ride to Adajan, Surat is complete. Total: ₹210',              'ride',    TRUE,  'r1000000-0000-0000-0000-000000000006'),
('b1000000-0000-0000-0000-000000000002', 'Complaint Update',    'Your complaint about surge pricing is under review.',               'info',    FALSE, 'r1000000-0000-0000-0000-000000000006'),
('c1000000-0000-0000-0000-000000000001', 'New Ride Request!',   'Pickup: Vesu | Drop: Ring Road | Fare: ₹85',                       'ride',    TRUE,  'r1000000-0000-0000-0000-000000000001'),
('c1000000-0000-0000-0000-000000000001', 'Earnings Credited!',  '₹64 credited for your last ride.',                                 'payment', TRUE,  'r1000000-0000-0000-0000-000000000001');
