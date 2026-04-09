import express, { Request, Response } from "express";
import morgan from "morgan";
import dotenv from "dotenv";

dotenv.config({ path: "./config.env", quiet: true });

// routes
import authRouter from "./routes/auth.routes.js";
import env from "./config/env.js";

const app = express();

if (env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

app.use("/api/v1/auth", authRouter);

// route not found
app.all(/.*/, (req, res) => {
  console.log("route not found");
});
// global error handler
app.use((err: Error, req: Request, res: Response, next: Function) => {
  console.log(err);
});

export default app;
