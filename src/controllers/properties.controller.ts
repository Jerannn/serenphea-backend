import { NextFunction, Request, Response } from "express";

export const createProperty = async (req: Request, res: Response, next: NextFunction) => {};

export const getProperties = async (req: Request, res: Response, next: NextFunction) => {};

export const getPropertyById = async (req: Request, res: Response, next: NextFunction) => {};

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
