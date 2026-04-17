import { z } from "zod";

const createPropertySchema = z.object({
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

const propertiesSchema = {
  createPropertySchema,
};

export default propertiesSchema;
