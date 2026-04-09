import { Request, Response } from "express";
import AppError from "../utils/appError.js";

export const validateRequest =
  (schema: any) =>
  (req: Request, res: Response, next: Function): void => {
    const validationResult = schema.safeParse(req.body);

    if (!validationResult.success) {
      // Extract error messages
      const errorMessages = validationResult.error!.issues.reduce(
        (acc: any, err: Record<string, string>) => ({
          ...acc,
          [err.path[0]]: err.message,
        }),
        {},
      );

      // Send a response if validation fails
      //   res.status(400).json({ errors: errorMessages });
      next(new AppError("Validation failed", 400, errorMessages));
      return;
    }

    // If validation is successful, proceed to the next middleware
    req.body = validationResult.data;
    next();
  };
