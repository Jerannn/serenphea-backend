import express from "express";
import {
  forgotPassword,
  getMe,
  login,
  register,
  resendVerification,
  resetPassword,
  verifyRegistration,
  verifyResetPassword,
} from "../controllers/auth.controller.js";
import { validateRequest } from "../middleware/validate.middleware.js";
import authSchema from "../schemas/auth.schema.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", validateRequest(authSchema.registerSchema), register);
router.post("/login", validateRequest(authSchema.loginSchema), login);

router.post("/forgot-password", validateRequest(authSchema.forgotPasswordSchema), forgotPassword);
router.post("/verify-reset-otp", validateRequest(authSchema.otpSchema), verifyResetPassword);
router.post("/reset-password", validateRequest(authSchema.resetPasswordSchema), resetPassword);

// verify email
router.post("/verify-email", validateRequest(authSchema.otpSchema), verifyRegistration);
router.post(
  "/resend-verification",
  validateRequest(authSchema.resendOtpSchema),
  resendVerification
);

// router.post("/login/verify-otp");
// router.post("/verify-reset-otp");

router.get("/me", protect, restrictTo("guest", "host", "admin"), getMe);

export default router;
