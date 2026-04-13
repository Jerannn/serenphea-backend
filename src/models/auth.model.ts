import db from "../config/db.js";
import { CreateUserInput, Users, VerificationPayload } from "../types/auth.types.js";
import { hashValue } from "../utils/helper.js";

export default class AuthModel {
  static async create(data: CreateUserInput): Promise<Users> {
    const { name, email, role, password } = data;
    const hashedPassword = await hashValue(password);

    const { rows } = await db.query(
      `
      INSERT INTO users (name, email, role, password_hash)
      VALUES ($1, $2, $3, $4)
      RETURNING *`,
      [name, email, role, hashedPassword]
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

  static async createVerificationToken({ userId, email, otp }: VerificationPayload): Promise<void> {
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    const hashedOtp = await hashValue(otp);

    await db.query(
      `
      INSERT INTO auth_verifications (user_id, email, code_hash, type, expires_at)
      VALUES ($1, $2, $3, 'register', $4)
     `,
      [userId, email, hashedOtp, expiresAt]
    );
  }

  static async getLatestVerification(email: string) {
    const { rows } = await db.query(
      `
    SELECT *
    FROM auth_verifications
    WHERE email = $1
    ORDER BY created_at DESC
    LIMIT 1
    `,
      [email]
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

  static async incrementAttempts(id: string) {
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

  static async markVerified(id: string) {
    await db.query(
      `
    UPDATE auth_verifications
    SET status = 'verified',
        verified_at = NOW(),
        updated_at = NOW()
    WHERE id = $1
    `,
      [id]
    );
  }

  static async verifyUser(id: string) {
    const { rows } = await db.query(
      `
    UPDATE users
    SET status = 'active',
        email_verified_at = NOW(),
        updated_at = NOW()
    WHERE id = $1
    RETURNING id, name, email, role, status, email_verified_at
    `,
      [id]
    );

    return rows[0];
  }
}
