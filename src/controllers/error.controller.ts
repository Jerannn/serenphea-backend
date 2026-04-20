import { NextFunction, Request, Response } from "express";
import env from "../config/env.js";
import AppError from "../utils/appError.js";
import { HTTP_STATUS } from "../constants/http-status.js";
import { MESSAGES } from "../constants/messages.js";

interface PostgresError extends Error {
  constraint: string;
}

const handleUniqueError = (err: PostgresError) => {
  const arr = err.constraint.split("_") || [];
  const field = arr.length > 0 ? arr[1] : "field";

  return new AppError(MESSAGES.VALIDATION_FAILED, HTTP_STATUS.BAD_REQUEST, {
    [field]: [`This ${field} is already in use`],
  });
};

const handleJWTError = () => {
  return new AppError(MESSAGES.AUTH_FAILED, HTTP_STATUS.UNAUTHORIZED);
};

const isPostgresError = (err: Error): err is PostgresError => {
  return "code" in err;
};

const errorDev = (err: AppError, res: Response) => {
  res.status(err.statusCode || HTTP_STATUS.SERVER_ERROR).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err,
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
    res.status(HTTP_STATUS.SERVER_ERROR).json({
      status: "error",
      message: "Something went wrong 💥",
    });
  }
};

export default (err: Error | AppError, req: Request, res: Response, _next: NextFunction) => {
  console.log(err);
  const error =
    err instanceof AppError ? err : new AppError(err.message, HTTP_STATUS.SERVER_ERROR, { ...err });

  error.statusCode = error.statusCode || HTTP_STATUS.SERVER_ERROR;
  error.status = error.status || "error";

  if (env.STAGE === "development") {
    errorDev(error, res);
  } else if (env.STAGE === "production") {
    let processedError: AppError = error;

    // Postgres error
    if (isPostgresError(err)) {
      if ((err as any).code === "23505") processedError = handleUniqueError(err);
    }

    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError")
      processedError = handleJWTError();
    errorProd(processedError, res);
  }
};
