import { Request, Response } from "express";
import AppError from "../utils/appError.js";
import env from "../config/env.js";

const errorDev = (err: Error, res: Response) => {
  if (!AppError.isAppError(err)) return;

  res.status(err.statusCode || 500).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const errorProd = (err: AppError, res: Response) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      ...(err.details && { details: err.details }),
    });
  } else {
    res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
};

export default (err: Error, req: Request, res: Response, next: Function) => {
  if (!AppError.isAppError(err)) return;

  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (env.NODE_ENV === "development") {
    errorDev(err, res);
  } else if (env.NODE_ENV === "production") {
    const error = { ...err, message: err.message };

    errorProd(error, res);
  }
};
