import db from "../config/db.js";
import bcrypt from "bcryptjs";
import { CreateUserInput } from "../types/auth.types.js";

export default class AuthModel {
  static async hashPassword(password: string) {
    const salt = await bcrypt.genSalt(12);
    return await bcrypt.hash(password, salt);
  }

  static async create(data: CreateUserInput) {
    const { name, email, role, password } = data;
    const hashedPassword = await this.hashPassword(password);

    const { rows } = await db.query(
      `
      INSERT INTO users (name, email, role, password_hash)
      VALUES ($1, $2, $3, $4)
      RETURNING *`,
      [name, email, role, hashedPassword],
    );

    return rows[0];
  }
}
