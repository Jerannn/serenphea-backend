export type VerificationPayload = {
  email: string;
  otp: string;
  type: string;
  attempts: number;
  expiresAt: Date | string;
};
