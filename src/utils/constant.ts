export const SUCCESS = 200;
export const BAD_REQUEST = 400;
export const UNAUTHORIZED = 401;
export const FORBIDDEN = 403;
export const NOT_FOUND = 404;
export const SERVER_ERROR = 500;

export const OTP_COOLDOWN = 3 * 60 * 1000; // 3 minutes
export const MAX_OTP_RESEND_ATTEMPTS = 5;
export const REGISTRATION_FAILED = "Registration failed, please try again";
export const INVALID_OTP = "Invalid code. Please check the code sent to your email and try again.";
export const TOO_MANY_REQUEST = "Too many requests. Try again later.";
export const OTP_COOLDOWN_MESSAGE = "Please wait 3 minutes before requesting again";
export const SERVER_ERROR_MESSAGE = "Something went wrong, please try again";
