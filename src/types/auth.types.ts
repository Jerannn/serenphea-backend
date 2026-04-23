import { z } from "zod";
import authSchema from "../schemas/auth.schema.js";

export type Register = z.infer<typeof authSchema.registerSchema>;

export type Users = {
  readonly id: string;
  full_name: string;
  email: string;
  password_hash: string | undefined;
  roles: "guest" | "host" | "admin";
  status: "pending" | "active" | "inactive" | "suspended";
  email_verified_at: Date | null;
  created_at: Date;
  updated_at: Date;
};
