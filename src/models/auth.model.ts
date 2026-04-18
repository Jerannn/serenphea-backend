import db from "../config/db.js";
import { Register, Users } from "../types/auth.types.js";
import { hashSecret } from "../utils/helper.js";

export default class AuthModel {
  static async create(data: Register): Promise<Users> {
    const { name, email, password } = data;
    const hashedPassword = await hashSecret(password);

    const { rows } = await db.query(
      `
      WITH new_user AS (
        INSERT INTO users (name, email, password_hash)
        VALUES ($1, $2, $3)
        RETURNING *
      ),
      assigned_role AS (
        INSERT INTO roles (user_id)
        SELECT id
        FROM new_user
        RETURNING *
      )
      
      SELECT 
        nu.*,
        ar.role AS roles
      FROM new_user nu
      JOIN assigned_role ar ON nu.id = ar.user_id
      `,
      [name, email, hashedPassword]
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

  static async verifyUser(email: string): Promise<Users> {
    const { rows } = await db.query(
      `
      WITH verified_user AS (
        UPDATE users
        SET status = 'active',
            email_verified_at = NOW(),
            updated_at = NOW()
        WHERE email = $1
        RETURNING *
      )
      SELECT 
        vr.*,
        COALESCE(JSON_AGG(r.role) FILTER (WHERE r.role IS NOT NULL), '[]') AS roles
      FROM verified_user vr
      JOIN roles r ON vr.id = r.user_id
      WHERE vr.email = $1
      GROUP BY vr.id, vr.name, vr.email, vr.password_hash, vr.status, vr.email_verified_at, vr.created_at, vr.updated_at
    `,
      [email]
    );

    return rows[0];
  }

  static async updatePassword(userId: string, hashedPassword: string): Promise<Users> {
    const { rows } = await db.query(
      `
      UPDATE users
      SET password_hash = $1,
          updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `,
      [hashedPassword, userId]
    );

    return rows[0];
  }
}
