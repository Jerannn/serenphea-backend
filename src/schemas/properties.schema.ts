import { z } from "zod";
import { ACCEPTED_IMAGE_TYPES, LIMIT, MAX_IMAGES, MIN_IMAGES } from "../constants/shared.js";

const propertyBase = z.object({
  propertyTypeId: z.uuid({
    message: "Please select a property type",
  }),
  title: z.string().min(1, { message: "Please enter a property title" }),
  description: z.string().min(1, { message: "Please enter a description" }),

  maxAdults: z.coerce.number().int().min(1, { message: "At least 1 adult is required" }),
  maxChildren: z.coerce.number().int().min(0, { message: "Children cannot be negative" }),
  maxInfants: z.coerce.number().int().min(0, { message: "Infants cannot be negative" }),
  maxPets: z.coerce.number().int().min(0, { message: "Pets cannot be negative" }),

  bedrooms: z.coerce.number().min(1, { message: "Please enter a number of bedrooms" }),
  beds: z.coerce.number().min(1, { message: "Please enter a number of beds" }),
  bathrooms: z.coerce.number().min(1, { message: "Please enter a number of bathrooms" }),
});

const query = z.object({
  id: z.uuid().optional(),
  createdAt: z.iso.datetime().optional(),
  limit: z.coerce.number().int().min(1).max(LIMIT).default(LIMIT),
  status: z.enum(["all", "draft", "published", "archived"]).default("all"),
  sort: z.enum(["asc", "desc"]).default("desc"),
});

const location = z.object({
  street: z.string().trim().min(1, { message: "Please enter a street" }),
  city: z.string().trim().min(1, { message: "Please enter a city" }),
  region: z.string().trim().min(1, { message: "Please enter a region" }),
  postcode: z.string().trim().min(1, { message: "Please enter a postcode" }),
  country: z.string().trim().min(1, { message: "Please enter a country" }),
  latitude: z.coerce
    .number()
    .refine(Number.isFinite, { message: "Please pick a location on the map" })
    .min(-90)
    .max(90),
  longitude: z.coerce
    .number()
    .refine(Number.isFinite, { message: "Please pick a location on the map" })
    .min(-180)
    .max(180),
});

const amenity = z.object({
  amenityIds: z.array(z.uuid()).min(1, "Please select at least one amenity"),
});

const pricing = z.object({
  basePrice: z.coerce.number("Please enter a per night price").positive({
    message: "Please enter a per night price",
  }),

  cleaningFee: z.coerce
    .number("Please enter a cleaning fee")
    .nonnegative({ message: "Please enter a cleaning fee" }),
  weeklyDiscount: z.coerce
    .number({ message: "Weekly discount must be a number" })
    .min(0, { message: "Must be at least 0%" })
    .max(100, { message: "Cannot exceed 100%" })
    .default(0),
  monthlyDiscount: z.coerce
    .number({ message: "Monthly discount must be a number" })
    .min(0, { message: "Must be at least 0%" })
    .max(100, { message: "Cannot exceed 100%" })
    .default(0),
});

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
const bookingSettings = z
  .object({
    instantBook: z.coerce.boolean().default(false),
    checkInTime: z.string().regex(timeRegex, { message: "Invalid time format (HH:mm)" }),
    checkOutTime: z.string().regex(timeRegex, { message: "Invalid time format (HH:mm)" }),
    minNights: z.coerce.number().int().min(1).default(1),
    maxNights: z.coerce.number().int().min(1).default(365),
  })
  .refine((data) => data.maxNights >= data.minNights, {
    message: "Maximum nights must be greater than or equal to minimum nights",
    path: ["maxNights"],
  });

const multerFileSchema = z.object({
  fieldname: z.string(),
  originalname: z.string(),
  encoding: z.string(),
  mimetype: z.string(),
  buffer: z.any(),
  size: z.number(),
});

const photosSchema = z.object({
  images: z
    .array(multerFileSchema)
    .min(1, "At least 1 image is required")
    .max(MAX_IMAGES, "Maximum of 20 images allowed")
    .refine((files) => files.every((file) => ACCEPTED_IMAGE_TYPES.includes(file.mimetype)), {
      message: "Only JPG, PNG, and WebP images are allowed",
    }),
  imageRemoveIds: z.array(z.string()).optional(),
});

const rules = z.object({
  rules: z.string().min(1, { message: "Please enter at least one rule" }),
});
const createProperty = propertyBase;
const updateProperty = propertyBase.partial().strict();

const propertiesSchema = {
  createProperty,
  updateProperty,
  location,
  pricing,
  bookingSettings,
  photosSchema,
  rules,
  amenity,
  query,
  multerFileSchema,
};

export default propertiesSchema;
