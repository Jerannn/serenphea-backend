import { z } from "zod";
import propertiesSchema from "../schemas/properties.schema.js";

export type CreatePropertyInput = z.infer<typeof propertiesSchema.createProperty>;
export type UpdatePropertyInput = z.infer<typeof propertiesSchema.updateProperty>;
export type UpdateLocationInput = z.infer<typeof propertiesSchema.location>;
export type UpdatePricingInput = z.infer<typeof propertiesSchema.pricing>;
export type UpdateBookingSettingsInput = z.infer<typeof propertiesSchema.bookingSettings>;
export type UpdateRulesInput = z.infer<typeof propertiesSchema.rules>;
export type PropertyQuery = z.infer<typeof propertiesSchema.query>;
export type PropertyByHostPayload = z.infer<typeof propertiesSchema.query> & {
  hostId: string;
};
export type PropertyRules = z.infer<typeof propertiesSchema.rules>;
export type Property = CreatePropertyInput & {
  id: string;
  hostId: string;
  status: "draft" | "published" | "archived";
  createdAt: Date | string;
  updatedAt: Date | string;
};

export type PropertyWithRelations = Property & {
  rules: string | null;

  location: PropertyLocation;

  pricing: PropertyPricing | null;
  availability: PropertyAvailability[] | null;
  bookingSettings: PropertyBookingSettings | null;

  images: PropertyImage[];
  amenities: string[];
};

export interface PropertyLocation {
  id: string;
  propertyId: string;

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
  isCover: boolean;
  publicId: string;
}

export interface PropertyPricing {
  id: string;
  propertyId: string;

  base_price: number;
  cleaningFee: number;
  weeklyDiscount: number;
  monthlyDiscount: number;
}

export interface PropertyAvailability {
  id: string;
  propertyId: string;

  date: string; // ISO string (TIMESTAMPTZ)
  isAvailable: boolean;
  priceOverride: number | null;
}

export interface PropertyBookingSettings {
  propertyId: string;

  instantBook: boolean;
  check_inTime: string; // "HH:mm"
  check_outTime: string;

  min_nights: number;
  max_nights: number;
}

export interface PropertyType {
  id: string;
  key: string;
  type: string;
  description: string;
}
