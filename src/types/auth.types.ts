import { z } from "zod";
import authSchema from "../schemas/auth.schema.js";

export type CreateUserInput = z.infer<typeof authSchema.register>;
