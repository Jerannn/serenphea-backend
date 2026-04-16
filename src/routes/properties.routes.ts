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
const router = express.Router();

router.post("/", protect, restrictTo("host"), createProperty);
router.get("/", getProperties);
router.route("/:id").get(getPropertyById).patch(updateProperty).delete(deleteProperty);

router.put("/:id/location", updatePropertyLocation);
router.put("/:id/pricing", updatePropertyPricing);
router.put("/:id/booking-settings", updatePropertyBookingSettings);
router.put("/:id/rules", updatePropertyRules);

router.post("/:id/images", addPropertyImages);

router.post("/:id/availability", setPropertyAvailability);
router.get("/:id/availability", getPropertyAvailability);

router.post("/:id/publish", publishProperty);

router.get("/host/properties", getHostProperties);

export default router;
