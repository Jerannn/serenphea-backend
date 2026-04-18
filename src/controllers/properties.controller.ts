import { NextFunction, Request, Response } from "express";
import Property from "../models/properties.model.js";
import { HTTP_STATUS } from "../constants/http-status.js";
import AppError from "../utils/appError.js";
import { z } from "zod";
import propertiesSchema from "../schemas/properties.schema.js";
import { LIMIT } from "../constants/shared.js";
import { Cursor } from "../types/shared.types.js";

export const createProperty = async (req: Request, res: Response, _next: NextFunction) => {
  const newProperty = await Property.create(req.body, req.user.id);

  res.status(HTTP_STATUS.CREATED).json({
    status: "success",
    data: { property: newProperty },
  });
};

export const getProperties = async (req: Request, res: Response, _next: NextFunction) => {
  const parsed = propertiesSchema.querySchema.parse(req.query);

  const properties = await Property.getAllByHost({
    hostId: req.user.id,
    status: parsed.status,
    createdAt: parsed.createdAt,
    id: parsed.id,
    limit: parsed.limit + 1,
    sort: parsed.sort,
  });

  let nextCursor: Cursor = null;

  if (properties.length > parsed.limit) {
    const lastProperty = properties[parsed.limit - 1];

    nextCursor = {
      createdAt: lastProperty.created_at,
      id: lastProperty.id,
    };

    properties.pop();
  }

  res.status(HTTP_STATUS.OK).json({
    status: "success",
    data: { properties, nextCursor },
  });
};

export const getPropertyById = async (req: Request, res: Response, next: NextFunction) => {
  const { id: propertyId } = req.params;

  const property = await Property.getProperty(propertyId as string);

  if (!property) {
    return next(new AppError("Property not found", HTTP_STATUS.NOT_FOUND));
  }

  res.status(HTTP_STATUS.OK).json({
    status: "success",
    data: { property },
  });
};

export const updateProperty = async (req: Request, res: Response, next: NextFunction) => {};

export const deleteProperty = async (req: Request, res: Response, next: NextFunction) => {};

export const updatePropertyLocation = async (req: Request, res: Response, next: NextFunction) => {};

export const updatePropertyPricing = async (req: Request, res: Response, next: NextFunction) => {};

export const updatePropertyBookingSettings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {};

export const updatePropertyRules = async (req: Request, res: Response, next: NextFunction) => {};

export const addPropertyImages = async (req: Request, res: Response, next: NextFunction) => {};

export const setPropertyAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {};

export const getPropertyAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {};

export const publishProperty = async (req: Request, res: Response, next: NextFunction) => {};
export const getHostProperties = async (req: Request, res: Response, next: NextFunction) => {};
