import { z } from "zod";

const register = z
  .object({
    name: z.string().min(1, { message: "Name is required" }),
    email: z
      .email({ message: "Please enter a valid email address" })
      .transform((val) => val.toLowerCase().trim()),
    role: z.enum(
      ["guest", "host", "admin"],
      "Please select a role for your account",
    ),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const login = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
  role: z.enum(["guest", "host", "admin"]),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

const authSchema = {
  register,
  login,
};

export default authSchema;
