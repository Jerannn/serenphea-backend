export default class AppError extends Error {
    statusCode;
    status;
    isOperational;
    details;
    static isAppError(err) {
        return err instanceof AppError;
    }
    constructor(message, statusCode, details) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
        this.details = details;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
//# sourceMappingURL=appError.js.map