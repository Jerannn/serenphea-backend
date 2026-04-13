import { CookieOptions, NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import Auth from "../models/auth.model.js";
import env from "../config/env.js";
import catchAsync from "../utils/catchAsync.js";
import AuthService from "../services/auth.service.js";
import AppError from "../utils/appError.js";
import { OTPService } from "../lib/email/email.service.js";
import { checkValue, generateOTP } from "../utils/helper.js";
import { MESSAGES } from "../constants/messages.js";
import { HTTP_STATUS } from "../constants/http-status.js";
import { Users } from "../types/auth.types.js";

const generateToken = (userId: string): string => {
  if (!env.JWT_SECRET || !env.JWT_EXPIRES_IN) {
    throw new Error("JWT config is not defined");
  }

  const options: jwt.SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  };

  return jwt.sign({ userId }, env.JWT_SECRET, options);
};

const createSendToken = (user: Users, statusCode: number, res: Response) => {
  const isProduction = env.STAGE === "production";

  // 1. Create token
  const token = generateToken(user.id);

  // 2. Create cookie
  const cookieOptions: CookieOptions = {
    expires: new Date(Date.now() + Number(env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: isProduction,
  };

  // 3. Send cookie
  res.cookie("jwt", token, cookieOptions);

  // 4. Send response
  res.status(statusCode).json({
    status: "success",
    token,
    data: { user },
  });
};

export const register = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // 1. Generate new OTP
  const newOtp = generateOTP();

  // 2. Create new user
  const newUser = await Auth.create(req.body);

  if (!newUser) {
    return next(new AppError(MESSAGES.REGISTRATION_FAILED, HTTP_STATUS.BAD_REQUEST));
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
  } catch (_error: unknown) {
    return next(new AppError(MESSAGES.REGISTRATION_FAILED, HTTP_STATUS.BAD_REQUEST));
  }

  // 5. Send response
  res.status(HTTP_STATUS.CREATED).json({
    status: "success",
    data: { user: newUser },
  });
});

export const verifyEmail = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const { email, otp } = req.body;

  // 1. Check if verification token exists
  const verifiedUser = await OTPService.verifyEmail(email, otp);

  // 2. Send response
  createSendToken(verifiedUser, HTTP_STATUS.OK, res);
});

export const resendVerification = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { email } = req.body;

    await OTPService.resendOtp(email);

    res.status(HTTP_STATUS.NO_CONTENT).send();
  }
);

export const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password, role } = req.body;

  const user = await Auth.findByEmail(email);

  if (!user || user.role !== role || !(await checkValue(password, user.password_hash))) {
    return next(new AppError(MESSAGES.INVALID_CREDENTIALS, HTTP_STATUS.UNAUTHORIZED));
  }

  createSendToken(user, HTTP_STATUS.OK, res);
});

export const getMe = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  res.status(HTTP_STATUS.OK).json({
    status: "success",
    data: { user: req.user },
  });
});
