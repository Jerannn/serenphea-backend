import { NextFunction, Request, Response } from "express";
import Property from "../models/properties.model.js";
import { HTTP_STATUS } from "../constants/http-status.js";
import AppError from "../utils/appError.js";
import { z } from "zod";
import propertiesSchema from "../schemas/properties.schema.js";
import { LIMIT } from "../constants/shared.js";
import { Cursor } from "../types/shared.types.js";
import PropertiesService from "../services/properties.service.js";
import { meta } from "zod/v4/core";

export const createProperty = async (req: Request, res: Response, _next: NextFunction) => {
  const newProperty = await Property.create(req.body, req.user.id);

  res.status(HTTP_STATUS.CREATED).json({
    status: "success",
    data: { property: newProperty },
  });
};

export const getProperties = async (req: Request, res: Response, _next: NextFunction) => {
  const parsedQuery = propertiesSchema.querySchema.parse(req.query);
  const { properties, nextCursor } = await PropertiesService.getPropertiesByHost(
    parsedQuery,
    req.user.id
  );

  res.status(HTTP_STATUS.OK).json({
    status: "success",
    data: { properties, meta: { nextCursor } },
  });
};

export const getPropertyById = async (req: Request, res: Response, next: NextFunction) => {
  const { id: propertyId } = req.params;

  const property = await PropertiesService.getPropertyById(propertyId as string);

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
