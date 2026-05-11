import streamifier from "streamifier";
import { randomInt } from "node:crypto";
import bcrypt from "bcryptjs";
import cloudinary from "../config/cloudinary.js";
import { multerFile } from "../types/properties.types.js";
import { UploadApiResponse } from "cloudinary";

export const hashSecret = async (val: string) => {
  const salt = await bcrypt.genSalt(12);
  return await bcrypt.hash(val, salt);
};

export const verifySecret = async (plainValue: string, hashedValue: string) => {
  return await bcrypt.compare(plainValue, hashedValue);
};

export const generateOTP = (): string => {
  return randomInt(100000, 1000000).toString();
};

export const sanitizeFileName = (fileName: string) => {
  return fileName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-zA-Z0-9-_]/g, "-") // replace invalid chars
    .replace(/-+/g, "-") // collapse multiple dashes
    .toLowerCase()
    .slice(0, 60); // limit length
};

export const uploadToCloudinary = (
  file: multerFile,
  folder: string
): Promise<UploadApiResponse | undefined> => {
  return new Promise((resolve, reject) => {
    const fileStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error) return reject(error);

        resolve(result);
      }
    );

    streamifier.createReadStream(file.buffer).pipe(fileStream);
  });
};
