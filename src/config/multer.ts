import path from "path";
import multer from "multer";
import AppError from "../utils/appError.js";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary.js";
import { sanitizeFileName } from "../utils/helper.js";

type MulterConfig = {
  folder: string;
  formats: string[];
  fileSize: number;
  resourceType?: string | null;
};

export function createUploader({ folder, formats, fileSize, resourceType = null }: MulterConfig) {
  // const storage = new CloudinaryStorage({
  //   cloudinary,
  //   params: async (req, file) => {
  //     const location = `serenphea/users/${req.user.id}/${folder}`;
  //     console.log(location);
  //     const sanitizedName = sanitizeFileName(path.parse(file.originalname).name);
  //     const fileName = `${Date.now()}-${sanitizedName}`;

  //     return {
  //       folder: location,
  //       public_id: fileName,
  //       allowed_formats: formats,
  //       ...(resourceType && { resource_type: resourceType }),
  //     };
  //   },
  // });

  return multer({
    storage: multer.memoryStorage(),
    limits: { fileSize },
    fileFilter: (req, file, cb) => {
      if (!formats.includes(file.mimetype.split("/")[1])) {
        return cb(new AppError("Invalid file type, only images are allowed.", 400));
      }
      cb(null, true);
    },
  });
}

// export function createUploader({ folder, formats, fileSize, resourceType = null }: MulterConfig) {
//   const storage = new CloudinaryStorage({
//     cloudinary,
//     params: async (req, file) => {
//       const location = `serenphea/users/${req.user.id}/${folder}`;
//       console.log(location);
//       const sanitizedName = sanitizeFileName(path.parse(file.originalname).name);
//       const fileName = `${Date.now()}-${sanitizedName}`;

//       return {
//         folder: location,
//         public_id: fileName,
//         allowed_formats: formats,
//         ...(resourceType && { resource_type: resourceType }),
//       };
//     },
//   });

//   return multer({
//     storage,
//     limits: { fileSize },
//     fileFilter: (req, file, cb) => {
//       if (!formats.includes(file.mimetype.split("/")[1])) {
//         return cb(new AppError("Invalid file type, only images are allowed.", 400));
//       }
//       cb(null, true);
//     },
//   });
// }
