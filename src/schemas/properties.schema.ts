import { z } from "zod";
import { LIMIT } from "../constants/shared.js";

const propertyBaseSchema = z.object({
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

export const createPropertySchema = propertyBaseSchema;
export const updatePropertySchema = propertyBaseSchema.partial().strict();

const querySchema = z.object({
  id: z.uuid().optional(),
  createdAt: z.iso.datetime().optional(),
  limit: z.coerce.number().int().min(1).max(LIMIT).default(LIMIT),
  status: z.enum(["all", "draft", "published", "archived"]).default("all"),
  sort: z.enum(["asc", "desc"]).default("desc"),
});

const propertiesSchema = {
  createPropertySchema,
  updatePropertySchema,
  querySchema,
};

export default propertiesSchema;
