import { z } from "zod";
import { LIMIT } from "../constants/shared.js";

const propertyBase = z.object({
  propertyTypeId: z.uuid({
    message: "Please select a property type",
  }),
  name: z.string().min(1, { message: "Please enter a property name" }),
  description: z.string().min(1, { message: "Please enter a description" }),

  guests: z.coerce.number().min(1, { message: "Please enter a number of guests" }),
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

const location = z
  .object({
    address: z.string().trim().min(5).max(255).min(1, { message: "Please enter an address" }),
    city: z.string().trim().toLowerCase().min(1, { message: "Please enter a city" }),
    state: z.string().trim().toLowerCase().min(1, { message: "Please enter a state" }),
    country: z.string().trim().toLowerCase().min(1, { message: "Please enter a country" }),
    latitude: z.coerce.number().min(-90).max(90),
    longitude: z.coerce.number().min(-180).max(180),
  })
  .refine((data) => (data.latitude && data.longitude) || (!data.latitude && !data.longitude), {
    message: "Latitude and longitude must be provided together",
    path: ["latitude", "longitude"],
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
    instantBook: z.boolean().default(false),
    checkInTime: z.string().regex(timeRegex, { message: "Invalid time format (HH:mm)" }),
    checkOutTime: z.string().regex(timeRegex, { message: "Invalid time format (HH:mm)" }),
    minNights: z.coerce.number().int().min(1).default(1),
    maxNights: z.coerce.number().int().min(1).default(365),
  })
  .refine((data) => data.maxNights >= data.minNights, {
    message: "Maximum nights must be greater than or equal to minimum nights",
    path: ["maxNights"],
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
  rules,
  query,
};

export default propertiesSchema;
