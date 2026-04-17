import express from "express";
import {
  addPropertyImages,
  createProperty,
  deleteProperty,
  getHostProperties,
  getProperties,
  getPropertyAvailability,
  getPropertyById,
  publishProperty,
  setPropertyAvailability,
  updateProperty,
  updatePropertyBookingSettings,
  updatePropertyLocation,
  updatePropertyPricing,
  updatePropertyRules,
} from "../controllers/properties.controller.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";
import { validateRequest } from "../middleware/validate.middleware.js";
import propertiesSchema from "../schemas/properties.schema.js";

const router = express.Router();

router.post(
  "/",
  protect,
  restrictTo("host"),
  validateRequest(propertiesSchema.createPropertySchema),
  createProperty
);
router.get("/", protect, restrictTo("guest", "host", "admin"), getProperties);
router
  .route("/:id")
  .get(protect, restrictTo("host"), getPropertyById)
  .patch(protect, restrictTo("host"), updateProperty)
  .delete(protect, restrictTo("host"), deleteProperty);

router.put("/:id/location", protect, restrictTo("host"), updatePropertyLocation);
router.put("/:id/pricing", protect, restrictTo("host"), updatePropertyPricing);
router.put("/:id/booking-settings", protect, restrictTo("host"), updatePropertyBookingSettings);
router.put("/:id/rules", protect, restrictTo("host"), updatePropertyRules);

router.post("/:id/images", protect, restrictTo("host"), addPropertyImages);

router.post("/:id/availability", protect, restrictTo("host"), setPropertyAvailability);
router.get("/:id/availability", protect, restrictTo("host"), getPropertyAvailability);

router.post("/:id/publish", protect, restrictTo("host"), publishProperty);

router.get("/host/properties", protect, restrictTo("host"), getHostProperties);

export default router;
