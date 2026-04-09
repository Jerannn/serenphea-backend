CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE role_type AS ENUM ('guest', 'host', 'admin');
CREATE TYPE status_type AS ENUM ('pending', 'active', 'suspended', 'inactive');
CREATE TYPE verification_type AS ENUM ('email_verification', 'password_reset', 'login_otp'); 

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role role_type NOT NULL DEFAULT 'guest',
    status status_type NOT NULL DEFAULT 'pending',
    email_verified_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS auth_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    code_hash VARCHAR(255) NOT NULL,
    type verification_type NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    verified_at TIMESTAMP NULL,
    attempts SMALLINT DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),   
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);