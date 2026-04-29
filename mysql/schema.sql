CREATE DATABASE IF NOT EXISTS aibts;
USE aibts;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('passenger', 'driver', 'admin') NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY unique_email_role (email, role)
);

CREATE TABLE IF NOT EXISTS sessions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  token CHAR(64) NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY unique_token (token),
  KEY idx_sessions_user_id (user_id),
  KEY idx_sessions_expires_at (expires_at),
  CONSTRAINT fk_sessions_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS buses (
  id VARCHAR(80) NOT NULL,
  operator_id VARCHAR(80) NOT NULL,
  registration_number VARCHAR(80) NOT NULL,
  model VARCHAR(120) NOT NULL,
  bus_type ENUM('ordinary', 'express', 'deluxe', 'ac-sleeper', 'volvo', 'semi-sleeper', 'super-deluxe') NOT NULL,
  capacity INT NOT NULL,
  amenities JSON NOT NULL,
  status ENUM('active', 'maintenance', 'inactive') NOT NULL,
  current_location_lat DECIMAL(10, 7) NULL,
  current_location_lng DECIMAL(10, 7) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY unique_registration_number (registration_number)
);

CREATE TABLE IF NOT EXISTS routes (
  id VARCHAR(80) NOT NULL,
  operator_id VARCHAR(80) NOT NULL,
  name VARCHAR(160) NOT NULL,
  origin_name VARCHAR(120) NOT NULL,
  origin_lat DECIMAL(10, 7) NOT NULL,
  origin_lng DECIMAL(10, 7) NOT NULL,
  destination_name VARCHAR(120) NOT NULL,
  destination_lat DECIMAL(10, 7) NOT NULL,
  destination_lng DECIMAL(10, 7) NOT NULL,
  stops JSON NOT NULL,
  distance INT NOT NULL,
  estimated_duration INT NOT NULL,
  base_fare DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS trips (
  id VARCHAR(80) NOT NULL,
  route_id VARCHAR(80) NOT NULL,
  bus_id VARCHAR(80) NOT NULL,
  driver_id VARCHAR(80) NOT NULL,
  departure_time DATETIME NOT NULL,
  arrival_time DATETIME NOT NULL,
  status ENUM('scheduled', 'in-progress', 'completed', 'cancelled') NOT NULL,
  current_stop_index INT NOT NULL DEFAULT 0,
  current_location_lat DECIMAL(10, 7) NULL,
  current_location_lng DECIMAL(10, 7) NULL,
  passengers JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS bookings (
  id VARCHAR(80) NOT NULL,
  passenger_id VARCHAR(80) NOT NULL,
  trip_id VARCHAR(80) NOT NULL,
  seat_numbers JSON NOT NULL,
  status ENUM('confirmed', 'cancelled', 'completed') NOT NULL,
  total_fare DECIMAL(10, 2) NOT NULL,
  booked_at DATETIME NOT NULL,
  boarding_stop VARCHAR(160) NOT NULL,
  dropping_stop VARCHAR(160) NOT NULL,
  passenger_name VARCHAR(120) NULL,
  passenger_phone VARCHAR(30) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);
