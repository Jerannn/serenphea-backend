import { z } from "zod";
import authSchema from "../schemas/auth.schema.js";

export type CreateUserInput = z.infer<typeof authSchema.registerSchema>;

export type Users = {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  roles: string;
  status: string;
  email_verified_at: Date | null;
  created_at: Date;
  updated_at: Date;
};

export type AuthVerification = {
  id: string;
  user_id: string;
  email: string;
  secret_hash: string;
  type: "register" | "login" | "reset";
  attempts: number;
  max_attempts: number;
  status: "active" | "locked" | "expired" | "verified";
  expires_at: Date;
  verified_at: Date | null;
  created_at: Date;
  updated_at: Date;
};

export type VerificationPayload = { userId: string; email: string; otp: string; type: string };
