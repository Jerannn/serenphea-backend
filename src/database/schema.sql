CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE role_type AS ENUM ('guest', 'host', 'admin');
CREATE TYPE status_type AS ENUM ('pending', 'active', 'suspended', 'inactive');
CREATE TYPE property_status AS ENUM ('draft', 'published', 'archived');

-- users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    status status_type NOT NULL DEFAULT 'pending',
    email_verified_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS roles (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role role_type NOT NULL DEFAULT 'guest',
    PRIMARY KEY (user_id, role)
);

-- properties
CREATE TABLE IF NOT EXISTS property_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    host_id UUID REFERENCES users(id) ON DELETE CASCADE,
    property_type_id UUID REFERENCES property_types(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(255) NOT NULL,
    guests INT NOT NULL,
    bedrooms INT NOT NULL,
    beds INT NOT NULL,
    bathrooms INT NOT NULL,
    status property_status NOT NULL DEFAULT 'draft',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS property_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    state VARCHAR(255) NOT NULL,
    country VARCHAR(255) NOT NULL,
    latitude DECIMAL NOT NULL,
    longitude DECIMAL NOT NULL,
    UNIQUE (property_id)
);

CREATE TABLE IF NOT EXISTS property_pricing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    base_price NUMERIC(12,2) NOT NULL,
    cleaning_fee NUMERIC(12,2) NOT NULL,
    weekly_discount NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (weekly_discount BETWEEN 0 AND 100),
    monthly_discount NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (monthly_discount BETWEEN 0 AND 100),
    UNIQUE (property_id)
);

CREATE TABLE IF NOT EXISTS availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    date TIMESTAMPTZ NOT NULL,
    is_available BOOLEAN NOT NULL,
    price_override DECIMAL NULL,
    UNIQUE (property_id, date)
);

CREATE TABLE IF NOT EXISTS property_booking_settings (
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    instant_book BOOLEAN NOT NULL DEFAULT FALSE,
    check_in_time TIME NOT NULL,
    check_out_time TIME NOT NULL,
    min_nights INT DEFAULT 1,
    max_nights INT DEFAULT 365
);

CREATE TABLE IF NOT EXISTS property_rules (
    property_id UUID PRIMARY KEY REFERENCES properties(id) ON DELETE CASCADE,
    rules TEXT
);

CREATE TABLE IF NOT EXISTS property_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    url VARCHAR(255) NOT NULL,
    public_id VARCHAR(255) NOT NULL,
    is_cover BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS amenities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    UNIQUE (name)
);

CREATE TABLE IF NOT EXISTS property_amenities (
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    amenity_id UUID REFERENCES amenities(id) ON DELETE CASCADE,
    PRIMARY KEY (property_id, amenity_id)
);