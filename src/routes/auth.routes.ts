import express from "express";
import {
  forgotPassword,
  getMe,
  login,
  register,
  resendVerification,
  resetPassword,
  updatePassword,
  verifyRegistration,
  verifyResetPassword,
} from "../controllers/auth.controller.js";
import { validateRequest } from "../middleware/validate.middleware.js";
import authSchema from "../schemas/auth.schema.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";
import otpSchema from "../schemas/otp.schema.js";
import {
  loginLimiter,
  otpLimiter,
  publicAuthLimiter,
  sensitiveLimiter,
} from "../middleware/rate-limiter.middleware.js";

const router = express.Router();

// AUTH
router.post("/register", publicAuthLimiter, validateRequest(authSchema.registerSchema), register);
router.post("/login", loginLimiter, validateRequest(authSchema.loginSchema), login);
router.get("/me", protect, restrictTo("guest", "host", "admin"), getMe);

//  PASSWORD RESET
router.post(
  "/password/forgot",
  otpLimiter,
  validateRequest(authSchema.forgotPasswordSchema),
  forgotPassword
);
router.post(
  "/password/verify-otp",
  otpLimiter,
  validateRequest(otpSchema.verifySchema),
  verifyResetPassword
);
router.patch(
  "/password/reset",
  otpLimiter,
  validateRequest(authSchema.resetPasswordSchema),
  resetPassword
);
router.patch(
  "/password/update",
  protect,
  sensitiveLimiter,
  restrictTo("guest", "host", "admin"),
  validateRequest(authSchema.updatePasswordSchema),
  updatePassword
);

//  EMAIL VERIFICATION
router.post(
  "/email/verify",
  otpLimiter,
  validateRequest(otpSchema.verifySchema),
  verifyRegistration
);
router.post(
  "/email/resend",
  publicAuthLimiter,
  validateRequest(otpSchema.resendOtpSchema),
  resendVerification
);

export default router;
