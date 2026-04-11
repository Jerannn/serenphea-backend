CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE role_type AS ENUM ('GUEST', 'HOST', 'ADMIN');
CREATE TYPE status_type AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED', 'INACTIVE');
CREATE TYPE verification_type AS ENUM ('REGISTER', 'LOGIN', 'RESET'); 
CREATE TYPE verification_status AS ENUM ('ACTIVE', 'VERIFIED', 'LOCKED', 'EXPIRED'); 

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role role_type NOT NULL DEFAULT 'GUEST',
    status status_type NOT NULL DEFAULT 'PENDING',
    email_verified_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS auth_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    code_hash VARCHAR(255) NOT NULL,
    type verification_type NOT NULL,
    attempts SMALLINT DEFAULT 0,
    max_attempts INT DEFAULT 5,
    status verification_status NOT NULL DEFAULT 'ACTIVE',
    expires_at TIMESTAMPTZ NOT NULL,
    verified_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),   
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);