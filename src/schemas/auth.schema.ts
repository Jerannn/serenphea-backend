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
  role: z.enum(["guest", "host", "admin"]),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

const otpSchema = z.object({
  email: z
    .email({ message: "Please enter a valid email address" })
    .transform((val) => val.toLowerCase().trim()),
  otp: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9]{6}$/, "OTP must be 6 alphanumeric characters"),
});

const resendOtpSchema = z.object({
  email: z
    .email({ message: "Please enter a valid email address" })
    .transform((val) => val.toLowerCase().trim()),
});

const authSchema = {
  registerSchema,
  loginSchema,
  otpSchema,
  resendOtpSchema,
};

export default authSchema;
