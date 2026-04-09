import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import Auth from "../models/auth.model.js";
import env from "../config/env.js";
import catchAsync from "../utils/catchAsync.js";

const generateToken = (userId: string) => {
  if (!env.JWT_SECRET || !env.JWT_EXPIRES_IN) {
    throw new Error("JWT config is not defined");
  }

  const options: jwt.SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  };

  return jwt.sign({ userId }, env.JWT_SECRET, options);
};

export const register = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const newUser = await Auth.create(req.body);

    const token = generateToken(newUser.id);

    res.status(200).json({
      status: "success",
      token,
      data: { user: newUser },
    });
  },
);
