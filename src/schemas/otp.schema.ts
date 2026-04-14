import { z } from "zod";

const verifySchema = z.object({
  email: z
    .email({ message: "Please enter a valid email address" })
    .transform((val) => val.toLowerCase().trim()),
  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "OTP must be a 6-digit number"),
});

const resendOtpSchema = z.object({
  type: z.enum(["register", "reset", "login"], "Please select a valid type"),
  email: z
    .email({ message: "Please enter a valid email address" })
    .transform((val) => val.toLowerCase().trim()),
});

const otpSchema = {
  verifySchema,
  resendOtpSchema,
};

export default otpSchema;
