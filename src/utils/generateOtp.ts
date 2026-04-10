export const generateOTP = (): string => crypto.randomUUID().slice(0, 6).toUpperCase();
