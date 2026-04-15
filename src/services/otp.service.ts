import { HTTP_STATUS } from "../constants/http-status.js";
import { MESSAGES } from "../constants/messages.js";
import { MAX_ATTEMPTS, OTP_EXPIRATION_TIME } from "../constants/otp.js";
import AppError from "../utils/appError.js";

import { verifySecret, generateOTP, hashSecret } from "../utils/helper.js";
import redis from "../lib/redis/redis.client.js";
import { redisKeys } from "../lib/redis/redis.keys.js";
import { sendEmail } from "../lib/email/email.client.js";
import { getOtpRegisterTemplate } from "../lib/email/email.templates.js";
import { VerificationPayload } from "../lib/email/email.types.js";

export class OTPService {
  static async handleEmail(email: string, otp: string) {
    const html = getOtpRegisterTemplate(otp);

    await sendEmail({
      to: email,
      subject: "Your Serenphéa verification code (expires in 15 minutes)",
      text: `
        Welcome to Serenphéa!
        Your verification code is: ${otp}
        This code will expire in 15 minutes.
        For your security, do not share this code with anyone.
        `,
      html,
    });
  }

  static async verifyOtp(email: string, otp: string, type: string) {
    const key = redisKeys.otp(type, email);

    const storeOtp = await redis.hgetall<VerificationPayload>(key);

    if (!storeOtp) {
      throw new AppError(MESSAGES.INVALID_OTP, HTTP_STATUS.BAD_REQUEST);
    }

    if (Number(storeOtp.attempts) >= MAX_ATTEMPTS) {
      throw new AppError(MESSAGES.TOO_MANY_REQUEST, HTTP_STATUS.TOO_MANY_REQUESTS);
    }

    if (!(await verifySecret(otp, storeOtp.otp))) {
      await redis.hincrby(key, "attempts", 1);
      throw new AppError(MESSAGES.INVALID_OTP, HTTP_STATUS.BAD_REQUEST);
    }

    // OTP is single-use → remove after successful verification
    await redis.del(key);

    console.log("REGISTRATION OTP: ", storeOtp);
    return storeOtp;
  }

  static async resendOtp(email: string, type: string) {
    const key = redisKeys.otp(type, email);

    // Prevent issuing multiple active OTPs at the same time
    if (await redis.exists(key)) {
      throw new AppError(MESSAGES.OTP_COOLDOWN, HTTP_STATUS.BAD_REQUEST);
    }

    const newOtp = generateOTP();
    const hashedOtp = await hashSecret(newOtp);

    await Promise.all([
      redis.hset(key, {
        email: email,
        otp: hashedOtp,
        attempts: 0,
      }),
      redis.expire(key, OTP_EXPIRATION_TIME),
    ]);

    console.log("NEW OTP GENERATED:", newOtp);

    // Email sending intentionally separated (can be plugged per provider later)
    // if (type === "register") {
    //   // 6. Send verification email
    //   try {
    //     await this.handleEmail(email, newOtp);
    //   } catch (error) {
    //     throw new AppError(MESSAGES.SERVER_ERROR, HTTP_STATUS.BAD_REQUEST);
    //   }
    // } else if (type === "reset") {
    //   // 6. Send verification email
    //   try {
    //     await this.handleEmail(email, newOtp);
    //   } catch (error) {
    //     throw new AppError(MESSAGES.SERVER_ERROR, HTTP_STATUS.BAD_REQUEST);
    //   }
    // }
  }
}
