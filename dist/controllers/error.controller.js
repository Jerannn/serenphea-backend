import env from "../config/env.js";
const errorDev = (err, res) => {
    res.status(err.statusCode || 500).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack,
    });
};
const errorProd = (err, res) => {
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
            ...(err.details && { details: err.details }),
        });
    }
    else {
        res.status(500).json({
            status: "error",
            message: "Something went wrong 💥",
        });
    }
};
export default (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";
    if (env.NODE_ENV === "development") {
        errorDev(err, res);
    }
    else if (env.NODE_ENV === "production") {
        const error = { ...err, message: err.message };
        errorProd(error, res);
    }
};
//# sourceMappingURL=error.controller.js.map