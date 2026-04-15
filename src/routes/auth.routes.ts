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
import otpSchema from "../schemas/otp.schema.js";

const router = express.Router();

// AUTH
router.post("/register", validateRequest(authSchema.registerSchema), register);
router.post("/login", validateRequest(authSchema.loginSchema), login);
router.get("/me", protect, restrictTo("guest", "host", "admin"), getMe);

//  PASSWORD RESET
router.post("/password/forgot", validateRequest(authSchema.forgotPasswordSchema), forgotPassword);
router.post("/password/verify-otp", validateRequest(otpSchema.verifySchema), verifyResetPassword);
router.post("/password/reset", validateRequest(authSchema.resetPasswordSchema), resetPassword);

//  EMAIL VERIFICATION
router.post("/email/verify", validateRequest(otpSchema.verifySchema), verifyRegistration);
router.post("/email/resend", validateRequest(otpSchema.resendOtpSchema), resendVerification);

export default router;
