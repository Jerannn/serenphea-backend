import express, { NextFunction, Request, Response } from "express";
import morgan from "morgan";
import helmet from "helmet";
import cookieParser from "cookie-parser";

// Routes
import authRouter from "./routes/auth.routes.js";
import propertiesRouter from "./routes/properties.routes.js";

// Error handler
import globalErrorHandler from "./controllers/error.controller.js";

import env from "./config/env.js";
import AppError from "./utils/appError.js";
import { globalLimiter } from "./middleware/rate-limiter.middleware.js";

const app = express();

if (env.STAGE === "development") {
  app.use(morgan("dev"));
}

app.use(helmet());
app.use(cookieParser());
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// API endpoints
app.use("/api", globalLimiter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/properties", propertiesRouter);

// Route not found
app.all(/.*/, (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handler
app.use(globalErrorHandler);

export default app;
