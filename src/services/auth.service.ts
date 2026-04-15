import { Response } from "express";
import { HTTP_STATUS } from "../constants/http-status.js";
import { MESSAGES } from "../constants/messages.js";
import { OTP_EXPIRATION_TIME, RESET_TOKEN_EXPIRATION_TIME } from "../constants/otp.js";
import redis from "../lib/redis/redis.client.js";
import { redisKeys } from "../lib/redis/redis.keys.js";
import Auth from "../models/auth.model.js";
import { Register, Users } from "../types/auth.types.js";
import AppError from "../utils/appError.js";
import { verifySecret, generateOTP, hashSecret } from "../utils/helper.js";
import { OTPService } from "./otp.service.js";
import { randomBytes } from "node:crypto";

export default class AuthService {
  static async createAccount(data: Register): Promise<{ user: Users; expiresAt: Date }> {
    const newOtp = generateOTP();
    const newUser = await Auth.create(data);

    if (!newUser) {
      throw new AppError(MESSAGES.REGISTRATION_FAILED, HTTP_STATUS.BAD_REQUEST);
    }

    console.log("OTP:", newOtp);

    const key = redisKeys.otp("register", newUser.email);
    const hashedOtp = await hashSecret(newOtp);

    await Promise.all([
      redis.hset(key, {
        email: newUser.email,
        otp: hashedOtp,
        attempts: 0,
      }),
      redis.expire(key, OTP_EXPIRATION_TIME),
    ]);

    // TODO: send OTP via email service
    // 4. Send verification email
    //   await OTPService.handleEmail(newUser.email, newOtp);

    return { user: newUser, expiresAt: new Date(Date.now() + OTP_EXPIRATION_TIME * 1000) };
  }

  static async authenticateUser(email: string, password: string): Promise<Users> {
    const user = await Auth.findByEmail(email);

    if (!user || !(await verifySecret(password, user.password_hash))) {
      throw new AppError(MESSAGES.INVALID_CREDENTIALS, HTTP_STATUS.UNAUTHORIZED);
    }

    return user;
  }

  static async requestPasswordReset(email: string, res: Response) {
    const user = await Auth.findByEmail(email);

    // Prevent user enumeration
    if (!user) {
      return res.status(HTTP_STATUS.NO_CONTENT).send();
    }

    const key = redisKeys.otp("reset", email);

    // Do not issue a new OTP if one is still valid
    if (await redis.exists(key)) {
      return res.status(HTTP_STATUS.NO_CONTENT).send();
    }
    const newOtp = generateOTP();
    const hashedOtp = await hashSecret(newOtp);
    console.log("OTP:", newOtp);

    await Promise.all([
      redis.hset(key, {
        email: email,
        otp: hashedOtp,
        attempts: 0,
      }),
      redis.expire(key, OTP_EXPIRATION_TIME),
    ]);

    // TODO: send OTP via email service
    // 4. Send verification email
    // await OTPService.handleEmail(user.email, newOtp);
  }

  static async confirmPasswordResetOtp(email: string, otp: string): Promise<string> {
    const success = await OTPService.verifyOtp(email, otp, "reset");
    const rawToken = randomBytes(32).toString("hex");
    const hashedToken = await hashSecret(rawToken);

    await redis.set(redisKeys.resetToken(success.email), hashedToken, {
      ex: RESET_TOKEN_EXPIRATION_TIME,
    });

    return rawToken;
  }

  static async completePasswordReset(email: string, password: string, token: string) {
    const key = redisKeys.resetToken(email);

    // Validate reset token (stored hashed in Redis, expires automatically)
    const hashedToken = await redis.get<string>(key);

    if (!hashedToken || !(await verifySecret(token, hashedToken))) {
      throw new AppError(MESSAGES.INVALID_OTP, HTTP_STATUS.BAD_REQUEST);
    }

    const user = await Auth.findByEmail(email);

    if (!user) {
      throw new AppError(MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    // Prevent password reuse
    const isSamePassword = await verifySecret(password, user.password_hash);
    if (isSamePassword) {
      throw new AppError(MESSAGES.PASSWORD_REUSE, HTTP_STATUS.BAD_REQUEST);
    }

    const hashedPassword = await hashSecret(password);
    await Auth.updatePassword(user.id, hashedPassword);

    // Invalidate token after successful use
    await redis.del(key);
  }
}
