import { z } from "zod";
import authSchema from "../schemas/auth.schema.js";

export type Register = z.infer<typeof authSchema.registerSchema>;

export type Users = {
  readonly id: string;
  name: string;
  email: string;
  password_hash: string | undefined;
  roles: string;
  status: string;
  email_verified_at: Date | null;
  created_at: Date;
  updated_at: Date;
};
