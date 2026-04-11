import express from "express";
import { register, resendVerification, verifyEmail } from "../controllers/auth.controller.js";
import { validateRequest } from "../middleware/validate.middleware.js";
import authSchema from "../schemas/auth.schema.js";

const router = express.Router();

router.post("/register", validateRequest(authSchema.registerSchema), register);
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

export default router;
