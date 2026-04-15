import { z } from "zod";

const registerSchema = z
  .object({
    name: z.string().min(1, { message: "Name is required" }),
    email: z
      .email({ message: "Please enter a valid email address" })
      .transform((val) => val.toLowerCase().trim()),
    role: z.enum(["guest", "host", "admin"], "Please select a role for your account"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const loginSchema = z.object({
  email: z
    .email({ message: "Please enter a valid email address" })
    .transform((val) => val.toLowerCase().trim()),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

const resetPasswordSchema = z
  .object({
    email: z
      .email({ message: "Please enter a valid email address" })
      .transform((val) => val.toLowerCase().trim()),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const forgotPasswordSchema = z.object({
  email: z
    .email({ message: "Please enter a valid email address" })
    .transform((val) => val.toLowerCase().trim()),
});

const authSchema = {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};

export default authSchema;
