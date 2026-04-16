import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import AppError from "../utils/appError.js";

type Limiter = {
  windowMs: number;
  max: number;
  keyType?: "ip" | "email" | "user";
};

export const createLimiter = ({ windowMs, max, keyType = "ip" }: Limiter) => {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,

    keyGenerator: (req: any) => {
      if (keyType === "user" && req.user?.id) {
        return `user:${req.user.id}`;
      }

      if (keyType === "email" && req.body?.email) {
        return `email:${req.body.email}`;
      }

      return `ip:${ipKeyGenerator(req)}`;
    },

    handler: (_req, _res, next) => {
      next(new AppError("Too many requests. Please try again later.", 429));
    },
  });
};

export const globalLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

// login (very strict)
export const loginLimiter = createLimiter({
  windowMs: 10 * 60 * 1000,
  max: 5,
  keyType: "email",
});

// OTP (moderate)
export const otpLimiter = createLimiter({
  windowMs: 10 * 60 * 1000,
  max: 10,
  keyType: "email",
});

// public auth (light)
export const publicAuthLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  keyType: "email",
});

// sensitive (authenticated users)
export const sensitiveLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 10,
  keyType: "user",
});

// browsing properties
export const generalApiLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 200,
});

// booking / critical actions
export const bookingLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 20,
  keyType: "user",
});

// property creation (hosts)
export const createPropertyLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 10,
  keyType: "user",
});
