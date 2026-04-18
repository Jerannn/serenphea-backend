import { z } from "zod";
import propertiesSchema from "../schemas/properties.schema.js";

export type CreateProperty = z.infer<typeof propertiesSchema.createPropertySchema>;

export type PropertyByHostPayload = z.infer<typeof propertiesSchema.querySchema> & {
  hostId: string;
};

export type Property = Omit<CreateProperty, "propertyTypeId"> & {
  id: string;
  host_id: string;
  property_type_id: string;
  status: "draft" | "published" | "archived";
  created_at: Date;
  updated_at: Date;
};
