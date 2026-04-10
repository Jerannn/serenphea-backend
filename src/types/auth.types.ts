import { z } from "zod";
import authSchema from "../schemas/auth.schema.js";

export type CreateUserInput = z.infer<typeof authSchema.registerSchema>;

export type Users = {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: string;
  status: string;
  email_verified_at: Date | null;
  created_at: Date;
  updated_at: Date;
};

export type VerificationPayload = { userId: string; email: string; otp: string };
