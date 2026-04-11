import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import db from "../config/db.js";
import Auth from "../models/auth.model.js";
import env from "../config/env.js";
import catchAsync from "../utils/catchAsync.js";
import AuthService from "../services/auth.service.js";
import { generateOTP } from "../utils/generateOtp.js";
import { OTPService } from "../services/otp.service.js";
import AppError from "../utils/appError.js";
import { REGISTRATION_FAILED } from "../utils/constant.js";

export const generateToken = (userId: string): string => {
  if (!env.JWT_SECRET || !env.JWT_EXPIRES_IN) {
    throw new Error("JWT config is not defined");
  }

  const options: jwt.SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  };

  return jwt.sign({ userId }, env.JWT_SECRET, options);
};

export const register = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // 1. Generate new OTP
  const newOtp = generateOTP();

  // 2. Create new user
  const newUser = await Auth.create(req.body);

  if (!newUser) {
    return next(new AppError(REGISTRATION_FAILED, 400));
  }

  // 3. Create verification token
  await Auth.createVerificationToken({
    userId: newUser.id,
    email: newUser.email,
    otp: newOtp,
  });

  // 4. Send verification email
  try {
    await AuthService.handleEmail(newUser.email, newOtp);
  } catch (error) {
    return next(new AppError(REGISTRATION_FAILED, 400));
  }

  // 5. Send response
  res.status(200).json({
    status: "success",
    data: { user: newUser },
  });
});

export const verifyEmail = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email, otp } = req.body;

  // 1. Check if verification token exists
  const verifiedUser = await OTPService.verifyEmail(email, otp);

  // 2. Generate token
  const token = generateToken(verifiedUser.id);

  // 3. Send response
  res.status(200).json({
    status: "success",
    token,
    data: { verifiedUser },
  });
});

export const resendVerification = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
    await OTPService.resendOtp(email);

    res.status(204).send();
  }
);
