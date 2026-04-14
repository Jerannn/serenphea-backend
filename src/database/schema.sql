CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE role_type AS ENUM ('guest', 'host', 'admin');
CREATE TYPE status_type AS ENUM ('pending', 'active', 'suspended', 'inactive');

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



