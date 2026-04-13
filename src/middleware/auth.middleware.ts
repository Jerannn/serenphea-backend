import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import env from "../config/env.js";
import Auth from "../models/auth.model.js";
import { HTTP_STATUS } from "../constants/http-status.js";

export const protect = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // 1. Get token and check if it's there
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", HTTP_STATUS.UNAUTHORIZED)
    );
  }

  // 2. Verification token
  const decoded = jwt.verify(token, env.JWT_SECRET as string);

  if (typeof decoded === "string" || !("userId" in decoded)) {
    throw new Error("Invalid token payload");
  }

  // 3. Check if user still exists
  const currentUser = await Auth.findById(decoded.userId);

  if (!currentUser) {
    return next(
      new AppError("The user belonging to this token no longer exists.", HTTP_STATUS.UNAUTHORIZED)
    );
  }

  // 4. Grant access to protected route
  req.user = currentUser;
  next();
});

export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // check if user role is allowed
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", HTTP_STATUS.FORBIDDEN)
      );
    }

    // Grant access to protected route
    next();
  };
};
