import { HTTP_STATUS } from "../constants/http-status.js";
import Property from "../models/properties.model.js";
import {
  PropertyQuery,
  PropertyWithRelations,
  UpdatePropertyInput,
} from "../types/properties.types.js";
import { Cursor } from "../types/shared.types.js";
import AppError from "../utils/appError.js";

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
        createdAt: lastProperty.created_at,
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
}
