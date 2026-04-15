import { CookieOptions, NextFunction, Request, Response } from "express";
import Auth from "../models/auth.model.js";
import env from "../config/env.js";
import catchAsync from "../utils/catchAsync.js";
import AuthService from "../services/auth.service.js";
import { OTPService } from "../services/otp.service.js";
import { HTTP_STATUS } from "../constants/http-status.js";
import { Users } from "../types/auth.types.js";
import { generateToken } from "../utils/generateToken.js";

const sendAuthResponse = (user: Users, statusCode: number, res: Response) => {
  const isProduction = env.STAGE === "production";

  const token = generateToken(user.id);

  const cookieOptions: CookieOptions = {
    expires: new Date(Date.now() + Number(env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: isProduction,
  };

  res.cookie("jwt", token, cookieOptions);

  res.status(statusCode).json({
    status: "success",
    token,
    data: { user },
  });
};

export const register = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { user, expiresAt } = await AuthService.createAccount(req.body);

  // 5. Send response
  res.status(HTTP_STATUS.CREATED).json({
    status: "success",
    data: { user, expiresAt },
  });
});

export const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  const user = await AuthService.authenticateUser(email, password);

  sendAuthResponse(user, HTTP_STATUS.OK, res);
});

export const getMe = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  res.status(HTTP_STATUS.OK).json({
    status: "success",
    data: { user: req.user },
  });
});

export const forgotPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    await AuthService.requestPasswordReset(req.body.email, res);

    res.status(HTTP_STATUS.NO_CONTENT).send();
  }
);

export const resendVerification = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { email, type } = req.body;

    await OTPService.resendOtp(email, type);

    res.status(HTTP_STATUS.NO_CONTENT).send();
  }
);

export const verifyRegistration = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { email, otp } = req.body;

    const success = await OTPService.verifyOtp(email, otp, "register");
    const verifiedUser = await Auth.verifyUser(success.email);

    sendAuthResponse(verifiedUser, HTTP_STATUS.OK, res);
  }
);

export const verifyResetPassword = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { email, otp } = req.body;

    const token = await AuthService.confirmPasswordResetOtp(email, otp);

    res.status(HTTP_STATUS.OK).json({
      status: "success",
      data: { token },
    });
  }
);

export const resetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password, token } = req.body;

  await AuthService.completePasswordReset(email, password, token);

  res.status(HTTP_STATUS.NO_CONTENT).send();
});
