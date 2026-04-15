// utils/redisKeys.ts
export const redisKeys = {
  otp: (type: string, email: string) => `auth:otp:${type}:${email}`,
  resetToken: (email: string) => `auth:reset:token:${email}`,
};
