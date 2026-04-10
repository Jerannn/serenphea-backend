import db from "../config/db.js";
import bcrypt from "bcryptjs";
import { CreateUserInput, Users, VerificationPayload } from "../types/auth.types.js";
import { PoolClient } from "pg";

export default class AuthModel {
  static async hashValue(val: string): Promise<string> {
    const salt = await bcrypt.genSalt(12);
    return await bcrypt.hash(val, salt);
  }

  static async checkValue(plainValue: string, hashedValue: string) {
    return await bcrypt.compare(plainValue, hashedValue);
  }

  static async create(client: PoolClient, data: CreateUserInput): Promise<Users> {
    const { name, email, role, password } = data;
    const hashedPassword = await this.hashValue(password);

    const { rows } = await client.query(
      `
      INSERT INTO users (name, email, role, password_hash)
      VALUES ($1, $2, $3, $4)
      RETURNING *`,
      [name, email, role, hashedPassword]
    );

    return rows[0];
  }

  static async createVerificationToken(
    client: PoolClient,
    { userId, email, otp }: VerificationPayload
  ): Promise<void> {
    const expiresAt = new Date(Date.now() + 15 * 15 * 1000); // 15 minutes
    const hashedOtp = await this.hashValue(otp);

    await client.query(
      `
      INSERT INTO auth_verifications (user_id, email, code_hash, type, expires_at)
      VALUES ($1, $2, $3, 'email_verification', $4)
      RETURNING *`,
      [userId, email, hashedOtp, expiresAt]
    );
  }
}
