import express, { Request, Response } from "express";
import morgan from "morgan";
import helmet from "helmet";

// Routes
import authRouter from "./routes/auth.routes.js";

// Error handler
import globalErrorHandler from "./controllers/error.controller.js";

import env from "./config/env.js";
import AppError from "./utils/appError.js";

const app = express();

if (env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(helmet());
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// API endpoints
app.use("/api/v1/auth", authRouter);

// Route not found
app.all(/.*/, (req: Request, res: Response, next: Function) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handler
app.use(globalErrorHandler);

export default app;
