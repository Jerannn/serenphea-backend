import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import db from "../config/db.js";
import Auth from "../models/auth.model.js";
import env from "../config/env.js";
import catchAsync from "../utils/catchAsync.js";
import authService from "../services/auth.service.js";
import { generateOTP } from "../utils/generateOtp.js";
import { Users } from "../types/auth.types.js";

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
  const client = await db.pool.connect();

  let newOtp: string;
  let newUser: Users;

  try {
    await client.query("BEGIN");
    newOtp = generateOTP();

    // 1. Create new user
    newUser = await Auth.create(client, req.body);

    // 2. Create verification token
    await Auth.createVerificationToken(client, {
      userId: newUser.id,
      email: newUser.email,
      otp: newOtp,
    });

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  // 3. Send verification email
  await authService.handleEmail(newUser.email, newOtp);

  // 4. Generate token
  const token = generateToken(newUser.id);

  // 5. Send response
  res.status(200).json({
    status: "success",
    token,
    data: { user: newUser },
  });
});

export const verifyEmail = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  console.log("Verify email", req.body);
});
