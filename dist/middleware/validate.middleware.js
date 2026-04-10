import AppError from "../utils/appError.js";
export const validateRequest = (schema) => (req, res, next) => {
    const validationResult = schema.safeParse(req.body);
    if (!validationResult.success) {
        // Extract error messages
        const errorMessages = validationResult.error.issues.reduce((acc, err) => ({
            ...acc,
            [err.path[0]]: err.message,
        }), {});
        // Send a response if validation fails
        next(new AppError("Validation failed", 400, errorMessages));
        return;
    }
    // If validation is successful, proceed to the next middleware
    req.body = validationResult.data;
    next();
};
//# sourceMappingURL=validate.middleware.js.map