import express from "express";
import {
  getMe,
  login,
  register,
  resendVerification,
  verifyEmail,
} from "../controllers/auth.controller.js";
import { validateRequest } from "../middleware/validate.middleware.js";
import authSchema from "../schemas/auth.schema.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", validateRequest(authSchema.registerSchema), register);
router.post("/login", validateRequest(authSchema.loginSchema), login);

// verify email
router.post("/verify-email", validateRequest(authSchema.otpSchema), verifyEmail);
router.post(
  "/resend-verification",
  validateRequest(authSchema.resendOtpSchema),
  resendVerification
);

// router.post("/login/verify-otp");
// router.post("/forgot-password");
// router.post("/verify-reset-otp");
// router.post("/reset-password");

router.get("/me", protect, restrictTo("guest"), getMe);

export default router;
