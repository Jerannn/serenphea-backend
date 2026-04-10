import { NextFunction, Request, Response } from "express";
import env from "../config/env.js";
import AppError from "../utils/appError.js";

const handleUniqueError = (err: any) => {
  const arr = err.constraint.split("_") || [];
  const field = arr.length > 0 ? arr[1] : "field";

  return new AppError("Validation failed", 400, {
    [field]: [`This ${field} is already in use`],
  });
};

const errorDev = (err: any, res: Response) => {
  res.status(err.statusCode || 500).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const errorProd = (err: any, res: Response) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      ...(err.details && { details: err.details }),
    });
  } else {
    res.status(500).json({
      status: "error",
      message: "Something went wrong 💥",
    });
  }
};

export default (err: any, req: Request, res: Response, next: NextFunction) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (env.NODE_ENV === "development") {
    errorDev(err, res);
  } else if (env.NODE_ENV === "production") {
    let error = { ...err, message: err.message };

    if (err.code === "23505") error = handleUniqueError(err);
    errorProd(error, res);
  }
};
