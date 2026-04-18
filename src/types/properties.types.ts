import { z } from "zod";
import propertiesSchema from "../schemas/properties.schema.js";

export type CreateProperty = z.infer<typeof propertiesSchema.createPropertySchema>;
export type PropertyQuery = z.infer<typeof propertiesSchema.querySchema>;
export type PropertyByHostPayload = z.infer<typeof propertiesSchema.querySchema> & {
  hostId: string;
};

export type Property = Omit<CreateProperty, "propertyTypeId"> & {
  id: string;
  host_id: string;
  property_type_id: string;
  status: "draft" | "published" | "archived";
  created_at: Date | string;
  updated_at: Date | string;
};

export type PropertyWithRelations = Property & {
  rules: string | null;

  location: PropertyLocation;

  pricing: PropertyPricing | null;
  availability: PropertyAvailability[] | null;
  booking_settings: PropertyBookingSettings | null;

  images: PropertyImage[];
  amenities: string[];
};

export interface PropertyLocation {
  id: string;
  property_id: string;

  address: string;
  city: string;
  state: string;
  country: string;

  latitude: number;
  longitude: number;
}

export interface PropertyImage {
  id: string;
  url: string;
  is_cover: boolean;
  public_id: string;
}

export interface PropertyPricing {
  id: string;
  property_id: string;

  base_price: number;
  cleaning_fee: number;
  weekly_discount: number;
  monthly_discount: number;
}

export interface PropertyAvailability {
  id: string;
  property_id: string;

  date: string; // ISO string (TIMESTAMPTZ)
  is_available: boolean;
  price_override: number | null;
}

export interface PropertyBookingSettings {
  property_id: string;

  instant_book: boolean;
  check_in_time: string; // "HH:mm:ss"
  check_out_time: string;

  min_nights: number;
  max_nights: number;
}
