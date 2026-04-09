import express from "express";
import { register } from "../controllers/auth.controller.js";
import { validateRequest } from "../middleware/validate.middleware.js";
import authSchema from "../schemas/auth.schema.js";

const router = express.Router();

router.post("/register", validateRequest(authSchema.register), register);

export default router;
