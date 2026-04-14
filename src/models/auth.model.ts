import db from "../config/db.js";
import {
  AuthVerification,
  CreateUserInput,
  Users,
  VerificationPayload,
} from "../types/auth.types.js";
import { hashValue } from "../utils/helper.js";

export default class AuthModel {
  static async create(data: CreateUserInput): Promise<Users> {
    const { name, email, role, password } = data;
    const hashedPassword = await hashValue(password);
    console.log(email);
    const { rows } = await db.query(
      `
      WITH new_user AS (
        INSERT INTO users (name, email, password_hash)
        VALUES ($1, $2, $3)
        RETURNING *
      ),
      assigned_role AS (
        INSERT INTO roles (user_id, role)
        SELECT id, $4
        FROM new_user
        RETURNING *
      )
      
      SELECT 
        nu.*,
        ar.role AS roles
      FROM new_user nu
      JOIN assigned_role ar ON nu.id = ar.user_id
      `,
      [name, email, hashedPassword, role]
    );

    return rows[0];
  }

  static async findByEmail(email: string): Promise<Users> {
    const { rows } = await db.query(
      `
      SELECT *
      FROM users
      WHERE email = $1
    `,
      [email]
    );

    return rows[0];
  }

  static async findById(id: string): Promise<Users> {
    const { rows } = await db.query(
      `
      SELECT *
      FROM users
      WHERE id = $1
    `,
      [id]
    );

    return rows[0];
  }

  static async findRole(userId: string) {
    const { rows } = await db.query(
      `
      SELECT JSON_AGG(role) AS roles
      FROM roles
      WHERE user_id = $1
    `,
      [userId]
    );

    return rows[0].roles;
  }

  static async createVerificationToken({
    userId,
    email,
    otp,
    type,
  }: VerificationPayload): Promise<void> {
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    const hashedOtp = await hashValue(otp);

    await db.query(
      `
      INSERT INTO auth_verifications (user_id, email, secret_hash, type, expires_at)
      VALUES ($1, $2, $3, $4, $5)
     `,
      [userId, email, hashedOtp, type, expiresAt]
    );
  }

  static async getLatestVerification(email: string, type: string): Promise<AuthVerification> {
    const { rows } = await db.query(
      `
      SELECT *
      FROM auth_verifications
      WHERE email = $1 AND type = $2
      ORDER BY created_at DESC
      LIMIT 1
    `,
      [email, type]
    );

    return rows[0];
  }

  static async countRecentOtps(email: string): Promise<number> {
    const { rows } = await db.query(
      `
      SELECT COUNT(*)
      FROM auth_verifications
      WHERE email = $1 AND created_at > NOW() - INTERVAL '1 hour'
    `,
      [email]
    );

    return Number(rows[0].count);
  }

  static async incrementAttempts(id: string): Promise<{ attempts: number }> {
    const { rows } = await db.query(
      `
      UPDATE auth_verifications
      SET attempts = attempts + 1,
          updated_at = NOW()
      WHERE id = $1
      RETURNING attempts
    `,
      [id]
    );

    return rows[0];
  }

  static async lockOtp(id: string) {
    await db.query(
      `
      UPDATE auth_verifications
      SET status = 'locked',
          updated_at = NOW()
      WHERE id = $1
    `,
      [id]
    );
  }

  static async expireOtp(id: string) {
    await db.query(
      `
      UPDATE auth_verifications
      SET status = 'expired',
          updated_at = NOW()
      WHERE id = $1
    `,
      [id]
    );
  }

  static async markVerified(id: string, type: string): Promise<AuthVerification> {
    const { rows } = await db.query(
      `
      UPDATE auth_verifications
      SET status = 'verified',
          verified_at = NOW(),
          updated_at = NOW()
      WHERE id = $1 AND type = $2
      RETURNING *
    `,
      [id, type]
    );

    return rows[0];
  }

  static async verifyUser(id: string): Promise<Users> {
    const { rows } = await db.query(
      `
      WITH verified_user AS (
        UPDATE users
        SET status = 'active',
            email_verified_at = NOW(),
            updated_at = NOW()
        WHERE id = $1
        RETURNING id
      )
      SELECT 
        u.*,
        JSON_AGG(r.role) AS roles
      FROM users u
      JOIN roles r ON u.id = r.user_id
      WHERE u.id = $1
      GROUP BY u.id
    `,
      [id]
    );

    return rows[0];
  }

  static async updatePassword(userId: string, hashedPassword: string) {
    await db.query(
      `
      UPDATE users
      SET password_hash = $1,
          updated_at = NOW()
      WHERE id = $2
    `,
      [hashedPassword, userId]
    );
  }
}
