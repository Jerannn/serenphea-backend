import dotenv from "dotenv";
dotenv.config({ path: "./config.env", quiet: true });
export default {
    PORT: process.env.PORT,
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    // JWT
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
    JWT_COOKIE_EXPIRES_IN: process.env.JWT_COOKIE_EXPIRES_IN,
    // cloudinary
    CLOUDINARY_NAME: process.env.CLOUDINARY_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    FRONTEND_ORIGIN_URL: process.env.FRONTEND_ORIGIN_URL,
};
//# sourceMappingURL=env.js.map