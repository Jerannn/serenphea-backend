import express from "express";
const router = express.Router();

router.post("/", () => {});
router.get("/", () => {});
router
  .route("/:id")
  .get(() => {})
  .patch(() => {})
  .delete(() => {});

router.put("/:d/location", () => {});
router.put("/:id/pricing", () => {});
router.put("/:id/booking-settings", () => {});
router.put("/:id/rules", () => {});

router.post("/:id/images", () => {});

router.post("/:id/availability", () => {});
router.get("/:id/availability", () => {});

router.post("/:id/publish", () => {});

router.get("/host/properties", () => {});

export default router;
