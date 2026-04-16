import { Users } from "./auth.types.ts";

declare global {
  namespace Express {
    interface Request {
      user: Users;
    }
  }
}

export {};
