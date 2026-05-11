import { createUploader } from "../config/multer.js";

export const uploadImage = (location: string) =>
  createUploader({
    folder: location,
    formats: ["jpg", "png", "jpeg", "webp"],
    fileSize: 5 * 1024 * 1024,
  });
