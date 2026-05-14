import { Request } from "express";
import { HTTP_STATUS } from "../constants/http-status.js";
import Property from "../models/properties.model.js";
import {
  multerFile,
  PropertyBookingSettings,
  PropertyImage,
  PropertyLocation,
  PropertyPricing,
  PropertyQuery,
  PropertyRules,
  PropertyWithRelations,
  UpdateAmenityInput,
  UpdateBookingSettingsInput,
  UpdateLocationInput,
  UpdatePricingInput,
  UpdatePropertyInput,
  UpdateRulesInput,
} from "../types/properties.types.js";
import { Cursor } from "../types/shared.types.js";
import AppError from "../utils/appError.js";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";
import { uploadToCloudinary } from "../utils/helper.js";
import { url } from "node:inspector";
import db from "../config/db.js";
export default class PropertiesService {
  static async getPropertyById(propertyId: string): Promise<PropertyWithRelations> {
    const property = await Property.getProperty(propertyId as string);

    if (!property) {
      throw new AppError("Property not found", HTTP_STATUS.NOT_FOUND);
    }

    return property;
  }

  static async getPropertiesByHost(
    query: PropertyQuery,
    hostId: string
  ): Promise<{ properties: PropertyWithRelations[]; nextCursor: Cursor }> {
    const properties = await Property.getAllByHost({
      hostId,
      status: query.status,
      createdAt: query.createdAt,
      id: query.id,
      limit: query.limit + 1,
      sort: query.sort,
    });

    let nextCursor: Cursor = null;

    if (properties.length > query.limit) {
      const lastProperty = properties[query.limit - 1];

      nextCursor = {
        createdAt: lastProperty.createdAt,
        id: lastProperty.id,
      };

      properties.pop();
    }

    return { properties, nextCursor };
  }

  static async updateProperty(data: UpdatePropertyInput, propertyId: string): Promise<Property> {
    const property = await Property.update(data, propertyId);

    if (!property) {
      throw new AppError("Property not found", HTTP_STATUS.NOT_FOUND);
    }

    return property;
  }

  static async updateLocation(
    data: UpdateLocationInput,
    propertyId: string
  ): Promise<PropertyLocation> {
    const location = await Property.updateLocation(data, propertyId);

    return location;
  }

  static async updateAmenities(data: UpdateAmenityInput, propertyId: string): Promise<any> {
    const amenities = await Property.updateAmenities(data.amenityIds, propertyId);

    return amenities;
  }

  static async updatePricing(
    data: UpdatePricingInput,
    propertyId: string
  ): Promise<PropertyPricing> {
    const pricing = await Property.updatePricing(data, propertyId);

    return pricing;
  }

  static async updateBookingSettings(
    data: UpdateBookingSettingsInput,
    propertyId: string
  ): Promise<PropertyBookingSettings> {
    const bookingSettings = await Property.updateBookingSettings(data, propertyId);

    return bookingSettings;
  }

  static async updateRules(data: UpdateRulesInput, propertyId: string): Promise<PropertyRules> {
    const rules = await Property.updateRules(data, propertyId);

    return rules;
  }

  static async updateImages(req: Request, propertyId: string): Promise<PropertyImage[]> {
    const files = req.body.images as multerFile[];
    const folder = `serenphea/users/${req.user.id}/properties`;
    const client = await db.pool.connect();

    let property: PropertyImage[];

    try {
      await client.query("BEGIN");

      const uploadedImages = await Promise.all(
        files.map(async (file, index) => {
          const result = await uploadToCloudinary(file, folder);

          return {
            url: result?.url || "",
            publicId: result?.public_id || "",
            isCover: index === 0,
          };
        })
      );

      property = await Property.updateImages(uploadedImages, propertyId);

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }

    return property;
  }

  static async getPropertiesTypes() {
    const types = await Property.findPropertiesTypes();
    return types;
  }

  static async getAmenities() {
    const amenities = await Property.findAmenities();
    return amenities;
  }
}
