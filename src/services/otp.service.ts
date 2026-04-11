import Auth from "../models/auth.model.js";
import AppError from "../utils/appError.js";
import {
  INVALID_OTP,
  MAX_OTP_RESEND_ATTEMPTS,
  OTP_COOLDOWN,
  OTP_COOLDOWN_MESSAGE,
  SERVER_ERROR_MESSAGE,
  TOO_MANY_REQUEST,
} from "../utils/constant.js";
import { generateOTP } from "../utils/generateOtp.js";
import AuthService from "./auth.service.js";

export class OTPService {
  static async verifyEmail(email: string, otp: string) {
    const record = await Auth.getLatestVerification(email);

    // 1. Not found, locked, expired, verified
    if (
      !record ||
      record.status === "LOCKED" ||
      record.status === "EXPIRED" ||
      record.status === "VERIFIED"
    ) {
      throw new AppError(INVALID_OTP, 400);
    }

    // 2. Check OTP
    const isValid = await Auth.checkValue(otp, record.code_hash);

    if (!isValid) {
      const updated = await Auth.incrementAttempts(record.id);

      if (updated.attempts >= record.max_attempts) {
        await Auth.lockOtp(record.id);
      }

      throw new AppError(INVALID_OTP, 400);
    }

    // 3. Expired
    if (record.expires_at < new Date()) {
      await Auth.expireOtp(record.id);
      throw new AppError(INVALID_OTP, 400);
    }

    // 4. SUCCESS
    await Auth.markVerified(record.id);

    const user = await Auth.verifyUser(record.user_id);

    return user;
  }

  static async resendOtp(email: string) {
    // 1. Find current user
    const currentUser = await Auth.findByEmail(email);

    if (currentUser) {
      // 2. Find latest otp
      const lastOtp = await Auth.getLatestVerification(email);

      // 3.1 Check if otp has been sent in the last 3 minutes
      if (lastOtp) {
        const now = Date.now();
        const lastCreatedOtp = new Date(lastOtp.created_at).getTime();

        if (now - lastCreatedOtp < OTP_COOLDOWN) {
          throw new AppError(OTP_COOLDOWN_MESSAGE, 429);
        }
      }

      // 3.2 Check if user has made too many requests
      const otpCount = await Auth.countRecentOtps(email);
      if (otpCount >= MAX_OTP_RESEND_ATTEMPTS) {
        throw new AppError(TOO_MANY_REQUEST, 429);
      }

      // 3.3 Invalidate previous otp
      await Auth.expireOtp(lastOtp.id);

      // 4. Generate new OTP
      const newOtp = generateOTP();

      // 5. Create verification token
      await Auth.createVerificationToken({
        userId: currentUser.id,
        email: email,
        otp: newOtp,
      });

      // 6. Send verification email
      try {
        await AuthService.handleEmail(email, newOtp);
      } catch (error) {
        throw new AppError(SERVER_ERROR_MESSAGE, 400);
      }
    }
  }
}
