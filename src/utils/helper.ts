import bcrypt from "bcryptjs";

export const hashValue = async (val: string) => {
  const salt = await bcrypt.genSalt(12);
  return await bcrypt.hash(val, salt);
};

export const checkValue = async (plainValue: string, hashedValue: string) => {
  return await bcrypt.compare(plainValue, hashedValue);
};

export const generateOTP = (): string => crypto.randomUUID().slice(0, 6).toUpperCase();
