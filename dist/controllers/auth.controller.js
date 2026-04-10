import jwt from "jsonwebtoken";
import Auth from "../models/auth.model.js";
import env from "../config/env.js";
import catchAsync from "../utils/catchAsync.js";
const generateToken = (userId) => {
    if (!env.JWT_SECRET || !env.JWT_EXPIRES_IN) {
        throw new Error("JWT config is not defined");
    }
    const options = {
        expiresIn: env.JWT_EXPIRES_IN,
    };
    return jwt.sign({ userId }, env.JWT_SECRET, options);
};
export const register = catchAsync(async (req, res, next) => {
    const newUser = await Auth.create(req.body);
    const token = generateToken(newUser.id);
    res.status(200).json({
        status: "success",
        token,
        data: { user: newUser },
    });
});
//# sourceMappingURL=auth.controller.js.map