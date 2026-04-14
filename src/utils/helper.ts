import { randomInt } from "node:crypto";
import bcrypt from "bcryptjs";

export const hashSecret = async (val: string) => {
  const salt = await bcrypt.genSalt(12);
  return await bcrypt.hash(val, salt);
};

export const verifySecret = async (plainValue: string, hashedValue: string) => {
  return await bcrypt.compare(plainValue, hashedValue);
};

export const generateOTP = (): string => {
  return randomInt(100000, 1000000).toString();
};
